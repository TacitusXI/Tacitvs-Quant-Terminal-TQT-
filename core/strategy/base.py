"""
Базовые классы для торговых стратегий.

Этот модуль определяет интерфейсы которые должны реализовать все стратегии.
"""

# ===== ИМПОРТЫ =====

# dataclass - декоратор для создания классов данных (как struct в других языках)
from dataclasses import dataclass, field

# ABC = Abstract Base Class - базовый класс для создания интерфейсов
# abstractmethod - декоратор для методов которые ОБЯЗАНЫ быть реализованы в наследниках
from abc import ABC, abstractmethod

# Типизация для лучшей читаемости и проверки типов
from typing import List, Dict, Any, Optional
from enum import Enum


# ===== ENUMS (перечисления) =====

class SignalSide(Enum):
    """
    Перечисление возможных направлений сигнала.
    Используем Enum чтобы избежать опечаток в строках.
    """
    LONG = "long"      # Покупка (ставка на рост)
    SHORT = "short"    # Продажа (ставка на падение)
    EXIT = "exit"      # Закрытие позиции


# ===== DATA CLASSES (классы данных) =====

@dataclass
class BarContext:
    """
    Контекст одной свечи (бара) для стратегии.
    
    @dataclass автоматически создает __init__, __repr__, __eq__ методы.
    Это удобно для классов которые просто хранят данные.
    
    Attributes:
        timestamp: Unix timestamp в миллисекундах (когда закрылась свеча)
        market: Название рынка, например "BTC-PERP"
        open: Цена открытия свечи
        high: Максимальная цена за период
        low: Минимальная цена за период
        close: Цена закрытия свечи (самая важная)
        volume: Объем торгов за период
        indicators: Словарь с дополнительными индикаторами (ATR, MA, etc)
    """
    timestamp: int                    # int = целое число
    market: str                       # str = строка
    open: float                       # float = число с плавающей точкой
    high: float
    low: float
    close: float
    volume: float
    indicators: Dict[str, Any] = field(default_factory=dict)
    # field(default_factory=dict) создает новый пустой словарь для каждого экземпляра
    # Это важно! Не используем просто {} так как это создаст один общий словарь


@dataclass
class Signal:
    """
    Торговый сигнал от стратегии.
    
    Описывает ЧТО делать (long/short/exit), ГДЕ входить, 
    ГДЕ ставить стоп, КУДА целимся.
    
    Attributes:
        market: На каком рынке торговать
        side: Направление (long/short/exit)
        entry: Цена входа в позицию
        stop: Цена стоп-лосса (где выходим если пошло не туда)
        targets: Список целевых цен для частичного/полного выхода
        confidence: Уверенность в сигнале 0.0-1.0 (опционально)
        metadata: Дополнительная информация (reason, indicators values, etc)
    """
    market: str
    side: SignalSide
    entry: float
    stop: float
    targets: List[float]
    confidence: float = 0.5           # Значение по умолчанию
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def risk_distance(self) -> float:
        """
        Расчет дистанции до стопа (сколько рискуем на единицу).
        
        Returns:
            Абсолютное значение разницы между входом и стопом
        """
        # abs() = absolute value (модуль числа, всегда положительный)
        return abs(self.entry - self.stop)
    
    def reward_distance(self) -> float:
        """
        Расчет дистанции до первой цели (сколько хотим заработать).
        
        Returns:
            Абсолютное значение разницы между входом и первой целью
        """
        # Если есть хотя бы одна цель, берем первую (индекс 0)
        if self.targets:
            return abs(self.targets[0] - self.entry)
        # Если целей нет, возвращаем 0
        return 0.0
    
    def risk_reward_ratio(self) -> float:
        """
        Расчет соотношения риск/прибыль (R:R).
        
        Например, если риск = 10$, цель = 30$, то R:R = 3.0
        Означает что мы целимся заработать в 3 раза больше чем рискуем.
        
        Returns:
            Отношение reward/risk
        """
        risk = self.risk_distance()
        # Защита от деления на ноль
        if risk == 0:
            return 0.0
        reward = self.reward_distance()
        return reward / risk


# ===== STRATEGY INTERFACE (интерфейс стратегии) =====

