"""
EV Engine - расчет Expected Value (математического ожидания) для сделок.

Ключевая идея: мы торгуем только когда EV_net > 0 после ВСЕХ издержек.
Издержки считаем в R-units (единицах риска) для универсальности.
"""

# ===== ИМПОРТЫ =====

from dataclasses import dataclass
from typing import Dict, Any


# ===== DATA CLASSES =====

@dataclass
class EVResult:
    """
    Результат расчета EV для одной сделки или серии сделок.
    
    Attributes:
        win_rate: Процент выигрышных сделок (p в формуле)
        avg_win_r: Средний выигрыш в R (b̄ в формуле)
        avg_loss_r: Средний проигрыш в R (обычно -1.0 если стоп = 1R)
        fees_eff_r: Эффективные комиссии в R (может быть отрицательным для maker rebates!)
        funding_r: Funding rate издержки в R
        slippage_r: Проскальзывание в R
        gas_r: Gas издержки в R (для HL почти 0)
        total_costs_r: Сумма всех издержек в R
        ev_gross: EV без издержек = p*b̄ - (1-p)*|loss|
        ev_net: EV после издержек = ev_gross - total_costs_r
    """
    win_rate: float
    avg_win_r: float
    avg_loss_r: float
    fees_eff_r: float
    funding_r: float
    slippage_r: float
    gas_r: float
    total_costs_r: float
    ev_gross: float
    ev_net: float
    
    def is_tradeable(self) -> bool:
        """
        Проверка можно ли торговать (EV_net > 0).
        
        Returns:
            True если ev_net положительный
        """
        return self.ev_net > 0
    
    def to_dict(self) -> Dict[str, float]:
        """
        Конвертация в словарь (для JSON API).
        
        Returns:
            Словарь со всеми полями
        """
        # vars(self) возвращает словарь всех атрибутов объекта
        return vars(self)


# ===== EV CALCULATOR CLASS =====

