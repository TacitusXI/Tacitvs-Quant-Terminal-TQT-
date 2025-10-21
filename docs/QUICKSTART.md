# 🚀 Quick Start Guide - Первые Шаги

Пошаговая инструкция для запуска Tacitus Quant Terminal.

## 📋 Что мы только что создали

```
tqt/
  core/
    strategy/
      base.py          ✅ IStrategy interface с подробными комментариями
      tortoise.py      ✅ Donchian breakout стратегия
    
    ev/
      ev_calculator.py ✅ Расчет EV с полными издержками
    
    risk/
      risk_manager.py  ✅ 1% R sizing & risk limits
  
  apps/
    api/
      main.py          ✅ FastAPI backend
      requirements.txt ✅ Зависимости
  
  tests/
    test_integration_demo.py ✅ Демонстрация всей системы
```

---

## 🔧 Шаг 1: Установка зависимостей

### Создаем виртуальное окружение

```bash
# Переходим в директорию tqt/
cd /home/user/Documents/GitHub/Tacitvs-Quant-Terminal-TQT/tqt

# Создаем виртуальное окружение Python
python -m venv venv

# Активируем его
source venv/bin/activate  # Linux/Mac
# или
# venv\Scripts\activate   # Windows
```

### Устанавливаем пакеты

```bash
# Устанавливаем зависимости для API
pip install -r apps/api/requirements.txt
```

Это установит:
- `fastapi` - Web framework
- `uvicorn` - ASGI сервер
- `pydantic` - Валидация данных
- `pandas` - Работа с табличными данными
- `numpy` - Численные вычисления

---

## 🎯 Шаг 2: Запуск Demo теста

Этот тест покажет работу всех компонентов.

```bash
# Убедитесь что вы в директории tqt/ и venv активирован
python tests/test_integration_demo.py
```

### Что вы увидите:

```
========================================
  🚀 TACITUS QUANT TERMINAL - Integration Demo
========================================

1️⃣  Генерация исторических данных
   ✅ Сгенерировано 100 дней истории
   📊 OHLCV данные для BTC

2️⃣  Инициализация стратегии Tortoise
   ✅ Donchian 20/10 breakout

3️⃣  Генерация торгового сигнала
   📊 LONG/SHORT/EXIT сигналы

4️⃣  Risk Management & Position Sizing
   💰 Капитал, sizing по 1% R
   🚦 Проверка лимитов

5️⃣  Expected Value (EV) Calculation
   💸 Fees, Funding, Slippage в R-units
   🎯 EV_net расчет

6️⃣  Резюме полного цикла
   ✅ Signal → Sizing → EV check → Decision
```

---

## 🌐 Шаг 3: Запуск FastAPI Backend

Запускаем REST API сервер.

```bash
# Из директории tqt/
cd apps/api

# Запускаем сервер
python main.py

# Или через uvicorn напрямую:
# uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

Сервер запустится на **http://localhost:8080**

### Тестируем API

Открываем браузер:

**Swagger документация (интерактивная):**
- http://localhost:8080/docs

**Health check:**
- http://localhost:8080/health

### Примеры запросов

#### 1) Расчет EV

```bash
curl -X POST "http://localhost:8080/api/ev/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "win_rate": 0.45,
    "avg_win_r": 2.5,
    "avg_loss_r": -1.0,
    "notional_in": 1000,
    "notional_out": 1000,
    "r_usd": 100
  }'
```

Ответ:
```json
{
  "ev_result": {
    "win_rate": 0.45,
    "ev_net": 0.095,
    "total_costs_r": 0.03,
    ...
  },
  "is_tradeable": true,
  "message": "EV_net = 0.095R. ✅ Стратегия прибыльна"
}
```

#### 2) Расчет размера позиции

```bash
curl -X POST "http://localhost:8080/api/risk/position-size" \
  -H "Content-Type: application/json" \
  -d '{
    "entry_price": 45000,
    "stop_price": 43000,
    "equity": 10000,
    "risk_pct": 1.0
  }'
```

Ответ:
```json
{
  "size": 0.05,
  "r_usd": 100,
  "risk_distance": 2000,
  "message": "Size: 0.0500 contracts, Risk: $100.00 (1.0% of equity)"
}
```

#### 3) Получить список стратегий

```bash
curl "http://localhost:8080/api/strategies/list"
```

---

## 📚 Как работает код

### 1. Strategy (Стратегия)

```python
from core.strategy.tortoise import TortoiseStrategy

# Создаем стратегию
strategy = TortoiseStrategy({
    'don_break': 20,  # Период breakout канала
    'don_exit': 10,   # Период exit канала
    'markets': ['BTC-PERP']
})

# Генерируем сигналы
signals = strategy.on_bar(current_bar_context, history_dataframe)
```

**Что делает:**
- Рассчитывает Donchian каналы (max/min за N периодов)
- Проверяет прорыв границ канала
- Генерирует LONG/SHORT/EXIT сигналы

### 2. Risk Manager (Управление рисками)

```python
from core.risk.risk_manager import RiskManager