class IStrategy(ABC):
    """
    Абстрактный базовый класс для всех торговых стратегий.
    
    ABC = Abstract Base Class означает что этот класс нельзя использовать напрямую.
    Нужно создать наследника и реализовать все @abstractmethod методы.
    
    Это гарантирует что все стратегии имеют одинаковый интерфейс.
    """
    
    def __init__(self, params: Dict[str, Any]):
        """
        Конструктор базовой стратегии.
        
        Args:
            params: Словарь с параметрами стратегии
                   Например: {"don_break": 20, "atr_length": 14}
        """
        # self.params будет доступен во всех методах класса
        self.params = params
        
        # Уникальный ID стратегии (берем из params или используем имя класса)
        # self.__class__.__name__ = название класса (например "TortoiseStrategy")
        self.strategy_id = params.get('id', self.__class__.__name__)
    
    @abstractmethod
    def on_bar(self, ctx: BarContext, history: Any) -> List[Signal]:
        """
        ГЛАВНЫЙ МЕТОД стратегии - вызывается на каждой новой свече.
        
        @abstractmethod означает что каждая стратегия ОБЯЗАНА реализовать этот метод.
        
        Args:
            ctx: Контекст текущей свечи (BarContext)
            history: История предыдущих свечей (обычно pandas DataFrame)
                    Нужна для расчета индикаторов
        
        Returns:
            Список торговых сигналов (может быть пустым если нет сигнала)
        """
        # pass означает "ничего не делаем" - это placeholder
        # В наследниках этот метод будет заменен на реальную логику
        pass
    
    @abstractmethod
    def markets(self) -> List[str]:
        """
        Список рынков на которых работает эта стратегия.
        
        Returns:
            Список строк, например ["BTC-PERP", "ETH-PERP"]
        """
        pass
    
    def validate_signal(self, signal: Signal) -> bool:
        """
        Валидация сигнала (проверка что он корректный).
        
        Этот метод НЕ абстрактный - есть базовая реализация,
        но стратегии могут переопределить если нужны дополнительные проверки.
        
        Args:
            signal: Сигнал для проверки
        
        Returns:
            True если сигнал валидный, False если что-то не так
        """
        # Проверяем что entry != stop (иначе risk_distance = 0)
        if signal.entry == signal.stop:
            return False
        
        # Проверяем что есть хотя бы одна цель
        if not signal.targets:
            return False
        
        # Проверяем что направление и расположение stop логичны
        if signal.side == SignalSide.LONG:
            # Для лонга стоп должен быть НИЖЕ входа
            if signal.stop >= signal.entry:
                return False
            # Цели должны быть ВЫШЕ входа
            if any(target <= signal.entry for target in signal.targets):
                return False
        
        elif signal.side == SignalSide.SHORT:
            # Для шорта стоп должен быть ВЫШЕ входа
            if signal.stop <= signal.entry:
                return False
            # Цели должны быть НИЖЕ входа
            if any(target >= signal.entry for target in signal.targets):
                return False
        
        # Если все проверки прошли - сигнал валидный
        return True
    
    def __repr__(self) -> str:
        """
        Строковое представление стратегии (для debug).
        
        __repr__ - специальный метод Python, вызывается когда мы print(strategy)
        """
        return f"{self.strategy_id}(markets={self.markets()})"


# ===== UTILITY FUNCTIONS (вспомогательные функции) =====

def calculate_position_size_from_signal(
    signal: Signal,
    equity: float,
    risk_pct: float = 1.0,
    contract_size: float = 1.0
) -> tuple[float, float]:
    """
    Расчет размера позиции исходя из сигнала и процента риска.
    
    Формула: size = (risk_pct * equity) / (stop_distance * contract_size)
    
    Args:
        signal: Торговый сигнал с entry и stop
        equity: Текущий капитал (например 10000 USD)
        risk_pct: Процент риска на сделку (1.0 = 1%)
        contract_size: Размер одного контракта (для перпов обычно 1.0)
    
    Returns:
        Кортеж (size, R_usd):
            size: Размер позиции в контрактах
            R_usd: Размер риска в долларах (1R)
    """
    # Расстояние до стопа в цене
    stop_distance = signal.risk_distance()
    
    # Защита от деления на ноль
    if stop_distance == 0:
        return 0.0, 0.0
    
    # Сколько долларов мы готовы рискнуть (1R)
    r_usd = (risk_pct / 100.0) * equity
    
    # Размер позиции = риск в долларах / (дистанция до стопа * размер контракта)
    size = r_usd / (stop_distance * contract_size)
    
    # Возвращаем кортеж (tuple) - это как пара значений
    return size, r_usd

