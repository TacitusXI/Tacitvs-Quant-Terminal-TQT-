"""
Backtesting Engine для тестирования стратегий на исторических данных.

Функционал:
- Симуляция сделок bar-by-bar
- Расчет P&L с учетом fees
- Position sizing (risk-based)
- Метрики: Sharpe, Drawdown, Win Rate, и т.д.
- Equity curve tracking
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from core.strategy.base import IStrategy, Signal, SignalSide, BarContext


class BacktestEngine:
    """
    Engine для backtesting торговых стратегий.
    
    Симулирует торговлю на исторических данных:
    - Генерирует сигналы через strategy
    - Открывает/закрывает позиции
    - Считает P&L
    - Собирает метрики
    """
    
    def __init__(
        self,
        strategy: IStrategy,
        initial_capital: float = 10000.0,
        risk_per_trade: float = 1.0,
        fee_rate: float = 0.0005  # 0.05% (maker fee на многих биржах)
    ):
        """
        Инициализация backtesting engine.
        
        strategy: Стратегия для тестирования (IStrategy).
        initial_capital: Начальный капитал в USD.
        risk_per_trade: Процент риска на сделку (1.0 = 1%).
        fee_rate: Комиссия биржи (0.0005 = 0.05%).
        """
        self.strategy = strategy
        self.initial_capital = initial_capital
        self.risk_per_trade = risk_per_trade
        self.fee_rate = fee_rate
        
        # Текущее состояние
        self.equity = initial_capital
        self.positions: Dict[str, Dict[str, Any]] = {}  # Открытые позиции
        self.trades: List[Dict[str, Any]] = []  # История сделок
        self.equity_curve: List[float] = [initial_capital]  # История капитала
    
    def run_backtest(
        self,
        market: str,
        history: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Запустить backtest на исторических данных.
        
        market: Рынок для теста (например, 'BTC-PERP').
        history: DataFrame с историческими данными.
                 Колонки: timestamp, open, high, low, close, volume.
        
        Возвращает: Словарь с результатами {trades, equity_curve, metrics}.
        """
        print(f"\n🔄 Запуск backtest для {market}...")
        print(f"   Период: {history['timestamp'].iloc[0].date()} - {history['timestamp'].iloc[-1].date()}")
        print(f"   Свечей: {len(history)}")
        
        # Итерация по каждому бару
        for i in range(len(history)):
            # Получаем текущий бар
            current_bar = history.iloc[i]
            
            # Создаем BarContext для стратегии
            ctx = BarContext(
                timestamp=int(current_bar['timestamp'].timestamp() * 1000),
                market=market,
                open=current_bar['open'],
                high=current_bar['high'],
                low=current_bar['low'],
                close=current_bar['close'],
                volume=current_bar['volume']
            )
            
            # Получаем историю ДО текущего бара (не включая текущий)
            history_slice = history.iloc[:i+1].copy()
            
            # Генерируем сигналы через стратегию
            signals = self.strategy.on_bar(ctx, history_slice)
            
            # Обрабатываем каждый сигнал
            for signal in signals:
                self.process_signal(signal, ctx.timestamp)
            
            # Проверяем существующие позиции (stop loss / take profit)
            self._check_positions(ctx)
            
            # Записываем текущий equity в curve
            self.equity_curve.append(self.equity)
        
        # Закрываем все открытые позиции в конце
        self._close_all_positions(history.iloc[-1], reason='backtest_end')
        
        # Считаем метрики
        metrics = self.calculate_metrics()
        
        print(f"\n✅ Backtest завершен!")
        print(f"   Сделок: {metrics['total_trades']}")
        print(f"   Win Rate: {metrics['win_rate']:.1f}%")
        print(f"   Total P&L: ${metrics['total_pnl']:.2f}")
        
        return {
            'trades': self.trades,
            'equity_curve': self.equity_curve,
            'metrics': metrics
        }
    
    def process_signal(self, signal: Signal, timestamp: int):
        """
        Обработать торговый сигнал.
        
        signal: Сигнал от стратегии.
        timestamp: Время сигнала.
        """
        market = signal.market
        
        # EXIT сигнал - закрываем позицию
        if signal.side == SignalSide.EXIT:
            if market in self.positions:
                self.close_position(
                    market=market,
                    exit_price=signal.entry,
                    reason='strategy_exit',
                    timestamp=timestamp
                )
            return
        
        # Проверяем что позиция не открыта уже
        if market in self.positions:
            return  # Игнорируем новый сигнал если позиция есть
        
        # Рассчитываем position size
        stop_distance = abs(signal.entry - signal.stop)
        if stop_distance == 0:
            return  # Некорректный сигнал
        
        # Risk в USD = risk_per_trade% от equity
        risk_usd = (self.risk_per_trade / 100.0) * self.equity
        
        # Size = risk_usd / stop_distance
        # Для перпов размер в количестве базовой валюты (BTC, ETH, etc)
        size = risk_usd / stop_distance
        
        # Открываем позицию
        position = {
            'market': market,
            'side': 'long' if signal.side == SignalSide.LONG else 'short',
            'entry': signal.entry,
            'stop': signal.stop,
            'targets': signal.targets,
            'size': size,
            'timestamp': timestamp,
            'risk_usd': risk_usd
        }
        
        self.positions[market] = position
        
        # Регистрируем позицию в стратегии (для tracking)
        if hasattr(self.strategy, 'register_position'):
            self.strategy.register_position(market, position['side'])
    
    def close_position(
        self,
        market: str,
        exit_price: float,
        reason: str,
        timestamp: int
    ) -> Optional[Dict[str, Any]]:
        """
        Закрыть позицию и рассчитать P&L.
        
        market: Рынок.
        exit_price: Цена закрытия.
        reason: Причина закрытия ('stop_loss', 'target_hit', 'strategy_exit').
        timestamp: Время закрытия.
        
        Возвращает: Словарь с информацией о сделке или None.
        """
        if market not in self.positions:
            return None
        
        position = self.positions[market]
        
        # Рассчитываем P&L
        entry = position['entry']
        size = position['size']
        
        if position['side'] == 'long':
            # Long: P&L = (exit - entry) * size
            price_diff = exit_price - entry
        else:
            # Short: P&L = (entry - exit) * size
            price_diff = entry - exit_price
        
        # Gross P&L (без комиссий)
        gross_pnl = price_diff * size
        
        # Комиссии: на вход и на выход
        entry_cost = entry * size * self.fee_rate
        exit_cost = exit_price * size * self.fee_rate
        total_fees = entry_cost + exit_cost
        
        # Net P&L (с комиссиями)
        net_pnl = gross_pnl - total_fees
        
        # P&L в процентах от риска
        pnl_r = net_pnl / position['risk_usd'] if position['risk_usd'] > 0 else 0
        
        # Обновляем equity
        self.equity += net_pnl
        
        # Записываем сделку
        trade = {
            'market': market,
            'side': position['side'],
            'entry': entry,
            'exit': exit_price,
            'size': size,
            'pnl': net_pnl,
            'pnl_pct': (net_pnl / self.equity) * 100,
            'pnl_r': pnl_r,
            'fees': total_fees,
            'reason': reason,
            'entry_time': position['timestamp'],
            'exit_time': timestamp,
            'duration': timestamp - position['timestamp']
        }
        
        self.trades.append(trade)
        
        # Удаляем позицию
        del self.positions[market]
        
        # Убираем из tracking стратегии
        if hasattr(self.strategy, 'unregister_position'):
            self.strategy.unregister_position(market)
        
        return trade
    
    def _check_positions(self, ctx: BarContext):
        """
        Проверить существующие позиции на stop/target hits.
        
        ctx: Контекст текущего бара.
        """
        market = ctx.market
        if market not in self.positions:
            return
        
        position = self.positions[market]
        
        if position['side'] == 'long':
            # Long: проверяем stop и targets
            if ctx.low <= position['stop']:
                # Hit stop loss
                self.close_position(
                    market=market,
                    exit_price=position['stop'],
                    reason='stop_loss',
                    timestamp=ctx.timestamp
                )
            elif position['targets'] and ctx.high >= position['targets'][0]:
                # Hit first target
                self.close_position(
                    market=market,
                    exit_price=position['targets'][0],
                    reason='target_hit',
                    timestamp=ctx.timestamp
                )
        
        else:  # short
            # Short: проверяем stop и targets
            if ctx.high >= position['stop']:
                # Hit stop loss
                self.close_position(
                    market=market,
                    exit_price=position['stop'],
                    reason='stop_loss',
                    timestamp=ctx.timestamp
                )
            elif position['targets'] and ctx.low <= position['targets'][0]:
                # Hit first target
                self.close_position(
                    market=market,
                    exit_price=position['targets'][0],
                    reason='target_hit',
                    timestamp=ctx.timestamp
                )
    
    def _close_all_positions(self, last_bar: pd.Series, reason: str):
        """
        Закрыть все открытые позиции (в конце backtest).
        
        last_bar: Последний бар данных.
        reason: Причина закрытия.
        """
        markets_to_close = list(self.positions.keys())
        for market in markets_to_close:
            self.close_position(
                market=market,
                exit_price=last_bar['close'],
                reason=reason,
                timestamp=int(last_bar['timestamp'].timestamp() * 1000)
            )
    
    def calculate_metrics(self) -> Dict[str, float]:
        """
        Рассчитать метрики производительности.
        
        Возвращает: Словарь с метриками.
        """
        if not self.trades:
            return {
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0.0,
                'total_pnl': 0.0,
                'avg_win': 0.0,
                'avg_loss': 0.0,
                'profit_factor': 0.0,
                'max_drawdown': 0.0,
                'sharpe_ratio': 0.0,
                'final_equity': self.equity,
                'return_pct': 0.0
            }
        
        # Базовые метрики
        total_trades = len(self.trades)
        winning_trades = sum(1 for t in self.trades if t['pnl'] > 0)
        losing_trades = sum(1 for t in self.trades if t['pnl'] < 0)
        
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        
        # P&L метрики
        total_pnl = sum(t['pnl'] for t in self.trades)
        avg_win = np.mean([t['pnl'] for t in self.trades if t['pnl'] > 0]) if winning_trades > 0 else 0
        avg_loss = np.mean([t['pnl'] for t in self.trades if t['pnl'] < 0]) if losing_trades > 0 else 0
        
        # Sharpe Ratio (упрощенный)
        pnl_series = np.array([t['pnl'] for t in self.trades])
        if len(pnl_series) > 1 and pnl_series.std() > 0:
            sharpe_ratio = (pnl_series.mean() / pnl_series.std()) * np.sqrt(252)  # Annualized
        else:
            sharpe_ratio = 0.0
        
        # Max Drawdown
        equity_array = np.array(self.equity_curve)
        running_max = np.maximum.accumulate(equity_array)
        drawdown = (equity_array - running_max) / running_max * 100
        max_drawdown = abs(drawdown.min())
        
        return {
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate': win_rate,
            'total_pnl': total_pnl,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'profit_factor': abs(avg_win / avg_loss) if avg_loss != 0 else 0,
            'max_drawdown': max_drawdown,
            'sharpe_ratio': sharpe_ratio,
            'final_equity': self.equity,
            'return_pct': ((self.equity - self.initial_capital) / self.initial_capital) * 100
        }

