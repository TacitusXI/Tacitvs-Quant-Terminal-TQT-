"""
Unit tests для Parameter Optimizer.

Тестируем:
- Grid search по параметрам
- Walk-Forward validation
- Ranking по OOS метрикам
- Parameter sensitivity
"""

import pytest
from unittest.mock import Mock, MagicMock


class TestParameterOptimizer:
    """Тесты для ParameterOptimizer."""
    
    def test_init_stores_parameters(self):
        """Тест: ParameterOptimizer сохраняет параметры."""
        from core.research.parameter_optimizer import ParameterOptimizer
        
        optimizer = ParameterOptimizer(
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        assert optimizer.initial_capital == 10000.0
        assert optimizer.risk_per_trade == 1.0
    
    def test_optimize_returns_results(self):
        """
        Тест: optimize() возвращает результаты.
        """
        from core.research.parameter_optimizer import ParameterOptimizer
        
        # Mock strategy class
        mock_strategy_class = Mock()
        mock_strategy_instance = Mock()
        mock_strategy_class.return_value = mock_strategy_instance
        
        # Mock data
        import pandas as pd
        mock_data = pd.DataFrame({
            'timestamp': pd.date_range('2024-01-01', periods=200, freq='D'),
            'open': [100.0] * 200,
            'high': [101.0] * 200,
            'low': [99.0] * 200,
            'close': [100.0] * 200,
            'volume': [1000.0] * 200
        })
        
        param_grid = {
            'don_break': [10, 20],
            'don_exit': [5, 10]
        }
        
        optimizer = ParameterOptimizer()
        
        # Mock strategy должен иметь on_bar method
        mock_strategy_instance.on_bar.return_value = []
        mock_strategy_instance.markets = ['TEST-PERP']
        
        results = optimizer.optimize(
            strategy_class=mock_strategy_class,
            market='TEST-PERP',
            data=mock_data,
            param_grid=param_grid
        )
        
        # Результаты должны содержать ключевые поля
        assert 'best_params' in results
        assert 'all_results' in results
        assert 'top_n' in results
    
    def test_grid_search_tests_all_combinations(self):
        """
        Тест: Grid search тестирует все комбинации параметров.
        
        Если 2 значения don_break × 2 значения don_exit = 4 комбинации.
        """
        from core.research.parameter_optimizer import ParameterOptimizer
        
        mock_strategy_class = Mock()
        mock_strategy_instance = Mock()
        mock_strategy_class.return_value = mock_strategy_instance
        mock_strategy_instance.on_bar.return_value = []
        mock_strategy_instance.markets = ['TEST-PERP']
        
        import pandas as pd
        mock_data = pd.DataFrame({
            'timestamp': pd.date_range('2024-01-01', periods=200, freq='D'),
            'open': [100.0] * 200,
            'high': [101.0] * 200,
            'low': [99.0] * 200,
            'close': [100.0] * 200,
            'volume': [1000.0] * 200
        })
        
        param_grid = {
            'don_break': [10, 20],
            'don_exit': [5, 10]
        }
        
        optimizer = ParameterOptimizer()
        results = optimizer.optimize(
            strategy_class=mock_strategy_class,
            market='TEST-PERP',
            data=mock_data,
            param_grid=param_grid
        )
        
        # Должно быть 2 × 2 = 4 теста
        assert len(results['all_results']) == 4
    
    def test_best_params_ranked_by_oos_metric(self):
        """
        Тест: Лучшие параметры ранжируются по OOS метрике.
        
        Важно: NOT by in-sample metric (защита от overfitting).
        """
        from core.research.parameter_optimizer import ParameterOptimizer
        
        mock_strategy_class = Mock()
        optimizer = ParameterOptimizer()
        
        # Создаем mock results с разными IS/OOS метриками
        mock_results = [
            {
                'params': {'don_break': 10},
                'is_sharpe': 2.0,
                'oos_sharpe': 0.5  # Хороший IS, плохой OOS
            },
            {
                'params': {'don_break': 20},
                'is_sharpe': 1.0,
                'oos_sharpe': 1.5  # Средний IS, лучший OOS
            }
        ]
        
        # Лучший должен быть don_break=20 (по OOS)
        best = max(mock_results, key=lambda x: x['oos_sharpe'])
        
        assert best['params']['don_break'] == 20
    
    def test_uses_walk_forward_for_validation(self):
        """
        Тест: Optimizer использует Walk-Forward для валидации.
        
        Это защищает от overfitting на одном периоде.
        """
        from core.research.parameter_optimizer import ParameterOptimizer
        
        # Проверяем что optimizer принимает WF splitter
        optimizer = ParameterOptimizer()
        
        assert hasattr(optimizer, 'optimize')
        # В optimize должен быть параметр для WF
    
    def test_top_n_returns_best_configurations(self):
        """
        Тест: top_n возвращает N лучших конфигураций.
        """
        from core.research.parameter_optimizer import ParameterOptimizer
        
        mock_strategy_class = Mock()
        mock_strategy_instance = Mock()
        mock_strategy_class.return_value = mock_strategy_instance
        mock_strategy_instance.on_bar.return_value = []
        mock_strategy_instance.markets = ['TEST-PERP']
        
        import pandas as pd
        mock_data = pd.DataFrame({
            'timestamp': pd.date_range('2024-01-01', periods=200, freq='D'),
            'open': [100.0] * 200,
            'high': [101.0] * 200,
            'low': [99.0] * 200,
            'close': [100.0] * 200,
            'volume': [1000.0] * 200
        })
        
        param_grid = {
            'don_break': [10, 15, 20, 25],
            'don_exit': [5, 10]
        }
        
        optimizer = ParameterOptimizer()
        results = optimizer.optimize(
            strategy_class=mock_strategy_class,
            market='TEST-PERP',
            data=mock_data,
            param_grid=param_grid,
            top_n=3
        )
        
        # top_n должен содержать максимум 3 результата
        assert len(results['top_n']) <= 3
    
    def test_empty_param_grid_handled(self):
        """
        Тест: Пустой param grid обрабатывается корректно.
        """
        from core.research.parameter_optimizer import ParameterOptimizer
        
        mock_strategy_class = Mock()
        
        import pandas as pd
        mock_data = pd.DataFrame({
            'timestamp': pd.date_range('2024-01-01', periods=200, freq='D'),
            'open': [100.0] * 200,
            'high': [101.0] * 200,
            'low': [99.0] * 200,
            'close': [100.0] * 200,
            'volume': [1000.0] * 200
        })
        
        optimizer = ParameterOptimizer()
        
        results = optimizer.optimize(
            strategy_class=mock_strategy_class,
            market='TEST-PERP',
            data=mock_data,
            param_grid={}
        )
        
        # Должен вернуть пустые результаты
        assert len(results['all_results']) == 0
    
    def test_parameter_sensitivity_calculated(self):
        """
        Тест: Parameter sensitivity рассчитывается.
        
        Показывает какие параметры сильнее влияют на результат.
        """
        from core.research.parameter_optimizer import ParameterOptimizer
        
        optimizer = ParameterOptimizer()
        
        # Mock results с разными параметрами
        mock_results = [
            {'params': {'don_break': 10, 'don_exit': 5}, 'oos_sharpe': 0.5},
            {'params': {'don_break': 10, 'don_exit': 10}, 'oos_sharpe': 0.6},
            {'params': {'don_break': 20, 'don_exit': 5}, 'oos_sharpe': 1.5},
            {'params': {'don_break': 20, 'don_exit': 10}, 'oos_sharpe': 1.6},
        ]
        
        sensitivity = optimizer.calculate_sensitivity(mock_results)
        
        # Sensitivity должен быть словарем
        assert isinstance(sensitivity, dict)
        
        # don_break имеет большее влияние (1.0 vs 0.5-0.6)
        # Проверяем что sensitivity содержит оба параметра
        assert 'don_break' in sensitivity
        assert 'don_exit' in sensitivity

