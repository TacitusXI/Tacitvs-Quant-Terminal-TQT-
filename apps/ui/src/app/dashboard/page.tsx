'use client';

import { useState, useEffect } from 'react';
import DataPanel from '@/components/DataPanel';
import MetricCell from '@/components/MetricCell';
import GraphModule from '@/components/GraphModule';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function DashboardPage() {
  const [portfolioValue, setPortfolioValue] = useState(125430.50);
  const [pnl, setPnl] = useState(3240.20);
  const [pnlPercent, setPnlPercent] = useState(2.65);

  // Mock market data for chart
  const mockChartData = Array.from({ length: 100 }, (_, i) => ({
    time: (Date.now() / 1000 - (100 - i) * 86400) as any,
    open: 40000 + Math.random() * 5000,
    high: 40000 + Math.random() * 6000,
    low: 40000 + Math.random() * 4000,
    close: 40000 + Math.random() * 5000,
  }));

  const positions = [
    { symbol: 'BTC-PERP', size: 0.5, entry: 42000, current: 43500, pnl: 750 },
    { symbol: 'ETH-PERP', size: 2.0, entry: 2200, current: 2350, pnl: 300 },
    { symbol: 'SOL-PERP', size: 10, entry: 98, current: 105, pnl: 70 },
  ];

  const strategyMetrics = [
    { name: 'Tortoise Strategy', status: 'ACTIVE', trades: 124, winRate: 0.68, sharpe: 2.1 },
    { name: 'Momentum Alpha', status: 'PAUSED', trades: 89, winRate: 0.55, sharpe: 1.4 },
  ];

  return (
    <div className="h-full p-6">
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Portfolio Metrics */}
        <div className="col-span-12 lg:col-span-3">
          <DataPanel title="Portfolio" glow>
            <div className="space-y-6">
              <MetricCell
                label="Total Value"
                value={formatCurrency(portfolioValue)}
                size="lg"
                glow
              />
              <MetricCell
                label="P&L (24h)"
                value={formatCurrency(pnl)}
                change={pnlPercent}
                size="md"
                status={pnl >= 0 ? 'active' : 'error'}
              />
              <MetricCell
                label="Open Positions"
                value={positions.length}
                size="md"
              />
              <MetricCell
                label="Sharpe Ratio"
                value="2.14"
                size="md"
              />
            </div>
          </DataPanel>
        </div>

        {/* Main Chart */}
        <div className="col-span-12 lg:col-span-6">
          <DataPanel title="BTC-PERP" headerRight={
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-fg/60">Last:</span>
              <span className="text-accent font-bold">$43,521.00</span>
            </div>
          }>
            <GraphModule data={mockChartData} height={400} />
          </DataPanel>
        </div>

        {/* Active Positions */}
        <div className="col-span-12 lg:col-span-3">
          <DataPanel title="Positions">
            <div className="space-y-3">
              {positions.map((pos) => (
                <div key={pos.symbol} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-accent font-semibold">{pos.symbol}</span>
                    <span className={pos.pnl >= 0 ? 'text-accent' : 'status-error'}>
                      {pos.pnl >= 0 ? '+' : ''}{formatCurrency(pos.pnl)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-fg/60">Size</div>
                      <div className="font-semibold">{pos.size}</div>
                    </div>
                    <div>
                      <div className="text-fg/60">Entry</div>
                      <div className="font-semibold">${pos.entry}</div>
                    </div>
                    <div>
                      <div className="text-fg/60">Current</div>
                      <div className="font-semibold">${pos.current}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DataPanel>
        </div>

        {/* Strategy Performance */}
        <div className="col-span-12">
          <DataPanel title="Active Strategies">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Strategy</th>
                    <th>Status</th>
                    <th>Trades</th>
                    <th>Win Rate</th>
                    <th>Sharpe</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {strategyMetrics.map((strat) => (
                    <tr key={strat.name}>
                      <td className="text-accent">{strat.name}</td>
                      <td>
                        <span className={strat.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}>
                          {strat.status}
                        </span>
                      </td>
                      <td>{strat.trades}</td>
                      <td>{formatPercent(strat.winRate)}</td>
                      <td>{strat.sharpe.toFixed(2)}</td>
                      <td>
                        <button className="px-3 py-1 text-xs border border-accent2 hover:bg-accent2/20 transition-all">
                          MANAGE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}

