"""
Tortoise Lite Strategy - Donchian Channel Breakout.

Классическая трендовая стратегия основанная на прорыве каналов Дончиана.

Логика:
- Entry: прорыв 20-периодного максимума (лонг) или минимума (шорт)
- Stop: противоположная граница канала (20-периодный минимум для лонга)
- Exit: 50% на 2R, 50% на trailing stop (ATR-based)

Timeframe: 1D (дневные свечи)
Markets: BTC-PERP, ETH-PERP, или любые liquid perpetuals
"""

# ===== ИМПОРТЫ =====

# Для работы с данными используем pandas (библиотека для табличных данных)
import pandas as pd
# numpy - для численных расчетов
import numpy as np

# Импортируем базовые классы из нашего framework
from .base import IStrategy, Signal, BarContext, SignalSide
from typing import List, Dict, Any


# ===== TORTOISE STRATEGY CLASS =====

class TortoiseStrategy(IStrategy):
    """
    Tortoise Lite - трендовая стратегия на прорывах Donchian каналов.
    
    Параметры:
        don_break: период для breakout канала (default: 20)
        don_exit: период для exit канала (default: 10)
        trail_atr_len: период ATR для trailing stop (default: 20)
        trail_mult: множитель ATR для trailing (default: 2.0)
        markets: список рынков для торговли
    """
    
    def __init__(self, params: Dict[str, Any]):
        """
        Инициализация стратегии.
        
        Args:
            params: Словарь с параметрами стратегии
        """
        # Вызываем конструктор родительского класса
        # super() дает доступ к методам родителя (IStrategy)
        super().__init__(params)
        
        # Извлекаем параметры из словаря с default значениями
        # .get(key, default) возвращает значение или default если ключа нет
        
        # Период для breakout канала (сколько свечей смотрим назад)
        self.don_break = params.get('don_break', 20)
        
        # Период для exit канала (обычно короче breakout)
        self.don_exit = params.get('don_exit', 10)
        
        # Период для расчета ATR (Average True Range - средний диапазон)
        self.trail_atr_len = params.get('trail_atr_len', 20)
        
        # Множитель ATR для trailing stop (2.0 = стоп на 2×ATR от цены)
        self.trail_mult = params.get('trail_mult', 2.0)
        
        # Список рынков
        self._markets = params.get('markets', ['BTC-PERP', 'ETH-PERP'])
        
        # Словарь для хранения состояния trailing stops
        # market -> {'price': float, 'side': str}
        self.trailing_stops: Dict[str, Dict[str, Any]] = {}
    
    def markets(self) -> List[str]:
        """
        Возвращает список рынков на которых работает стратегия.
        
        Returns:
            Список строк с названиями рынков
        """
        return self._markets
    
    def _calculate_atr(self, df: pd.DataFrame, period: int = 14) -> pd.Series:
        """
        Расчет Average True Range (ATR) - мера волатильности.
        
        ATR = среднее значение "истинного диапазона" за N периодов.
        True Range = max из:
            1) high - low (диапазон текущей свечи)
            2) abs(high - prev_close) (гэп вверх)
            3) abs(low - prev_close) (гэп вниз)
        
        Args:
            df: DataFrame с колонками 'high', 'low', 'close'
            period: период для расчета (обычно 14 или 20)
        
        Returns:
            pandas Series с значениями ATR
        """
        # .shift(1) сдвигает значения на 1 позицию вниз (получаем prev_close)
        prev_close = df['close'].shift(1)
        
        # Считаем три варианта диапазона
        tr1 = df['high'] - df['low']                    # Диапазон свечи
        tr2 = abs(df['high'] - prev_close)              # Гэп вверх
        tr3 = abs(df['low'] - prev_close)               # Гэп вниз
        
        # Берем максимум из трех значений для каждой строки
        # pd.concat объединяет Series в DataFrame
        # axis=1 означает "по столбцам"
        true_range = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        
        # Считаем скользящее среднее true_range
        # .rolling(period) создает окно из period элементов
        # .mean() считает среднее для каждого окна
        atr = true_range.rolling(window=period).mean()
        
        return atr
    
    def _calculate_donchian(
        self,
        df: pd.DataFrame,
        period: int
    ) -> tuple[pd.Series, pd.Series]:
        """
        Расчет каналов Дончиана (Donchian Channels).
        
        Donchian Channel = самый высокий high и самый низкий low за N периодов.
        
        Args:
            df: DataFrame с колонками 'high', 'low'
            period: период канала (например 20)
        
        Returns:
            Tuple (upper, lower):
                upper: верхняя граница (максимум за период)
                lower: нижняя граница (минимум за период)
        """
        # .rolling(period) создает скользящее окно
        # .max() находит максимум в окне
        upper = df['high'].rolling(window=period).max()
        
        # .min() находит минимум в окне
        lower = df['low'].rolling(window=period).min()
        
        return upper, lower
    
    def on_bar(self, ctx: BarContext, history: pd.DataFrame) -> List[Signal]:
        """
        ГЛАВНЫЙ МЕТОД - генерация сигналов на новой свече.
        
        Вызывается каждый раз когда приходит новая свеча (например закрылась дневная свеча).
        
        Args:
            ctx: Контекст текущей свечи (цены OHLCV)
            history: История предыдущих свечей (pandas DataFrame)
                    Колонки: timestamp, open, high, low, close, volume
        
        Returns:
            Список сигналов (может быть пустым)
        """
        signals = []
        
        # --- 1) ПРОВЕРКИ ---
        
        # Проверяем что у нас достаточно истории для расчетов
        # Нужно минимум don_break + 1 свеча (для расчета канала и проверки прорыва)
        min_history = max(self.don_break, self.trail_atr_len) + 1
        if len(history) < min_history:
            # Недостаточно данных - возвращаем пустой список
            return signals
        
        # --- 2) РАСЧЕТ ИНДИКАТОРОВ ---
        
        # Рассчитываем Donchian каналы для breakout (20-period)
        don_upper_20, don_lower_20 = self._calculate_donchian(history, self.don_break)
        
        # Рассчитываем Donchian каналы для exit (10-period)
        don_upper_10, don_lower_10 = self._calculate_donchian(history, self.don_exit)
        
        # Рассчитываем ATR для trailing stop
        atr = self._calculate_atr(history, self.trail_atr_len)
        
        # --- 3) ПОЛУЧАЕМ ЗНАЧЕНИЯ ДЛЯ АНАЛИЗА ---
        
        # Берем ПРЕДЫДУЩИЕ значения каналов ([-2])
        # Почему -2 а не -1? Потому что индикаторы считаем на ЗАКРЫТЫХ свечах.
        # -1 = текущая свеча (может быть еще не закрыта)
        # -2 = предыдущая закрытая свеча
        
        # .iloc[-2] берет предпоследний элемент из Series
        prev_upper_20 = don_upper_20.iloc[-2] if len(don_upper_20) > 1 else None
        prev_lower_20 = don_lower_20.iloc[-2] if len(don_lower_20) > 1 else None
        prev_upper_10 = don_upper_10.iloc[-2] if len(don_upper_10) > 1 else None
        prev_lower_10 = don_lower_10.iloc[-2] if len(don_lower_10) > 1 else None
        current_atr = atr.iloc[-1] if len(atr) > 0 else None
        
        # Проверяем что все индикаторы рассчитались (не NaN)
        # pd.isna() проверяет является ли значение NaN (Not a Number)
        if (pd.isna(prev_upper_20) or pd.isna(prev_lower_20) or 
            pd.isna(current_atr)):
            return signals
        
        # --- 4) ЛОГИКА ENTRY ---
        
        # LONG BREAKOUT: цена закрытия пробила верхнюю границу 20-канала
        if ctx.close > prev_upper_20:
            # Создаем LONG сигнал
            
            # Entry = текущая цена закрытия (или можно prev_upper_20 + small offset)
            entry = ctx.close
            
            # Stop = нижняя граница 20-канала (классический Donchian stop)
            stop = prev_lower_20
            
            # Target = entry + 2R (где R = дистанция до стопа)
            risk_distance = abs(entry - stop)
            target_2r = entry + 2.0 * risk_distance
            
            # Создаем объект Signal
            signal = Signal(
                market=ctx.market,
                side=SignalSide.LONG,
                entry=entry,
                stop=stop,
                targets=[target_2r],  # Список целей (пока одна - 2R)
                confidence=0.5,        # Confidence можно настроить
                metadata={
                    'reason': 'donchian_breakout_long',
                    'don_upper': prev_upper_20,
                    'don_lower': prev_lower_20,
                    'atr': current_atr,
                    'timeframe': '1D'
                }
            )
            
            # Валидируем сигнал (проверка корректности)
            if self.validate_signal(signal):
                signals.append(signal)
        
        # SHORT BREAKOUT: цена закрытия пробила нижнюю границу 20-канала
        elif ctx.close < prev_lower_20:
            # Создаем SHORT сигнал
            
            entry = ctx.close
            
            # Для шорта stop ВЫШЕ entry
            stop = prev_upper_20
            
            # Target = entry - 2R
            risk_distance = abs(entry - stop)
            target_2r = entry - 2.0 * risk_distance
            
            signal = Signal(
                market=ctx.market,
                side=SignalSide.SHORT,
                entry=entry,
                stop=stop,
                targets=[target_2r],
                confidence=0.5,
                metadata={
                    'reason': 'donchian_breakout_short',
                    'don_upper': prev_upper_20,
                    'don_lower': prev_lower_20,
                    'atr': current_atr,
                    'timeframe': '1D'
                }
            )
            
            if self.validate_signal(signal):
                signals.append(signal)
        
        # --- 5) ЛОГИКА EXIT (для existing positions) ---
        # Этот функционал будет реализован в execution engine
        # Здесь мы можем генерировать EXIT сигналы если пробили exit канал
        
        # Проверяем есть ли у нас открытая позиция на этом рынке
        if ctx.market in self.trailing_stops:
            position_info = self.trailing_stops[ctx.market]
            position_side = position_info['side']
            
            # Exit для LONG позиции
            if position_side == 'long':
                # Если цена пробила нижнюю границу 10-канала - выход
                if not pd.isna(prev_lower_10) and ctx.close < prev_lower_10:
                    exit_signal = Signal(
                        market=ctx.market,
                        side=SignalSide.EXIT,
                        entry=ctx.close,  # Цена выхода
                        stop=0,  # Для EXIT stop не важен
                        targets=[],
                        confidence=1.0,
                        metadata={
                            'reason': 'donchian_exit_long',
                            'exit_channel': prev_lower_10
                        }
                    )
                    signals.append(exit_signal)
                    # Удаляем из trailing stops
                    del self.trailing_stops[ctx.market]
            
            # Exit для SHORT позиции
            elif position_side == 'short':
                # Если цена пробила верхнюю границу 10-канала - выход
                if not pd.isna(prev_upper_10) and ctx.close > prev_upper_10:
                    exit_signal = Signal(
                        market=ctx.market,
                        side=SignalSide.EXIT,
                        entry=ctx.close,
                        stop=0,
                        targets=[],
                        confidence=1.0,
                        metadata={
                            'reason': 'donchian_exit_short',
                            'exit_channel': prev_upper_10
                        }
                    )
                    signals.append(exit_signal)
                    del self.trailing_stops[ctx.market]
        
        return signals
    
    def register_position(self, market: str, side: str):
        """
        Зарегистрировать открытую позицию для tracking.
        
        Вызывается execution engine когда позиция открыта.
        
        Args:
            market: Рынок
            side: 'long' или 'short'
        """
        self.trailing_stops[market] = {
            'side': side,
            'opened_at': pd.Timestamp.now()
        }
    
    def unregister_position(self, market: str):
        """
        Удалить позицию из tracking.
        
        Args:
            market: Рынок
        """
        if market in self.trailing_stops:
            del self.trailing_stops[market]
    
    def __repr__(self) -> str:
        """
        Строковое представление стратегии.
        """
        return (
            f"TortoiseStrategy("
            f"don_break={self.don_break}, "
            f"don_exit={self.don_exit}, "
            f"markets={self.markets()}"
            f")"
        )

