# 📚 TQT Documentation Hub

**Навигация по документации Tacitus Quant Terminal**

---

## 🎯 START HERE

### 1️⃣ **[PROJECT_STATUS.md](../PROJECT_STATUS.md)** ⭐
**Главный файл** - полный обзор проделанной и предстоящей работы:
- ✅ Что сделано (Weeks 1-4)
- 📋 Что предстоит (Week 5+)
- 📊 Статистика (тесты, код, coverage)
- 🎯 Ключевые достижения

### 2️⃣ **[QUICKSTART.md](QUICKSTART.md)**
Как запустить проект:
- Installation guide
- Running demos
- Testing commands
- Troubleshooting

---

## 📅 WEEKLY PROGRESS

Детальные отчёты по неделям:

### ✅ [Week 1 - Core Framework](week-01/IMPLEMENTATION_SUMMARY.md)
- Strategy Framework (IStrategy, Tortoise)
- EV Calculator (full costs)
- Risk Manager (1% R sizing, kill-switch)
- FastAPI Backend (6 endpoints)
- **Status:** ✅ Complete

### ✅ [Week 2 - Data Pipeline](week-02/WEEK_02_PROGRESS.md)
- HyperliquidClient (REST API)
- DataFetcher (OHLC validation)
- DataStorage (Parquet)
- DataManager (unified API, caching)
- **Status:** ✅ Complete | **Tests:** 38/38 ✅

### ✅ [Week 3 - Research Tools](week-03/WEEK_03_PROGRESS.md)
- Backtest Engine
- Walk-Forward Analysis
- Monte Carlo Simulation
- Advanced Metrics (Sharpe, Calmar, VaR)
- Parameter Optimizer
- **Status:** ✅ Complete | **Tests:** 100/100 ✅

### ✅ Week 4 - Frontend UI
- Next.js 16 + React 19
- Silent Blade Design System
- OPS/LAB/METRICS/CONSOLE terminals
- Command Palette + Keyboard Shortcuts
- Error Boundaries + Loading States
- **Status:** ✅ Complete | **Tests:** 28/28 ✅

---

## 📖 TECHNICAL GUIDES

### Getting Started
- **[QUICKSTART.md](QUICKSTART.md)** - Installation & first run
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Code architecture

### API Reference
- **[api/API_REFERENCE.md](api/API_REFERENCE.md)** - REST API & Python API docs

### Strategy Development
- **[strategies/STRATEGY_FRAMEWORK.md](strategies/STRATEGY_FRAMEWORK.md)** - How to create strategies
- **[strategies/TORTOISE.md](strategies/TORTOISE.md)** - Tortoise strategy guide

### Week-Specific Plans
- **[week-02/PLAN.md](week-02/PLAN.md)** - Data pipeline detailed plan
- **[week-02/DATA_PIPELINE.md](week-02/DATA_PIPELINE.md)** - Architecture details
- **[week-02/HYPERLIQUID_INTEGRATION.md](week-02/HYPERLIQUID_INTEGRATION.md)** - API integration guide
- **[week-03/PLAN.md](week-03/PLAN.md)** - Research tools plan
- **[week-03/WEEK_03_DETAILED_PLAN.md](week-03/WEEK_03_DETAILED_PLAN.md)** - Full breakdown
- **[FRONTEND_DETAILED_PLAN.md](FRONTEND_DETAILED_PLAN.md)** - UI specifications

---

## 🗺️ NAVIGATION MAP

```
📚 Documentation Structure:

ROOT/
├── README.md                  ← Project overview
├── PROJECT_STATUS.md          ⭐ ГЛАВНЫЙ ФАЙЛ
│
└── docs/
    ├── README.md              ← You are here
    ├── QUICKSTART.md          ← Installation guide
    ├── PROJECT_STRUCTURE.md   ← Code architecture
    ├── FRONTEND_DETAILED_PLAN.md ← UI specs
    │
    ├── api/
    │   └── API_REFERENCE.md   ← REST & Python API
    │
    ├── strategies/
    │   ├── STRATEGY_FRAMEWORK.md
    │   └── TORTOISE.md
    │
    ├── week-01/
    │   ├── IMPLEMENTATION_SUMMARY.md  ← Week 1 progress
    │   └── PROJECT_ASSESSMENT.md      ← Project evaluation
    │
    ├── week-02/
    │   ├── WEEK_02_PROGRESS.md        ← Week 2 progress
    │   ├── PLAN.md
    │   ├── DATA_PIPELINE.md
    │   └── HYPERLIQUID_INTEGRATION.md
    │
    └── week-03/
        ├── WEEK_03_PROGRESS.md        ← Week 3 progress
        ├── PLAN.md
        └── WEEK_03_DETAILED_PLAN.md
```

---

## 🔍 QUICK FIND

**Хочу понять что сделано:**
→ [PROJECT_STATUS.md](../PROJECT_STATUS.md)

**Хочу запустить проект:**
→ [QUICKSTART.md](QUICKSTART.md)

**Хочу создать стратегию:**
→ [strategies/STRATEGY_FRAMEWORK.md](strategies/STRATEGY_FRAMEWORK.md)

**Хочу понять API:**
→ [api/API_REFERENCE.md](api/API_REFERENCE.md)

**Хочу понять архитектуру:**
→ [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

**Хочу увидеть weekly progress:**
→ `docs/week-*/WEEK_*_PROGRESS.md`

---

## 📊 DOCUMENTATION STATS

- **Total Docs:** 20+ файлов
- **Total Lines:** ~5,000+ строк
- **Languages:** English + Русский
- **Last Updated:** 25 октября 2025

---

## 💡 TIPS

1. **Start with [PROJECT_STATUS.md](../PROJECT_STATUS.md)** - лучший overview
2. **Weekly progress docs** содержат детали implementation
3. **Technical guides** для reference при разработке
4. **Все коды прокомментированы** - читайте исходники!

---

**Навигация:** [← Back to main README](../README.md)
