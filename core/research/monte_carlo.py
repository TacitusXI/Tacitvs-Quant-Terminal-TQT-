"""
Monte Carlo Simulation для оценки робастности стратегий.

Monte Carlo использует randomization для оценки range возможных результатов:
1. Trade Shuffling - перемешиваем порядок сделок N раз
2. Каждый раз вычисляем equity curve
3. Анализируем распределение outcomes

Ключевые метрики:
- Percentile curves (p5, p25, p50, p75, p95)
- Probability of profit
- Median vs Mean return
- Best/Worst case scenarios
"""

import numpy as np
from typing import List, Dict, Any
import random


class MonteCarloSimulator:
    """
    Simulator для Monte Carlo analysis на результатах backtest.
    
    Принимает список сделок и делает N permutations (перестановок) 
    для оценки распределения возможных результатов.
    
    Пример:
        trades = [
            {'pnl': 100, 'return_pct': 1.0},
            {'pnl': -50, 'return_pct': -0.5},
            ...
        ]
        
        simulator = MonteCarloSimulator(n_simulations=1000)
        results = simulator.run_simulation(trades)
        
        print(f"Probability of Profit: {results['stats']['prob_profit']:.1%}")
        print(f"Median Return: {results['stats']['median_return']:.2f}%")
    """
    
    def __init__(
        self,
        n_simulations: int = 1000,
        initial_capital: float = 10000.0,
        seed: int = None
    ):
        """
        Инициализация Monte Carlo Simulator.
        
        n_simulations: Количество симуляций (permutations).
        initial_capital: Начальный капитал.
        seed: Random seed для воспроизводимости (опционально).
        """
        self.n_simulations = n_simulations
        self.initial_capital = initial_capital
        self.seed = seed
        
        # Устанавливаем seed если указан
        if seed is not None:
            random.seed(seed)
            np.random.seed(seed)
    
    def run_simulation(self, trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Запустить Monte Carlo simulation.
        
        trades: Список сделок с полями 'pnl' и 'return_pct'.
        
        Возвращает: Словарь с результатами:
            {
                'simulations': [
                    {
                        'equity_curve': [...],
                        'final_equity': ...,
                        'return_pct': ...,
                        'shuffled_pnl': [...]
                    },
                    ...
                ],
                'percentiles': {
                    'p5': [...],   # 5th percentile equity curve
                    'p25': [...],
                    'p50': [...],  # Median
                    'p75': [...],
                    'p95': [...]
                },
                'stats': {
                    'prob_profit': ...,
                    'median_return': ...,
                    'mean_return': ...,
                    'worst_case_return': ...,
                    'best_case_return': ...,
                    'median_final_equity': ...
                }
            }
        """
        # Handle empty trades
        if not trades:
            return self._empty_results()
        
        simulations = []
        
        # Запускаем N симуляций
        for i in range(self.n_simulations):
            # Shuffle trades (создаем копию и перемешиваем)
            shuffled_trades = trades.copy()
            random.shuffle(shuffled_trades)
            
            # Вычисляем equity curve для этой permutation
            equity_curve = self._calculate_equity_curve(shuffled_trades)
            
            # Сохраняем результаты симуляции
            final_equity = equity_curve[-1]
            return_pct = ((final_equity - self.initial_capital) / self.initial_capital) * 100
            
            simulations.append({
                'equity_curve': equity_curve,
                'final_equity': final_equity,
                'return_pct': return_pct,
                'shuffled_pnl': [t['pnl'] for t in shuffled_trades]
            })
        
        # Вычисляем percentiles и stats
        percentiles = self._calculate_percentiles(simulations)
        stats = self._calculate_stats(simulations)
        
        return {
            'simulations': simulations,
            'percentiles': percentiles,
            'stats': stats
        }
    
    def _calculate_equity_curve(self, trades: List[Dict[str, Any]]) -> List[float]:
        """
        Вычислить equity curve для последовательности сделок.
        
        trades: Список сделок в определенном порядке.
        
        Возвращает: Список equity values начиная с initial_capital.
        """
        equity_curve = [self.initial_capital]
        current_equity = self.initial_capital
        
        for trade in trades:
            # Добавляем PnL к текущему equity
            current_equity += trade['pnl']
            equity_curve.append(current_equity)
        
        return equity_curve
    
    def _calculate_percentiles(self, simulations: List[Dict[str, Any]]) -> Dict[str, List[float]]:
        """
        Вычислить percentile equity curves.
        
        simulations: Список всех симуляций.
        
        Возвращает: Словарь с percentile curves.
        """
        # Собираем все equity curves в матрицу
        # Размерность: n_simulations × (n_trades + 1)
        equity_matrix = np.array([sim['equity_curve'] for sim in simulations])
        
        # Вычисляем percentiles для каждого временного шага
        p5 = np.percentile(equity_matrix, 5, axis=0).tolist()
        p25 = np.percentile(equity_matrix, 25, axis=0).tolist()
        p50 = np.percentile(equity_matrix, 50, axis=0).tolist()  # Median
        p75 = np.percentile(equity_matrix, 75, axis=0).tolist()
        p95 = np.percentile(equity_matrix, 95, axis=0).tolist()
        
        return {
            'p5': p5,
            'p25': p25,
            'p50': p50,
            'p75': p75,
            'p95': p95
        }
    
    def _calculate_stats(self, simulations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Вычислить агрегированные статистики.
        
        simulations: Список всех симуляций.
        
        Возвращает: Словарь со статистиками.
        """
        # Собираем финальные returns из всех симуляций
        returns = [sim['return_pct'] for sim in simulations]
        final_equities = [sim['final_equity'] for sim in simulations]
        
        # Вероятность прибыли
        profitable_sims = sum(1 for r in returns if r > 0)
        prob_profit = profitable_sims / len(simulations) if simulations else 0.0
        
        # Медиана и среднее
        median_return = np.median(returns)
        mean_return = np.mean(returns)
        
        # Лучший и худший случаи
        worst_case_return = np.min(returns)
        best_case_return = np.max(returns)
        
        # Медианный финальный equity
        median_final_equity = np.median(final_equities)
        
        return {
            'prob_profit': prob_profit,
            'median_return': float(median_return),
            'mean_return': float(mean_return),
            'worst_case_return': float(worst_case_return),
            'best_case_return': float(best_case_return),
            'median_final_equity': float(median_final_equity)
        }
    
    def _empty_results(self) -> Dict[str, Any]:
        """
        Возвращает пустые результаты для случая без сделок.
        """
        return {
            'simulations': [],
            'percentiles': {
                'p5': [self.initial_capital],
                'p25': [self.initial_capital],
                'p50': [self.initial_capital],
                'p75': [self.initial_capital],
                'p95': [self.initial_capital]
            },
            'stats': {
                'prob_profit': 0.0,
                'median_return': 0.0,
                'mean_return': 0.0,
                'worst_case_return': 0.0,
                'best_case_return': 0.0,
                'median_final_equity': self.initial_capital
            }
        }
    
    def __repr__(self) -> str:
        """Строковое представление."""
        return (
            f"MonteCarloSimulator("
            f"n={self.n_simulations}, "
            f"capital={self.initial_capital:.0f})"
        )

