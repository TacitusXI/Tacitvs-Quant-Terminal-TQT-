# 🧪 Week 3: Backtesting & Research - План

**Статус:** 📝 Planned (начнётся после Week 2)

---

## Цели

### Главная цель
Создать полноценный backtest engine и research framework для валидации стратегий.

### Deliverables
1. Simple Backtest Engine
2. Trade Log & Analysis
3. Walk-Forward Testing
4. Monte Carlo Simulation
5. Performance Metrics (Sharpe, MaxDD, etc)

---

## Задачи (краткий обзор)

### Phase 1: Simple Backtest
- `core/sim/backtest.py`
- Iterate через historical data
- Generate signals → simulate fills
- Track P&L в R-units

### Phase 2: Trade Log & Metrics
- CSV/Parquet trade log
- Cumulative R curve
- Win rate, avg win/loss
- Sharpe ratio, MaxDD
- Deflated Sharpe

### Phase 3: Walk-Forward
- Train/test split
- Rolling windows
- Out-of-sample validation
- Anti-overfitting checks

### Phase 4: Monte Carlo
- Permutation test
- Bootstrap resampling
- Block bootstrap
- Risk metrics: VaR, ES, P(ruin)

---

**Детальный план будет создан:** После завершения Week 2  
**ETA:** 5-7 дней  
**Дата создания:** 21 октября 2025

