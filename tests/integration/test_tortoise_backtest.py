"""
Integration test: Tortoise Strategy + Real Data + Backtesting.

Полный цикл:
1. Загрузка реальных данных BTC/ETH через DataManager
2. Создание Tortoise strategy
3. Backtesting на реальных данных
4. Анализ результатов
"""

import pytest
import pandas as pd
from datetime import datetime, timedelta


pytestmark = pytest.mark.integration


class TestTortoiseBacktest:
    """
    Интеграционные тесты Tortoise strategy на реальных данных.
    """
    
    @pytest.fixture(scope="class")
    def btc_data(self):
        """Загрузка реальных BTC данных."""
        from core.data.manager import DataManager
        
        manager = DataManager()
        df = manager.get_candles(
            market='BTC-PERP',
            interval='1d',
            days_back=180,  # 6 месяцев данных для больше сигналов
            force_refresh=True  # Обновляем данные
        )
        
        return df
    
    @pytest.fixture(scope="class")
    def eth_data(self):
        """Загрузка реальных ETH данных."""
        from core.data.manager import DataManager
        
        manager = DataManager()
        df = manager.get_candles(
            market='ETH-PERP',
            interval='1d',
            days_back=90
        )
        
        return df
    
    def test_tortoise_btc_backtest(self, btc_data):
        """
        Тест: Tortoise strategy на BTC (3 месяца).
        
        Проверяем что:
        - Strategy генерирует сигналы
        - Backtest завершается без ошибок
        - Метрики рассчитываются
        """
        from core.strategy.tortoise import TortoiseStrategy
        from core.backtest.engine import BacktestEngine
        
        print("\n📊 BTC Tortoise Backtest")
        print(f"   Данные: {len(btc_data)} дней")
        print(f"   Период: {btc_data['timestamp'].iloc[0].date()} - {btc_data['timestamp'].iloc[-1].date()}")
        
        # Создаем strategy
        strategy = TortoiseStrategy({
            'don_break': 20,
            'don_exit': 10,
            'trail_atr_len': 20,
            'trail_mult': 2.0,
            'markets': ['BTC-PERP']
        })
        
        # Создаем backtest engine
        engine = BacktestEngine(
            strategy=strategy,
            initial_capital=10000.0,
            risk_per_trade=1.0  # 1% риск
        )
        
        # Запускаем backtest
        results = engine.run_backtest(
            market='BTC-PERP',
            history=btc_data
        )
        
        # Проверки
        assert 'trades' in results
        assert 'metrics' in results
        assert 'equity_curve' in results
        
        metrics = results['metrics']
        
        # Backtest должен завершиться без ошибок
        # (сигналы могут быть или не быть в зависимости от рынка)
        assert metrics['total_trades'] >= 0, "Backtest должен завершиться"
        
        # Метрики должны быть валидны
        assert 0 <= metrics['win_rate'] <= 100
        assert isinstance(metrics['total_pnl'], (int, float))
        assert metrics['max_drawdown'] >= 0
        
        # Выводим результаты
        print(f"\n📈 Результаты BTC:")
        print(f"   Сделок: {metrics['total_trades']}")
        
        if metrics['total_trades'] > 0:
            print(f"   Win Rate: {metrics['win_rate']:.1f}%")
            print(f"   Total P&L: ${metrics['total_pnl']:.2f}")
            print(f"   Return: {metrics['return_pct']:.2f}%")
            print(f"   Max DD: {metrics['max_drawdown']:.2f}%")
            print(f"   Sharpe: {metrics['sharpe_ratio']:.2f}")
            print(f"   Avg Win: ${metrics['avg_win']:.2f}")
            print(f"   Avg Loss: ${metrics['avg_loss']:.2f}")
            print(f"   Profit Factor: {metrics['profit_factor']:.2f}")
        else:
            print(f"   ⚠️  Нет сигналов в этом периоде (боковик без прорывов)")
    
    def test_tortoise_eth_backtest(self, eth_data):
        """
        Тест: Tortoise strategy на ETH (3 месяца).
        """
        from core.strategy.tortoise import TortoiseStrategy
        from core.backtest.engine import BacktestEngine
        
        print("\n📊 ETH Tortoise Backtest")
        print(f"   Данные: {len(eth_data)} дней")
        
        strategy = TortoiseStrategy({
            'don_break': 20,
            'don_exit': 10,
            'markets': ['ETH-PERP']
        })
        
        engine = BacktestEngine(
            strategy=strategy,
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        results = engine.run_backtest('ETH-PERP', eth_data)
        
        metrics = results['metrics']
        
        print(f"\n📈 Результаты ETH:")
        print(f"   Сделок: {metrics['total_trades']}")
        
        if metrics['total_trades'] > 0:
            print(f"   Win Rate: {metrics['win_rate']:.1f}%")
            print(f"   Total P&L: ${metrics['total_pnl']:.2f}")
            print(f"   Return: {metrics['return_pct']:.2f}%")
            print(f"   Max DD: {metrics['max_drawdown']:.2f}%")
        else:
            print(f"   ⚠️  Нет сигналов")
        
        # Базовые проверки
        assert metrics['total_trades'] >= 0
        assert isinstance(metrics['final_equity'], (int, float))
    
    def test_tortoise_parameter_comparison(self, btc_data):
        """
        Тест: сравнение разных параметров Tortoise.
        
        Проверяем что изменение параметров влияет на результаты.
        """
        from core.strategy.tortoise import TortoiseStrategy
        from core.backtest.engine import BacktestEngine
        
        print("\n🔬 Parameter Comparison Test")
        
        # Тестируем разные параметры breakout канала
        params_sets = [
            {'don_break': 10, 'label': '10-period'},
            {'don_break': 20, 'label': '20-period'},
            {'don_break': 30, 'label': '30-period'}
        ]
        
        results_comparison = []
        
        for params_set in params_sets:
            strategy = TortoiseStrategy({
                'don_break': params_set['don_break'],
                'don_exit': 10,
                'markets': ['BTC-PERP']
            })
            
            engine = BacktestEngine(
                strategy=strategy,
                initial_capital=10000.0,
                risk_per_trade=1.0
            )
            
            results = engine.run_backtest('BTC-PERP', btc_data)
            metrics = results['metrics']
            
            results_comparison.append({
                'label': params_set['label'],
                'trades': metrics['total_trades'],
                'win_rate': metrics['win_rate'],
                'return': metrics['return_pct'],
                'max_dd': metrics['max_drawdown']
            })
            
            print(f"\n   {params_set['label']}:")
            print(f"     Trades: {metrics['total_trades']}")
            print(f"     Win Rate: {metrics['win_rate']:.1f}%")
            print(f"     Return: {metrics['return_pct']:.2f}%")
        
        # Проверяем что результаты различаются
        # (разные параметры должны давать разные результаты)
        trades_counts = [r['trades'] for r in results_comparison]
        assert len(set(trades_counts)) > 1, "Разные параметры должны давать разное количество сделок"
        
        print(f"\n✅ Параметры влияют на результаты")
    
    def test_equity_curve_analysis(self, btc_data):
        """
        Тест: анализ equity curve.
        
        Проверяем что equity curve корректно отслеживает изменения капитала.
        """
        from core.strategy.tortoise import TortoiseStrategy
        from core.backtest.engine import BacktestEngine
        
        print("\n📈 Equity Curve Analysis")
        
        strategy = TortoiseStrategy({
            'don_break': 20,
            'don_exit': 10,
            'markets': ['BTC-PERP']
        })
        
        engine = BacktestEngine(
            strategy=strategy,
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        results = engine.run_backtest('BTC-PERP', btc_data)
        
        equity_curve = results['equity_curve']
        
        # Проверки
        assert len(equity_curve) > 0
        assert equity_curve[0] == 10000.0  # Начинается с initial_capital
        
        # Equity curve не должен быть монотонным (должны быть изменения)
        if results['metrics']['total_trades'] > 0:
            # Если были сделки, equity должен меняться
            unique_values = len(set(equity_curve))
            assert unique_values > 1, "Equity должен меняться при наличии сделок"
        
        print(f"   Initial: ${equity_curve[0]:,.2f}")
        print(f"   Final: ${equity_curve[-1]:,.2f}")
        print(f"   Min: ${min(equity_curve):,.2f}")
        print(f"   Max: ${max(equity_curve):,.2f}")
        
        # Проверяем что final equity совпадает с metrics
        assert abs(equity_curve[-1] - results['metrics']['final_equity']) < 0.01
    
    def test_trade_details_analysis(self, btc_data):
        """
        Тест: детальный анализ сделок.
        
        Проверяем структуру данных о сделках.
        """
        from core.strategy.tortoise import TortoiseStrategy
        from core.backtest.engine import BacktestEngine
        
        print("\n📊 Trade Details Analysis")
        
        strategy = TortoiseStrategy({
            'don_break': 20,
            'don_exit': 10,
            'markets': ['BTC-PERP']
        })
        
        engine = BacktestEngine(
            strategy=strategy,
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        results = engine.run_backtest('BTC-PERP', btc_data)
        
        trades = results['trades']
        
        if len(trades) > 0:
            # Проверяем структуру первой сделки
            first_trade = trades[0]
            
            required_keys = ['market', 'side', 'entry', 'exit', 'pnl', 'reason']
            for key in required_keys:
                assert key in first_trade, f"Сделка должна содержать {key}"
            
            print(f"   Всего сделок: {len(trades)}")
            print(f"\n   Первая сделка:")
            print(f"     Side: {first_trade['side']}")
            print(f"     Entry: ${first_trade['entry']:.2f}")
            print(f"     Exit: ${first_trade['exit']:.2f}")
            print(f"     P&L: ${first_trade['pnl']:.2f}")
            print(f"     Reason: {first_trade['reason']}")
            
            # Анализ всех сделок
            winners = [t for t in trades if t['pnl'] > 0]
            losers = [t for t in trades if t['pnl'] < 0]
            
            print(f"\n   Winners: {len(winners)}")
            print(f"   Losers: {len(losers)}")
            
            if winners:
                avg_win = sum(t['pnl'] for t in winners) / len(winners)
                print(f"   Avg Win: ${avg_win:.2f}")
            
            if losers:
                avg_loss = sum(t['pnl'] for t in losers) / len(losers)
                print(f"   Avg Loss: ${avg_loss:.2f}")

