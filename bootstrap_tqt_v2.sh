#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-tqt}"
PY_VERSION_MIN="3.10.0"
NODE_VERSION_MIN="18.0.0"

banner() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }
warn()   { printf "\033[1;33m[warn]\033[0m %s\n" "$*"; }
die()    { printf "\033[1;31m[err]\033[0m %s\n" "$*"; exit 1; }

require_cmd() { command -v "$1" >/dev/null 2>&1 || die "Required command '$1' not found. Please install it."; }

# Compare semantic versions: returns 0 if $1 >= $2
ver_ge() {
  python3 - "$1" "$2" <<'PY'
import sys,re
def norm(v):
  parts = re.split(r'[^\d]+', v.strip('v'))
  parts = [int(p) for p in parts if p.isdigit()]
  parts = (parts + [0,0,0])[:3]
  return tuple(parts)
cur, req = norm(sys.argv[1]), norm(sys.argv[2])
sys.exit(0 if cur >= req else 1)
PY
}

banner "Checking dependencies"
require_cmd python3
require_cmd pip3
require_cmd node
require_cmd npm

PY_VER="$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:3])))')"
NODE_VER_RAW="$(node -v)"
NODE_VER="${NODE_VER_RAW#v}"

if ! ver_ge "$PY_VER" "$PY_VERSION_MIN"; then
  die "Python >= ${PY_VERSION_MIN} required, found ${PY_VER}"
fi
if ! ver_ge "$NODE_VER" "$NODE_VERSION_MIN"; then
  die "Node.js >= ${NODE_VERSION_MIN} required, found ${NODE_VER_RAW}"
fi

banner "Creating project directory: ${PROJECT_DIR}"
mkdir -p "${PROJECT_DIR}"
cd "${PROJECT_DIR}"

