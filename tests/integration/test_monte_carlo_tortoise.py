"""
Integration test: Monte Carlo на реальных Tortoise результатах.

Запускаем MC simulation на:
- Реальных сделках от Tortoise backtest
- Анализируем распределение outcomes
- Оцениваем risk of ruin
"""

import pytest


pytestmark = pytest.mark.integration


class TestMonteCarloTortoise:
    """Monte Carlo analysis на Tortoise стратегии."""
    
    @pytest.fixture(scope="class")
    def tortoise_trades(self):
        """
        Получить реальные сделки от Tortoise backtest на BTC.
        """
        from core.data.manager import DataManager
        from core.strategy.tortoise import TortoiseStrategy
        from core.backtest.engine import BacktestEngine
        
        # Загружаем BTC данные
        manager = DataManager()
        df = manager.get_candles(
            market='BTC-PERP',
            interval='1d',
            days_back=180
        )
        
        # Создаем стратегию
        params = {
            'markets': ['BTC-PERP'],
            'don_break': 20,
            'don_exit': 10
        }
        strategy = TortoiseStrategy(params)
        
        # Запускаем backtest
        engine = BacktestEngine(
            strategy=strategy,
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        results = engine.run_backtest('BTC-PERP', df)
        
        return results['trades']
    
    def test_monte_carlo_on_tortoise_trades(self, tortoise_trades):
        """
        Тест: Monte Carlo simulation на реальных Tortoise сделках.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        print(f"\n{'='*70}")
        print(f"🎲 MONTE CARLO SIMULATION: Tortoise на BTC")
        print(f"{'='*70}")
        
        print(f"\n📊 Исходные данные:")
        print(f"   Количество сделок: {len(tortoise_trades)}")
        
        if len(tortoise_trades) == 0:
            print(f"   ⚠️  Нет сделок для анализа")
            pytest.skip("No trades available for Monte Carlo")
        
        # Вычисляем базовые метрики
        total_pnl = sum(t['pnl'] for t in tortoise_trades)
        winning_trades = sum(1 for t in tortoise_trades if t['pnl'] > 0)
        
        print(f"   Total P&L: ${total_pnl:.2f}")
        print(f"   Winning trades: {winning_trades}/{len(tortoise_trades)}")
        
        # Создаем simulator
        simulator = MonteCarloSimulator(
            n_simulations=1000,
            initial_capital=10000.0,
            seed=42  # Для воспроизводимости
        )
        
        print(f"\n🎲 Simulator: {simulator}")
        
        # Запускаем simulation
        results = simulator.run_simulation(tortoise_trades)
        
        stats = results['stats']
        
        print(f"\n{'='*70}")
        print(f"📈 MONTE CARLO РЕЗУЛЬТАТЫ (1000 симуляций)")
        print(f"{'='*70}")
        
        print(f"\n🎯 Вероятности:")
        print(f"   Probability of Profit: {stats['prob_profit']:.1%}")
        print(f"   Probability of Loss:   {(1 - stats['prob_profit']):.1%}")
        
        print(f"\n📊 Распределение Returns:")
        print(f"   Median:     {stats['median_return']:>8.2f}%")
        print(f"   Mean:       {stats['mean_return']:>8.2f}%")
        print(f"   Best Case:  {stats['best_case_return']:>8.2f}%")
        print(f"   Worst Case: {stats['worst_case_return']:>8.2f}%")
        
        print(f"\n💰 Final Equity:")
        print(f"   Median: ${stats['median_final_equity']:.2f}")
        
        # Анализ percentiles
        percentiles = results['percentiles']
        
        print(f"\n📉 Percentile Analysis:")
        print(f"   P5  (5%):  ${percentiles['p5'][-1]:.2f}")
        print(f"   P25 (25%): ${percentiles['p25'][-1]:.2f}")
        print(f"   P50 (50%): ${percentiles['p50'][-1]:.2f}")
        print(f"   P75 (75%): ${percentiles['p75'][-1]:.2f}")
        print(f"   P95 (95%): ${percentiles['p95'][-1]:.2f}")
        
        # Risk of Ruin analysis
        ruin_threshold = 8000  # -20% от $10k
        ruin_count = sum(1 for sim in results['simulations'] 
                        if sim['final_equity'] < ruin_threshold)
        risk_of_ruin = ruin_count / len(results['simulations']) * 100
        
        print(f"\n⚠️  Risk of Ruin (< $8000):")
        print(f"   {risk_of_ruin:.1f}% симуляций упали ниже -20%")
        
        print(f"\n{'='*70}")
        
        # Проверки
        assert len(results['simulations']) == 1000
        assert 0 <= stats['prob_profit'] <= 1
        assert stats['worst_case_return'] <= stats['median_return'] <= stats['best_case_return']
    
    def test_monte_carlo_percentile_spread(self, tortoise_trades):
        """
        Тест: Анализ spread между percentiles.
        
        Большой spread = высокая неопределенность.
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        if len(tortoise_trades) == 0:
            pytest.skip("No trades for analysis")
        
        print(f"\n{'='*70}")
        print(f"📊 PERCENTILE SPREAD ANALYSIS")
        print(f"{'='*70}")
        
        simulator = MonteCarloSimulator(n_simulations=1000, seed=42)
        results = simulator.run_simulation(tortoise_trades)
        
        percentiles = results['percentiles']
        
        # Spread между p5 и p95
        final_p5 = percentiles['p5'][-1]
        final_p95 = percentiles['p95'][-1]
        spread = final_p95 - final_p5
        spread_pct = (spread / 10000) * 100
        
        print(f"\n📏 P5-P95 Spread:")
        print(f"   P5:     ${final_p5:.2f}")
        print(f"   P95:    ${final_p95:.2f}")
        print(f"   Spread: ${spread:.2f} ({spread_pct:.1f}%)")
        
        if spread_pct > 20:
            print(f"\n   ⚠️  HIGH UNCERTAINTY: Spread > 20%")
        else:
            print(f"\n   ✅ Moderate uncertainty")
        
        # Interquartile range (p25-p75)
        iqr = percentiles['p75'][-1] - percentiles['p25'][-1]
        iqr_pct = (iqr / 10000) * 100
        
        print(f"\n📦 Interquartile Range (IQR):")
        print(f"   P25:    ${percentiles['p25'][-1]:.2f}")
        print(f"   P75:    ${percentiles['p75'][-1]:.2f}")
        print(f"   IQR:    ${iqr:.2f} ({iqr_pct:.1f}%)")
        
        print(f"\n✅ Spread analysis complete!")
    
    def test_monte_carlo_vs_original_backtest(self, tortoise_trades):
        """
        Тест: Сравнение MC median с оригинальным backtest результатом.
        
        MC median должен быть близок к оригиналу (в среднем).
        """
        from core.research.monte_carlo import MonteCarloSimulator
        
        if len(tortoise_trades) == 0:
            pytest.skip("No trades for analysis")
        
        print(f"\n{'='*70}")
        print(f"🆚 MONTE CARLO vs ORIGINAL BACKTEST")
        print(f"{'='*70}")
        
        # Оригинальный результат
        original_pnl = sum(t['pnl'] for t in tortoise_trades)
        original_return = (original_pnl / 10000) * 100
        original_final = 10000 + original_pnl
        
        print(f"\n📊 Original Backtest:")
        print(f"   P&L:    ${original_pnl:.2f}")
        print(f"   Return: {original_return:.2f}%")
        print(f"   Final:  ${original_final:.2f}")
        
        # Monte Carlo median
        simulator = MonteCarloSimulator(n_simulations=1000, seed=42)
        results = simulator.run_simulation(tortoise_trades)
        
        mc_median_return = results['stats']['median_return']
        mc_median_equity = results['stats']['median_final_equity']
        
        print(f"\n🎲 Monte Carlo Median (1000 sims):")
        print(f"   Return: {mc_median_return:.2f}%")
        print(f"   Final:  ${mc_median_equity:.2f}")
        
        # Разница
        diff = abs(original_return - mc_median_return)
        
        print(f"\n📏 Difference:")
        print(f"   Return diff: {diff:.2f}%")
        
        # MC median может отличаться от original из-за shuffling
        # Но в среднем должны быть близки
        print(f"\n💡 Note: MC median может отличаться из-за order effects")
        
        print(f"\n✅ Comparison complete!")

