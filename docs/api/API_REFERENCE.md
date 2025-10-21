# 📖 API Reference

**Статус:** 📝 Skeleton (будет заполнен постепенно)

---

## FastAPI Endpoints

### Health & Info
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/strategies/list` - Available strategies

### EV Calculation
- `POST /api/ev/calculate` - Calculate Expected Value

### Risk Management  
- `POST /api/risk/position-size` - Position sizing

### Strategy Signals
- `POST /api/strategy/signal` - Get trading signal

---

## Request/Response Schemas

### EVCalculationRequest
```typescript
{
  win_rate: number
  avg_win_r: number
  avg_loss_r: number
  notional_in: number
  notional_out: number
  fee_in_bps?: number
  fee_out_bps?: number
  funding_rate?: number
  hold_time_hours?: number
  slippage_bps?: number
  gas_usd?: number
  r_usd: number
}
```

### PositionSizeRequest
```typescript
{
  entry_price: number
  stop_price: number
  equity: number
  risk_pct?: number  // default 1.0
  contract_size?: number  // default 1.0
}
```

---

## Python Core API

### Strategy Framework
```python
from core.strategy import IStrategy, Signal, BarContext

class MyStrategy(IStrategy):
    def on_bar(self, ctx: BarContext, history) -> List[Signal]:
        ...
```

### EV Calculator
```python
from core.ev import EVCalculator

calc = EVCalculator()
result = calc.calculate_ev_result(...)
```

### Risk Manager
```python
from core.risk import RiskManager

mgr = RiskManager(equity=10000)
size, r_usd = mgr.calculate_position_size(...)
```

---

**Будет расширяться:** По мере добавления функциональности  
**Дата создания:** 21 октября 2025

