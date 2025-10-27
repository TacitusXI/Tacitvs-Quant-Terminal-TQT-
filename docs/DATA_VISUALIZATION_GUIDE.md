# 📊 Data Visualization Guide — Enhanced Charts

## Overview

Tacitvs Quant Terminal now features professional-grade trading charts with real-time updates, technical indicators, and advanced visualizations.

---

## 🎨 Chart Components

### 1. **CandlestickChart** — Professional OHLC Visualization

The ultimate trading chart with candlesticks, volume bars, and technical indicators.

#### Features:
- ✅ **OHLC Candlesticks** — Bullish (green) / Bearish (red)
- ✅ **Volume Bars** — Semi-transparent overlay with gradient
- ✅ **Technical Indicators:**
  - SMA 20/50
  - EMA 12/26
  - Customizable periods
- ✅ **R-Ruler** — Entry/Stop/Target price lines with R:R ratio
- ✅ **Multiple Timeframes** — 5m, 15m, 1h, 4h, 1d, 1w
- ✅ **Rich Tooltips** — OHLC, Volume, %Change, Indicators
- ✅ **Responsive** — Adapts to screen size

#### Usage:
```tsx
import { CandlestickChart } from "@/components/charts";

<CandlestickChart 
  market="BTC-PERP"
  interval="1d"
  daysBack={30}
  height={500}
  showVolume={true}
  showRRuler={true}
  entryPrice={50000}
  stopPrice={48000}
  targetPrice={54000}
  indicators={{
    sma20: true,
    ema12: true,
    ema26: true
  }}
/>
```

#### Visual Elements:

**Candlestick Colors:**
- 🟢 Green: Bullish (Close > Open)
- 🔴 Red: Bearish (Close < Open)
- Thin wicks show High-Low range

**Volume Bars:**
- Gradient fill (accent color)
- Right Y-axis scale
- Semi-transparent overlay

**R-Ruler Lines:**
- Entry: Cyan dashed line
- Stop: Red dashed line
- Target: Green dashed line
- R:R ratio displayed below

---

### 2. **Monte Carlo Fan Chart** — Probability Distributions

Enhanced fan chart with area fills showing probability ranges.

#### Features:
- ✅ **Percentile Bands:**
  - P5-P25: Worst 25% (red gradient)
  - P25-P50: Below median (yellow gradient)
  - P50-P75: Above median (green gradient)
  - P75-P95: Best 25% (cyan gradient)
- ✅ **Median Line** — Thick solid line (P50)
- ✅ **Boundary Lines** — P5 and P95 dashed
- ✅ **Summary Stats:**
  - Number of simulations
  - Probability of profit
  - Median return %
- ✅ **Legend** — Color-coded explanation
- ✅ **Interpretation Guide** — Built-in help text

#### Usage:
```tsx
import { MonteCarloFanChart } from "@/components/charts";

<MonteCarloFanChart 
  data={{
    percentiles: {
      p5: [...],
      p25: [...],
      p50: [...],
      p75: [...],
      p95: [...]
    },
    simulations: 1000,
    prob_profit: 0.65,
    median_return_pct: 12.5
  }}
  height={400}
/>
```

#### Visual Interpretation:
- **Narrow bands** = Low uncertainty, stable strategy
- **Wide bands** = High uncertainty, volatile outcomes
- **Median line trending up** = Positive expected value
- **50% of outcomes** fall within yellow-green range (P25-P75)

---

### 3. **LivePriceTicker** — Real-time Price Updates

WebSocket-powered live price display with flash animations.

#### Features:
- ✅ **Real-time Updates** — WebSocket streaming
- ✅ **Flash Animation** — Price change indicator
- ✅ **Direction Arrow** — ▲ Up / ▼ Down
- ✅ **24h Change** — Percentage with color coding
- ✅ **24h Volume** — Total volume display
- ✅ **Connection Status** — Green dot (connected) / Yellow (connecting)
- ✅ **Last Update Time** — HH:MM:SS timestamp

#### Usage:
```tsx
import { LivePriceTicker, CompactPriceTicker, LivePriceGrid } from "@/components/live-price-ticker";

// Full ticker
<LivePriceTicker 
  market="BTC-PERP"
  size="lg"
  showChange
  showVolume
/>

// Compact version
<CompactPriceTicker market="ETH-PERP" />

// Multi-market grid
<LivePriceGrid markets={["BTC-PERP", "ETH-PERP", "SOL-PERP"]} />
```

#### Size Variants:
- `sm` — Small (text-sm)
- `md` — Medium (text-lg)
- `lg` — Large (text-2xl)

#### Animation:
- Price increases → 🟢 Green flash + scale up
- Price decreases → 🔴 Red flash + scale up
- Duration: 300ms smooth transition

---

## 🔌 WebSocket System

### WebSocketManager

Singleton class managing real-time price streams.

#### Features:
- ✅ **Auto-reconnect** — Exponential backoff (max 5 attempts)
- ✅ **Multi-market Support** — Subscribe to multiple markets
- ✅ **Callback System** — Efficient event handling
- ✅ **Connection Status** — Track connected/connecting states
- ✅ **Mock Mode** — Development with simulated updates

#### API:
```typescript
import { getWebSocketManager } from "@/lib/websocket";

const ws = getWebSocketManager();

// Subscribe to market
const unsubscribe = ws.subscribe('BTC-PERP', (update) => {
  console.log('Price:', update.price);
  console.log('Volume:', update.volume24h);
  console.log('Change:', update.change24h);
});

// Unsubscribe
unsubscribe();

// Get status
const { connected, connecting } = ws.getStatus();

// Disconnect
ws.disconnect();
```