class EVCalculator:
    """
    Калькулятор Expected Value с полным учетом издержек.
    
    Формула:
        fees_eff = notional_in * f_in + notional_out * f_out  
                   (f может быть отрицательным для maker rebates!)
        
        Costs_in_R = (fees_eff + funding + slippage + gas) / R_$
        
        EV_net = p*b̄ - (1-p) - Costs_in_R
    
    Где:
        p = win_rate (вероятность выигрыша)
        b̄ = avg_win_r (средний выигрыш в R)
        Costs_in_R = все издержки в единицах риска
    """
    
    def __init__(self, default_maker_bps: float = -1.5, default_taker_bps: float = 4.5):
        """
        Конструктор калькулятора.
        
        Args:
            default_maker_bps: Комиссия maker в базисных пунктах
                              Отрицательное значение = rebate (возврат)
                              -1.5 означает возврат 0.015% от notional
            default_taker_bps: Комиссия taker в базисных пунктах
                              4.5 означает комиссия 0.045% от notional
        
        Note: 1 bps (basis point) = 0.01% = 0.0001 в десятичной форме
              100 bps = 1%
        """
        self.default_maker_bps = default_maker_bps
        self.default_taker_bps = default_taker_bps
    
    def calculate_costs_in_r(
        self,
        notional_in: float,
        notional_out: float,
        fee_in_bps: float,
        fee_out_bps: float,
        funding_rate: float = 0.0,
        hold_time_hours: float = 24.0,
        slippage_bps: float = 1.0,
        gas_usd: float = 0.0,
        r_usd: float = 100.0
    ) -> float:
        """
        Расчет ВСЕХ издержек в R-units (единицах риска).
        
        Args:
            notional_in: Размер позиции при входе в USD (entry_price * size)
            notional_out: Размер позиции при выходе в USD (exit_price * size)
            fee_in_bps: Комиссия при входе в bps (может быть < 0 для maker)
            fee_out_bps: Комиссия при выходе в bps (может быть < 0 для maker)
            funding_rate: Ставка funding за 8 часов (например 0.01 = 1%)
            hold_time_hours: Сколько часов держали позицию
            slippage_bps: Проскальзывание в bps (обычно 1-5)
            gas_usd: Gas издержки в USD (для Hyperliquid ~0)
            r_usd: Размер 1R в долларах (например 100$ = 1% от 10000$)
        
        Returns:
            Общие издержки в R (например 0.15 = 15% от 1R)
        """
        # --- 1) FEES (комиссии) ---
        # Конвертируем bps в десятичную форму: bps / 10000
        # Пример: 4.5 bps = 4.5 / 10000 = 0.00045 = 0.045%
        fees_eff = (
            notional_in * (fee_in_bps / 10000.0) +      # Комиссия на вход
            notional_out * (fee_out_bps / 10000.0)      # Комиссия на выход
        )
        # Если использовали maker order (fee_in_bps < 0), fees_eff может быть отрицательным!
        # Это ХОРОШО - мы получили rebate (возврат комиссии)
        
        # --- 2) FUNDING (плата за удержание позиции) ---
        # Funding взимается каждые 8 часов
        # Формула: funding = rate × (hold_time / 8) × notional
        funding_periods = hold_time_hours / 8.0         # Сколько 8-часовых периодов
        funding = funding_rate * funding_periods * notional_in
        # Если funding_rate положительный и мы в лонге - платим
        # Если отрицательный - получаем
        
        # --- 3) SLIPPAGE (проскальзывание цены) ---
        # Разница между ожидаемой и реальной ценой исполнения
        # Считаем от суммы входа и выхода
        slippage = (notional_in + notional_out) * (slippage_bps / 10000.0)
        
        # --- 4) GAS (издержки на газ) ---
        # Для Hyperliquid газ платит система (gasless UX)
        # Но для других venue может быть значимым
        # gas_usd уже в долларах, не нужно конвертировать
        
        # --- 5) TOTAL COSTS ---
        total_cost_usd = fees_eff + funding + slippage + gas_usd
        
        # --- 6) Конвертируем в R-units ---
        # Делим на размер 1R чтобы получить "сколько процентов от риска"
        # Пример: если издержки = 15$, а R = 100$, то costs_in_r = 0.15
        # Это означает что издержки "съели" 15% от нашего риска
        if r_usd == 0:
            return 0.0  # Защита от деления на ноль
        
        costs_in_r = total_cost_usd / r_usd
        
        return costs_in_r
    
    def calculate_ev_net(
        self,
        win_rate: float,
        avg_win_r: float,
        avg_loss_r: float = -1.0,
        costs_in_r: float = 0.0
    ) -> float:
        """
        Расчет чистого EV (Expected Value) в R-units.
        
        Формула: EV_net = p*b̄ - (1-p)*|loss| - Costs_in_R
        
        Args:
            win_rate: Процент выигрышных сделок (0.0 - 1.0)
                     Например 0.45 = 45% winrate
            avg_win_r: Средний выигрыш в R
                      Например 2.5 = в среднем берем 2.5R прибыли
            avg_loss_r: Средний проигрыш в R (обычно -1.0 если стоп = 1R)
            costs_in_r: Издержки в R (из calculate_costs_in_r)
        
        Returns:
            EV_net в R. Если > 0 - стратегия прибыльна после издержек.
        """
        # Вероятность проигрыша = 1 - вероятность выигрыша
        loss_rate = 1.0 - win_rate
        
        # EV_gross = математическое ожидание БЕЗ издержек
        # = (вероятность выигрыша × размер выигрыша) - (вероятность проигрыша × размер проигрыша)
        ev_gross = win_rate * avg_win_r - loss_rate * abs(avg_loss_r)
        
        # EV_net = EV после вычета издержек
        ev_net = ev_gross - costs_in_r
        
        return ev_net
    
    def calculate_ev_result(
        self,
        win_rate: float,
        avg_win_r: float,
        avg_loss_r: float = -1.0,
        notional_in: float = 1000.0,
        notional_out: float = 1000.0,
        fee_in_bps: float = None,
        fee_out_bps: float = None,
        funding_rate: float = 0.0,
        hold_time_hours: float = 24.0,
        slippage_bps: float = 1.0,
        gas_usd: float = 0.0,
        r_usd: float = 100.0
    ) -> EVResult:
        """
        Полный расчет EV со всеми компонентами.
        
        Это главный метод который объединяет все расчеты.
        
        Args:
            win_rate: Winrate стратегии (0.45 = 45%)
            avg_win_r: Средний выигрыш в R
            avg_loss_r: Средний проигрыш в R
            notional_in: Размер позиции при входе
            notional_out: Размер позиции при выходе
            fee_in_bps: Комиссия на вход (None = использовать default)
            fee_out_bps: Комиссия на выход (None = использовать default)
            ... остальные параметры как в calculate_costs_in_r
        
        Returns:
            EVResult с полной разбивкой всех компонентов
        """
        # Используем default fees если не указаны явно
        if fee_in_bps is None:
            fee_in_bps = self.default_maker_bps
        if fee_out_bps is None:
            fee_out_bps = self.default_maker_bps
        
        # --- Расчет каждого компонента издержек ОТДЕЛЬНО ---
        # Это нужно чтобы видеть разбивку в EVResult
        
        # Fees
        fees_eff_usd = (
            notional_in * (fee_in_bps / 10000.0) +
            notional_out * (fee_out_bps / 10000.0)
        )
        fees_eff_r = fees_eff_usd / r_usd if r_usd > 0 else 0.0
        
        # Funding
        funding_periods = hold_time_hours / 8.0
        funding_usd = funding_rate * funding_periods * notional_in
        funding_r = funding_usd / r_usd if r_usd > 0 else 0.0
        
        # Slippage
        slippage_usd = (notional_in + notional_out) * (slippage_bps / 10000.0)
        slippage_r = slippage_usd / r_usd if r_usd > 0 else 0.0
        
        # Gas
        gas_r = gas_usd / r_usd if r_usd > 0 else 0.0
        
        # Total costs
        total_costs_r = fees_eff_r + funding_r + slippage_r + gas_r
        
        # --- EV расчет ---
        loss_rate = 1.0 - win_rate
        ev_gross = win_rate * avg_win_r - loss_rate * abs(avg_loss_r)
        ev_net = ev_gross - total_costs_r
        
        # Создаем и возвращаем результат
        return EVResult(
            win_rate=win_rate,
            avg_win_r=avg_win_r,
            avg_loss_r=avg_loss_r,
            fees_eff_r=fees_eff_r,
            funding_r=funding_r,
            slippage_r=slippage_r,
            gas_r=gas_r,
            total_costs_r=total_costs_r,
            ev_gross=ev_gross,
            ev_net=ev_net
        )
    
    def rolling_ev(
        self,
        recent_trades_r: list[float],
        costs_in_r: float = 0.0
    ) -> float:
        """
        Расчет rolling EV на основе последних N сделок.
        
        Используется для kill-switch: если rolling EV становится <= 0,
        прекращаем торговать эту таблицу/venue.
        
        Args:
            recent_trades_r: Список результатов последних сделок в R
                            Например: [2.1, -1.0, 1.5, -1.0, 3.2]
            costs_in_r: Средние издержки на сделку в R
        
        Returns:
            Средний EV на сделку для этого окна
        """
        if not recent_trades_r:
            return 0.0
        
        # Считаем среднее арифметическое всех сделок
        # sum() суммирует все элементы списка
        # len() возвращает количество элементов
        avg_r = sum(recent_trades_r) / len(recent_trades_r)
        
        # Вычитаем издержки
        rolling_ev = avg_r - costs_in_r
        
        return rolling_ev

