"""
Integration test: Walk-Forward Analysis на Tortoise стратегии.

Реальная проверка:
- Запуск WF analysis на BTC данных
- IS vs OOS сравнение
- OOS consistency
"""

import pytest


pytestmark = pytest.mark.integration


class TestWalkForwardTortoise:
    """Walk-Forward анализ для Tortoise стратегии."""
    
    @pytest.fixture(scope="class")
    def btc_data(self):
        """Загрузка BTC данных."""
        from core.data.manager import DataManager
        
        manager = DataManager()
        df = manager.get_candles(
            market='BTC-PERP',
            interval='1d',
            days_back=180
        )
        
        return df
    
    @pytest.fixture(scope="class")
    def tortoise_strategy(self):
        """Tortoise стратегия с дефолтными параметрами."""
        from core.strategy.tortoise import TortoiseStrategy
        
        params = {
            'markets': ['BTC-PERP'],
            'don_break': 20,
            'don_exit': 10
        }
        
        return TortoiseStrategy(params)
    
    def test_walk_forward_rolling_window(self, btc_data, tortoise_strategy):
        """
        Тест: Rolling window Walk-Forward на BTC.
        
        Проверяем:
        - OOS метрики хуже чем IS (типично)
        - OOS consistency показывает стабильность
        """
        from core.research.walk_forward import WalkForwardAnalyzer, WalkForwardSplitter
        
        print(f"\n{'='*70}")
        print(f"🔬 WALK-FORWARD ANALYSIS: Tortoise на BTC")
        print(f"{'='*70}")
        
        # Создаем splitter (3 месяца train, 1 месяц test)
        splitter = WalkForwardSplitter(
            train_days=90,
            test_days=30,
            step_days=30,
            anchored=False  # Rolling window
        )
        
        print(f"\n📐 Splitter: {splitter}")
        
        # Создаем analyzer
        analyzer = WalkForwardAnalyzer(
            strategy=tortoise_strategy,
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        print(f"📊 Analyzer: {analyzer}")
        
        # Запускаем Walk-Forward analysis
        results = analyzer.run_analysis(
            market='BTC-PERP',
            data=btc_data,
            splitter=splitter
        )
        
        # Выводим результаты
        summary = results['summary']
        
        print(f"\n{'='*70}")
        print(f"📈 РЕЗУЛЬТАТЫ")
        print(f"{'='*70}")
        print(f"\n📊 Количество splits: {summary['num_splits']}")
        
        print(f"\n🔵 IN-SAMPLE (Train) Metrics:")
        print(f"   Средний Return: {summary['is_avg_return']:.2f}%")
        
        print(f"\n🔴 OUT-OF-SAMPLE (Test) Metrics:")
        print(f"   Средний Return:  {summary['oos_avg_return']:.2f}%")
        print(f"   Средний Sharpe:  {summary['oos_avg_sharpe']:.2f}")
        print(f"   Средний Win Rate: {summary['oos_win_rate']:.1f}%")
        print(f"   OOS Consistency: {summary['oos_consistency']:.1f}%")
        
        # Degradation
        degradation = summary['is_avg_return'] - summary['oos_avg_return']
        print(f"\n⚠️  IS → OOS Degradation: {degradation:.2f}%")
        
        # Детальный разбор каждого split
        print(f"\n{'='*70}")
        print(f"📋 ДЕТАЛИ ПО КАЖДОМУ SPLIT")
        print(f"{'='*70}")
        
        for split in results['splits']:
            split_id = split['split_id']
            train = split['train_metrics']
            test = split['test_metrics']
            
            print(f"\n🔹 Split #{split_id}")
            print(f"   Train: {train['total_trades']} сделок, "
                  f"Return: {train['return_pct']:.2f}%, "
                  f"Sharpe: {train['sharpe_ratio']:.2f}")
            print(f"   Test:  {test['total_trades']} сделок, "
                  f"Return: {test['return_pct']:.2f}%, "
                  f"Sharpe: {test['sharpe_ratio']:.2f}")
        
        print(f"\n{'='*70}")
        
        # Проверки
        assert len(results['splits']) > 0, "Должны быть splits"
        assert 'summary' in results
        assert 0 <= summary['oos_consistency'] <= 100
    
    def test_walk_forward_anchored_window(self, btc_data, tortoise_strategy):
        """
        Тест: Anchored window Walk-Forward.
        
        Anchored может показывать больше stability так как train растет.
        """
        from core.research.walk_forward import WalkForwardAnalyzer, WalkForwardSplitter
        
        print(f"\n{'='*70}")
        print(f"🔬 ANCHORED WALK-FORWARD: Tortoise на BTC")
        print(f"{'='*70}")
        
        splitter = WalkForwardSplitter(
            train_days=90,
            test_days=30,
            step_days=30,
            anchored=True  # Anchored mode
        )
        
        analyzer = WalkForwardAnalyzer(
            strategy=tortoise_strategy,
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        results = analyzer.run_analysis('BTC-PERP', btc_data, splitter)
        
        summary = results['summary']
        
        print(f"\n📊 ANCHORED RESULTS:")
        print(f"   Splits: {summary['num_splits']}")
        print(f"   OOS Avg Return: {summary['oos_avg_return']:.2f}%")
        print(f"   OOS Avg Sharpe: {summary['oos_avg_sharpe']:.2f}")
        print(f"   OOS Consistency: {summary['oos_consistency']:.1f}%")
        
        print(f"\n✅ Anchored analysis complete!")
    
    def test_compare_rolling_vs_anchored(self, btc_data, tortoise_strategy):
        """
        Тест: Сравнение Rolling vs Anchored.
        
        Показывает какой режим более stable для этой стратегии.
        """
        from core.research.walk_forward import WalkForwardAnalyzer, WalkForwardSplitter
        
        print(f"\n{'='*70}")
        print(f"🆚 ROLLING vs ANCHORED COMPARISON")
        print(f"{'='*70}")
        
        analyzer = WalkForwardAnalyzer(
            strategy=tortoise_strategy,
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        # Rolling
        rolling_splitter = WalkForwardSplitter(90, 30, 30, anchored=False)
        rolling_results = analyzer.run_analysis('BTC-PERP', btc_data, rolling_splitter)
        
        # Anchored
        anchored_splitter = WalkForwardSplitter(90, 30, 30, anchored=True)
        anchored_results = analyzer.run_analysis('BTC-PERP', btc_data, anchored_splitter)
        
        # Сравнение
        rolling_summary = rolling_results['summary']
        anchored_summary = anchored_results['summary']
        
        print(f"\n📊 СРАВНЕНИЕ:")
        print(f"\n   {'Metric':<25} {'Rolling':<15} {'Anchored':<15}")
        print(f"   {'-'*55}")
        print(f"   {'OOS Avg Return':<25} {rolling_summary['oos_avg_return']:>14.2f}% {anchored_summary['oos_avg_return']:>14.2f}%")
        print(f"   {'OOS Avg Sharpe':<25} {rolling_summary['oos_avg_sharpe']:>14.2f}  {anchored_summary['oos_avg_sharpe']:>14.2f}")
        print(f"   {'OOS Consistency':<25} {rolling_summary['oos_consistency']:>14.1f}% {anchored_summary['oos_consistency']:>14.1f}%")
        
        # Какой режим лучше?
        if rolling_summary['oos_avg_return'] > anchored_summary['oos_avg_return']:
            print(f"\n🏆 Rolling показывает лучший OOS return")
        else:
            print(f"\n🏆 Anchored показывает лучший OOS return")
        
        print(f"\n✅ Comparison complete!")

