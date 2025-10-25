"""
Walk-Forward Analysis для валидации стратегий.

Walk-Forward - метод тестирования который защищает от overfitting:
1. Разделяем данные на train/test windows
2. Оптимизируем параметры на train
3. Тестируем на test (out-of-sample)
4. Повторяем для следующего периода

Два режима:
- Anchored: train window растет с каждым split
- Rolling: train window фиксированного размера, сдвигается
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

# Импорт BacktestEngine для запуска backtests
from core.backtest.engine import BacktestEngine


class WalkForwardSplitter:
    """
    Разделяет данные на train/test windows для Walk-Forward analysis.
    
    Пример:
        splitter = WalkForwardSplitter(
            train_days=180,  # 6 месяцев обучения
            test_days=30,    # 1 месяц тестирования
            step_days=30,    # Сдвиг на 1 месяц
            anchored=False   # Rolling window
        )
        
        splits = splitter.split(data)
        # Получаем список {train, test} пар
    """
    
    def __init__(
        self,
        train_days: int = 180,
        test_days: int = 30,
        step_days: Optional[int] = None,
        anchored: bool = False
    ):
        """
        Инициализация Walk-Forward splitter.
        
        train_days: Количество дней для обучения (in-sample).
        test_days: Количество дней для тестирования (out-of-sample).
        step_days: Шаг сдвига для следующего split (default = test_days).
        anchored: Если True - anchored window, если False - rolling window.
        """
        self.train_days = train_days
        self.test_days = test_days
        self.step_days = step_days or test_days  # По умолчанию = test_days
        self.anchored = anchored
    
    def split(self, data: pd.DataFrame) -> List[Dict[str, pd.DataFrame]]:
        """
        Разделить данные на train/test windows.
        
        data: DataFrame с временными рядами (должен иметь 'timestamp' колонку).
        
        Возвращает: Список словарей [{'train': df, 'test': df}, ...]
        
        Raises:
            ValueError: Если данных недостаточно для хотя бы одного split.
        """
        # Проверка что данных достаточно
        min_required = self.train_days + self.test_days
        if len(data) < min_required:
            raise ValueError(
                f"Недостаточно данных. Требуется минимум {min_required} дней, "
                f"имеется {len(data)} дней"
            )
        
        splits = []
        
        if self.anchored:
            # Anchored window: train растет с каждым split
            splits = self._create_anchored_splits(data)
        else:
            # Rolling window: train фиксированного размера
            splits = self._create_rolling_splits(data)
        
        return splits
    
    def _create_anchored_splits(self, data: pd.DataFrame) -> List[Dict[str, pd.DataFrame]]:
        """
        Создать anchored window splits.
        
        Anchored: train всегда начинается с начала данных и растет.
        
        Split 1: [Train: 0-180][Test: 180-210]
        Split 2: [Train: 0-210][Test: 210-240]
        Split 3: [Train: 0-240][Test: 240-270]
        """
        splits = []
        
        # Начинаем с первого возможного split
        train_end = self.train_days
        test_end = train_end + self.test_days
        
        while test_end <= len(data):
            # Train от начала до train_end
            train_data = data.iloc[0:train_end].copy()
            
            # Test от train_end до test_end
            test_data = data.iloc[train_end:test_end].copy()
            
            splits.append({
                'train': train_data,
                'test': test_data
            })
            
            # Сдвигаем на step_days
            train_end += self.step_days
            test_end += self.step_days
        
        return splits
    
    def _create_rolling_splits(self, data: pd.DataFrame) -> List[Dict[str, pd.DataFrame]]:
        """
        Создать rolling window splits.
        
        Rolling: train фиксированного размера, сдвигается вперед.
        
        Split 1: [Train: 0-180][Test: 180-210]
        Split 2: [Train: 30-210][Test: 210-240]
        Split 3: [Train: 60-240][Test: 240-270]
        """
        splits = []
        
        # Начинаем с первого split
        train_start = 0
        train_end = self.train_days
        test_end = train_end + self.test_days
        
        while test_end <= len(data):
            # Train от train_start до train_end
            train_data = data.iloc[train_start:train_end].copy()
            
            # Test от train_end до test_end
            test_data = data.iloc[train_end:test_end].copy()
            
            splits.append({
                'train': train_data,
                'test': test_data
            })
            
            # Сдвигаем на step_days
            train_start += self.step_days
            train_end += self.step_days
            test_end += self.step_days
        
        return splits
    
    def get_split_info(self, splits: List[Dict[str, pd.DataFrame]]) -> List[Dict[str, Any]]:
        """
        Получить метаданные о каждом split.
        
        splits: Список splits от метода split().
        
        Возвращает: Список словарей с информацией о каждом split.
        """
        info = []
        
        for i, split in enumerate(splits):
            train = split['train']
            test = split['test']
            
            # Получаем даты из timestamp колонки
            train_start = train['timestamp'].iloc[0]
            train_end = train['timestamp'].iloc[-1]
            test_start = test['timestamp'].iloc[0]
            test_end = test['timestamp'].iloc[-1]
            
            split_info = {
                'split_id': i,
                'train_start': train_start,
                'train_end': train_end,
                'test_start': test_start,
                'test_end': test_end,
                'train_size': len(train),
                'test_size': len(test)
            }
            
            info.append(split_info)
        
        return info
    
    def __repr__(self) -> str:
        """Строковое представление."""
        mode = "Anchored" if self.anchored else "Rolling"
        return (
            f"WalkForwardSplitter("
            f"train={self.train_days}d, "
            f"test={self.test_days}d, "
            f"step={self.step_days}d, "
            f"mode={mode})"
        )


class WalkForwardAnalyzer:
    """
    Analyzer для запуска Walk-Forward tests на стратегии.
    
    Для каждого split:
    1. Запускает backtest на train (In-Sample)
    2. Запускает backtest на test (Out-of-Sample)
    3. Сравнивает IS vs OOS метрики
    
    Агрегирует результаты для оценки робастности стратегии.
    
    Пример:
        analyzer = WalkForwardAnalyzer(
            strategy=tortoise,
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        results = analyzer.run_analysis(
            market='BTC-PERP',
            data=btc_data,
            splitter=splitter
        )
        
        print(f"OOS Sharpe: {results['summary']['oos_avg_sharpe']}")
        print(f"OOS Consistency: {results['summary']['oos_consistency']}%")
    """
    
    def __init__(
        self,
        strategy,
        initial_capital: float = 10000.0,
        risk_per_trade: float = 1.0
    ):
        """
        Инициализация WalkForwardAnalyzer.
        
        strategy: Стратегия для тестирования (должна реализовывать IStrategy).
        initial_capital: Начальный капитал для backtesting.
        risk_per_trade: Риск на сделку в % (default: 1.0).
        """
        self.strategy = strategy
        self.initial_capital = initial_capital
        self.risk_per_trade = risk_per_trade
    
    def run_analysis(
        self,
        market: str,
        data: pd.DataFrame,
        splitter: WalkForwardSplitter
    ) -> Dict[str, Any]:
        """
        Запустить Walk-Forward analysis.
        
        market: Название рынка (например, 'BTC-PERP').
        data: DataFrame с историческими данными.
        splitter: WalkForwardSplitter для разделения данных.
        
        Возвращает: Словарь с результатами:
            {
                'splits': [
                    {
                        'split_id': 0,
                        'train_metrics': {...},  # IS метрики
                        'test_metrics': {...}    # OOS метрики
                    },
                    ...
                ],
                'summary': {
                    'is_avg_return': ...,
                    'oos_avg_return': ...,
                    'oos_avg_sharpe': ...,
                    'oos_win_rate': ...,
                    'oos_consistency': ...,  # % прибыльных OOS периодов
                    'num_splits': ...
                }
            }
        """
        # Разделяем данные на splits
        splits = splitter.split(data)
        
        split_results = []
        
        # Для каждого split запускаем backtests
        for i, split in enumerate(splits):
            train_data = split['train']
            test_data = split['test']
            
            # Backtest на train (In-Sample)
            train_metrics = self._run_backtest(market, train_data)
            
            # Backtest на test (Out-of-Sample)
            test_metrics = self._run_backtest(market, test_data)
            
            split_results.append({
                'split_id': i,
                'train_metrics': train_metrics,
                'test_metrics': test_metrics
            })
        
        # Агрегируем результаты
        summary = self._aggregate_results(split_results)
        
        return {
            'splits': split_results,
            'summary': summary
        }
    
    def _run_backtest(self, market: str, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Запустить backtest на данных.
        
        market: Название рынка.
        data: DataFrame с данными.
        
        Возвращает: Метрики backtest.
        """
        # Создаем backtest engine
        engine = BacktestEngine(
            strategy=self.strategy,
            initial_capital=self.initial_capital,
            risk_per_trade=self.risk_per_trade
        )
        
        # Запускаем backtest
        results = engine.run_backtest(market, data)
        
        # Возвращаем метрики
        return results['metrics']
    
    def _aggregate_results(self, split_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Агрегировать результаты всех splits.
        
        split_results: Список результатов для каждого split.
        
        Возвращает: Агрегированные метрики.
        """
        # Собираем IS метрики
        is_returns = []
        is_sharpes = []
        
        # Собираем OOS метрики
        oos_returns = []
        oos_sharpes = []
        oos_win_rates = []
        oos_profitable_count = 0
        
        for split in split_results:
            # In-Sample (train)
            train = split['train_metrics']
            is_returns.append(train.get('return_pct', 0.0))
            is_sharpes.append(train.get('sharpe_ratio', 0.0))
            
            # Out-of-Sample (test)
            test = split['test_metrics']
            test_return = test.get('return_pct', 0.0)
            oos_returns.append(test_return)
            oos_sharpes.append(test.get('sharpe_ratio', 0.0))
            oos_win_rates.append(test.get('win_rate', 0.0))
            
            # Считаем прибыльные OOS периоды
            if test_return > 0:
                oos_profitable_count += 1
        
        # Вычисляем средние
        is_avg_return = np.mean(is_returns) if is_returns else 0.0
        oos_avg_return = np.mean(oos_returns) if oos_returns else 0.0
        oos_avg_sharpe = np.mean(oos_sharpes) if oos_sharpes else 0.0
        oos_avg_win_rate = np.mean(oos_win_rates) if oos_win_rates else 0.0
        
        # OOS Consistency = % прибыльных OOS периодов
        oos_consistency = (oos_profitable_count / len(split_results) * 100) if split_results else 0.0
        
        return {
            'is_avg_return': is_avg_return,
            'oos_avg_return': oos_avg_return,
            'oos_avg_sharpe': oos_avg_sharpe,
            'oos_win_rate': oos_avg_win_rate,
            'oos_consistency': oos_consistency,
            'num_splits': len(split_results)
        }
    
    def __repr__(self) -> str:
        """Строковое представление."""
        return (
            f"WalkForwardAnalyzer("
            f"strategy={self.strategy.id if hasattr(self.strategy, 'id') else 'unknown'}, "
            f"capital={self.initial_capital:.0f}, "
            f"risk={self.risk_per_trade}%)"
        )

