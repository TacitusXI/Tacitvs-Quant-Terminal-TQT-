'use client';

import { useState } from 'react';
import DataPanel from '@/components/DataPanel';
import MetricCell from '@/components/MetricCell';
import GraphModule from '@/components/GraphModule';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function BacktestPage() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const backtestResults = {
    totalReturn: 0.342,
    sharpeRatio: 2.14,
    maxDrawdown: -0.087,
    winRate: 0.68,
    trades: 234,
    avgWin: 1240,
    avgLoss: -580,
  };

  const mockEquityCurve = Array.from({ length: 100 }, (_, i) => ({
    time: (Date.now() / 1000 - (100 - i) * 86400) as any,
    open: 100000 + i * 500 + Math.random() * 2000,
    high: 100000 + i * 500 + Math.random() * 2500,
    low: 100000 + i * 500 + Math.random() * 1500,
    close: 100000 + i * 500 + Math.random() * 2000,
  }));

  const runBacktest = () => {
    setRunning(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="h-full p-6">
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Configuration Panel */}
        <div className="col-span-12 lg:col-span-3">
          <DataPanel title="Configuration">
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-fg/60 mb-2">Strategy</label>
                <select className="w-full">
                  <option>Tortoise Strategy</option>
                  <option>Momentum Alpha</option>
                  <option>Mean Reversion</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs uppercase text-fg/60 mb-2">Symbol</label>
                <select className="w-full">
                  <option>BTC-PERP</option>
                  <option>ETH-PERP</option>
                  <option>SOL-PERP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs uppercase text-fg/60 mb-2">Timeframe</label>
                <select className="w-full">
                  <option>1m</option>
                  <option>5m</option>
                  <option>15m</option>
                  <option>1h</option>
                  <option>1d</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs uppercase text-fg/60 mb-2">Start Date</label>
                <input type="date" className="w-full" defaultValue="2024-01-01" />
              </div>
              
              <div>
                <label className="block text-xs uppercase text-fg/60 mb-2">End Date</label>
                <input type="date" className="w-full" defaultValue="2025-01-01" />
              </div>
              
              <div>
                <label className="block text-xs uppercase text-fg/60 mb-2">Initial Capital</label>
                <input type="number" className="w-full" defaultValue="100000" />
              </div>

              <button
                onClick={runBacktest}
                disabled={running}
                className="w-full py-3 border-2 border-accent text-accent font-bold uppercase tracking-wider hover:bg-accent hover:text-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {running ? `RUNNING ${progress}%` : 'RUN BACKTEST'}
              </button>
              
              {running && (
                <div className="w-full h-2 bg-grid">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </DataPanel>
        </div>

        {/* Results */}
        <div className="col-span-12 lg:col-span-6">
          <DataPanel title="Equity Curve">
            <GraphModule data={mockEquityCurve} height={400} />
          </DataPanel>

          <div className="mt-6">
            <DataPanel title="Trade History">
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Symbol</th>
                      <th>Side</th>
                      <th>Size</th>
                      <th>Entry</th>
                      <th>Exit</th>
                      <th>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        <td>2024-12-{10 + i} 14:30</td>
                        <td className="text-accent">BTC-PERP</td>
                        <td>{i % 2 === 0 ? 'LONG' : 'SHORT'}</td>
                        <td>0.5</td>
                        <td>$42,000</td>
                        <td>$43,200</td>
                        <td className={i % 2 === 0 ? 'text-accent' : 'status-error'}>
                          {i % 2 === 0 ? '+' : '-'}${(Math.random() * 1000).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DataPanel>
          </div>
        </div>

        {/* Metrics */}
        <div className="col-span-12 lg:col-span-3">
          <DataPanel title="Results" glow>
            <div className="space-y-6">
              <MetricCell
                label="Total Return"
                value={formatPercent(backtestResults.totalReturn)}
                size="lg"
                status="active"
                glow
              />
              <MetricCell
                label="Sharpe Ratio"
                value={backtestResults.sharpeRatio.toFixed(2)}
                size="md"
              />
              <MetricCell
                label="Max Drawdown"
                value={formatPercent(backtestResults.maxDrawdown)}
                size="md"
                status="error"
              />
              <MetricCell
                label="Win Rate"
                value={formatPercent(backtestResults.winRate)}
                size="md"
              />
              <MetricCell
                label="Total Trades"
                value={backtestResults.trades}
                size="md"
              />
              <MetricCell
                label="Avg Win"
                value={formatCurrency(backtestResults.avgWin)}
                size="sm"
                status="active"
              />
              <MetricCell
                label="Avg Loss"
                value={formatCurrency(backtestResults.avgLoss)}
                size="sm"
                status="error"
              />
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}

