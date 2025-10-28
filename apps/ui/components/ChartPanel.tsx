/**
 * 📊 TACITVS QUANT TERMINAL - Chart Panel
 * Complete chart panel with symbol/timeframe selector and indicators
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Chart from './Chart';
import { fetchCandles, fetchIndicator, Candle } from '@/lib/api';
import { playBeep } from '@/lib/audio';
import { useAppStore } from '@/lib/store';

const AVAILABLE_SYMBOLS = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP'];
const AVAILABLE_TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];
const AVAILABLE_INDICATORS = [
  { id: 'none', name: 'None', color: '#8AFF00' },
  { id: 'ema', name: 'EMA(20)', color: '#8AFF00', length: 20 },
  { id: 'ema', name: 'EMA(50)', color: '#FF6B35', length: 50 },
  { id: 'rsi', name: 'RSI(14)', color: '#7FB7FF', length: 14 },
  { id: 'sma', name: 'SMA(20)', color: '#FFA500', length: 20 },
];
const AVAILABLE_LIMITS = [
  { value: 1000, label: '1K bars' },
  { value: 5000, label: '5K bars' },
  { value: 15000, label: '15K bars' },
  { value: 30000, label: '30K bars' },
  { value: 50000, label: '50K bars' },
];

interface IndicatorOverlay {
  name: string;
  data: Array<{ time: number; value: number }>;
  color: string;
}

export function ChartPanel() {
  const { audioEnabled } = useAppStore();
  
  const [symbol, setSymbol] = useState<string>('BTC-PERP');
  const [timeframe, setTimeframe] = useState<string>('1d');
  const [selectedIndicator, setSelectedIndicator] = useState<string>('none');
  const [barsLimit, setBarsLimit] = useState<number>(15000);
  
  const [candles, setCandles] = useState<Candle[]>([]);
  const [indicators, setIndicators] = useState<IndicatorOverlay[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadChartData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch candles
      const candleData = await fetchCandles(symbol, timeframe, barsLimit);
      setCandles(candleData);
      
      // Fetch indicator if selected
      if (selectedIndicator !== 'none') {
        const indicatorConfig = AVAILABLE_INDICATORS.find(
          ind => ind.name === selectedIndicator
        );
        
        if (indicatorConfig && indicatorConfig.id !== 'none') {
          const indicatorData = await fetchIndicator(
            symbol,
            timeframe,
            indicatorConfig.id,
            indicatorConfig.length || 14,
            barsLimit
          );
          
          setIndicators([{
            name: indicatorConfig.name,
            data: indicatorData,
            color: indicatorConfig.color
          }]);
        }
      } else {
        setIndicators([]);
      }
      
      playBeep('notification', audioEnabled);
    } catch (err) {
      console.error('Error loading chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe, selectedIndicator, barsLimit, audioEnabled]);

  // Load chart data
  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);
    playBeep('click', audioEnabled);
  };

  const handleTimeframeChange = (newTf: string) => {
    setTimeframe(newTf);
    playBeep('click', audioEnabled);
  };

  const handleIndicatorChange = (newIndicator: string) => {
    setSelectedIndicator(newIndicator);
    playBeep('click', audioEnabled);
  };

  const handleLimitChange = (newLimit: number) => {
    setBarsLimit(newLimit);
    playBeep('click', audioEnabled);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Symbol Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--fg)] opacity-60">
            SYMBOL:
          </span>
          <div className="flex gap-1">
            {AVAILABLE_SYMBOLS.map(sym => (
              <button
                key={sym}
                onClick={() => handleSymbolChange(sym)}
                className={`
                  px-3 py-1.5 text-xs font-mono border transition-all
                  ${symbol === sym
                    ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-bold'
                    : 'bg-[var(--grid)] text-[var(--fg)] border-[var(--border)] hover:border-[var(--accent)]'
                  }
                `}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--fg)] opacity-60">
            TIMEFRAME:
          </span>
          <div className="flex gap-1">
            {AVAILABLE_TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`
                  px-3 py-1.5 text-xs font-mono border transition-all
                  ${timeframe === tf
                    ? 'bg-[var(--accent)] text-black border-[var(--accent)] font-bold'
                    : 'bg-[var(--grid)] text-[var(--fg)] border-[var(--border)] hover:border-[var(--accent)]'
                  }
                `}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Indicator Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--fg)] opacity-60">
            INDICATOR:
          </span>
          <select
            value={selectedIndicator}
            onChange={(e) => handleIndicatorChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-[var(--grid)] text-[var(--fg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all"
          >
            {AVAILABLE_INDICATORS.map(ind => (
              <option key={ind.name} value={ind.name}>
                {ind.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bars Limit Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--fg)] opacity-60">
            BARS:
          </span>
          <select
            value={barsLimit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-mono bg-[var(--grid)] text-[var(--fg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all"
          >
            {AVAILABLE_LIMITS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={loadChartData}
          disabled={isLoading}
          className={`
            px-4 py-1.5 text-xs font-mono border transition-all
            ${isLoading
              ? 'bg-[var(--grid)] text-[var(--fg)] border-[var(--border)] opacity-50 cursor-not-allowed'
              : 'bg-[var(--grid)] text-[var(--accent)] border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black font-bold'
            }
          `}
        >
          {isLoading ? '⟳ LOADING...' : '↻ REFRESH'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded">
          <p className="text-sm font-mono text-red-400">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Chart */}
      {!error && (
        <Chart
          symbol={symbol}
          timeframe={timeframe}
          candles={candles}
          indicators={indicators}
          height={500}
        />
      )}
    </div>
  );
}