#### React Hook:
```typescript
import { usePriceStream } from "@/lib/websocket";

function MyComponent() {
  const { 
    price, 
    volume24h, 
    change24h, 
    lastUpdate, 
    isConnected 
  } = usePriceStream('BTC-PERP');
  
  return (
    <div>
      {isConnected ? (
        <span>${price?.toLocaleString()}</span>
      ) : (
        <span>Connecting...</span>
      )}
    </div>
  );
}
```

---

## 🎨 Technical Indicators

### Simple Moving Average (SMA)

**Formula:** Average of last N periods

```typescript
SMA(20) = (P1 + P2 + ... + P20) / 20
```

**Usage in charts:**
- SMA 20: Short-term trend (yellow line)
- SMA 50: Long-term trend (orange line)

**Interpretation:**
- Price > SMA → Bullish
- Price < SMA → Bearish
- SMA crossovers → Trend change

### Exponential Moving Average (EMA)

**Formula:** Weighted average with more weight on recent prices

```typescript
EMA(t) = Price(t) * k + EMA(t-1) * (1-k)
where k = 2 / (period + 1)
```

**Usage in charts:**
- EMA 12: Fast EMA (cyan line)
- EMA 26: Slow EMA (purple line)

**Interpretation:**
- EMA 12 crosses above EMA 26 → Bullish signal
- EMA 12 crosses below EMA 26 → Bearish signal

---

## 🎯 Best Practices

### Chart Selection

**Use CandlestickChart when:**
- Analyzing price action
- Need OHLC details
- Intraday/swing trading
- Want technical indicators

**Use PriceChart (line) when:**
- Long-term trends
- Clean visualization
- Space constrained
- Equity curves

**Use MonteCarloFanChart when:**
- Showing uncertainty
- Risk assessment
- Strategy evaluation
- Probability analysis

### Performance Tips

1. **Limit Data Points:**
   - Keep < 1000 candles for smooth rendering
   - Use appropriate timeframe

2. **Conditional Rendering:**
   - Load charts on-demand
   - Use loading skeletons

3. **WebSocket Throttling:**
   - Update max once per second
   - Debounce rapid changes

4. **Indicator Selection:**
   - Enable only needed indicators
   - More indicators = more computation

### Color Coding

**Follow theme colors:**
- 🟢 Bullish/Positive → Emerald (#10B981)
- 🔴 Bearish/Negative → Rose (#EF4444)
- 🔵 Neutral/Info → Accent (theme-dependent)
- 🟡 Warning → Amber (#fbbf24)

---

## 🛠️ Customization

### Adding New Indicators

1. **Calculate indicator values:**
```typescript
function calculateBollingerBands(data: CandleData[], period: number) {
  const sma = calculateSMA(data, period);
  const stdDev = calculateStdDev(data, period);
  
  return {
    upper: sma.map((val, i) => val + 2 * stdDev[i]),
    middle: sma,
    lower: sma.map((val, i) => val - 2 * stdDev[i])
  };
}
```

2. **Add to chart data:**
```typescript
const chartData = candleData.map((candle, i) => ({
  ...candle,
  bbUpper: bollingerBands.upper[i],
  bbMiddle: bollingerBands.middle[i],
  bbLower: bollingerBands.lower[i]
}));
```

3. **Render lines:**
```tsx
<Line
  dataKey="bbUpper"
  stroke="#9333ea"
  strokeWidth={1}
  dot={false}
/>
```

### Custom Tooltips

```tsx
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload) return null;
  
  return (
    <div className="bg-black border border-accent rounded p-2">
      <p>Price: ${payload[0].value}</p>
      <p>Your custom data...</p>
    </div>
  );
};

<Chart>
  <Tooltip content={<CustomTooltip />} />
</Chart>
```

---

## 📚 References

### Chart Libraries Used:
- **Recharts** — React charting library
- **Custom SVG** — Candlestick rendering

### Exchange WebSocket APIs:
- **Hyperliquid** — wss://api.hyperliquid.xyz/ws
- **Binance** — wss://stream.binance.com:9443/ws
- **Bybit** — wss://stream.bybit.com/realtime

### Technical Analysis:
- [Investopedia — Moving Averages](https://www.investopedia.com/terms/m/movingaverage.asp)
- [TradingView — Indicators](https://www.tradingview.com/pine-script-docs/)
- [TA-Lib Documentation](https://ta-lib.org/)

---

## ✅ Summary

### What We Built:
1. ✅ **CandlestickChart** — OHLC + Volume + Indicators
2. ✅ **Enhanced MonteCarloFanChart** — Area fills + Legend
3. ✅ **LivePriceTicker** — Real-time WebSocket updates
4. ✅ **WebSocketManager** — Connection management
5. ✅ **Technical Indicators** — SMA, EMA

### Key Improvements:
- 📊 Professional trading visualizations
- 🔴 Candlestick charts (not just lines)
- 📈 Volume overlay
- 📉 Technical indicators (SMA, EMA)
- 🎲 Monte Carlo probability bands
- 🔴 Real-time price streaming
- ⚡ Flash animations on price changes
- 🎨 Theme-aware colors

### Next Steps (Future):
- [ ] Bollinger Bands indicator
- [ ] RSI indicator
- [ ] MACD indicator
- [ ] Drawing tools (trend lines)
- [ ] Chart annotations
- [ ] Order book visualization
- [ ] Trade execution overlay

---

**Data Visualization** is now production-ready! 🚀

