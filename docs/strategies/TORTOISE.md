# 🐢 Tortoise Strategy Guide

**Статус:** 📝 Skeleton (будет заполнен после backtest результатов)

---

## Overview

Tortoise Lite - трендовая стратегия на основе Donchian каналов.

**Type:** Trend Following  
**Timeframe:** 1D (daily)  
**Markets:** BTC-PERP, ETH-PERP, liquid perpetuals

---

## Logic

### Entry
- **Long:** Close > 20-period high breakout
- **Short:** Close < 20-period low breakdown

### Stop
- **Long:** 20-period low
- **Short:** 20-period high

### Exit
- 50% at 2R target
- 50% trailing stop (ATR-based)
- Alternative: 100% at 2R for clean backtests

---

## Parameters

```python
{
  'don_break': 20,      # Breakout channel period
  'don_exit': 10,       # Exit channel period  
  'trail_atr_len': 20,  # ATR period for trailing
  'trail_mult': 2.0     # ATR multiplier
}
```

---

## Expected Performance

*(Будет заполнено после backtests)*

### Backtest Results
- Period: 2022-2024 (2 years)
- Market: BTC-PERP
- Timeframe: 1D

**Metrics:**
- Win Rate: TBD
- Avg Win: TBD R
- Avg Loss: TBD R
- EV_net: TBD R
- Sharpe: TBD
- MaxDD: TBD R

---

## Code Example

```python
from core.strategy.tortoise import TortoiseStrategy
from core.data.storage import ParquetStorage

# Load data
storage = ParquetStorage()
history = storage.load_candles('BTC-PERP', '1d')

# Create strategy
strategy = TortoiseStrategy({
    'don_break': 20,
    'markets': ['BTC-PERP']
})

# Generate signals
signals = strategy.on_bar(current_bar, history)
```

---

## Optimization Notes

*(Будет заполнено после research)*

- Don_break: tested 10, 15, 20, 25, 30
- Trail_mult: tested 1.5, 2.0, 2.5, 3.0
- Walk-Forward results
- Parameter stability

---

**Будет заполнено:** После Week 2-3  
**Дата создания:** 21 октября 2025

