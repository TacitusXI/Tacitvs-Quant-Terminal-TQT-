# 📚 Структура Документации - Навигация

**Создано:** 21 октября 2025  
**Статус:** Реорганизовано и расширено

---

## 🎯 Новая Организация

Вся документация теперь в папке `docs/` с чёткой структурой по этапам.

```
tqt/
├── README.md                          → Главная точка входа
├── RUN_NOW.sh                         → Быстрый запуск
├── Tacitus_Quant_Terminal_README.md   → Оригинальный vision document
│
└── docs/                              📚 ВСЯ ДОКУМЕНТАЦИЯ ЗДЕСЬ
    │
    ├── README.md                      → Навигация по всем docs
    ├── QUICKSTART.md                  → Установка и первый запуск
    ├── PROJECT_STRUCTURE.md           → Структура кода
    │
    ├── week-01/                       ✅ Week 1 Complete
    │   ├── PROJECT_ASSESSMENT.md      → Оценка проекта 9/10, план на 3 недели
    │   └── IMPLEMENTATION_SUMMARY.md  → Что сделано, статистика
    │
    ├── week-02/                       🔄 Week 2 In Progress
    │   ├── PLAN.md                    → 📋 ДЕТАЛЬНЫЙ ПЛАН (главный файл!)
    │   ├── HYPERLIQUID_INTEGRATION.md → Скелет: API details
    │   └── DATA_PIPELINE.md           → Скелет: Architecture
    │
    ├── week-03/                       ⏳ Week 3 Planned
    │   ├── PLAN.md                    → Скелет: Backtest план
    │   ├── BACKTESTING.md             → Скелет: Engine details
    │   └── RESEARCH.md                → Скелет: WF & MC
    │
    ├── api/                           📖 API Reference
    │   └── API_REFERENCE.md           → Скелет: REST & Python API
    │
    └── strategies/                    🧠 Strategy Guides
        ├── TORTOISE.md                → Скелет: Strategy guide
        └── STRATEGY_FRAMEWORK.md      → Скелет: How to create
```

---

## 📖 Карта чтения по сценариям

### 🆕 Сценарий 1: Новый в проекте

**Цель:** Быстро запустить и понять что это.

1. **[../README.md](../README.md)** - Общий overview (5 мин)
2. **[QUICKSTART.md](QUICKSTART.md)** - Установка и запуск demo (15 мин)
3. **[week-01/PROJECT_ASSESSMENT.md](week-01/PROJECT_ASSESSMENT.md)** - Зачем и почему (20 мин)
4. **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Структура кода (10 мин)

**Итог:** За 50 минут полное понимание + работающий demo.

---

### 🔧 Сценарий 2: Хочу начать Week 2

**Цель:** Подключить реальные данные Hyperliquid.

1. **[week-02/PLAN.md](week-02/PLAN.md)** ← **НАЧАТЬ ЗДЕСЬ!** (детальный план)
2. **[week-02/HYPERLIQUID_INTEGRATION.md](week-02/HYPERLIQUID_INTEGRATION.md)** - API детали (заполнится при имплементации)
3. **[week-02/DATA_PIPELINE.md](week-02/DATA_PIPELINE.md)** - Архитектура (заполнится при имплементации)

**Ключевой файл:** `week-02/PLAN.md` - там ВСЁ: задачи, код, примеры, чеклисты!

---

### 🧪 Сценарий 3: Хочу разобраться в backtesting

**Цель:** Понять как будет работать backtest engine.

1. **[week-03/PLAN.md](week-03/PLAN.md)** - Краткий план Week 3
2. **[week-03/BACKTESTING.md](week-03/BACKTESTING.md)** - Скелет (будет заполнен)
3. **[week-03/RESEARCH.md](week-03/RESEARCH.md)** - Скелет WF & MC (будет заполнен)

**Статус:** Skeleton - детали после Week 2.

---

### 📚 Сценарий 4: Хочу создать свою стратегию

**Цель:** Написать новую стратегию по аналогии с Tortoise.

1. **[strategies/STRATEGY_FRAMEWORK.md](strategies/STRATEGY_FRAMEWORK.md)** - Как создавать (скелет)
2. **[strategies/TORTOISE.md](strategies/TORTOISE.md)** - Пример стратегии (скелет)
3. Код: `core/strategy/base.py` - IStrategy interface
4. Код: `core/strategy/tortoise.py` - Reference implementation

**Статус:** Скелеты созданы, будут заполнены после Week 3.

---

### 🔌 Сценарий 5: Хочу использовать API

**Цель:** Интеграция с TQT через REST API.

1. **[api/API_REFERENCE.md](api/API_REFERENCE.md)** - Справочник endpoints
2. Swagger docs: `http://localhost:8080/docs` (live)
3. Код: `apps/api/main.py` - Implementation с комментариями

**Endpoints работают:** ✅ 6 endpoints уже реализованы!

