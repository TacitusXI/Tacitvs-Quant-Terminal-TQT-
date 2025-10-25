#!/usr/bin/env python3
"""
Demo: Генерация полного отчёта для Tortoise стратегии.

Демонстрирует:
- Backtest на BTC
- Walk-Forward analysis
- Monte Carlo simulation
- Advanced metrics
- Report generation
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.data.manager import DataManager
from core.strategy.tortoise import TortoiseStrategy
from core.backtest.engine import BacktestEngine
from core.research.walk_forward import WalkForwardSplitter, WalkForwardAnalyzer
from core.research.monte_carlo import MonteCarloSimulator
from core.research.advanced_metrics import AdvancedMetricsCalculator
from core.research.report_generator import ReportGenerator


def main():
    print("=" * 70)
    print("📊 TORTOISE STRATEGY - COMPREHENSIVE REPORT")
    print("=" * 70)
    
    # 1. Load data
    print("\n📦 Loading BTC data...")
    manager = DataManager()
    btc_data = manager.get_candles(
        market='BTC-PERP',
        interval='1d',
        days_back=180
    )
    print(f"   Loaded {len(btc_data)} days of data")
    
    # 2. Run backtest
    print("\n🔄 Running backtest...")
    params = {
        'markets': ['BTC-PERP'],
        'don_break': 20,
        'don_exit': 10
    }
    strategy = TortoiseStrategy(params)
    
    engine = BacktestEngine(
        strategy=strategy,
        initial_capital=10000.0,
        risk_per_trade=1.0
    )
    
    backtest_results = engine.run_backtest('BTC-PERP', btc_data)
    metrics = backtest_results['metrics']
    equity_curve = backtest_results['equity_curve']
    trades = backtest_results['trades']
    
    print(f"   Trades: {metrics['total_trades']}, Return: {metrics['return_pct']:.2f}%")
    
    # 3. Walk-Forward analysis
    print("\n🔄 Running Walk-Forward analysis...")
    splitter = WalkForwardSplitter(train_days=90, test_days=30)
    analyzer = WalkForwardAnalyzer(strategy=strategy)
    
    wf_results = analyzer.run_analysis('BTC-PERP', btc_data, splitter)
    print(f"   OOS Consistency: {wf_results['summary']['oos_consistency']:.1f}%")
    
    # 4. Monte Carlo simulation
    print("\n🎲 Running Monte Carlo simulation...")
    mc_simulator = MonteCarloSimulator(n_simulations=1000, seed=42)
    mc_results = mc_simulator.run_simulation(trades)
    print(f"   Prob of Profit: {mc_results['stats']['prob_profit']:.1%}")
    
    # 5. Advanced metrics
    print("\n📊 Calculating advanced metrics...")
    metrics_calc = AdvancedMetricsCalculator()
    
    # Get returns from equity curve
    returns = []
    for i in range(1, len(equity_curve)):
        ret = ((equity_curve[i] - equity_curve[i-1]) / equity_curve[i-1]) * 100
        returns.append(ret)
    
    advanced_metrics = metrics_calc.calculate_all(equity_curve, returns)
    print(f"   Calmar: {advanced_metrics['calmar_ratio']:.2f}, "
          f"Sortino: {advanced_metrics['sortino_ratio']:.2f}")
    
    # 6. Generate report
    print("\n📝 Generating report...")
    generator = ReportGenerator(output_dir="reports")
    
    report = generator.generate_markdown_report(
        strategy_name='Tortoise',
        market='BTC-PERP',
        metrics=metrics,
        equity_curve=equity_curve,
        trades=trades,
        walk_forward_results=wf_results,
        monte_carlo_results=mc_results,
        advanced_metrics=advanced_metrics
    )
    
    # 7. Save report
    filepath = generator.save_report(report, 'tortoise_btc_full_report.md')
    print(f"\n✅ Report saved to: {filepath}")
    
    print("\n" + "=" * 70)
    print("📊 REPORT PREVIEW (first 30 lines):")
    print("=" * 70)
    
    # Preview
    lines = report.split('\n')
    for line in lines[:30]:
        print(line)
    
    print("\n... (see full report in file)")
    print("=" * 70)


if __name__ == '__main__':
    main()

