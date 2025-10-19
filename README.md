# Tacitus Quant Terminal — Hyperliquid-first, Venue-Agnostic MVP

> Minimal, production-lean trading stack for **perp DEX execution** and **EV-first research**.  
> Ships a full Hyperliquid path (data → signals → queue-aware execution sim → EV & risk → UI), while keeping the core **venue-agnostic** via a single `IExchange` interface (ready to plug in dYdX v4, Drift, etc.).


## Table of Contents

- [Tacitus Quant Terminal — Hyperliquid-first, Venue-Agnostic MVP](#tacitus-quant-terminal--hyperliquid-first-venue-agnostic-mvp)
  - [Table of Contents](#table-of-contents)
  - [Goals](#goals)
  - [Architecture \& Tech Stack](#architecture--tech-stack)
  - [Quick Start](#quick-start)
  - [Directory Layout](#directory-layout)
  - [Core Concepts (R \& EV)](#core-concepts-r--ev)
  - [Interfaces (venue-agnostic)](#interfaces-venue-agnostic)
  - [Hyperliquid Adapter (MVP)](#hyperliquid-adapter-mvp)
  - [Execution Engine](#execution-engine)
  - [Risk Module](#risk-module)
  - [EV Engine](#ev-engine)
  - [Simulators \& Research](#simulators--research)
  - [Built-in Strategies (reference tables)](#built-in-strategies-reference-tables)
  - [UI /OPS \& /LAB](#ui-ops--lab)
  - [Config](#config)
  - [Logs \& Data](#logs--data)
  - [Testing \& CI](#testing--ci)
  - [Security](#security)
  - [Roadmap](#roadmap)
  - [Language Plan (TS + Python + Rust/Go)](#language-plan-ts--python--rustgo)
  - [Monetization \& Portfolio Artifacts](#monetization--portfolio-artifacts)
  - [License \& Disclaimer](#license--disclaimer)
    - [Appendix — Snippets](#appendix--snippets)

---

## Goals

- **Hyperliquid E2E** (SIM first): live data → signals → queue-aware execution sim → trade logs → EV & risk reports → UI.
- **Venue-agnostic core:** trade any perp DEX via `IExchange` without rewriting strategies.
- **EV-first discipline:** trade a table only when rolling **`EV_net > 0`** with full costs.  
- **Execution quality:** **maker-first** (post-only, rebates), queue awareness, anti-toxic-flow filter.
- **Robust research:** walk-forward, Monte Carlo (permutation / bootstrap / block bootstrap).
- **Operator UX:** “personal terminal” UI with lamps (EV ON/OFF), R-ruler, ops log, command palette.

---

## Architecture & Tech Stack

**Apps**
- `apps/ui` – Next.js + Tailwind + shadcn/ui + Framer Motion + Recharts (terminal-style PWA).
- `apps/api` – FastAPI (or Express) gateway for data, sims, EV, adapters.

**Core**
- `core/exchanges` – venue adapters (Hyperliquid full, dYdX/Drift stubs).
- `core/execution` – maker/taker logic, queue model, retries, idempotency.
- `core/ev` – EV math with fees/rebates, funding, slippage, gas → **Costs_in_R**.
- `core/strategy` – strategy interface + reference tables (Tortoise, Squeeze, SRR, CTR).
- `core/risk` – sizing (1% R), stops, exposure, EV kill-switch.
- `core/sim` – backtests, walk-forward, Monte Carlo, queue-aware simulator.

**Data**
- Columnar storage: **Parquet**; ad-hoc analytics: **DuckDB / ClickHouse**.

---

## Quick Start

```bash
# 1) Clone
git clone https://github.com/you/tqt.git
cd tqt

# 2) Environment
cp .env.example .env           # fill credentials if needed (DRY-RUN), data paths, ports
cp config.example.yaml config.yaml

# 3) Install & run
make dev                       # or: docker compose up --build
# UI → http://localhost:3000   (/OPS for live terminal, /LAB for tests)
```

**Modes**
- **SIM** (default): paper trading with live data, no real orders.
- **DRY-RUN**: guarded real routing (enable explicitly in config & env).

---

## Directory Layout

```
tqt/
  apps/ui/                # Next.js terminal (PWA)
  apps/api/               # FastAPI/Express gateway
  core/exchanges/         # hyperliquid/, dydx/, drift/
  core/execution/         # maker-first, queue, TIF, retries, idempotency
  core/ev/                # EV math (fees_eff, funding, slippage, gas)
  core/strategy/          # IStrategy + Tortoise, Squeeze, SRR, CTR
  core/risk/              # sizing 1% R, limits, EV kill-switch
  core/sim/               # backtest, walk-forward, Monte Carlo, queue sim
  data/                   # Parquet: candles, trades, L2/L3, funding
  scripts/                # import/export utilities
  config.yaml
  .env
```

---

## Core Concepts (R & EV)

- **Risk unit (R):**  
  `size = 0.01 * equity / stop_distance` → `R_$ = size * stop_distance` (1% risk per trade).
- **Net EV** (per trade, in **R**):
  ```
  fees_eff   = notional_in * f_in + notional_out * f_out    # f can be negative for maker rebates
  Costs_in_R = (fees_eff + funding + slippage + gas) / R_$

  EV_net ≈ p*b − (1 − p) − Costs_in_R
  ```
  Trade a table only when rolling EV over recent N trades **> 0** on that **venue**.

---

## Interfaces (venue-agnostic)

**`IExchange` (TypeScript)**
```ts
export interface IExchange {
  name(): string
  time(): Promise<number>
  orderbook(pair: string): Promise<OrderBookL2>
  trades(pair: string, since?: number): AsyncIterable<Trade>
  funding(pair: string): Promise<FundingInfo>
  fees(tier?: string): Promise<FeeSchedule>      // maker/taker bps, rebates
  riskParams(pair: string): Promise<RiskParams>  // init/maint margin, bands
  place(o: PlaceOrder): Promise<Placed>          // postOnly, tif, reduceOnly, clientId
  cancel(id: string): Promise<void>
  positions(): Promise<Position[]>
  account(): Promise<AccountInfo>                // balances, tier
}
```

**`IStrategy`**
```ts
export interface IStrategy {
  id: string
  markets: string[]
  params: Record<string, any>
  onBar(ctx: BarCtx): Signal[]        // entry/exit with stop & targets in R
}
```

---

## Hyperliquid Adapter (MVP)

- Live WS for trades/book; REST for orders/positions.  
- Fees model with tiers; **gasless UX** for trader (keep `gas` param configurable).  
- DRY-RUN guarded; SIM default.  
- Maker post-only & one-tick-improve, optional mid-peg (if exposed).

---

## Execution Engine

**Maker-first (rebates & queue)**
- Post-only limit **one tick inside spread** (lead the queue without overpaying).
- **Queue position** tracking; bounded `cancel/replace` rate (anti-spam).
- **Fallback taker** for breakout fills (cap slippage).

**Anti-toxic-flow filter**
- Pause maker insertion on volatility spikes, spread blowouts, **extreme funding** in trade direction.

**Exit**
- Default: **50% at 2R**, **50% trailing** (ATR/channel). Alternative: 100% at 2R for clean comparisons.

---

## Risk Module

- **Sizing** 0.5–2.0% per trade (default 1%).  
- **Hard stop** at 1R; **daily loss stop** (e.g., 5R).  
- **Exposure limits** (positions, markets, per venue).  
- **Kill-switch** when rolling `EV_net ≤ 0` for a table/venue.  
- **Perp risk**: init/maint margins, liquidation bands, index pricing.

---

## EV Engine

- **fees_eff** uses real maker/taker bps and rebates (in/out separately).  
- **funding** = rate × held_time × notional.  
- **slippage** = (expected − realized) × qty (from sim or real fills).  
- **gas** parameter (HL ~0 UX; keep configurable).  
- Reports: `p, b̄, EV_gross, Costs_in_R, EV_net, MaxDD, Deflated Sharpe`.

---

## Simulators & Research

**Queue-aware execution sim**
- L2 snapshots / trade tape, emulate best bid/ask placement with **one-tick improve**.
- FIFO fills by opposing flow; life-time for orders; penalties for frequent replace.

**Walk-Forward**
- Multiple `train → test` windows; parameters frozen on train, measured on test.  
- Charts: cumulative **R**, EV_net trend, MaxDD per window.

**Monte Carlo**
- **Permutation** of trade outcomes (R),  
- **Bootstrap** re-sampling,  
- **Block bootstrap** to preserve short-range dependence.  
- Metrics: `P(EV_net>0)`, `VaR/ES (R)`, 95% MaxDD, probability of ruin beyond X R.

---

## Built-in Strategies (reference tables)

1. **Tortoise Lite** (Donchian 20/10, 1D): breakout entry, stop = opposite channel, 50% 2R + 50% trail.  
2. **Squeeze Spring** (ATR squeeze, 1H/4H): box on low ATR/ATR_SMA, breakout, stop beyond box + ATR buffer.  
3. **SRR** (Stop-Run Reclaim): false break of swing high/low, reclaim, tight stop.  
4. **CTR** (Crowd Tilt Revert): extreme funding + level reclaim → mean-revert leg.

_All use 1% R sizing and common risk/EV/execution APIs._

---

## UI /OPS & /LAB

**/OPS (live terminal)**
- **Lamps** per table: green `EV_net>0`, amber `≈0`, red `≤0`.  
- **R-ruler** on chart (1R/2R, trail, stop).  
- **Ops log** (mono):  
  `14:31Z | BTC-PERP | TORTOISE | ENTRY L | R_$=120 | EV=+0.16 | maker`
- **Matrix**: venue × pair → `fees_eff/R`, `slip/R`, `EV_net`.

**Commands / Buttons**
- **[SIM] / [DRY-RUN] / [OFF]**  
- **[ARM] / [HOLD]** (allow / pause entries)  
- **Risk %** slider (0.5–2.0%) with live `R_$`  
- `/status btc` — `p, b̄, Costs_in_R, EV_net, funding, fees`  
- `/backtest <strat> <pair> <from> <to>`  
- `/mc <strat> <pair> <N>`  
- `/route maker|taker`  
- `/rebates on|off`

**/LAB (research)**
- Backtest runner (candles/book), fees/funding/slippage, 1% R sizing.  
- Walk-Forward wizard, Monte Carlo panel, queue simulator controls.  
- Export: CSV/Parquet trades, PDF/HTML reports.

---

## Config

`config.yaml` (example)
```yaml
venues:
  hyperliquid:
    ws_url: wss://...
    rest_url: https://...
    fees_bps:
      maker: -1.5      # rebates example
      taker:  4.5
    slip_bps_default: 1.0
    risk_limits:
      max_daily_loss_R: 5
      max_concurrent_positions: 3

strategies:
  - id: tortoise
    markets: ["BTC-PERP","ETH-PERP"]
    params:
      don_break: 20
      don_exit:  10
      trail_atr_len: 20
      trail_mult: 2.0
    mode: SIM           # SIM | DRYRUN | OFF

risk:
  per_trade_risk_pct: 1.0
  hard_stop_R: 1.0
  close_all_on_daily_loss_R: 5

ev:
  rolling_window_trades: 40
  min_ev_net: 0.0
  apply_rebates: true
```

`.env.example`
```
NODE_ENV=development
API_PORT=8080
UI_PORT=3000
DATA_DIR=./data
HL_REST_KEY=...
HL_REST_SECRET=...
```

---

## Logs & Data

**Trade log (CSV/Parquet)**
```
ts, venue, market, strat, side, entry, stop, tp, size, R_$,
fill_type_in/out=maker|taker, fees_$, funding_$, slip_$, gas_$,
Costs_in_R, outcome_R, EV_net_at_entry, EV_net_at_exit
```

**Raw**: candles (1m/5m/1h/1d), trades, L2/L3, funding, indices.

---

## Testing & CI

- **Unit:** EV math, sizing, routing, parsers.  
- **Integration:** Hyperliquid adapter (mock WS/REST).  
- **Repro notebook:** backtest + WF + MC (fixed seeds).  
- **CI:** run tests, build artifacts (HTML/PDF), speed budget; Conventional Commits.

---

## Security

- Secrets in `.env` only; for desktop builds use OS keyring (Tauri/Electron later).  
- **Idempotent** client IDs; safe retries; cancel-on-disconnect.  
- **Kill-switches:** daily loss R, EV degradation, network failures.  
- SIM by default; DRY-RUN requires explicit enable.

---

## Roadmap

**Q1**
- Full Hyperliquid (orders/positions/funding/fees/riskParams) + DRY-RUN.
- dYdX v4 data + fees (sim path); Drift data; JIT logic in sim.
- Rich queue sim (micro-timing, order life, replace penalties).
- Reports: Deflated Sharpe, Prob. of Ruin, 95% MaxDD.

**Q2**
- Batch/intents modes (when venues expose them).
- Expand SRR/CTR with funding filters & on-chain indices.
- **Matrix router**: choose venue by **live EV_net** (fees_eff/slip/funding).
- **Trust/Compliance badges** in UI (custody, matching on-chain, sequencer, forced exit, geo flags).

**Q3**
- WF auto-tuning (Bayes/Optuna) with strict anti-overfit guards.
- Block-bootstrap portfolio stability.
- PWA/Tauri desktop (local journal, OS hotkeys).

**Q4**
- BTC-L2 adapters (Stacks/Velar etc.).  
- Privacy orders / protected mempools (when available).  
- Post-quantum readiness (signature abstraction).

---

## Language Plan (TS + Python + Rust/Go)

- **Phase A (MVP/portfolio):**  
  - **TypeScript** for adapters, glue, UI, light online math.  
  - **Python** for heavy research: backtests, WF, MC, queue sim (polars/numpy/numba, DuckDB/ClickHouse).
- **Phase B (production execution):**  
  - Extract low-latency **execution microservice** in **Rust/Go** (pyo3/napi-rs bindings if needed).  
  - Keep TS for UI/orchestration; Python for research.

---

## Monetization & Portfolio Artifacts

- **Trade your own bot** (after EV/Risk discipline).  
- **Paid adapters & cost analysis** for teams (venue-agnostic EV in R).  
- **Execution sim / “where EV leaks”** audits.  
- **Consulting** on maker-first routing & cost reduction.

**Showcase pack (what hiring teams want):**
1) `IExchange` + **Hyperliquid adapter** (real), dYdX/Drift stubs.  
2) **EV engine** (TS & Py parity tests).  
3) **Queue-aware sim** report: maker vs taker costs in **R** (BTC/ETH).  
4) **R-report**: `p, b̄, Costs_in_R, EV_net, MaxDD, WF, MC`.  
5) **Live demo UI**: lamps, R-ruler, ops log, `/arm`, `/backtest`, `/mc`.  
6) 2–3 concise write-ups (rebates as anti-fee; cost of an extra replace; WF vs overfitting).

---

## License & Disclaimer

- **License:** MIT (or choose your own before publishing).  
- **Disclaimer:** Not financial advice. Derivatives trading carries risk. Respect your local regulations and venue ToS.

---

### Appendix — Snippets

**Sizing (1% risk)**
```py
size  = 0.01 * equity / stop_distance
R_usd = size * stop_distance
```

**EV (net)**
```py
fees_eff   = notional_in * f_in + notional_out * f_out
costs_in_r = (fees_eff + funding + slippage + gas) / R_usd
ev_net     = p * b - (1 - p) - costs_in_r
```

**Monte Carlo (permutation)**
```py
def mc_perm(returns_R, N=10000, seed=42):
    import numpy as np
    rng = np.random.default_rng(seed)
    sims = [rng.permutation(returns_R).sum() for _ in range(N)]
    return np.percentile(sims, [5, 50, 95]), float(np.mean(sims))
```
