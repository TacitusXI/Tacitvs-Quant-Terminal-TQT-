"""
Unit tests для Monte Carlo Simulator.

Тестируем:
- Trade shuffling (permutation test)
- Percentile расчеты
- Probability of profit
- Risk of ruin
"""

import pytest
import pandas as pd
import numpy as np
from typing import List, Dict


class TestMonteCarloSimulator:
    """Тесты для MonteCarloSimulator."""
    
    @pytest.fixture
    def sample_trades(self):
        """
        Sample trades для тестирования.
        
        5 сделок: 2 прибыльных, 3 убыточных.
        """
        return [
            {'pnl': 100.0, 'return_pct': 1.0},   # Win
            {'pnl': -50.0, 'return_pct': -0.5},  # Loss
            {'pnl': 150.0, 'return_pct': 1.5},   # Win
            {'pnl': -80.0, 'return_pct': -0.8},  # Loss
            {'pnl': -30.0, 'return_pct': -0.3}   # Loss
        ]
    
    def test_init_stores_parameters(self):
        """Тест: MonteCarloSimulator сохраняет параметры."""
        from core.research.monte_carlo import MonteCarloSimulator
        
        simulator = MonteCarloSimulator(
            n_simulations=1000,
            initial_capital=10000.0
        )
        
        assert simulator.n_simulations == 1000
        assert simulator.initial_capital == 10000.0
    
    def test_run_simulation_returns_results(self, sample_trades):
        """
        Тест: run_simulation возвращает результаты.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        simulator = MonteCarloSimulator(n_simulations=100)
        
        results = simulator.run_simulation(sample_trades)
        
        # Результаты должны содержать ключевые поля
        assert 'simulations' in results
        assert 'percentiles' in results
        assert 'stats' in results
    
    def test_simulations_count_matches_n(self, sample_trades):
        """
        Тест: Количество симуляций соответствует n_simulations.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        n = 100
        simulator = MonteCarloSimulator(n_simulations=n)
        
        results = simulator.run_simulation(sample_trades)
        
        # Должно быть ровно n симуляций
        assert len(results['simulations']) == n
    
    def test_each_simulation_has_equity_curve(self, sample_trades):
        """
        Тест: Каждая симуляция имеет equity curve.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        simulator = MonteCarloSimulator(n_simulations=10)
        results = simulator.run_simulation(sample_trades)
        
        # Каждая симуляция должна иметь equity curve
        for sim in results['simulations']:
            assert 'equity_curve' in sim
            assert isinstance(sim['equity_curve'], list)
            # Equity curve должен начинаться с initial_capital
            assert sim['equity_curve'][0] == simulator.initial_capital
    
    def test_shuffling_changes_order(self, sample_trades):
        """
        Тест: Shuffling изменяет порядок сделок.
        
        С большой вероятностью хотя бы одна симуляция будет отличаться.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        simulator = MonteCarloSimulator(n_simulations=10)
        results = simulator.run_simulation(sample_trades)
        
        # Получаем оригинальный порядок PnL
        original_pnl = [t['pnl'] for t in sample_trades]
        
        # Проверяем что хотя бы одна симуляция имеет другой порядок
        different_found = False
        for sim in results['simulations']:
            sim_pnl = sim.get('shuffled_pnl', [])
            if sim_pnl != original_pnl:
                different_found = True
                break
        
        # С 10 симуляциями вероятность что хотя бы одна отличается ~99.9%
        assert different_found or len(sample_trades) <= 1
    
    def test_percentiles_calculated_correctly(self, sample_trades):
        """
        Тест: Percentiles рассчитываются правильно.
        
        Проверяем что p50 находится между p5 и p95.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        simulator = MonteCarloSimulator(n_simulations=100)
        results = simulator.run_simulation(sample_trades)
        
        percentiles = results['percentiles']
        
        # Проверяем наличие ключевых percentiles
        assert 'p5' in percentiles
        assert 'p50' in percentiles
        assert 'p95' in percentiles
        
        # Каждый percentile должен быть списком
        assert isinstance(percentiles['p5'], list)
        assert isinstance(percentiles['p50'], list)
        assert isinstance(percentiles['p95'], list)
        
        # p50 должен быть между p5 и p95 в конце
        final_p5 = percentiles['p5'][-1]
        final_p50 = percentiles['p50'][-1]
        final_p95 = percentiles['p95'][-1]
        
        assert final_p5 <= final_p50 <= final_p95
    
    def test_probability_of_profit_calculated(self, sample_trades):
        """
        Тест: Probability of profit рассчитывается.
        
        prob_profit = (число симуляций с прибылью) / (всего симуляций)
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        simulator = MonteCarloSimulator(n_simulations=100)
        results = simulator.run_simulation(sample_trades)
        
        stats = results['stats']
        
        # Должна быть вероятность прибыли
        assert 'prob_profit' in stats
        
        # Вероятность должна быть между 0 и 1
        assert 0 <= stats['prob_profit'] <= 1
    
    def test_stats_include_key_metrics(self, sample_trades):
        """
        Тест: Stats включают ключевые метрики.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        simulator = MonteCarloSimulator(n_simulations=100)
        results = simulator.run_simulation(sample_trades)
        
        stats = results['stats']
        
        # Ключевые метрики
        required_stats = [
            'prob_profit',
            'median_return',
            'mean_return',
            'worst_case_return',
            'best_case_return',
            'median_final_equity'
        ]
        
        for stat in required_stats:
            assert stat in stats, f"Missing stat: {stat}"
    
    def test_worst_case_is_worse_than_median(self, sample_trades):
        """
        Тест: Worst case хуже чем median.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        simulator = MonteCarloSimulator(n_simulations=100)
        results = simulator.run_simulation(sample_trades)
        
        stats = results['stats']
        
        # Worst case должен быть хуже median
        assert stats['worst_case_return'] <= stats['median_return']
    
    def test_best_case_is_better_than_median(self, sample_trades):
        """
        Тест: Best case лучше чем median.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        simulator = MonteCarloSimulator(n_simulations=100)
        results = simulator.run_simulation(sample_trades)
        
        stats = results['stats']
        
        # Best case должен быть лучше median
        assert stats['best_case_return'] >= stats['median_return']
    
    def test_empty_trades_handled_gracefully(self):
        """
        Тест: Пустой список сделок обрабатывается корректно.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        simulator = MonteCarloSimulator(n_simulations=10)
        
        results = simulator.run_simulation([])
        
        # Должны получить результаты с нулевыми метриками
        assert results['stats']['prob_profit'] == 0.0
        assert results['stats']['median_return'] == 0.0
    
    def test_single_trade_simulation(self):
        """
        Тест: Симуляция с одной сделкой работает.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        single_trade = [{'pnl': 100.0, 'return_pct': 1.0}]
        
        simulator = MonteCarloSimulator(n_simulations=10)
        results = simulator.run_simulation(single_trade)
        
        # С одной сделкой все симуляции должны быть одинаковыми
        # (нечего shuffling)
        stats = results['stats']
        assert stats['prob_profit'] == 1.0  # Единственная сделка прибыльная
    
    def test_all_losing_trades_prob_profit_zero(self):
        """
        Тест: Только убыточные сделки → prob_profit = 0.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        losing_trades = [
            {'pnl': -50.0, 'return_pct': -0.5},
            {'pnl': -30.0, 'return_pct': -0.3},
            {'pnl': -20.0, 'return_pct': -0.2}
        ]
        
        simulator = MonteCarloSimulator(n_simulations=100)
        results = simulator.run_simulation(losing_trades)
        
        # Вероятность прибыли должна быть 0
        assert results['stats']['prob_profit'] == 0.0
    
    def test_all_winning_trades_prob_profit_one(self):
        """
        Тест: Только прибыльные сделки → prob_profit = 1.0.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        winning_trades = [
            {'pnl': 50.0, 'return_pct': 0.5},
            {'pnl': 30.0, 'return_pct': 0.3},
            {'pnl': 20.0, 'return_pct': 0.2}
        ]
        
        simulator = MonteCarloSimulator(n_simulations=100)
        results = simulator.run_simulation(winning_trades)
        
        # Вероятность прибыли должна быть 1.0
        assert results['stats']['prob_profit'] == 1.0