banner "Writing .gitignore and skeleton folders"
cat > .gitignore <<'GIT'
# Node
node_modules/
npm-debug.log*
.yarn/*
.pnp.*

# Python
.venv/
__pycache__/
*.pyc

# Env/OS
.env
.env.*
.DS_Store

# Data
data/
*.parquet
*.csv

# Build
dist/
.next/
GIT

mkdir -p apps/ui apps/api core/exchanges core/execution core/ev core/strategy core/risk core/sim data scripts

banner "Writing full README"
cat > Tacitus_Quant_Terminal_README.md <<'BIGREADME'
# Tacitus Quant Terminal — Hyperliquid-first, Venue-Agnostic MVP

> Minimal, production-lean trading stack for **perp DEX execution** and **EV-first research**.  
> Ships a full Hyperliquid path (data → signals → queue-aware execution sim → EV & risk → UI), while keeping the core **venue-agnostic** via a single `IExchange` interface (ready to plug in dYdX v4, Drift, etc.).

---

## Why this is a strong project (career & revenue)

- **Quant value, not just code:** honest **EV in R**, queue-aware maker execution, rebates → lower **Costs_in_R** ⇒ higher P&L.  
- **Portable:** same strategies on multiple venues by swapping adapters.  
- **Mixed skill profile:** **quant research + execution engineering + risk** (rare and well paid).

---

## Table of Contents

1. [Goals](#goals)  
2. [Architecture & Tech Stack](#architecture--tech-stack)  
3. [Quick Start](#quick-start)  
4. [Directory Layout](#directory-layout)  
5. [Core Concepts (R & EV)](#core-concepts-r--ev)  
6. [Interfaces (venue-agnostic)](#interfaces-venueagnostic)  
7. [Hyperliquid Adapter (MVP)](#hyperliquid-adapter-mvp)  
8. [Execution Engine](#execution-engine)  
9. [Risk Module](#risk-module)  
10. [EV Engine](#ev-engine)  
11. [Simulators & Research](#simulators--research)  
12. [Built-in Strategies](#builtin-strategies)  
13. [UI /OPS & /LAB](#ui-ops--lab)  
14. [Config](#config)  
15. [Logs & Data](#logs--data)  
16. [Testing & CI](#testing--ci)  
17. [Security](#security)  
18. [Roadmap](#roadmap)  
19. [Language Plan (TS + Python + Rust/Go)](#language-plan-ts--python--rustgo)  
20. [Monetization & Portfolio Artifacts](#monetization--portfolio-artifacts)  
21. [License & Disclaimer](#license--disclaimer)

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

BIGREADME

# Short README pointer
cat > README.md <<'MD'
# Tacitus Quant Terminal — MVP

See **Tacitus_Quant_Terminal_README.md** for the full spec and instructions.
MD

banner "Writing config and env examples"
cat > config.example.yaml <<'YAML'
venues:
  hyperliquid:
    ws_url: wss://example
    rest_url: https://example
    fees_bps:
      maker: -1.5
      taker: 4.5
    slip_bps_default: 1.0
    risk_limits:
      max_daily_loss_R: 5
      max_concurrent_positions: 3

strategies:
  - id: tortoise
    markets: ["BTC-PERP","ETH-PERP"]
    params:
      don_break: 20
      don_exit: 10
      trail_atr_len: 20
      trail_mult: 2.0
    mode: SIM

risk:
  per_trade_risk_pct: 1.0
  hard_stop_R: 1.0
  close_all_on_daily_loss_R: 5

ev:
  rolling_window_trades: 40
  min_ev_net: 0.0
  apply_rebates: true
YAML

cat > .env.example <<'ENV'
NODE_ENV=development
API_PORT=8080
UI_PORT=3000
DATA_DIR=./data
HL_REST_KEY=changeme
HL_REST_SECRET=changeme
ENV

banner "Seeding TypeScript core interfaces"
cat > core/exchanges/IExchange.ts <<'TS'
export interface OrderBookLevel { price: number; size: number; }
export interface OrderBookL2 { bids: OrderBookLevel[]; asks: OrderBookLevel[]; ts: number; }
export interface Trade { ts: number; price: number; size: number; side: 'buy'|'sell'; }
export interface FundingInfo { rate: number; nextTs: number; }
export interface FeeSchedule { makerBps: number; takerBps: number; makerRebateBps?: number; }
export interface RiskParams { initMargin: number; maintMargin: number; }

export type TIF = 'GTC' | 'IOC' | 'FOK';
export interface PlaceOrder {
  pair: string; side: 'buy'|'sell'; qty: number; price?: number;
  postOnly?: boolean; tif?: TIF; reduceOnly?: boolean; clientId?: string;
}
export interface Placed { id: string; status: 'accepted'|'rejected'; }

export interface Position { pair: string; qty: number; entryPx: number; }

export interface AccountInfo { equity: number; balances: Record<string, number>; tier?: string; }

export interface IExchange {
  name(): string;
  time(): Promise<number>;
  orderbook(pair: string): Promise<OrderBookL2>;
  trades(pair: string, since?: number): AsyncIterable<Trade>;
  funding(pair: string): Promise<FundingInfo>;
  fees(tier?: string): Promise<FeeSchedule>;
  riskParams(pair: string): Promise<RiskParams>;
  place(o: PlaceOrder): Promise<Placed>;
  cancel(id: string): Promise<void>;
  positions(): Promise<Position[]>;
  account(): Promise<AccountInfo>;
}
TS

cat > core/strategy/IStrategy.ts <<'TS'
export interface Bar { ts: number; o: number; h: number; l: number; c: number; v?: number; }
export interface Signal {
  type: 'entry'|'exit';
  side?: 'buy'|'sell';
  pair: string;
  stopR?: number;
  targetR?: number;
  meta?: Record<string, any>;
}
export interface BarCtx {
  pair: string;
  bars: Bar[];
  equity: number;
}
export interface IStrategy {
  id: string;
  markets: string[];
  params: Record<string, any>;
  onBar(ctx: BarCtx): Signal[];
}
TS

cat > core/exchanges/HyperliquidExchange.ts <<'TS'
import type { IExchange, OrderBookL2, Trade, FundingInfo, FeeSchedule, RiskParams, PlaceOrder, Placed, Position, AccountInfo } from "./IExchange";

export class HyperliquidExchange implements IExchange {
  constructor(private cfg: { wsUrl: string; restUrl: string; apiKey?: string; apiSecret?: string; }){}
  name() { return "hyperliquid"; }
  async time(): Promise<number> { return Date.now(); }
  async orderbook(pair: string): Promise<OrderBookL2> { return { bids: [], asks: [], ts: Date.now() }; }
  async *trades(pair: string, since?: number): AsyncIterable<Trade> { if (false) yield { ts: 0, price: 0, size: 0, side: 'buy' }; }
  async funding(pair: string): Promise<FundingInfo> { return { rate: 0, nextTs: Date.now()+3600000 }; }
  async fees(tier?: string): Promise<FeeSchedule> { return { makerBps: -1.5, takerBps: 4.5 }; }
  async riskParams(pair: string): Promise<RiskParams> { return { initMargin: 0.05, maintMargin: 0.03 }; }
  async place(o: PlaceOrder): Promise<Placed> { return { id: `mock-${Date.now()}`, status: 'accepted' }; }
  async cancel(id: string): Promise<void> { return; }
  async positions(): Promise<Position[]> { return []; }
  async account(): Promise<AccountInfo> { return { equity: 0, balances: {} }; }
}
TS

banner "Seeding Python API & EV core"
mkdir -p apps/api
python3 - <<'PY'
from pathlib import Path
api = Path("apps/api")
(api/"__init__.py").write_text("")
(api/"requirements.txt").write_text("\\n".join([
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.30.0",
    "pydantic>=2.8.0",
    "numpy>=1.26.0",
    "polars>=1.5.0",
    "duckdb>=1.0.0",
]))
(api/"main.py").write_text('''
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np

app = FastAPI(title="TQT API")

class EVReq(BaseModel):
    p: float
    b: float
    fees_eff: float
    funding: float
    slippage: float
    gas: float
    R_usd: float

class EVResp(BaseModel):
    costs_in_R: float
    ev_net: float

@app.get("/health")
def health(): return {"ok": True}

@app.post("/ev/calc", response_model=EVResp)
def ev_calc(req: EVReq):
    costs_in_r = (req.fees_eff + req.funding + req.slippage + req.gas) / max(req.R_usd, 1e-9)
    ev_net = req.p * req.b - (1.0 - req.p) - costs_in_r
    return {"costs_in_R": costs_in_r, "ev_net": ev_net}

class MCreq(BaseModel):
    returns_R: list[float]
    N: int = 10000
    seed: int = 42

@app.post("/mc/perm")
def mc_perm(req: MCreq):
    rng = np.random.default_rng(req.seed)
    sims = [rng.permutation(req.returns_R).sum() for _ in range(req.N)]
    import numpy as np
    p5,p50,p95 = np.percentile(sims, [5,50,95]).tolist()
    return {"p5": p5, "p50": p50, "p95": p95, "mean": float(np.mean(sims))}
''')
PY

banner "Creating Makefile"
cat > Makefile <<'MK'
.PHONY: setup ui api dev fmt

setup: ## Install UI and API deps
	@echo "==> Installing Python deps"
	python3 -m venv .venv
	. .venv/bin/activate && pip install -U pip && pip install -r apps/api/requirements.txt
	@echo "==> Installing UI deps (Next.js app)"
	cd apps/ui && npm install

ui: ## Run UI dev server
	cd apps/ui && npm run dev

api: ## Run API dev server
	. .venv/bin/activate && uvicorn apps.api.main:app --reload --port $${API_PORT:-8080}

dev: ## Run UI and API together
	@echo "==> Starting API & UI (Ctrl-C to stop)"
	( . .venv/bin/activate && uvicorn apps.api.main:app --reload --port $${API_PORT:-8080} ) &
	API_PID=$$!; \
	( cd apps/ui && npm run dev ) & \
	UI_PID=$$!; \
	trap 'kill $$API_PID $$UI_PID 2>/dev/null || true' INT TERM; \
	wait

fmt:
	npx prettier -w . || true
MK

banner "Bootstrapping Next.js UI (non-interactive)"
cd apps/ui
npx --yes create-next-app@latest . --ts --eslint --tailwind --app --use-npm --no-src-dir --import-alias "@/*"

npm install --save recharts framer-motion zustand @tanstack/react-query clsx lucide-react

mkdir -p app/OPS app/LAB components lib

cat > app/OPS/page.tsx <<'TSX'
export default function OPS() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">OPS — Live Terminal</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 shadow bg-neutral-900 text-neutral-100">
          <h2 className="font-medium mb-2">Tables</h2>
          <ul className="text-sm space-y-2">
            <li>BTC-PERP — <span className="text-green-400">EV ON</span></li>
            <li>ETH-PERP — <span className="text-yellow-400">EV ~0</span></li>
          </ul>
        </div>
        <div className="rounded-2xl p-4 shadow bg-neutral-900 text-neutral-100">
          <h2 className="font-medium mb-2">Controls</h2>
          <div className="space-x-2">
            <button className="px-3 py-2 rounded-xl bg-emerald-600">ARM</button>
            <button className="px-3 py-2 rounded-xl bg-amber-600">HOLD</button>
            <button className="px-3 py-2 rounded-xl bg-sky-600">SIM</button>
          </div>
        </div>
        <div className="rounded-2xl p-4 shadow bg-neutral-900 text-neutral-100">
          <h2 className="font-medium mb-2">Ops Log</h2>
          <pre className="text-xs">
{`14:31Z | BTC-PERP | TORTOISE | ENTRY L | R_$=120 | EV=+0.16 | maker`}
          </pre>
        </div>
      </div>
    </main>
  );
}
TSX

cat > app/LAB/page.tsx <<'TSX'
export default function LAB() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">LAB — Research</h1>
      <p className="text-neutral-400 text-sm">Backtests, Walk-Forward, Monte Carlo, queue sim.</p>
    </main>
  );
}
TSX

cd ../..

banner "Done."
echo
echo "Next steps:"
echo "  1) cd ${PROJECT_DIR}"
echo "  2) cp .env.example .env && cp config.example.yaml config.yaml"
echo "  3) make setup"
echo "  4) make dev     # API on http://localhost:${API_PORT:-8080}, UI on http://localhost:3000"
echo
echo "Happy building!"