# Создаем risk manager с капиталом $10k
risk_mgr = RiskManager(equity=10000)

# Рассчитываем размер позиции (1% риска)
size, r_usd = risk_mgr.calculate_position_size(
    entry_price=45000,
    stop_price=43000
)

# size = количество контрактов
# r_usd = размер риска в долларах (1R)
```

**Что делает:**
- Sizing по формуле: `size = (risk% × equity) / stop_distance`
- Проверяет лимиты (daily loss, max positions)
- Kill-switch при достижении лимитов

### 3. EV Calculator (Расчет EV)

```python
from core.ev.ev_calculator import EVCalculator

# Создаем калькулятор
ev_calc = EVCalculator(
    default_maker_bps=-1.5,  # Rebate
    default_taker_bps=4.5    # Fee
)

# Рассчитываем EV
ev_result = ev_calc.calculate_ev_result(
    win_rate=0.45,      # 45% winrate
    avg_win_r=2.5,      # Средний выигрыш 2.5R
    avg_loss_r=-1.0,    # Средний проигрыш 1R
    notional_in=1000,
    notional_out=1000,
    r_usd=100
)

# Проверяем прибыльность
if ev_result.ev_net > 0:
    print("✅ Стратегия прибыльна!")
```

**Что считает:**
- Fees (может быть отрицательным для maker rebates)
- Funding (плата за удержание позиции)
- Slippage (проскальзывание)
- EV_net = EV_gross - Total_Costs

---

## 🎓 Ключевые Концепции

### R-units (единицы риска)

**1R** = расстояние от входа до стопа в долларах

Пример:
- Entry: $45,000
- Stop: $43,000
- Size: 0.05 BTC
- **1R** = (45000 - 43000) × 0.05 = **$100**

Если стоп сработал → потеряли 1R ($100)  
Если взяли 2R → заработали 2R ($200)

### EV (Expected Value)

**Математическое ожидание** прибыли на сделку.

Формула:
```
EV_gross = win_rate × avg_win - (1 - win_rate) × avg_loss
EV_net   = EV_gross - Costs_in_R
```

Пример:
- Win rate: 45%
- Avg win: 2.5R
- Avg loss: 1R
- Costs: 0.03R

```
EV_gross = 0.45 × 2.5 - 0.55 × 1.0 = 0.575R
EV_net   = 0.575 - 0.03 = 0.545R
```

**Торгуем только если EV_net > 0!**

### Maker vs Taker

**Maker** - ставим лимитную заявку в стакан  
→ Получаем **rebate** (возврат комиссии)  
→ Hyperliquid: -1.5 bps = получаем 0.015%

**Taker** - берем из стакана (market order)  
→ Платим **fee**  
→ Hyperliquid: +4.5 bps = платим 0.045%

**Экономия:** maker vs taker = 6 bps = 0.06% на сделку!  
На $1M notional = **$600 экономии**

---

## 🛠️ Следующие шаги

### 1. Подключить реальные данные

Сейчас используем fake данные. Следующий шаг:
- Создать Hyperliquid adapter (TypeScript)
- Скачать реальные исторические свечи
- Сохранить в Parquet для быстрого доступа

### 2. Backtest Engine

Создать полный backtester:
- Прогон по историческим данным
- Track всех сделок
- Расчет метрик (Sharpe, MaxDD, etc)

### 3. Walk-Forward Testing

Защита от overfitting:
- Train на N месяцах
- Test на следующем месяце
- Rolling windows

### 4. Monte Carlo

Оценка рисков:
- Permutation test
- Bootstrap
- P(ruin), VaR, Expected Shortfall

### 5. UI

Next.js терминал:
- Графики cumulative R
- Таблица сделок
- EV lamps (green/red)
- Command palette

---

## 🐛 Troubleshooting

### ImportError: No module named 'core'

```bash
# Убедитесь что запускаете из директории tqt/
cd /home/user/Documents/GitHub/Tacitvs-Quant-Terminal-TQT/tqt

# И что venv активирован
source venv/bin/activate
```

### ModuleNotFoundError: pandas

```bash
# Установите зависимости
pip install pandas numpy fastapi uvicorn pydantic
```

### Port 8080 already in use

```bash
# Измените порт в apps/api/main.py
uvicorn.run("main:app", host="0.0.0.0", port=8081)
```

---

## 📞 Вопросы?

Весь код прокомментирован построчно на русском языке!

Читайте комментарии в файлах:
- `core/strategy/base.py` - базовые классы
- `core/strategy/tortoise.py` - стратегия с объяснениями
- `core/ev/ev_calculator.py` - EV math
- `core/risk/risk_manager.py` - risk management
- `apps/api/main.py` - FastAPI endpoints

---

## ✅ Чеклист

- [ ] Создал venv и установил зависимости
- [ ] Запустил `test_integration_demo.py` - работает
- [ ] Запустил FastAPI сервер - работает
- [ ] Открыл Swagger docs - работает
- [ ] Понял концепцию R-units
- [ ] Понял EV расчет
- [ ] Понял разницу maker/taker

**Готов к следующему этапу!** 🚀

