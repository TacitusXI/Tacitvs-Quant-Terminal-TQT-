# 🚀 START HERE - Быстрый Старт

**Проект:** Tacitus Quant Terminal  
**Статус:** Week 1 Complete ✅ → Week 2 Ready 🚀  
**Дата:** 21 октября 2025

---

## ⚡ Быстрый запуск (5 минут)

```bash
# 1. Запустить demo
./RUN_NOW.sh

# Или вручную:
source venv/bin/activate  # Linux/Mac
python tests/test_integration_demo.py

# 2. Запустить API сервер (optional)
cd apps/api
python main.py
# → http://localhost:8080/docs
```

**Работает?** ✅ Отлично! Переходите к [документации](#-документация).

---

## 📚 Документация

### 🆕 Новый в проекте?

Читайте в таком порядке:

1. **[README.md](README.md)** - Общий overview (5 мин)
2. **[docs/QUICKSTART.md](docs/QUICKSTART.md)** - Установка и запуск (15 мин)
3. **[docs/week-01/PROJECT_ASSESSMENT.md](docs/week-01/PROJECT_ASSESSMENT.md)** - Зачем и почему (20 мин)

**Итого:** 40 минут и полное понимание проекта!

---

### 🔧 Готов начать Week 2?

**Главный файл:**
- **[docs/week-02/PLAN.md](docs/week-02/PLAN.md)** ⭐ - **700+ строк детального плана!**

**Дополнительно:**
- [docs/week-02/HYPERLIQUID_INTEGRATION.md](docs/week-02/HYPERLIQUID_INTEGRATION.md) - API guide (скелет)
- [docs/week-02/DATA_PIPELINE.md](docs/week-02/DATA_PIPELINE.md) - Architecture (скелет)

---

### 📖 Справочники

- **[docs/README.md](docs/README.md)** - Навигация по всем docs
- **[docs/api/API_REFERENCE.md](docs/api/API_REFERENCE.md)** - REST API reference
- **[docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)** - Структура кода

---

## 🎯 Что уже работает (Week 1)

### ✅ Python Core Modules
- **Strategy Framework** (`core/strategy/base.py`) - IStrategy interface
- **Tortoise Strategy** (`core/strategy/tortoise.py`) - Donchian breakout
- **EV Calculator** (`core/ev/ev_calculator.py`) - Полные издержки в R
- **Risk Manager** (`core/risk/risk_manager.py`) - 1% R sizing + limits

### ✅ Backend & API
- **FastAPI** (`apps/api/main.py`) - 6 REST endpoints
- **Swagger docs** - http://localhost:8080/docs (когда сервер запущен)

### ✅ Tests & Demo
- **Integration Demo** - Полный цикл: Signal → Sizing → EV → Decision
- **Result:** EV_net = +0.571R (стратегия прибыльна!)

**Детали:** [docs/week-01/IMPLEMENTATION_SUMMARY.md](docs/week-01/IMPLEMENTATION_SUMMARY.md)

---

## 🎯 Следующий шаг: Week 2

**Цель:** Подключить реальные данные с Hyperliquid

**Задачи:**
1. TypeScript Hyperliquid adapter
2. Python data fetcher
3. Parquet storage
4. Download historical data (BTC/ETH 2 years)

**План:** [docs/week-02/PLAN.md](docs/week-02/PLAN.md) (700+ строк)  
**ETA:** 5-7 дней

---

## 📊 Структура проекта

```
Tacitvs-Quant-Terminal-TQT/
├── apps/
│   ├── api/           # FastAPI backend ✅
│   └── ui/            # Next.js UI (planned)
│
├── core/
│   ├── strategy/      # Python strategies ✅
│   ├── ev/            # EV calculator ✅
│   ├── risk/          # Risk manager ✅
│   ├── exchanges/     # TS adapters (Week 2)
│   ├── data/          # Data pipeline (Week 2)
│   └── sim/           # Backtesting (Week 3)
│
├── docs/              # 📚 Вся документация
│   ├── week-01/       # Week 1 summary
│   ├── week-02/       # Week 2 plan ⭐
│   └── week-03/       # Week 3 planned
│
├── tests/             # Integration tests ✅
├── data/              # Parquet storage
├── scripts/           # Utility scripts
└── venv/              # Python env
```

---

## 🛠️ Tech Stack

### Backend
- **Python 3.13** - Strategies, EV, Risk, Research
- **FastAPI** - REST API
- **Pandas/NumPy** - Data processing
- **Parquet** - Storage

### Frontend (Planned)
- **TypeScript** - Exchange adapters
- **Next.js** - Terminal UI

### Data
- **Hyperliquid** - Primary venue
- **DuckDB** - Analytics (planned)

---

## 🎓 Ключевые концепции

### R-units
- **1R** = дистанция от entry до stop в $
- Универсальная метрика для P&L
- Sizing: `size = (1% × equity) / stop_distance`

### EV-first
- Торгуем только если **EV_net > 0**
- Учитываем ВСЕ издержки: fees, funding, slippage
- Формула: `EV_net = p×b̄ - (1-p) - Costs_in_R`

### Maker-first
- Limit orders → rebates (−1.5 bps)
- Экономия vs taker: 6 bps = $600 на $1M

**Подробнее:** [docs/week-01/PROJECT_ASSESSMENT.md](docs/week-01/PROJECT_ASSESSMENT.md)

---

## 📞 Важные ссылки

### Внутренние
- **Quick Start:** [docs/QUICKSTART.md](docs/QUICKSTART.md)
- **Week 2 Plan:** [docs/week-02/PLAN.md](docs/week-02/PLAN.md) ⭐
- **API Docs:** [docs/api/API_REFERENCE.md](docs/api/API_REFERENCE.md)
- **All Docs:** [docs/README.md](docs/README.md)

### Внешние
- [Hyperliquid API](https://hyperliquid.gitbook.io/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Pandas Docs](https://pandas.pydata.org/docs/)

---

## 🎉 Готово!

**Выберите свой путь:**

- 🆕 **Новичок?** → Читайте [README.md](README.md) → [docs/QUICKSTART.md](docs/QUICKSTART.md)
- 🔧 **Начать Week 2?** → Открывайте [docs/week-02/PLAN.md](docs/week-02/PLAN.md)
- 📚 **Изучить детали?** → Смотрите [docs/README.md](docs/README.md)

---

**Last Updated:** 21 октября 2025  
**Status:** Week 1 Complete, Week 2 Ready 🚀

