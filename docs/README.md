# 📚 Tacitus Quant Terminal - Документация

Полная документация проекта, организованная по этапам разработки.

---

## 🗂️ Структура документации

```
docs/
├── README.md                    ← Вы здесь
├── QUICKSTART.md               → Быстрый старт
├── PROJECT_STRUCTURE.md        → Структура проекта
│
├── week-01/                    ✅ Week 1 Complete
│   ├── PROJECT_ASSESSMENT.md   → Оценка проекта (9/10)
│   └── IMPLEMENTATION_SUMMARY.md → Что сделано
│
├── week-02/                    🔄 Week 2 In Progress
│   ├── PLAN.md                 → Детальный план Week 2
│   ├── HYPERLIQUID_INTEGRATION.md → Подключение Hyperliquid
│   └── DATA_PIPELINE.md        → Data pipeline архитектура
│
├── week-03/                    ⏳ Week 3 Planned
│   ├── PLAN.md                 → План Week 3
│   ├── BACKTESTING.md          → Backtest engine
│   └── RESEARCH.md             → Walk-Forward & Monte Carlo
│
├── api/                        📖 API Documentation
│   └── API_REFERENCE.md        → Справочник по API
│
└── strategies/                 🧠 Strategy Guides
    ├── TORTOISE.md             → Tortoise strategy guide
    ├── SQUEEZE.md              → Squeeze strategy (planned)
    └── STRATEGY_FRAMEWORK.md   → Как создавать стратегии
```

---

## 🚀 С чего начать?

### Новый в проекте?
1. **[QUICKSTART.md](QUICKSTART.md)** - установка и первый запуск
2. **[week-01/PROJECT_ASSESSMENT.md](week-01/PROJECT_ASSESSMENT.md)** - зачем и почему
3. **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - структура кода

### Уже запустили Week 1?
1. **[week-02/PLAN.md](week-02/PLAN.md)** - что делаем дальше
2. **[week-02/HYPERLIQUID_INTEGRATION.md](week-02/HYPERLIQUID_INTEGRATION.md)** - подключение данных

### Хотите разобраться глубже?
1. **[api/API_REFERENCE.md](api/API_REFERENCE.md)** - все endpoints
2. **[strategies/STRATEGY_FRAMEWORK.md](strategies/STRATEGY_FRAMEWORK.md)** - как писать стратегии

---

## ✅ Что уже готово (Week 1)

### Core Python Modules
- ✅ Strategy Framework (`core/strategy/base.py`)
- ✅ Tortoise Strategy (`core/strategy/tortoise.py`)
- ✅ EV Calculator (`core/ev/ev_calculator.py`)
- ✅ Risk Manager (`core/risk/risk_manager.py`)

### Backend & API
- ✅ FastAPI Backend (`apps/api/main.py`)
- ✅ 6 REST endpoints работают
- ✅ Swagger docs на `/docs`

### Tests & Demo
- ✅ Integration Demo Test
- ✅ Полный цикл: Signal → Sizing → EV → Decision

**Детали:** [week-01/IMPLEMENTATION_SUMMARY.md](week-01/IMPLEMENTATION_SUMMARY.md)

---

## 🎯 Текущий этап: Week 2

**Цель:** Подключить реальные данные с Hyperliquid

**Задачи:**
1. TypeScript Hyperliquid adapter
2. Python data fetcher
3. Parquet storage
4. Historical data download

**Детальный план:** [week-02/PLAN.md](week-02/PLAN.md)

---

## 📖 Полезные ссылки

### Внутренние
- [Tacitus_Quant_Terminal_README.md](../Tacitus_Quant_Terminal_README.md) - оригинальный README
- [RUN_NOW.sh](../RUN_NOW.sh) - быстрый запуск

### Внешние
- [Hyperliquid API Docs](https://hyperliquid.gitbook.io/hyperliquid-docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pandas Documentation](https://pandas.pydata.org/docs/)

---

## 🤝 Contributing

Пока проект в активной разработке. Документация обновляется после каждой недели.

---

**Последнее обновление:** Week 1 Complete (21 октября 2025)

