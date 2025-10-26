'use client';

import DataPanel from '@/components/DataPanel';
import GraphModule from '@/components/GraphModule';
import { formatPercent } from '@/lib/utils';

export default function ResearchPage() {
  const mockCorrelationData = Array.from({ length: 100 }, (_, i) => ({
    time: (Date.now() / 1000 - (100 - i) * 86400) as any,
    open: 50 + Math.sin(i / 10) * 20 + Math.random() * 10,
    high: 50 + Math.sin(i / 10) * 20 + Math.random() * 15,
    low: 50 + Math.sin(i / 10) * 20 + Math.random() * 5,
    close: 50 + Math.sin(i / 10) * 20 + Math.random() * 10,
  }));

  const correlationMatrix = [
    ['', 'BTC', 'ETH', 'SOL', 'SPX', 'GOLD'],
    ['BTC', '1.00', '0.85', '0.72', '0.34', '-0.12'],
    ['ETH', '0.85', '1.00', '0.78', '0.28', '-0.08'],
    ['SOL', '0.72', '0.78', '1.00', '0.19', '-0.15'],
    ['SPX', '0.34', '0.28', '0.19', '1.00', '0.42'],
    ['GOLD', '-0.12', '-0.08', '-0.15', '0.42', '1.00'],
  ];

  const volatilityMetrics = [
    { symbol: 'BTC-PERP', vol30d: 0.42, vol7d: 0.38, vol1d: 0.45 },
    { symbol: 'ETH-PERP', vol30d: 0.56, vol7d: 0.52, vol1d: 0.58 },
    { symbol: 'SOL-PERP', vol30d: 0.68, vol7d: 0.64, vol1d: 0.72 },
  ];

  return (
    <div className="h-full p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Correlation Matrix */}
        <div className="col-span-12 lg:col-span-6">
          <DataPanel title="Correlation Matrix">
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead>
                  <tr>
                    {correlationMatrix[0].map((header, i) => (
                      <th key={i} className="text-center">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationMatrix.slice(1).map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={j === 0 ? 'text-accent font-semibold' : ''}
                          style={
                            j > 0
                              ? {
                                  color: `rgb(${
                                    parseFloat(cell) > 0
                                      ? `0, ${Math.floor(parseFloat(cell) * 255)}, 132`
                                      : `${Math.floor(Math.abs(parseFloat(cell)) * 255)}, 0, 116`
                                  })`,
                                }
                              : {}
                          }
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataPanel>
        </div>

        {/* Volatility Metrics */}
        <div className="col-span-12 lg:col-span-6">
          <DataPanel title="Volatility Analysis">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>30D Vol</th>
                    <th>7D Vol</th>
                    <th>1D Vol</th>
                  </tr>
                </thead>
                <tbody>
                  {volatilityMetrics.map((metric) => (
                    <tr key={metric.symbol}>
                      <td className="text-accent">{metric.symbol}</td>
                      <td>{formatPercent(metric.vol30d)}</td>
                      <td>{formatPercent(metric.vol7d)}</td>
                      <td>{formatPercent(metric.vol1d)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataPanel>
        </div>

        {/* Time Series Analysis */}
        <div className="col-span-12">
          <DataPanel title="BTC vs ETH Correlation (Rolling 30D)">
            <GraphModule data={mockCorrelationData} height={300} />
          </DataPanel>
        </div>

        {/* Research Notes */}
        <div className="col-span-12 lg:col-span-6">
          <DataPanel title="Research Notes">
            <div className="space-y-4">
              <div className="card">
                <div className="text-xs text-fg/60 mb-1">2025-01-15 14:30</div>
                <div className="text-sm">
                  BTC correlation with SPX increasing. Consider hedging positions during US trading hours.
                </div>
              </div>
              <div className="card">
                <div className="text-xs text-fg/60 mb-1">2025-01-14 09:15</div>
                <div className="text-sm">
                  SOL volatility spike detected. Adjust position sizing accordingly.
                </div>
              </div>
              <div className="card">
                <div className="text-xs text-fg/60 mb-1">2025-01-13 16:45</div>
                <div className="text-sm">
                  ETH showing mean reversion pattern. Potential entry opportunity.
                </div>
              </div>
            </div>
          </DataPanel>
        </div>

        {/* Market Regime */}
        <div className="col-span-12 lg:col-span-6">
          <DataPanel title="Market Regime Detection" glow>
            <div className="space-y-4">
              <div className="card border-accent2">
                <div className="text-lg font-bold text-accent mb-2">CURRENT REGIME: TRENDING</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-fg/60">Confidence</div>
                    <div className="font-semibold text-accent">87%</div>
                  </div>
                  <div>
                    <div className="text-fg/60">Duration</div>
                    <div className="font-semibold">5 days</div>
                  </div>
                  <div>
                    <div className="text-fg/60">Direction</div>
                    <div className="font-semibold text-accent">BULLISH</div>
                  </div>
                  <div>
                    <div className="text-fg/60">Strength</div>
                    <div className="font-semibold">MODERATE</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-fg/60">
                <div className="mb-2 font-semibold uppercase">Recommended Strategies:</div>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Momentum following strategies preferred</li>
                  <li>Reduce mean reversion exposure</li>
                  <li>Increase position sizing confidence</li>
                </ul>
              </div>
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}

