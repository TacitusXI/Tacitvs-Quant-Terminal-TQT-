# 🎯 Tacitus Quant Terminal (TQT)

**Professional quant trading terminal** для perpetual DEX с EV-first подходом и venue-agnostic архитектурой.

[![Week 1](https://img.shields.io/badge/Week%201-Complete-success)](docs/week-01/)
[![Week 2](https://img.shields.io/badge/Week%202-In%20Progress-yellow)](docs/week-02/PLAN.md)
[![Week 3](https://img.shields.io/badge/Week%203-Planned-lightgrey)](docs/week-03/PLAN.md)

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

### 🔄 Week 2 In Progress
- **Hyperliquid Integration** - REST API adapter
- **Data Pipeline** - Historical candles download & Parquet storage
- **Real Data** - BTC/ETH 2 years (1d, 4h, 1h)

### ⏳ Week 3 Planned
- **Backtest Engine** - Realistic simulation
- **Walk-Forward** - Out-of-sample validation
- **Monte Carlo** - Risk metrics (VaR, P(ruin))

**Roadmap:** [Tacitus_Quant_Terminal_README.md](Tacitus_Quant_Terminal_README.md)

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
| **Week 2** | 🔄 In Progress | Hyperliquid API, Data pipeline, Real data |
| **Week 3** | ⏳ Planned | Backtest, Walk-Forward, Monte Carlo |
| **Week 4+** | 📋 Backlog | UI, Live trading, Multi-venue |

**Детальный roadmap:** [Tacitus_Quant_Terminal_README.md](Tacitus_Quant_Terminal_README.md)

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

**Last Updated:** Week 1 Complete (21 октября 2025)  
**Next Milestone:** Week 2 - Data Integration (ETA: 5-7 days)
