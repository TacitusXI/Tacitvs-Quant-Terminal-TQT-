"""
Risk Manager - управление рисками и sizing позиций.

Ключевые принципы:
1. Sizing в R-units (1R = стоп-дистанция)
2. Фиксированный % риска на сделку (обычно 1%)
3. Daily loss limits (например 5R в день)
4. Kill-switch при деградации EV
"""

# ===== ИМПОРТЫ =====

from dataclasses import dataclass, field
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from enum import Enum


# ===== ENUMS =====

class RiskLevel(Enum):
    """
    Уровни риска для торгового аккаунта.
    """
    NORMAL = "normal"      # Все в порядке, торгуем нормально
    WARNING = "warning"    # Приближаемся к лимитам
    CRITICAL = "critical"  # Достигли лимитов, stop trading
    LOCKED = "locked"      # Заблокированы (требуется manual unlock)


# ===== DATA CLASSES =====

@dataclass
class RiskLimits:
    """
    Лимиты риска для торгового аккаунта.
    
    Attributes:
        per_trade_risk_pct: Процент капитала на одну сделку (1.0 = 1%)
        max_daily_loss_r: Максимальный дневной убыток в R (например 5.0)
        max_concurrent_positions: Максимум открытых позиций одновременно
        max_position_size_usd: Максимальный размер одной позиции в USD
        max_exposure_per_market: Максимальная экспозиция на один рынок (%)
        min_ev_net: Минимальный EV_net для торговли (0.0 = break-even)
    """
    per_trade_risk_pct: float = 1.0
    max_daily_loss_r: float = 5.0
    max_concurrent_positions: int = 3
    max_position_size_usd: float = 100000.0
    max_exposure_per_market: float = 50.0  # 50% от equity на один market
    min_ev_net: float = 0.0


@dataclass
class PositionInfo:
    """
    Информация об открытой позиции.
    
    Attributes:
        market: Название рынка
        side: 'long' или 'short'
        entry_price: Цена входа
        size: Размер позиции (в контрактах/монетах)
        stop_price: Цена стопа
        r_usd: Размер риска в USD (1R для этой позиции)
        opened_at: Timestamp открытия
    """
    market: str
    side: str
    entry_price: float
    size: float
    stop_price: float
    r_usd: float
    opened_at: int
    
    def risk_distance(self) -> float:
        """Дистанция до стопа в цене."""
        return abs(self.entry_price - self.stop_price)
    
    def current_r(self, current_price: float) -> float:
        """
        Текущий P&L в R-units.
        
        Args:
            current_price: Текущая рыночная цена
        
        Returns:
            P&L в R (положительный = прибыль, отрицательный = убыток)
        """
        if self.r_usd == 0:
            return 0.0
        
        # Рассчитываем P&L в USD
        if self.side == 'long':
            pnl_usd = (current_price - self.entry_price) * self.size
        else:  # short
            pnl_usd = (self.entry_price - current_price) * self.size
        
        # Конвертируем в R
        return pnl_usd / self.r_usd


# ===== RISK MANAGER CLASS =====

