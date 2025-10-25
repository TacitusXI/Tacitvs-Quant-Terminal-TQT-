# 🎯 Tacitus Quant Terminal (TQT)

**Professional quant trading terminal** для perpetual DEX с EV-first подходом и venue-agnostic архитектурой.

[![Week 1](https://img.shields.io/badge/Week%201-Complete-success)](docs/week-01/IMPLEMENTATION_SUMMARY.md)
[![Week 2](https://img.shields.io/badge/Week%202-Complete-success)](docs/week-02/WEEK_02_PROGRESS.md)
[![Week 3](https://img.shields.io/badge/Week%203-Complete-success)](docs/week-03/WEEK_03_PROGRESS.md)
[![Week 4](https://img.shields.io/badge/Week%204-Complete-success)](docs/FRONTEND_DETAILED_PLAN.md)

> 📊 **[→ PROJECT STATUS - Полный обзор работы](PROJECT_STATUS.md)** 📊

---

## 🚀 Quick Start

```bash
# Clone & setup
git clone https://github.com/you/Tacitvs-Quant-Terminal-TQT.git
cd Tacitvs-Quant-Terminal-TQT

# Automated setup & demo
./RUN_NOW.sh

# Or manual:
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r apps/api/requirements.txt
python tests/test_integration_demo.py
```

**Полная документация:** [docs/QUICKSTART.md](docs/QUICKSTART.md)

---

## ✨ Features

### ✅ Week 1 Complete
- **Strategy Framework** - IStrategy interface, Tortoise (Donchian breakout)
- **EV Calculator** - Полные издержки (fees, funding, slippage) в R-units
- **Risk Manager** - 1% R sizing, daily limits, kill-switch
- **FastAPI Backend** - 6 REST endpoints, Swagger docs
- **Integration Demo** - Полный цикл: Signal → Sizing → EV → Decision

### ✅ Week 2 Complete
- **Hyperliquid Integration** - REST API client с retry logic
- **Data Pipeline** - DataManager с кэшированием, Parquet storage
- **Real Data** - BTC/ETH/SOL исторические данные (1d, 4h, 1h)
- **38 Tests** - Unit + integration, 81% coverage

### ✅ Week 3 Complete
- **Backtest Engine** - Реалистичная симуляция с fees
- **Walk-Forward** - OOS validation (rolling & anchored)
- **Monte Carlo** - 1000+ permutations, percentile analysis
- **Advanced Metrics** - Calmar, Sortino, VaR, CVaR
- **Parameter Optimizer** - Grid search с overfitting protection
- **Report Generator** - Markdown/HTML reports
- **62+ Tests** - Research tools fully tested

### 🚧 Week 4 In Progress
- **Frontend Development** - Sci-fi terminal UI (Next.js + TypeScript)
- **Component Library** - Cards, Buttons, Charts, Lamps
- **OPS Terminal** - Table Matrix, Controls, Ops Log
- **LAB Terminal** - Backtest, Walk-Forward, Monte Carlo, Optimizer

**Full Status:** [PROJECT_STATUS.md](PROJECT_STATUS.md)

---

## 📊 Architecture

```
tqt/
├── apps/
│   ├── api/           # FastAPI backend ✅
│   └── ui/            # Next.js terminal (planned)
├── core/
│   ├── strategy/      # Strategy framework ✅
│   ├── ev/            # EV calculator ✅
│   ├── risk/          # Risk manager ✅
│   ├── exchanges/     # Hyperliquid adapter (Week 2)
│   ├── sim/           # Backtest & research (Week 3)
│   └── data/          # Data pipeline (Week 2)
├── data/              # Parquet storage
├── tests/             # Integration tests ✅
└── docs/              # 📚 Documentation hub
    ├── week-01/       # Week 1 summary
    ├── week-02/       # Current: Data integration
    └── week-03/       # Next: Backtesting
```

**Детали:** [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

---

## 🎯 Key Concepts

### R-units (Risk Units)
- **1R** = дистанция от entry до stop в $
- Универсальная метрика для любой стратегии
- Sizing: `size = (1% × equity) / stop_distance`

### EV-first Discipline
- Торгуем только если **EV_net > 0** после всех издержек
- Учитываем: fees (maker rebates!), funding, slippage, gas
- Формула: `EV_net = p×b̄ - (1-p) - Costs_in_R`

### Maker-first Execution
- Limit orders → rebates (−1.5 bps на Hyperliquid)
- Экономия vs taker: 6 bps = $600 на $1M notional
- Queue awareness для оптимальных fills

**Подробнее:** [docs/week-01/PROJECT_ASSESSMENT.md](docs/week-01/PROJECT_ASSESSMENT.md)

---

## 📚 Documentation

### Getting Started
- **[docs/QUICKSTART.md](docs/QUICKSTART.md)** - Установка и первый запуск
- **[docs/week-01/PROJECT_ASSESSMENT.md](docs/week-01/PROJECT_ASSESSMENT.md)** - Зачем и почему
- **[docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)** - Структура кода

### Current Week
- **[docs/week-02/PLAN.md](docs/week-02/PLAN.md)** - Детальный план Week 2
- **[docs/week-02/HYPERLIQUID_INTEGRATION.md](docs/week-02/HYPERLIQUID_INTEGRATION.md)** - API guide
- **[docs/week-02/DATA_PIPELINE.md](docs/week-02/DATA_PIPELINE.md)** - Data architecture

### Reference
- **[docs/api/API_REFERENCE.md](docs/api/API_REFERENCE.md)** - REST API & Python API
- **[docs/strategies/TORTOISE.md](docs/strategies/TORTOISE.md)** - Tortoise strategy guide
- **[docs/strategies/STRATEGY_FRAMEWORK.md](docs/strategies/STRATEGY_FRAMEWORK.md)** - Как создавать стратегии

**Навигация:** [docs/README.md](docs/README.md)

---

## 🧪 Demo Results

### Integration Test (Week 1)
```
📊 SIGNAL: LONG BTC-PERP @ $33,603
   Stop:   $31,923 (-5%)
   Target: $36,964 (+10%)
   R:R:    2.0

💰 SIZING: 0.0595 BTC (1% risk = $100)

🎯 EV ANALYSIS:
   Win rate:    45%
   Avg win:     2.5R
   Fees (maker): -0.006R (rebate!)
   EV_net:      +0.571R ✅
   
💡 DECISION: ✅ МОЖНО ОТКРЫВАТЬ
   Expected profit: $57/trade, $5,710/100 trades
```

**Запуск:** `./venv/bin/python tests/test_integration_demo.py`

---

## 🛠️ Tech Stack

### Backend
- **Python 3.13** - Core strategies, EV, Risk
- **FastAPI** - REST API gateway
- **Pandas/NumPy** - Data processing
- **Parquet** - Fast columnar storage

### Frontend (Planned)
- **Next.js** - Terminal UI
- **TypeScript** - Type safety
- **Tailwind** - Styling
- **Recharts** - Visualization

### Infrastructure
- **Hyperliquid** - Primary venue
- **DuckDB** - Ad-hoc analytics (planned)
- **Docker** - Deployment (planned)

---

## 📈 Status & Roadmap

| Week | Status | Deliverables |
|------|--------|-------------|
| **Week 1** | ✅ Complete | Strategy framework, EV, Risk, Demo |
| **Week 2** | ✅ Complete | Hyperliquid API, Data pipeline, Real data |
| **Week 3** | ✅ Complete | Backtest, Walk-Forward, Monte Carlo, Optimizer |
| **Week 4** | 🚧 In Progress | Frontend UI (OPS, LAB, METRICS, CONSOLE) |
| **Week 5+** | 📋 Planned | Live trading, Multi-venue, Advanced features |

**Детальный статус:** [PROJECT_STATUS.md](PROJECT_STATUS.md)

---

## 💼 Career Value

Этот проект демонстрирует:
- ✅ Понимание **профессионального квант-трейдинга**
- ✅ **EV-first** дисциплину (не просто "прибыльно на истории")
- ✅ **Execution engineering** (maker/taker, rebates, queue)
- ✅ **Production-ready** архитектуру (venue-agnostic, kill-switches)
- ✅ **Full-stack** skills (Python + TypeScript + API + UI)

**Подходит для:**
- Quantitative Trader (prop-shops, HFT firms)
- Execution Engineer
- Quant Researcher (crypto funds)
- Algo Trading Developer

**Оценка проекта:** 9/10 ([подробнее](docs/week-01/PROJECT_ASSESSMENT.md))

---

## 🤝 Contributing

Проект в активной разработке. Документация обновляется еженедельно.

**Вопросы?** Весь код прокомментирован построчно на русском!

---

## 📞 Links

- **Documentation Hub:** [docs/README.md](docs/README.md)
- **Quick Start:** [docs/QUICKSTART.md](docs/QUICKSTART.md)
- **Week 2 Plan:** [docs/week-02/PLAN.md](docs/week-02/PLAN.md)
- **API Reference:** [docs/api/API_REFERENCE.md](docs/api/API_REFERENCE.md)

---

## 📄 License

MIT (или на ваш выбор)

**Disclaimer:** Not financial advice. Derivatives trading carries risk.

---

**Last Updated:** Weeks 1-3 Complete (22 октября 2025)  
**Next Milestone:** Week 4 - Frontend Integration (ETA: 10 days)

---

## 📖 Key Documentation

### 🎯 Start Here:
- **[PROJECT STATUS](PROJECT_STATUS.md)** - Полный обзор проделанной и предстоящей работы
- **[QUICKSTART](docs/QUICKSTART.md)** - How to run everything
- **[FRONTEND DETAILED PLAN](docs/FRONTEND_DETAILED_PLAN.md)** - UI specifications

### 📚 Weekly Progress:
- **Week 1:** [IMPLEMENTATION_SUMMARY](docs/week-01/IMPLEMENTATION_SUMMARY.md)
- **Week 2:** [WEEK_02_PROGRESS](docs/week-02/WEEK_02_PROGRESS.md)
- **Week 3:** [WEEK_03_PROGRESS](docs/week-03/WEEK_03_PROGRESS.md)
