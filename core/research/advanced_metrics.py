"""
Advanced Metrics Calculator для глубокого анализа стратегий.

Профессиональные метрики:
- Calmar Ratio (Return / MaxDD)
- Sortino Ratio (учитывает только downside volatility)
- Omega Ratio (probability-weighted gains/losses)
- VaR & CVaR (Value at Risk)
- Recovery Factor
- Rolling metrics

Эти метрики дают более глубокое понимание risk/return профиля стратегии
чем классические Sharpe и MaxDD.
"""

import numpy as np
from typing import List, Dict, Any, Union


class AdvancedMetricsCalculator:
    """
    Calculator для продвинутых risk/return метрик.
    
    Пример:
        calc = AdvancedMetricsCalculator()
        
        # Отдельные метрики
        calmar = calc.calmar_ratio(equity_curve)
        sortino = calc.sortino_ratio(returns)
        var_95 = calc.value_at_risk(returns, confidence=0.95)
        
        # Все метрики сразу
        all_metrics = calc.calculate_all(equity_curve, returns)
    """
    
    def __init__(self):
        """Инициализация calculator."""
        pass
    
    def calmar_ratio(
        self,
        equity_curve: List[float],
        period_days: int = 365
    ) -> float:
        """
        Рассчитать Calmar Ratio.
        
        Calmar = Annualized Return / Absolute Max Drawdown
        
        Показывает сколько return на единицу максимального риска (DD).
        Выше = лучше.
        
        equity_curve: Список equity values.
        period_days: Количество дней в периоде (для аннуализации).
        
        Возвращает: Calmar ratio.
        """
        if not equity_curve or len(equity_curve) < 2:
            return 0.0
        
        # Total return
        total_return = ((equity_curve[-1] - equity_curve[0]) / equity_curve[0]) * 100
        
        # Annualize return
        years = period_days / 365.0
        annualized_return = total_return / years if years > 0 else total_return
        
        # Max drawdown (абсолютное значение)
        max_dd = abs(self.max_drawdown(equity_curve))
        
        if max_dd == 0:
            return 0.0  # Или inf, но 0 безопаснее
        
        return annualized_return / max_dd
    
    def sortino_ratio(
        self,
        returns: List[float],
        risk_free_rate: float = 0.0,
        periods_per_year: int = 252
    ) -> float:
        """
        Рассчитать Sortino Ratio.
        
        Sortino = (Mean Return - Risk Free Rate) / Downside Deviation
        
        В отличие от Sharpe, Sortino учитывает только downside volatility
        (не наказывает за upside).
        
        returns: Список returns (%).
        risk_free_rate: Risk-free rate (annualized %).
        periods_per_year: Периодов в году (для аннуализации).
        
        Возвращает: Sortino ratio.
        """
        if not returns:
            return 0.0
        
        # Средний return
        mean_return = np.mean(returns)
        
        # Downside deviation (только negative returns)
        downside_returns = [r for r in returns if r < 0]
        
        if not downside_returns:
            # Нет downside - возвращаем большое положительное число
            return 100.0  # Или можно вернуть inf
        
        # Используем ddof=0 чтобы избежать проблем с малым количеством данных
        downside_deviation = np.std(downside_returns, ddof=0)
        
        if downside_deviation == 0:
            # Все downside returns одинаковые (предсказуемый downside)
            # Возвращаем высокое значение
            return 100.0
        
        # Annualize
        risk_free_per_period = risk_free_rate / periods_per_year
        annualized_return = mean_return * periods_per_year
        annualized_dd = downside_deviation * np.sqrt(periods_per_year)
        
        return (annualized_return - risk_free_rate) / annualized_dd
    
    def sharpe_ratio(
        self,
        returns: List[float],
        risk_free_rate: float = 0.0,
        periods_per_year: int = 252
    ) -> float:
        """
        Рассчитать Sharpe Ratio (для сравнения с Sortino).
        
        Sharpe = (Mean Return - Risk Free Rate) / Std Dev
        
        returns: Список returns (%).
        risk_free_rate: Risk-free rate (annualized %).
        periods_per_year: Периодов в году.
        
        Возвращает: Sharpe ratio.
        """
        if not returns:
            return 0.0
        
        mean_return = np.mean(returns)
        std_dev = np.std(returns, ddof=1)
        
        if std_dev == 0:
            return 0.0
        
        # Annualize
        annualized_return = mean_return * periods_per_year
        annualized_std = std_dev * np.sqrt(periods_per_year)
        
        return (annualized_return - risk_free_rate) / annualized_std
    
    def value_at_risk(
        self,
        returns: List[float],
        confidence: float = 0.95
    ) -> float:
        """
        Рассчитать Value at Risk (VaR).
        
        VaR = максимальный loss в худших (1-confidence)% случаев.
        VaR(95%) = loss который будет превышен только в 5% случаев.
        
        returns: Список returns (%).
        confidence: Confidence level (0.95 = 95%).
        
        Возвращает: VaR (отрицательное число для loss).
        """
        if not returns:
            return 0.0
        
        # VaR = percentile на уровне (1 - confidence)
        var = np.percentile(returns, (1 - confidence) * 100)
        
        return float(var)
    
    def conditional_var(
        self,
        returns: List[float],
        confidence: float = 0.95
    ) -> float:
        """
        Рассчитать Conditional VaR (CVaR / Expected Shortfall).
        
        CVaR = средний loss в худших (1-confidence)% случаев.
        CVaR более консервативен чем VaR.
        
        returns: Список returns (%).
        confidence: Confidence level.
        
        Возвращает: CVaR (отрицательное число).
        """
        if not returns:
            return 0.0
        
        # Находим VaR
        var = self.value_at_risk(returns, confidence)
        
        # CVaR = средний return среди тех что хуже VaR
        tail_returns = [r for r in returns if r <= var]
        
        if not tail_returns:
            return var
        
        cvar = np.mean(tail_returns)
        
        return float(cvar)
    
    def max_drawdown(self, equity_curve: List[float]) -> float:
        """
        Рассчитать Maximum Drawdown.
        
        MaxDD = максимальное падение от peak до trough (%).
        
        equity_curve: Список equity values.
        
        Возвращает: Max drawdown (отрицательное число, %).
        """
        if not equity_curve or len(equity_curve) < 2:
            return 0.0
        
        # Running maximum
        running_max = np.maximum.accumulate(equity_curve)
        
        # Drawdown at each point
        drawdowns = ((equity_curve - running_max) / running_max) * 100
        
        # Maximum drawdown (наиболее отрицательный)
        max_dd = np.min(drawdowns)
        
        return float(max_dd)
    
    def omega_ratio(
        self,
        returns: List[float],
        threshold: float = 0.0
    ) -> float:
        """
        Рассчитать Omega Ratio.
        
        Omega = сумма(returns выше threshold) / сумма(|returns ниже threshold|)
        
        Omega > 1 = больше gains чем losses относительно threshold.
        
        returns: Список returns (%).
        threshold: Threshold return (обычно 0 или risk-free rate).
        
        Возвращает: Omega ratio.
        """
        if not returns:
            return 0.0
        
        # Gains и losses относительно threshold
        gains = sum(r - threshold for r in returns if r > threshold)
        losses = sum(abs(r - threshold) for r in returns if r < threshold)
        
        if losses == 0:
            return 100.0 if gains > 0 else 0.0
        
        omega = gains / losses
        
        return float(omega)
    
    def recovery_factor(self, equity_curve: List[float]) -> float:
        """
        Рассчитать Recovery Factor.
        
        Recovery = Net Profit / Absolute Max Drawdown
        
        Показывает сколько profit заработано на единицу максимального DD.
        
        equity_curve: Список equity values.
        
        Возвращает: Recovery factor.
        """
        if not equity_curve or len(equity_curve) < 2:
            return 0.0
        
        # Net profit
        net_profit = equity_curve[-1] - equity_curve[0]
        
        # Max drawdown (абсолютное значение в денежном выражении)
        max_dd_pct = abs(self.max_drawdown(equity_curve))
        max_dd_dollars = (max_dd_pct / 100) * max(equity_curve)
        
        if max_dd_dollars == 0:
            return 0.0
        
        recovery = net_profit / max_dd_dollars
        
        return float(recovery)
    
    def rolling_sharpe(
        self,
        returns: List[float],
        window: int = 30
    ) -> np.ndarray:
        """
        Рассчитать Rolling Sharpe Ratio.
        
        Показывает динамику risk-adjusted return во времени.
        
        returns: Список returns.
        window: Rolling window size.
        
        Возвращает: Array rolling Sharpe values.
        """
        if not returns or len(returns) < window:
            return np.array([])
        
        returns_array = np.array(returns)
        rolling_sharpes = []
        
        for i in range(len(returns_array) - window + 1):
            window_returns = returns_array[i:i+window]
            
            mean_ret = np.mean(window_returns)
            std_ret = np.std(window_returns, ddof=1)
            
            if std_ret > 0:
                sharpe = mean_ret / std_ret
            else:
                sharpe = 0.0
            
            rolling_sharpes.append(sharpe)
        
        return np.array(rolling_sharpes)
    
    def calculate_all(
        self,
        equity_curve: List[float],
        returns: List[float]
    ) -> Dict[str, Any]:
        """
        Рассчитать все метрики сразу.
        
        equity_curve: Список equity values.
        returns: Список returns (%).
        
        Возвращает: Словарь всех метрик.
        """
        metrics = {
            'calmar_ratio': self.calmar_ratio(equity_curve),
            'sortino_ratio': self.sortino_ratio(returns),
            'sharpe_ratio': self.sharpe_ratio(returns),
            'omega_ratio': self.omega_ratio(returns),
            'max_drawdown': self.max_drawdown(equity_curve),
            'var_95': self.value_at_risk(returns, confidence=0.95),
            'cvar_95': self.conditional_var(returns, confidence=0.95),
            'var_99': self.value_at_risk(returns, confidence=0.99),
            'cvar_99': self.conditional_var(returns, confidence=0.99),
            'recovery_factor': self.recovery_factor(equity_curve)
        }
        
        return metrics
    
    def __repr__(self) -> str:
        """Строковое представление."""
        return "AdvancedMetricsCalculator()"
