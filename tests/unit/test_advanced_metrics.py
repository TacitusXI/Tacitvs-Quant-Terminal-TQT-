"""
Unit tests для Advanced Metrics Calculator.

Тестируем:
- Calmar Ratio (Return / MaxDD)
- Sortino Ratio (downside deviation)
- VaR & CVaR (Value at Risk)
- Rolling metrics
- Trade quality analysis
"""

import pytest
import pandas as pd
import numpy as np


class TestAdvancedMetricsCalculator:
    """Тесты для AdvancedMetricsCalculator."""
    
    @pytest.fixture
    def sample_equity_curve(self):
        """
        Sample equity curve для тестирования.
        
        Начинается с 10000, растет до 11000, падает до 9500, восстанавливается до 10500.
        """
        return [10000, 10200, 10500, 10800, 11000, 10700, 10300, 9500, 9700, 10000, 10300, 10500]
    
    @pytest.fixture
    def sample_returns(self):
        """Sample returns для тестирования."""
        # Mix of positive and negative returns
        return [2.0, 3.0, 2.8, 2.0, -2.7, -3.7, -7.8, 2.1, 3.1, 3.0, 1.9]
    
    def test_calmar_ratio_calculated(self, sample_equity_curve):
        """
        Тест: Calmar Ratio рассчитывается.
        
        Calmar = Annual Return / Max Drawdown
        Выше = лучше (больше return на единицу risk)
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        calculator = AdvancedMetricsCalculator()
        
        calmar = calculator.calmar_ratio(sample_equity_curve, period_days=len(sample_equity_curve))
        
        # Calmar должен быть числом
        assert isinstance(calmar, (int, float))
        
        # С нашей curve (рост 5%, MaxDD ~13.6%) Calmar должен быть положительным но небольшим
        # Не проверяем точное значение т.к. зависит от аннуализации
    
    def test_sortino_ratio_uses_downside_deviation(self, sample_returns):
        """
        Тест: Sortino Ratio использует только downside deviation.
        
        Sortino = (Return - Risk Free Rate) / Downside Deviation
        Лучше чем Sharpe т.к. не наказывает за upside volatility.
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        calculator = AdvancedMetricsCalculator()
        
        sortino = calculator.sortino_ratio(sample_returns, risk_free_rate=0.0)
        
        # Sortino должен быть числом
        assert isinstance(sortino, (int, float))
        
        # С нашими returns (больше положительных) Sortino должен быть положительным
        assert sortino > 0
    
    def test_sortino_higher_than_sharpe_for_positive_skew(self):
        """
        Тест: Sortino выше чем Sharpe для positive skew returns.
        
        Если много больших gains и мало небольших losses, 
        Sortino должен быть выше Sharpe.
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        # Positive skew: много небольших gains, редкие большие gains, мало losses
        positive_skew_returns = [1, 1, 1, 2, 2, 3, 5, -0.5, -0.5]
        
        calculator = AdvancedMetricsCalculator()
        
        sortino = calculator.sortino_ratio(positive_skew_returns)
        sharpe = calculator.sharpe_ratio(positive_skew_returns)
        
        # Sortino должен быть выше (не наказывает за upside vol)
        assert sortino >= sharpe
    
    def test_var_calculates_percentile_loss(self, sample_returns):
        """
        Тест: VaR (Value at Risk) рассчитывает percentile loss.
        
        VaR(95%) = максимальный loss который мы ожидаем в 95% случаев.
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        calculator = AdvancedMetricsCalculator()
        
        var_95 = calculator.value_at_risk(sample_returns, confidence=0.95)
        
        # VaR должен быть отрицательным числом (это loss)
        assert var_95 < 0
        
        # VaR(95%) означает что в 5% случаев loss будет хуже
        losses = [r for r in sample_returns if r < 0]
        worst_loss = min(losses)
        
        # VaR должен быть между 0 и worst loss
        assert worst_loss <= var_95 <= 0
    
    def test_cvar_worse_than_var(self, sample_returns):
        """
        Тест: CVaR (Conditional VaR) хуже чем VaR.
        
        CVaR = средний loss в худших X% случаев.
        CVaR всегда >= VaR (более консервативная оценка).
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        calculator = AdvancedMetricsCalculator()
        
        var_95 = calculator.value_at_risk(sample_returns, confidence=0.95)
        cvar_95 = calculator.conditional_var(sample_returns, confidence=0.95)
        
        # CVaR должен быть хуже (более отрицательным) чем VaR
        assert cvar_95 <= var_95
    
    def test_max_drawdown_calculated(self, sample_equity_curve):
        """
        Тест: Maximum Drawdown рассчитывается.
        
        MaxDD = максимальное падение от peak до trough.
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        calculator = AdvancedMetricsCalculator()
        
        max_dd = calculator.max_drawdown(sample_equity_curve)
        
        # MaxDD должен быть отрицательным числом (%)
        assert max_dd < 0
        
        # С нашей curve (пик 11000, дно 9500) MaxDD должен быть ~-13.6%
        expected_dd = ((9500 - 11000) / 11000) * 100
        assert abs(max_dd - expected_dd) < 0.1
    
    def test_rolling_sharpe_returns_series(self, sample_returns):
        """
        Тест: Rolling Sharpe возвращает series значений.
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        calculator = AdvancedMetricsCalculator()
        
        rolling_sharpe = calculator.rolling_sharpe(sample_returns, window=5)
        
        # Должен вернуть список или array
        assert isinstance(rolling_sharpe, (list, np.ndarray))
        
        # Длина должна быть len(returns) - window + 1
        expected_length = len(sample_returns) - 5 + 1
        assert len(rolling_sharpe) == expected_length
    
    def test_omega_ratio_calculated(self, sample_returns):
        """
        Тест: Omega Ratio рассчитывается.
        
        Omega = сумма gains выше threshold / сумма losses ниже threshold
        Omega > 1 = больше gains чем losses
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        calculator = AdvancedMetricsCalculator()
        
        omega = calculator.omega_ratio(sample_returns, threshold=0.0)
        
        # Omega должен быть положительным числом
        assert omega > 0
        
        # С нашими returns (больше gains) Omega должен быть > 1
        assert omega > 1
    
    def test_recovery_factor_calculated(self, sample_equity_curve):
        """
        Тест: Recovery Factor рассчитывается.
        
        Recovery = Net Profit / Max Drawdown
        Показывает сколько profit на единицу DD.
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        calculator = AdvancedMetricsCalculator()
        
        recovery = calculator.recovery_factor(sample_equity_curve)
        
        # Recovery должен быть числом
        assert isinstance(recovery, (int, float))
    
    def test_calculate_all_returns_dict(self, sample_equity_curve, sample_returns):
        """
        Тест: calculate_all возвращает словарь всех метрик.
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        calculator = AdvancedMetricsCalculator()
        
        metrics = calculator.calculate_all(
            equity_curve=sample_equity_curve,
            returns=sample_returns
        )
        
        # Должны быть все ключевые метрики
        expected_metrics = [
            'calmar_ratio',
            'sortino_ratio',
            'omega_ratio',
            'max_drawdown',
            'var_95',
            'cvar_95',
            'recovery_factor'
        ]
        
        for metric in expected_metrics:
            assert metric in metrics, f"Missing metric: {metric}"
    
    def test_empty_equity_curve_handled(self):
        """
        Тест: Пустая equity curve обрабатывается корректно.
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        calculator = AdvancedMetricsCalculator()
        
        max_dd = calculator.max_drawdown([])
        
        # Должен вернуть 0 или None
        assert max_dd == 0.0 or max_dd is None
    
    def test_flat_equity_curve_zero_drawdown(self):
        """
        Тест: Flat equity curve дает zero drawdown.
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        flat_curve = [10000] * 10
        
        calculator = AdvancedMetricsCalculator()
        max_dd = calculator.max_drawdown(flat_curve)
        
        # Drawdown должен быть 0
        assert max_dd == 0.0
    
    def test_all_positive_returns_no_var(self):
        """
        Тест: Только положительные returns → VaR близок к 0.
        """
        from core.research.advanced_metrics import AdvancedMetricsCalculator
        
        positive_returns = [1.0, 2.0, 1.5, 3.0, 2.5]
        
        calculator = AdvancedMetricsCalculator()
        var_95 = calculator.value_at_risk(positive_returns)
        
        # VaR должен быть близок к нулю или небольшим положительным
        # (нет downside risk)
        assert var_95 >= 0

