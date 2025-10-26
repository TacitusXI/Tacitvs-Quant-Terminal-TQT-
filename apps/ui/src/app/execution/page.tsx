'use client';

import { useState } from 'react';
import DataPanel from '@/components/DataPanel';
import ExecPanel from '@/components/ExecPanel';
import MetricCell from '@/components/MetricCell';
import { formatCurrency } from '@/lib/utils';
import { useAudio } from '@/hooks/useAudio';

export default function ExecutionPage() {
  const { playPing, playAlert } = useAudio();
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [symbol, setSymbol] = useState('BTC-PERP');
  const [size, setSize] = useState('0.5');
  const [price, setPrice] = useState('43500');

  const activeOrders = [
    { id: '001', symbol: 'BTC-PERP', side: 'LONG', type: 'LIMIT', size: 0.5, price: 42000, status: 'OPEN' },
    { id: '002', symbol: 'ETH-PERP', side: 'SHORT', type: 'STOP', size: 2.0, price: 2200, status: 'OPEN' },
  ];

  const openPositions = [
    { symbol: 'BTC-PERP', side: 'LONG', size: 1.0, entry: 42500, current: 43500, pnl: 1000, pnlPercent: 2.35 },
    { symbol: 'SOL-PERP', side: 'LONG', size: 10, entry: 98, current: 105, pnl: 70, pnlPercent: 7.14 },
  ];

  const recentTrades = [
    { time: '14:32:15', symbol: 'BTC-PERP', side: 'LONG', size: 0.5, price: 43200, pnl: 850 },
    { time: '13:45:22', symbol: 'ETH-PERP', side: 'SHORT', size: 2.0, price: 2300, pnl: -120 },
    { time: '12:18:33', symbol: 'SOL-PERP', side: 'LONG', size: 10, price: 102, pnl: 340 },
  ];

  const handleSubmitOrder = () => {
    playAlert();
    alert(`Order submitted: ${side} ${size} ${symbol} @ ${orderType === 'MARKET' ? 'MARKET' : price}`);
  };

  const handleCancelOrder = (orderId: string) => {
    playPing();
    alert(`Order ${orderId} cancelled`);
  };

  return (
    <div className="h-full p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Order Entry */}
        <div className="col-span-12 lg:col-span-4">
          <ExecPanel mode={side === 'LONG' ? 'normal' : 'critical'}>
            <div className="p-4">
              <h3 className="text-lg font-bold uppercase mb-4 text-accent glow">
                Order Entry
              </h3>

              <div className="space-y-4">
                {/* Symbol */}
                <div>
                  <label className="block text-xs uppercase text-fg/60 mb-2">Symbol</label>
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full"
                  >
                    <option>BTC-PERP</option>
                    <option>ETH-PERP</option>
                    <option>SOL-PERP</option>
                  </select>
                </div>

                {/* Side */}
                <div>
                  <label className="block text-xs uppercase text-fg/60 mb-2">Side</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSide('LONG')}
                      className={`py-2 font-bold transition-all ${
                        side === 'LONG'
                          ? 'bg-accent text-bg'
                          : 'border border-accent text-accent hover:bg-accent/20'
                      }`}
                    >
                      LONG
                    </button>
                    <button
                      onClick={() => setSide('SHORT')}
                      className={`py-2 font-bold transition-all ${
                        side === 'SHORT'
                          ? 'bg-accent2 text-bg'
                          : 'border border-accent2 text-accent2 hover:bg-accent2/20'
                      }`}
                    >
                      SHORT
                    </button>
                  </div>
                </div>

                {/* Order Type */}
                <div>
                  <label className="block text-xs uppercase text-fg/60 mb-2">Order Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['MARKET', 'LIMIT', 'STOP'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setOrderType(type)}
                        className={`py-2 text-xs font-bold transition-all ${
                          orderType === type
                            ? 'bg-accent2 text-bg'
                            : 'border border-grid text-fg hover:border-accent2'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-xs uppercase text-fg/60 mb-2">Size</label>
                  <input
                    type="number"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full"
                    step="0.1"
                  />
                </div>

                {/* Price */}
                {orderType !== 'MARKET' && (
                  <div>
                    <label className="block text-xs uppercase text-fg/60 mb-2">Price</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmitOrder}
                  className={`w-full py-4 font-bold uppercase tracking-wider transition-all ${
                    side === 'LONG'
                      ? 'bg-accent text-bg hover:bg-accent2'
                      : 'bg-accent2 text-bg hover:bg-accent'
                  }`}
                >
                  {side} {symbol}
                </button>
              </div>
            </div>
          </ExecPanel>
        </div>

        {/* Open Positions & Risk */}
        <div className="col-span-12 lg:col-span-4">
          <DataPanel title="Open Positions" glow>
            <div className="space-y-4">
              {openPositions.map((pos) => (
                <div key={pos.symbol} className="card border-accent2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-accent font-bold text-lg">{pos.symbol}</div>
                    <div className={`text-lg font-bold ${pos.pnl >= 0 ? 'text-accent' : 'status-error'}`}>
                      {pos.pnl >= 0 ? '+' : ''}{formatCurrency(pos.pnl)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-fg/60 text-xs">Side</div>
                      <div className="font-semibold">{pos.side}</div>
                    </div>
                    <div>
                      <div className="text-fg/60 text-xs">Size</div>
                      <div className="font-semibold">{pos.size}</div>
                    </div>
                    <div>
                      <div className="text-fg/60 text-xs">Entry</div>
                      <div className="font-semibold">${pos.entry}</div>
                    </div>
                    <div>
                      <div className="text-fg/60 text-xs">Current</div>
                      <div className="font-semibold">${pos.current}</div>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-2 border border-accent2 text-accent2 text-xs uppercase hover:bg-accent2 hover:text-bg transition-all">
                    Close Position
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-grid">
              <div className="grid grid-cols-2 gap-4">
                <MetricCell label="Total P&L" value={formatCurrency(1070)} size="sm" status="active" />
                <MetricCell label="Exposure" value="$87,500" size="sm" />
              </div>
            </div>
          </DataPanel>
        </div>

        {/* Active Orders */}
        <div className="col-span-12 lg:col-span-4">
          <DataPanel title="Active Orders">
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <div key={order.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-accent font-semibold">{order.symbol}</span>
                    <span className="text-xs text-fg/60">#{order.id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <div className="text-fg/60">Side</div>
                      <div className="font-semibold">{order.side}</div>
                    </div>
                    <div>
                      <div className="text-fg/60">Type</div>
                      <div className="font-semibold">{order.type}</div>
                    </div>
                    <div>
                      <div className="text-fg/60">Price</div>
                      <div className="font-semibold">${order.price}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="w-full py-1 border border-grid text-xs hover:border-accent2 hover:text-accent2 transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              ))}
            </div>
          </DataPanel>
        </div>

        {/* Recent Trades */}
        <div className="col-span-12">
          <DataPanel title="Recent Trades">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>P&L</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade, i) => (
                    <tr key={i}>
                      <td>{trade.time}</td>
                      <td className="text-accent">{trade.symbol}</td>
                      <td>{trade.side}</td>
                      <td>{trade.size}</td>
                      <td>${trade.price}</td>
                      <td className={trade.pnl >= 0 ? 'text-accent' : 'status-error'}>
                        {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                      </td>
                      <td className="status-active">FILLED</td>
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