---

## 📊 Статус файлов

### ✅ Полностью готовые (можно читать прямо сейчас)

| Файл | Описание | Объём |
|------|----------|-------|
| `README.md` (корень) | Главная страница проекта | ~250 строк |
| `QUICKSTART.md` | Инструкции по запуску | ~400 строк |
| `PROJECT_STRUCTURE.md` | Структура кода | ~200 строк |
| `week-01/PROJECT_ASSESSMENT.md` | Оценка проекта + план | ~550 строк |
| `week-01/IMPLEMENTATION_SUMMARY.md` | Что сделано Week 1 | ~350 строк |
| `week-02/PLAN.md` | **ДЕТАЛЬНЫЙ ПЛАН Week 2** | ~700 строк |

**Итого:** ~2,450 строк готовой документации!

---

### 📝 Скелеты (будут заполняться)

| Файл | Когда заполнится | Зачем |
|------|------------------|-------|
| `week-02/HYPERLIQUID_INTEGRATION.md` | При имплементации | API детали |
| `week-02/DATA_PIPELINE.md` | При имплементации | Архитектура data |
| `week-03/PLAN.md` | После Week 2 | Детальный план Week 3 |
| `week-03/BACKTESTING.md` | Week 3 | Backtest guide |
| `week-03/RESEARCH.md` | Week 3 | WF & MC guide |
| `api/API_REFERENCE.md` | Постепенно | Полный API reference |
| `strategies/TORTOISE.md` | После backtests | Backtest results |
| `strategies/STRATEGY_FRAMEWORK.md` | Week 3 | Tutorial |

**Подход:** Создали скелеты сразу для структуры, заполним по мере реализации.

---

## 🎯 Ключевые файлы для Week 2

Если начинаете Week 2, читайте в таком порядке:

1. **[week-02/PLAN.md](week-02/PLAN.md)** ← **MUST READ!**
   - 700+ строк детального плана
   - Все задачи с кодом и примерами
   - Чеклисты и метрики успеха
   - Потенциальные проблемы и решения

2. **Hyperliquid API** (external)
   - https://hyperliquid.gitbook.io/hyperliquid-docs/
   - Изучить REST API endpoints
   - Понять rate limits

3. **Код Week 1** (reference)
   - `core/strategy/base.py` - как работают стратегии
   - `core/ev/ev_calculator.py` - расчет EV
   - `core/risk/risk_manager.py` - risk management

---

## 🔄 Как обновляется документация

### Week 1 (завершён)
- ✅ Написаны полные docs
- ✅ Все коды прокомментированы
- ✅ Integration demo работает

### Week 2 (текущий)
- ✅ Создан детальный PLAN.md
- ✅ Созданы скелеты для заполнения
- 🔄 По мере имплементации заполняем:
  - HYPERLIQUID_INTEGRATION.md
  - DATA_PIPELINE.md
  - Code examples
  - Troubleshooting sections

### Week 3 (будущий)
- 📋 После Week 2 создадим детальный PLAN.md
- 📋 Заполним скелеты backtesting docs
- 📋 Добавим примеры и results

---

## 💡 Best Practices

### Для читателей
1. Начинайте с **README.md** в корне
2. Следуйте сценариям выше
3. Скелеты показывают структуру (что будет)
4. Код всегда прокомментирован

### Для contributors
1. Обновляйте docs по мере кодинга
2. Скелеты → заполненные docs
3. Примеры кода в docs
4. Troubleshooting sections

---

## 📞 Навигация

### Быстрые ссылки
- **Главная:** [../README.md](../README.md)
- **Старт:** [QUICKSTART.md](QUICKSTART.md)
- **Week 2 Plan:** [week-02/PLAN.md](week-02/PLAN.md)
- **All docs:** [README.md](README.md)

### Внешние ресурсы
- [Hyperliquid Docs](https://hyperliquid.gitbook.io/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Pandas Docs](https://pandas.pydata.org/docs/)

---

## ✅ Результат реорганизации

### До
```
tqt/
├── PROJECT_ASSESSMENT.md
├── IMPLEMENTATION_SUMMARY.md
├── QUICKSTART.md
├── PROJECT_STRUCTURE.md
└── (все в корне, нет структуры)
```

### После
```
tqt/
├── README.md                    → Entry point
├── docs/                        📚 Hub
│   ├── README.md                → Navigation
│   ├── week-01/ ✅
│   ├── week-02/ 🔄 (детальный план!)
│   ├── week-03/ ⏳
│   ├── api/
│   └── strategies/
```

### Преимущества
✅ Чёткая структура по этапам  
✅ Скелеты для будущих docs  
✅ Лёгкая навигация  
✅ Масштабируемость  
✅ Week 2 план сразу готов для имплементации!

---

**Создано:** 21 октября 2025  
**Автор:** AI Assistant (Claude)  
**Цель:** Элегантная структура документации для multi-week проекта