class RiskManager:
    """
    Менеджер рисков для торгового аккаунта.
    
    Отвечает за:
    - Расчет размера позиций (1% R sizing)
    - Мониторинг дневных убытков
    - Проверку лимитов перед открытием позиций
    - Kill-switch при критических ситуациях
    """
    
    def __init__(
        self,
        equity: float,
        limits: RiskLimits = None
    ):
        """
        Инициализация Risk Manager.
        
        Args:
            equity: Текущий капитал в USD
            limits: Лимиты риска (если None - используются дефолтные)
        """
        # Текущий капитал
        self.equity = equity
        
        # Лимиты (создаем дефолтные если не переданы)
        self.limits = limits if limits else RiskLimits()
        
        # Отслеживание открытых позиций
        # Словарь: market -> PositionInfo
        self.positions: Dict[str, PositionInfo] = {}
        
        # Трекинг дневных убытков
        self.daily_loss_r = 0.0
        self.daily_trades_count = 0
        self.day_start = self._get_day_start()
        
        # История убытков по дням (для статистики)
        self.daily_losses_history: List[float] = []
        
        # Текущий уровень риска
        self.risk_level = RiskLevel.NORMAL
        
        # Флаг блокировки торговли
        self.trading_enabled = True
    
    def _get_day_start(self) -> int:
        """
        Получить timestamp начала текущего торгового дня.
        
        Returns:
            Unix timestamp в миллисекундах
        """
        # datetime.now() - текущее время
        # .replace(hour=0, minute=0, second=0, microsecond=0) - полночь
        # .timestamp() - конвертируем в unix timestamp (секунды)
        # * 1000 - конвертируем в миллисекунды
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        return int(today.timestamp() * 1000)
    
    def _check_new_day(self):
        """
        Проверить не начался ли новый день (сброс daily limits).
        """
        current_day = self._get_day_start()
        
        # Если начался новый день
        if current_day > self.day_start:
            # Сохраняем вчерашний убыток в историю
            self.daily_losses_history.append(self.daily_loss_r)
            
            # Сбрасываем дневные счетчики
            self.daily_loss_r = 0.0
            self.daily_trades_count = 0
            self.day_start = current_day
            
            # Если были заблокированы - разблокируем (новый день = новый шанс)
            if self.risk_level == RiskLevel.CRITICAL:
                self.risk_level = RiskLevel.NORMAL
                self.trading_enabled = True
    
    def calculate_position_size(
        self,
        entry_price: float,
        stop_price: float,
        contract_size: float = 1.0,
        custom_risk_pct: Optional[float] = None
    ) -> tuple[float, float]:
        """
        Расчет размера позиции по формуле 1% R.
        
        Формула: size = (risk_pct * equity) / (stop_distance * contract_size)
        
        Args:
            entry_price: Цена входа
            stop_price: Цена стопа
            contract_size: Размер одного контракта (обычно 1.0)
            custom_risk_pct: Кастомный % риска (если None - из limits)
        
        Returns:
            Tuple (size, r_usd):
                size: Размер позиции в контрактах
                r_usd: Размер риска в USD (1R)
        """
        # Используем кастомный risk_pct или дефолтный из limits
        risk_pct = custom_risk_pct if custom_risk_pct else self.limits.per_trade_risk_pct
        
        # Расстояние до стопа (в цене)
        stop_distance = abs(entry_price - stop_price)
        
        # Защита от деления на ноль
        if stop_distance == 0:
            return 0.0, 0.0
        
        # Сколько USD мы готовы рискнуть (это будет наш 1R)
        r_usd = (risk_pct / 100.0) * self.equity
        
        # Размер позиции = риск / (дистанция × размер контракта)
        # Пример: риск=100$, дистанция=50$, контракт=1 → size=2.0 контракта
        size = r_usd / (stop_distance * contract_size)
        
        return size, r_usd
    
    def can_open_position(
        self,
        market: str,
        size: float,
        entry_price: float,
        r_usd: float,
        current_ev_net: float = 0.0
    ) -> tuple[bool, str]:
        """
        Проверка можно ли открыть новую позицию.
        
        Args:
            market: Название рынка
            size: Размер позиции
            entry_price: Цена входа
            r_usd: Риск в USD
            current_ev_net: Текущий EV_net стратегии на этом venue
        
        Returns:
            Tuple (can_open, reason):
                can_open: True если можно открыть
                reason: Причина отказа (если can_open = False)
        """
        # Проверяем не начался ли новый день
        self._check_new_day()
        
        # --- CHECK 1: Trading enabled? ---
        if not self.trading_enabled:
            return False, "Trading is disabled (manual lock or critical state)"
        
        # --- CHECK 2: EV positive? ---
        if current_ev_net < self.limits.min_ev_net:
            return False, f"EV_net ({current_ev_net:.3f}) below minimum ({self.limits.min_ev_net})"
        
        # --- CHECK 3: Daily loss limit ---
        # Проверяем не превысили ли мы дневной лимит убытков
        if self.daily_loss_r <= -self.limits.max_daily_loss_r:
            self.risk_level = RiskLevel.CRITICAL
            self.trading_enabled = False
            return False, f"Daily loss limit reached ({self.daily_loss_r:.1f}R / {-self.limits.max_daily_loss_r}R)"
        
        # --- CHECK 4: Max concurrent positions ---
        if len(self.positions) >= self.limits.max_concurrent_positions:
            return False, f"Max concurrent positions reached ({len(self.positions)}/{self.limits.max_concurrent_positions})"
        
        # --- CHECK 5: Position size limit ---
        notional = size * entry_price
        if notional > self.limits.max_position_size_usd:
            return False, f"Position size ({notional:.0f}$) exceeds limit ({self.limits.max_position_size_usd:.0f}$)"
        
        # --- CHECK 6: Market exposure limit ---
        # Считаем текущую экспозицию на этот рынок (если есть открытая позиция)
        current_exposure_pct = 0.0
        if market in self.positions:
            pos = self.positions[market]
            current_notional = pos.size * pos.entry_price
            current_exposure_pct = (current_notional / self.equity) * 100.0
        
        new_exposure_pct = (notional / self.equity) * 100.0
        total_exposure_pct = current_exposure_pct + new_exposure_pct
        
        if total_exposure_pct > self.limits.max_exposure_per_market:
            return False, f"Market exposure ({total_exposure_pct:.1f}%) exceeds limit ({self.limits.max_exposure_per_market}%)"
        
        # Все проверки пройдены!
        return True, "OK"
    
    def register_position(
        self,
        market: str,
        side: str,
        entry_price: float,
        size: float,
        stop_price: float,
        r_usd: float
    ):
        """
        Зарегистрировать открытую позицию.
        
        Args:
            market: Рынок
            side: 'long' или 'short'
            entry_price: Цена входа
            size: Размер
            stop_price: Стоп
            r_usd: Риск в USD
        """
        # Проверяем не начался ли новый день
        self._check_new_day()
        
        # Создаем объект позиции
        position = PositionInfo(
            market=market,
            side=side,
            entry_price=entry_price,
            size=size,
            stop_price=stop_price,
            r_usd=r_usd,
            opened_at=int(datetime.now().timestamp() * 1000)
        )
        
        # Добавляем в словарь открытых позиций
        self.positions[market] = position
        
        # Увеличиваем счетчик сделок
        self.daily_trades_count += 1
    
    def close_position(
        self,
        market: str,
        exit_price: float
    ) -> Optional[float]:
        """
        Закрыть позицию и вернуть результат в R.
        
        Args:
            market: Рынок
            exit_price: Цена выхода
        
        Returns:
            Результат сделки в R (None если позиция не найдена)
        """
        # Проверяем не начался ли новый день
        self._check_new_day()
        
        # Проверяем есть ли такая позиция
        if market not in self.positions:
            return None
        
        # Получаем информацию о позиции
        position = self.positions[market]
        
        # Рассчитываем результат в R
        result_r = position.current_r(exit_price)
        
        # Обновляем дневной P&L
        self.daily_loss_r += result_r
        
        # Обновляем equity (реализованный P&L)
        realized_pnl_usd = result_r * position.r_usd
        self.equity += realized_pnl_usd
        
        # Удаляем позицию из словаря
        del self.positions[market]
        
        # Обновляем risk level
        self._update_risk_level()
        
        return result_r
    
    def _update_risk_level(self):
        """
        Обновить текущий уровень риска на основе daily loss.
        """
        # Если достигли 80% лимита - WARNING
        if self.daily_loss_r <= -self.limits.max_daily_loss_r * 0.8:
            self.risk_level = RiskLevel.WARNING
        
        # Если достигли 100% лимита - CRITICAL (stop trading)
        elif self.daily_loss_r <= -self.limits.max_daily_loss_r:
            self.risk_level = RiskLevel.CRITICAL
            self.trading_enabled = False
        
        else:
            self.risk_level = RiskLevel.NORMAL
    
    def get_status(self) -> Dict[str, any]:
        """
        Получить текущий статус risk manager.
        
        Returns:
            Словарь со статусом
        """
        self._check_new_day()
        
        return {
            'equity': self.equity,
            'risk_level': self.risk_level.value,
            'trading_enabled': self.trading_enabled,
            'daily_loss_r': self.daily_loss_r,
            'daily_loss_limit_r': -self.limits.max_daily_loss_r,
            'daily_loss_pct_used': (abs(self.daily_loss_r) / self.limits.max_daily_loss_r) * 100.0,
            'daily_trades_count': self.daily_trades_count,
            'open_positions_count': len(self.positions),
            'max_positions': self.limits.max_concurrent_positions,
            'open_positions': [
                {
                    'market': market,
                    'side': pos.side,
                    'entry': pos.entry_price,
                    'stop': pos.stop_price,
                    'size': pos.size,
                    'r_usd': pos.r_usd
                }
                for market, pos in self.positions.items()
            ]
        }
    
    def manual_lock(self):
        """Ручная блокировка торговли (emergency stop)."""
        self.trading_enabled = False
        self.risk_level = RiskLevel.LOCKED
    
    def manual_unlock(self):
        """Ручная разблокировка торговли (после emergency stop)."""
        # Разблокируем только если не достигнут daily limit
        if self.daily_loss_r > -self.limits.max_daily_loss_r:
            self.trading_enabled = True
            self.risk_level = RiskLevel.NORMAL
        else:
            # Нельзя разблокировать - достигнут daily limit
            pass

