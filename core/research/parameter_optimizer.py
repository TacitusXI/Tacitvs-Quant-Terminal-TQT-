"""
Parameter Optimizer для поиска оптимальных параметров стратегии.

Grid Search + Walk-Forward validation для защиты от overfitting:
1. Генерируем все комбинации параметров
2. Для каждой комбинации запускаем Walk-Forward analysis
3. Ранжируем по OOS метрикам (NOT in-sample!)
4. Анализируем parameter sensitivity

Ключевое отличие от naive optimization:
- Используем OOS метрики для ranking
- Walk-Forward validation предотвращает overfitting
- Parameter sensitivity показывает robustness
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Type
from itertools import product

from core.research.walk_forward import WalkForwardSplitter, WalkForwardAnalyzer


class ParameterOptimizer:
    """
    Optimizer для поиска лучших параметров стратегии.
    
    Использует Grid Search + Walk-Forward для защиты от overfitting.
    
    Пример:
        optimizer = ParameterOptimizer(
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        param_grid = {
            'don_break': [10, 15, 20, 25, 30],
            'don_exit': [5, 10, 15, 20]
        }
        
        results = optimizer.optimize(
            strategy_class=TortoiseStrategy,
            market='BTC-PERP',
            data=btc_data,
            param_grid=param_grid,
            top_n=5
        )
        
        print(f"Best params: {results['best_params']}")
        print(f"Best OOS Sharpe: {results['best_oos_sharpe']}")
    """
    
    def __init__(
        self,
        initial_capital: float = 10000.0,
        risk_per_trade: float = 1.0
    ):
        """
        Инициализация Parameter Optimizer.
        
        initial_capital: Начальный капитал для backtesting.
        risk_per_trade: Риск на сделку в %.
        """
        self.initial_capital = initial_capital
        self.risk_per_trade = risk_per_trade
    
    def optimize(
        self,
        strategy_class: Type,
        market: str,
        data: pd.DataFrame,
        param_grid: Dict[str, List[Any]],
        top_n: int = 5,
        wf_train_days: int = 90,
        wf_test_days: int = 30,
        wf_step_days: int = 30,
        metric: str = 'oos_sharpe'
    ) -> Dict[str, Any]:
        """
        Запустить parameter optimization.
        
        strategy_class: Класс стратегии (не instance!).
        market: Название рынка.
        data: DataFrame с данными.
        param_grid: Словарь параметров для grid search.
        top_n: Количество лучших конфигураций для возврата.
        wf_train_days: Дней в train window для WF.
        wf_test_days: Дней в test window для WF.
        wf_step_days: Шаг для WF.
        metric: Метрика для ранжирования (default: 'oos_sharpe').
        
        Возвращает: Словарь с результатами:
            {
                'best_params': {...},
                'best_oos_sharpe': ...,
                'all_results': [...],
                'top_n': [...],
                'sensitivity': {...}
            }
        """
        # Handle empty param grid
        if not param_grid:
            return {
                'best_params': {},
                'best_oos_sharpe': 0.0,
                'all_results': [],
                'top_n': [],
                'sensitivity': {}
            }
        
        # Генерируем все комбинации параметров
        param_combinations = self._generate_param_combinations(param_grid)
        
        print(f"\n🔧 Parameter Optimization")
        print(f"   Комбинаций: {len(param_combinations)}")
        print(f"   Walk-Forward: {wf_train_days}d train, {wf_test_days}d test")
        
        # Тестируем каждую комбинацию
        all_results = []
        
        for i, params in enumerate(param_combinations):
            print(f"\n   [{i+1}/{len(param_combinations)}] Testing: {params}")
            
            # Запускаем Walk-Forward analysis с этими параметрами
            wf_results = self._run_walk_forward(
                strategy_class=strategy_class,
                market=market,
                data=data,
                params=params,
                train_days=wf_train_days,
                test_days=wf_test_days,
                step_days=wf_step_days
            )
            
            # Сохраняем результаты
            result = {
                'params': params,
                'is_avg_return': wf_results['summary']['is_avg_return'],
                'oos_avg_return': wf_results['summary']['oos_avg_return'],
                'oos_sharpe': wf_results['summary'].get('oos_avg_sharpe', 0.0),
                'oos_consistency': wf_results['summary']['oos_consistency'],
                'num_splits': wf_results['summary']['num_splits']
            }
            
            all_results.append(result)
            
            print(f"      OOS Return: {result['oos_avg_return']:.2f}%, "
                  f"OOS Sharpe: {result['oos_sharpe']:.2f}, "
                  f"Consistency: {result['oos_consistency']:.1f}%")
        
        # Ранжируем по OOS метрике (NOT in-sample!)
        all_results_sorted = sorted(
            all_results,
            key=lambda x: x.get(metric, 0.0),
            reverse=True
        )
        
        # Top N конфигураций
        top_n_results = all_results_sorted[:top_n]
        
        # Лучшая конфигурация
        best_result = all_results_sorted[0] if all_results_sorted else None
        
        # Parameter sensitivity
        sensitivity = self.calculate_sensitivity(all_results)
        
        print(f"\n✅ Optimization complete!")
        if best_result:
            print(f"   Best params: {best_result['params']}")
            print(f"   Best OOS Sharpe: {best_result['oos_sharpe']:.2f}")
        
        return {
            'best_params': best_result['params'] if best_result else {},
            'best_oos_sharpe': best_result['oos_sharpe'] if best_result else 0.0,
            'all_results': all_results_sorted,
            'top_n': top_n_results,
            'sensitivity': sensitivity
        }
    
    def _generate_param_combinations(
        self,
        param_grid: Dict[str, List[Any]]
    ) -> List[Dict[str, Any]]:
        """
        Генерировать все комбинации параметров.
        
        param_grid: {'param1': [val1, val2], 'param2': [val3, val4]}
        
        Возвращает: [{'param1': val1, 'param2': val3}, ...]
        """
        # Получаем ключи и значения
        keys = list(param_grid.keys())
        values = list(param_grid.values())
        
        # Генерируем все комбинации
        combinations = []
        for combination in product(*values):
            params = dict(zip(keys, combination))
            combinations.append(params)
        
        return combinations
    
    def _run_walk_forward(
        self,
        strategy_class: Type,
        market: str,
        data: pd.DataFrame,
        params: Dict[str, Any],
        train_days: int,
        test_days: int,
        step_days: int
    ) -> Dict[str, Any]:
        """
        Запустить Walk-Forward analysis с заданными параметрами.
        
        Возвращает: WF results.
        """
        # Создаем стратегию с этими параметрами
        strategy_params = params.copy()
        strategy_params['markets'] = [market]
        
        strategy = strategy_class(strategy_params)
        
        # Создаем WF splitter
        splitter = WalkForwardSplitter(
            train_days=train_days,
            test_days=test_days,
            step_days=step_days,
            anchored=False  # Rolling window
        )
        
        # Создаем WF analyzer
        analyzer = WalkForwardAnalyzer(
            strategy=strategy,
            initial_capital=self.initial_capital,
            risk_per_trade=self.risk_per_trade
        )
        
        # Запускаем WF analysis
        results = analyzer.run_analysis(
            market=market,
            data=data,
            splitter=splitter
        )
        
        return results
    
    def calculate_sensitivity(
        self,
        results: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """
        Рассчитать parameter sensitivity.
        
        Показывает какие параметры больше влияют на результат.
        
        results: Список результатов optimization.
        
        Возвращает: Словарь {param_name: sensitivity_score}.
        """
        if not results:
            return {}
        
        # Получаем все имена параметров
        param_names = list(results[0]['params'].keys())
        
        sensitivity = {}
        
        for param_name in param_names:
            # Группируем результаты по значению этого параметра
            param_values = {}
            
            for result in results:
                param_val = result['params'][param_name]
                oos_sharpe = result.get('oos_sharpe', 0.0)
                
                if param_val not in param_values:
                    param_values[param_val] = []
                
                param_values[param_val].append(oos_sharpe)
            
            # Вычисляем среднее для каждого значения
            avg_by_value = {
                val: np.mean(sharpes)
                for val, sharpes in param_values.items()
            }
            
            # Sensitivity = range средних значений
            if len(avg_by_value) > 1:
                min_avg = min(avg_by_value.values())
                max_avg = max(avg_by_value.values())
                sensitivity[param_name] = max_avg - min_avg
            else:
                sensitivity[param_name] = 0.0
        
        return sensitivity
    
    def __repr__(self) -> str:
        """Строковое представление."""
        return (
            f"ParameterOptimizer("
            f"capital={self.initial_capital:.0f}, "
            f"risk={self.risk_per_trade}%)"
        )

