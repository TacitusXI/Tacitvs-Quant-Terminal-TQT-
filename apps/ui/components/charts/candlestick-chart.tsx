"use client";

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { SkeletonChart } from "@/components/ui/skeleton";
import { useCandles } from "@/lib/hooks";
import { useState, useMemo } from "react";

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  market?: string;
  interval?: string;
  daysBack?: number;
  data?: CandleData[];
  height?: number;
  className?: string;
  showVolume?: boolean;
  showRRuler?: boolean;
  entryPrice?: number;
  stopPrice?: number;
  targetPrice?: number;
  indicators?: {
    sma20?: boolean;
    sma50?: boolean;
    ema12?: boolean;
    ema26?: boolean;
  };
}

// Calculate technical indicators
function calculateSMA(data: CandleData[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      result.push(sum / period);
    }
  }
  return result;
}

function calculateEMA(data: CandleData[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let ema = data.slice(0, period).reduce((acc, d) => acc + d.close, 0) / period;
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else if (i === period - 1) {
      result.push(ema);
    } else {
      ema = (data[i].close - ema) * multiplier + ema;
      result.push(ema);
    }
  }
  return result;
}

function CandlestickChartInner({ 
  market = "BTC-PERP",
  interval = "1d",
  daysBack = 30,
  data, 
  height = 500, 
  className, 
  showVolume = true,
  showRRuler = false,
  entryPrice,
  stopPrice,
  targetPrice,
  indicators = {}
}: CandlestickChartProps) {
  const { data: realData, isLoading, error } = useCandles(market, interval, daysBack);
  const [activeInterval, setActiveInterval] = useState(interval);
  
  // Debug: log what we received
  console.log('[CandlestickChart] Data received:', {
    hasRealData: !!realData,
    candlesCount: realData?.candles?.length || 0,
    isLoading,
    error: error?.message,
    market,
    interval,
    daysBack
  });
  
  // Use real data if available - prioritize realData.candles
  let candleData: CandleData[] = [];
  
  if (realData?.candles && Array.isArray(realData.candles) && realData.candles.length > 0) {
    candleData = realData.candles;
    console.log(`[CandlestickChart] ✅ Using ${candleData.length} real candles, last price: $${candleData[candleData.length-1]?.close?.toFixed(2)}`);
  } else if (data && Array.isArray(data) && data.length > 0) {
    candleData = data;
    console.log('[CandlestickChart] Using provided data prop');
  } else {
    // Fallback mock data only if nothing else works
    console.warn('[CandlestickChart] ⚠️ Using mock data fallback');
    candleData = [
      { timestamp: 1640995200000, open: 47000, high: 48500, low: 46500, close: 47500, volume: 1000000 },
      { timestamp: 1641081600000, open: 47500, high: 48800, low: 47000, close: 48000, volume: 1200000 },
      { timestamp: 1641168000000, open: 48000, high: 49200, low: 47500, close: 48500, volume: 1100000 },
    ];
  }

  // Calculate indicators
  const chartData = useMemo(() => {
    const sma20 = indicators.sma20 ? calculateSMA(candleData, 20) : [];
    const sma50 = indicators.sma50 ? calculateSMA(candleData, 50) : [];
    const ema12 = indicators.ema12 ? calculateEMA(candleData, 12) : [];
    const ema26 = indicators.ema26 ? calculateEMA(candleData, 26) : [];

    return candleData.map((candle, i) => ({
      ...candle,
      // Candlestick body and wick representation
      wickHigh: [candle.low, candle.high],
      wickLow: candle.low,
      body: candle.open < candle.close 
        ? [candle.open, candle.close]  // Bullish
        : [candle.close, candle.open], // Bearish
      isBullish: candle.close >= candle.open,
      // Indicators
      sma20: indicators.sma20 ? sma20[i] : undefined,
      sma50: indicators.sma50 ? sma50[i] : undefined,
      ema12: indicators.ema12 ? ema12[i] : undefined,
      ema26: indicators.ema26 ? ema26[i] : undefined,
    }));
  }, [candleData, indicators]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0]?.payload;
      if (!data) return null;

      return (
        <div className="bg-[#0a0c12] border border-[var(--accent2)] rounded-lg p-3 shadow-2xl backdrop-blur-sm">
          <p className="text-[var(--accent2)] text-xs font-mono mb-2">
            {new Date(label).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric',
              hour: interval.includes('m') || interval.includes('h') ? '2-digit' : undefined,
              minute: interval.includes('m') || interval.includes('h') ? '2-digit' : undefined
            })}
          </p>
          <div className="space-y-1">
            <p className={`font-mono text-sm ${data.isBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.isBullish ? '▲' : '▼'} {data.isBullish ? 'BULLISH' : 'BEARISH'}
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs font-mono">
              <span className="text-neutral-500">Open:</span>
              <span className="text-neutral-200">${data.open?.toLocaleString()}</span>
              
              <span className="text-neutral-500">High:</span>
              <span className="text-emerald-400">${data.high?.toLocaleString()}</span>
              
              <span className="text-neutral-500">Low:</span>
              <span className="text-rose-400">${data.low?.toLocaleString()}</span>
              
              <span className="text-neutral-500">Close:</span>
              <span className="text-neutral-200">${data.close?.toLocaleString()}</span>
              
              <span className="text-neutral-500">Change:</span>
              <span className={data.isBullish ? 'text-emerald-400' : 'text-rose-400'}>
                {data.isBullish ? '+' : ''}{((data.close - data.open) / data.open * 100).toFixed(2)}%
              </span>
              
              {showVolume && (
                <>
                  <span className="text-neutral-500">Volume:</span>
                  <span className="text-[var(--accent2)]">
                    {(data.volume / 1000000).toFixed(2)}M
                  </span>
                </>
              )}
            </div>
            
            {/* Indicator values */}
            {indicators.sma20 && !isNaN(data.sma20) && (
              <p className="text-yellow-400 text-xs font-mono">
                SMA20: ${data.sma20?.toLocaleString(undefined, {maximumFractionDigits: 0})}
              </p>
            )}
            {indicators.ema12 && !isNaN(data.ema12) && (
              <p className="text-cyan-400 text-xs font-mono">
                EMA12: ${data.ema12?.toLocaleString(undefined, {maximumFractionDigits: 0})}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const currentPrice = candleData[candleData.length - 1]?.close || 52000;
  const openPrice = candleData[0]?.open || 47000;
  const priceChange = currentPrice - openPrice;
  const priceChangePercent = (priceChange / openPrice) * 100;

  // Calculate max volume for scaling
  const maxVolume = Math.max(...chartData.map(d => d.volume));

  // Loading state
  if (isLoading) {
    return <SkeletonChart className={className} height={height} />;
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-[var(--color-danger)]">Failed to Load Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-neutral-400 text-sm">
            Unable to fetch candlestick data for {market}. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-[var(--accent)]">📊</span> {market} | {activeInterval.toUpperCase()}
          </span>
          <div className="flex gap-1">
            {["5m", "15m", "1h", "4h", "1d", "1w"].map((tf) => (
              <Button
                key={tf}
                variant={tf === activeInterval ? "primary" : "ghost"}
                size="sm"
                className="px-3 py-1 text-xs font-mono"
                onClick={() => setActiveInterval(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Price Info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold font-mono text-neutral-100">
              ${currentPrice.toLocaleString()}
            </div>
            <div className={`text-sm font-mono flex items-center gap-2 ${
              priceChange >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}>
              <span className="text-lg">{priceChange >= 0 ? "▲" : "▼"}</span>
              <span>
                {priceChange >= 0 ? "+" : ""}{priceChange.toLocaleString(undefined, {maximumFractionDigits: 2})} 
                ({priceChangePercent >= 0 ? "+" : ""}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-500">24h Volume</div>
            <div className="text-[var(--accent)] font-mono text-lg">
              ${((chartData[chartData.length - 1]?.volume || 0) / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              H: <span className="text-emerald-400">${Math.max(...candleData.map(d => d.high)).toLocaleString()}</span> | 
              L: <span className="text-rose-400">${Math.min(...candleData.map(d => d.low)).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full" style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: showVolume ? 60 : 5 }}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" vertical={false} />
              
              <XAxis 
                dataKey="timestamp" 
                stroke="var(--accent2)"
                fontSize={11}
                fontFamily="monospace"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (activeInterval.includes('m') || activeInterval.includes('h')) {
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  }
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              
              <YAxis 
                yAxisId="price"
                stroke="var(--accent2)"
                fontSize={11}
                fontFamily="monospace"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                domain={['dataMin - 1000', 'dataMax + 1000']}
              />
              
              {showVolume && (
                <YAxis 
                  yAxisId="volume"
                  orientation="right"
                  stroke="var(--accent)"
                  fontSize={11}
                  fontFamily="monospace"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  domain={[0, maxVolume * 4]}
                />
              )}
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* R-Ruler Lines */}
              {showRRuler && entryPrice && stopPrice && targetPrice && (
                <>
                  <ReferenceLine 
                    yAxisId="price"
                    y={entryPrice} 
                    stroke="var(--accent)" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ 
                      value: `Entry: $${entryPrice.toLocaleString()}`, 
                      position: "right",
                      fill: "var(--accent)",
                      fontSize: 12,
                      fontFamily: "monospace"
                    }}
                  />
                  <ReferenceLine 
                    yAxisId="price"
                    y={stopPrice} 
                    stroke="var(--color-danger)" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ 
                      value: `Stop: $${stopPrice.toLocaleString()}`, 
                      position: "right",
                      fill: "var(--color-danger)",
                      fontSize: 12,
                      fontFamily: "monospace"
                    }}
                  />
                  <ReferenceLine 
                    yAxisId="price"
                    y={targetPrice} 
                    stroke="#16A34A" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ 
                      value: `Target: $${targetPrice.toLocaleString()}`, 
                      position: "right",
                      fill: "#16A34A",
                      fontSize: 12,
                      fontFamily: "monospace"
                    }}
                  />
                </>
              )}
              
              {/* Volume Bars */}
              {showVolume && (
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  fill="url(#volumeGradient)"
                  opacity={0.6}
                />
              )}
              
              {/* Candlestick Wicks (High-Low range) - TradingView style */}
              <Bar
                yAxisId="price"
                dataKey="wickHigh"
                fill="none"
                stroke="none"
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const wickX = x + width / 2;
                  const color = payload.isBullish ? '#10B981' : '#EF4444';
                  
                  return (
                    <line
                      x1={wickX}
                      y1={y}
                      x2={wickX}
                      y2={y + height}
                      stroke={color}
                      strokeWidth={1}
                      opacity={0.7}
                    />
                  );
                }}
              />
              
              {/* Candlestick Bodies - TradingView style */}
              <Bar
                yAxisId="price"
                dataKey="body"
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const color = payload.isBullish ? '#10B981' : '#EF4444';
                  const minHeight = 1;
                  const adjustedHeight = Math.max(Math.abs(height), minHeight);
                  
                  // Adaptive candle width based on data points (TradingView style)
                  // More data = narrower candles, less data = wider candles
                  const dataPointCount = chartData.length;
                  let candleWidth;
                  
                  if (dataPointCount > 500) {
                    // Very zoomed out - thin candles
                    candleWidth = Math.max(width * 0.4, 1);
                  } else if (dataPointCount > 200) {
                    // Medium zoom
                    candleWidth = Math.max(width * 0.6, 2);
                  } else if (dataPointCount > 50) {
                    // Zoomed in
                    candleWidth = Math.max(width * 0.75, 3);
                  } else {
                    // Very zoomed in - wide candles
                    candleWidth = Math.max(width * 0.85, 5);
                  }
                  
                  // Cap maximum width
                  candleWidth = Math.min(candleWidth, 25);
                  
                  const candleX = x + (width - candleWidth) / 2;
                  
                  return (
                    <rect
                      x={candleX}
                      y={height < 0 ? y + height : y}
                      width={candleWidth}
                      height={adjustedHeight}
                      fill={color}
                      stroke={color}
                      strokeWidth={0.5}
                      opacity={1}
                    />
                  );
                }}
              />
              
              {/* Technical Indicators */}
              {indicators.sma20 && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="sma20"
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                  name="SMA 20"
                />
              )}
              
              {indicators.sma50 && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="sma50"
                  stroke="#f97316"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                  name="SMA 50"
                />
              )}
              
              {indicators.ema12 && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="ema12"
                  stroke="#22d3ee"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                  name="EMA 12"
                />
              )}
              
              {indicators.ema26 && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="ema26"
                  stroke="#a78bfa"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                  name="EMA 26"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* R-Ruler Info */}
        {showRRuler && entryPrice && stopPrice && targetPrice && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xs text-neutral-500 mb-1">Entry</div>
                <div className="text-[var(--accent)] font-mono text-sm font-bold">
                  ${entryPrice.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Stop</div>
                <div className="text-rose-400 font-mono text-sm font-bold">
                  ${stopPrice.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Target</div>
                <div className="text-emerald-400 font-mono text-sm font-bold">
                  ${targetPrice.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">R:R Ratio</div>
                <div className="text-neutral-200 font-mono text-sm font-bold">
                  {((targetPrice - entryPrice) / Math.abs(entryPrice - stopPrice)).toFixed(2)}:1
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export with error boundary
export function CandlestickChart(props: CandlestickChartProps) {
  return (
    <ChartErrorBoundary>
      <CandlestickChartInner {...props} />
    </ChartErrorBoundary>
  );
}

