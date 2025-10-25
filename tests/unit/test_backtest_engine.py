"""
Unit tests для Backtesting Engine.

Тестируем:
- Инициализация engine
- Обработка сигналов
- Симуляция сделок
- Расчет P&L
- Метрики производительности
"""

import pytest
from unittest.mock import Mock, MagicMock
import pandas as pd
from datetime import datetime
from core.strategy.base import Signal, SignalSide, BarContext


class TestBacktestEngine:
    """Тесты для BacktestEngine."""
    
    @pytest.fixture
    def sample_history(self):
        """Sample исторические данные."""
        return pd.DataFrame({
            'timestamp': pd.to_datetime([
                '2022-01-01', '2022-01-02', '2022-01-03', 
                '2022-01-04', '2022-01-05'
            ]),
            'open': [50000.0, 50500.0, 51000.0, 51500.0, 52000.0],
            'high': [50800.0, 51200.0, 51700.0, 52200.0, 52700.0],
            'low': [49500.0, 50000.0, 50500.0, 51000.0, 51500.0],
            'close': [50500.0, 51000.0, 51500.0, 52000.0, 52500.0],
            'volume': [1000.0, 1200.0, 1100.0, 1300.0, 1250.0]
        })
    
    @pytest.fixture
    def mock_strategy(self):
        """Mock стратегии."""
        strategy = Mock()
        strategy.markets.return_value = ['BTC-PERP']
        return strategy
    
    @pytest.fixture
    def engine(self, mock_strategy):
        """BacktestEngine с mock strategy."""
        from core.backtest.engine import BacktestEngine
        return BacktestEngine(
            strategy=mock_strategy,
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
    
    def test_init_stores_parameters(self, mock_strategy):
        """Тест: engine сохраняет параметры при инициализации."""
        from core.backtest.engine import BacktestEngine
        
        engine = BacktestEngine(
            strategy=mock_strategy,
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        assert engine.strategy == mock_strategy
        assert engine.initial_capital == 10000.0
        assert engine.risk_per_trade == 1.0
        assert engine.equity == 10000.0  # Начальный equity = initial_capital
    
    def test_run_backtest_returns_results(self, engine, sample_history, mock_strategy):
        """
        Тест: run_backtest возвращает результаты.
        
        Должен вернуть dict с метриками.
        """
        # Setup: strategy возвращает пустой список сигналов
        mock_strategy.on_bar.return_value = []
        
        # Run backtest
        results = engine.run_backtest(
            market='BTC-PERP',
            history=sample_history
        )
        
        # Проверяем что results это dict
        assert isinstance(results, dict)
        # Должны быть основные ключи
        assert 'trades' in results
        assert 'equity_curve' in results
        assert 'metrics' in results
    
    def test_process_signal_long_opens_position(self, engine):
        """
        Тест: process_signal для LONG сигнала открывает позицию.
        """
        # Create long signal
        signal = Signal(
            market='BTC-PERP',
            side=SignalSide.LONG,
            entry=50000.0,
            stop=49000.0,  # Risk = 1000
            targets=[52000.0],  # Reward = 2000
            confidence=0.8
        )
        
        # Process signal
        engine.process_signal(signal, timestamp=1640000000000)
        
        # Проверяем что позиция открыта
        assert 'BTC-PERP' in engine.positions
        position = engine.positions['BTC-PERP']
        assert position['side'] == 'long'
        assert position['entry'] == 50000.0
        assert position['stop'] == 49000.0
    
    def test_process_signal_calculates_position_size(self, engine):
        """
        Тест: position size рассчитывается корректно.
        
        Формула: size = (risk% * equity) / stop_distance
        """
        signal = Signal(
            market='BTC-PERP',
            side=SignalSide.LONG,
            entry=50000.0,
            stop=49000.0,  # Risk distance = 1000
            targets=[52000.0]
        )
        
        # Initial equity = 10000, risk = 1% = 100 USD
        # Size = 100 / 1000 = 0.1
        engine.process_signal(signal, timestamp=1640000000000)
        
        position = engine.positions['BTC-PERP']
        # Проверяем что size рассчитан (должен быть около 0.1)
        assert position['size'] > 0
        assert position['size'] < 1  # Должен быть меньше 1
    
    def test_close_position_calculates_pnl_for_long_win(self, engine):
        """
        Тест: закрытие LONG позиции с прибылью рассчитывает P&L.
        
        Entry 50000, Exit 52000, Size 0.1 -> P&L = 200
        """
        # Open position
        signal = Signal(
            market='BTC-PERP',
            side=SignalSide.LONG,
            entry=50000.0,
            stop=49000.0,
            targets=[52000.0]
        )
        engine.process_signal(signal, timestamp=1640000000000)
        
        # Close position at profit
        trade = engine.close_position(
            market='BTC-PERP',
            exit_price=52000.0,
            reason='target_hit',
            timestamp=1640086400000
        )
        
        # Проверяем P&L
        assert trade is not None
        assert trade['pnl'] > 0  # Прибыльная сделка
        # Equity должен увеличиться
        assert engine.equity > engine.initial_capital
    
    def test_close_position_calculates_pnl_for_long_loss(self, engine):
        """
        Тест: закрытие LONG позиции с убытком.
        
        Entry 50000, Stop 49000, Size 0.1 -> P&L = -100
        """
        signal = Signal(
            market='BTC-PERP',
            side=SignalSide.LONG,
            entry=50000.0,
            stop=49000.0,
            targets=[52000.0]
        )
        engine.process_signal(signal, timestamp=1640000000000)
        
        # Close at stop loss
        trade = engine.close_position(
            market='BTC-PERP',
            exit_price=49000.0,
            reason='stop_loss',
            timestamp=1640086400000
        )
        
        # Проверяем P&L
        assert trade['pnl'] < 0  # Убыточная сделка
        # Equity должен уменьшиться
        assert engine.equity < engine.initial_capital
    
    def test_calculate_metrics_returns_key_metrics(self, engine):
        """
        Тест: calculate_metrics возвращает ключевые метрики.
        
        Должны быть: total_trades, win_rate, total_pnl, max_drawdown
        """
        # Добавляем несколько фейковых сделок
        engine.trades = [
            {'pnl': 100, 'pnl_pct': 1.0},
            {'pnl': -50, 'pnl_pct': -0.5},
            {'pnl': 150, 'pnl_pct': 1.5},
            {'pnl': -30, 'pnl_pct': -0.3}
        ]
        
        metrics = engine.calculate_metrics()
        
        # Проверяем наличие ключевых метрик
        assert 'total_trades' in metrics
        assert 'win_rate' in metrics
        assert 'total_pnl' in metrics
        assert 'max_drawdown' in metrics
        
        # Проверяем значения
        assert metrics['total_trades'] == 4
        assert metrics['win_rate'] == 50.0  # 2 wins из 4
        assert metrics['total_pnl'] == 170.0  # 100 - 50 + 150 - 30
    
    def test_equity_curve_tracks_equity_changes(self, engine, sample_history, mock_strategy):
        """
        Тест: equity_curve отслеживает изменения капитала.
        """
        # Setup: strategy генерирует сигнал на первом баре
        def on_bar_mock(ctx, history):
            if len(history) >= 2:  # Только на первом вызове
                return [Signal(
                    market='BTC-PERP',
                    side=SignalSide.LONG,
                    entry=ctx.close,
                    stop=ctx.close * 0.98,
                    targets=[ctx.close * 1.04]
                )]
            return []
        
        mock_strategy.on_bar.side_effect = on_bar_mock
        
        results = engine.run_backtest('BTC-PERP', sample_history)
        
        # Equity curve должен быть не пустым
        assert len(results['equity_curve']) > 0
        # Должен начинаться с initial_capital
        assert results['equity_curve'][0] == engine.initial_capital

