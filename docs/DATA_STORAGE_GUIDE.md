# 💾 Data Storage Guide - Работа с Историческими Данными

## 📦 Где Хранятся Данные?

### Структура файлов

```
data/
  historical/
    BTC-PERP/
      1m.parquet      # Минутные свечи
      5m.parquet      # 5-минутные свечи
      15m.parquet     # 15-минутные свечи
      1h.parquet      # Часовые свечи
      4h.parquet      # 4-часовые свечи
      1d.parquet      # Дневные свечи
    ETH-PERP/
      1d.parquet
      1h.parquet
      ...
    SOL-PERP/
      ...
```

### Формат: Apache Parquet

**Почему Parquet?**
- ✅ **Компактность**: 10x меньше чем CSV
- ✅ **Скорость**: Быстрое чтение/запись
- ✅ **Типизация**: Автоматические типы данных
- ✅ **Сжатие**: Built-in компрессия
- ✅ **Pandas совместимость**: Прямая загрузка в DataFrame

**Размеры файлов:**
- 1 year × 1m candles ≈ 160 KB (BTC)
- 1 year × 1h candles ≈ 190 KB
- 1 year × 1d candles ≈ 11 KB

---

## 🚀 Массовая Загрузка Данных

### Quick Start

```bash
# 1. Загрузить BTC и ETH за последний год (все таймфреймы)
python scripts/preload_historical_data.py \
  --markets BTC-PERP,ETH-PERP \
  --days 365

# 2. Загрузить ВСЕ популярные рынки за 6 месяцев (только дневные)
python scripts/preload_historical_data.py \
  --all-markets \
  --days 180 \
  --intervals 1d

# 3. Быстрый тест (7 дней, 1 рынок)
python scripts/preload_historical_data.py \
  --markets SOL-PERP \
  --days 7 \
  --intervals 1d
```

### Все популярные рынки

```bash
# Загрузить ВСЕ популярные рынки за год
python scripts/preload_historical_data.py --all-markets --days 365
```

**Включает:**
- BTC-PERP
- ETH-PERP
- SOL-PERP
- AVAX-PERP
- MATIC-PERP
- ARB-PERP
- OP-PERP
- DOGE-PERP

### Опции скрипта

| Опция | Описание | Пример |
|-------|----------|--------|
| `--markets` | Список рынков (через запятую) | `BTC-PERP,ETH-PERP` |
| `--all-markets` | Загрузить все популярные рынки | |
| `--intervals` | Таймфреймы (через запятую) | `1d,1h,5m` |
| `--days` | Количество дней истории | `365` |
| `--force` | Перезаписать существующие данные | |

### Примеры использования

#### 1. Полная загрузка для трейдинга

```bash
# BTC, ETH, SOL - все таймфреймы за год
python scripts/preload_historical_data.py \
  --markets BTC-PERP,ETH-PERP,SOL-PERP \
  --days 365 \
  --intervals 1m,5m,15m,1h,4h,1d
```

**Результат:**
- ~3 MB данных
- Все таймфреймы доступны оффлайн
- Мгновенная загрузка графиков

#### 2. Backtesting dataset

```bash
# Только дневные и часовые свечи за 2 года
python scripts/preload_historical_data.py \
  --all-markets \
  --days 730 \
  --intervals 1d,1h
```

**Результат:**
- ~2 MB для 8 рынков
- Идеально для backtesting
- Быстрый анализ трендов

#### 3. Real-time trading setup

```bash
# Минутки и 5-минутки за 30 дней
python scripts/preload_historical_data.py \
  --markets BTC-PERP,ETH-PERP \
  --days 30 \
  --intervals 1m,5m
```

**Результат:**
- Recent price action
- Scalping готов
- Быстрые обновления

---

## 📊 Работа с Данными в Python

### Прямое чтение из Parquet

```python
import pandas as pd

# Читаем BTC дневные свечи
df = pd.read_parquet('data/historical/BTC-PERP/1d.parquet')

print(df.head())
#       timestamp      open      high       low     close      volume
# 0  1640995200000  47000.0  48500.0  46500.0  47500.0  1000000.0
# ...
```

### Через DataManager (рекомендуется)

```python
from core.data.manager import DataManager

dm = DataManager()

# Получить данные (автоматически из кэша если есть)
df = dm.get_candles(
    market='BTC-PERP',
    interval='1d',
    days_back=365
)

# Принудительное обновление
df = dm.get_candles(
    market='ETH-PERP',
    interval='1h',
    days_back=30,
    force_refresh=True
)
```

### Batch загрузка

```python
# Загрузить несколько рынков одновременно
markets = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP']
interval = '1d'
days = 365

data = {}
for market in markets:
    data[market] = dm.get_candles(market, interval, days)

# Теперь data содержит все DataFrame'ы
print(f"BTC candles: {len(data['BTC-PERP'])}")
```

---

## 🔧 Управление Кэшем

### Проверить что есть

```bash
# Показать все загруженные данные
ls -lh data/historical/*/

# Размер каждого рынка
du -sh data/historical/*
```

### Очистка

```python
from core.data.storage import DataStorage

storage = DataStorage()

# Удалить данные конкретного рынка
storage.delete('BTC-PERP', '1m')

# Или вручную
rm data/historical/BTC-PERP/1m.parquet
```

### Обновление данных

```bash
# Обновить все данные (загрузить свежие)
python scripts/preload_historical_data.py \
  --all-markets \
  --days 365 \
  --force
```

---

## 🌐 Использование через API

### Получить данные из кэша

```bash
# API автоматически использует закэшированные данные
curl "http://localhost:8080/api/candles/BTC-PERP/1d?days_back=365"
```

**Response:**
```json
{
  "market": "BTC-PERP",
  "interval": "1d",
  "candles": [...],
  "from_cache": true,    ← Из локального файла!
  "count": 365
}
```

### Frontend автоматически использует

```typescript
// В компонентах графиков
const { data } = useCandles('BTC-PERP', '1d', 365);

// Если данные закэшированы - мгновенная загрузка!
// Если нет - автоматическая загрузка с Hyperliquid
```

---

## 📈 Производительность

### Сравнение скоростей

| Источник | Скорость | Примечание |
|----------|----------|------------|
| **Parquet cache** | ~10-50ms | ⚡ Мгновенно |
| **Hyperliquid API** | ~300-2000ms | Зависит от объема |
| **No cache, no API** | Mock data | Fallback |

### Оптимизация

**1. Предзагрузка перед торговлей:**
```bash
# Утром перед трейдингом
python scripts/preload_historical_data.py \
  --markets BTC-PERP,ETH-PERP \
  --days 90 \
  --force
```

**2. Scheduled updates (cron):**
```bash
# Каждый день в 00:00 обновлять данные
0 0 * * * cd /path/to/TQT && python scripts/preload_historical_data.py --all-markets --days 30 --force
```

**3. Selective caching:**
```bash
# Часто используемые пары - все таймфреймы
python scripts/preload_historical_data.py \
  --markets BTC-PERP,ETH-PERP \
  --days 365

# Остальные - только дневные
python scripts/preload_historical_data.py \
  --markets SOL-PERP,AVAX-PERP \
  --days 365 \
  --intervals 1d
```

---

## 🎯 Use Cases

### 1. Backtesting Strategy

```python
from core.data.manager import DataManager
from core.strategy.tortoise import TortoiseStrategy

dm = DataManager()

# Загружаем год данных
df = dm.get_candles('BTC-PERP', '1d', 365)

# Запускаем backtest
strategy = TortoiseStrategy(...)
results = strategy.backtest(df)
```

### 2. Multi-Market Analysis

```python
markets = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP']
correlations = {}

for market in markets:
    df = dm.get_candles(market, '1d', 365)
    correlations[market] = df['close'].pct_change()

# Корреляционный анализ
import pandas as pd
corr_df = pd.DataFrame(correlations)
print(corr_df.corr())
```

### 3. Real-time Dashboard

```python
# Предзагрузка для дашборда
markets = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP']
intervals = ['1m', '5m', '1h', '1d']

for market in markets:
    for interval in intervals:
        dm.get_candles(market, interval, 30)

# Теперь дашборд работает мгновенно!
```

---

## 🔮 Advanced Tips

### Compression

```python
# Parquet уже использует сжатие (snappy)
# Но можно изменить уровень сжатия:

import pandas as pd

df = pd.read_parquet('data/historical/BTC-PERP/1d.parquet')

# Пересохранить с максимальным сжатием
df.to_parquet(
    'data/historical/BTC-PERP/1d.parquet',
    compression='gzip',  # или 'brotli'
    compression_level=9
)
```

### Export to CSV (если нужно)

```python
import pandas as pd

# Конвертировать в CSV для Excel
df = pd.read_parquet('data/historical/BTC-PERP/1d.parquet')
df.to_csv('btc_daily.csv', index=False)
```

### Merge multiple intervals

```python
# Создать единый DataFrame со всеми таймфреймами
intervals = ['1h', '4h', '1d']
merged = {}

for interval in intervals:
    df = dm.get_candles('BTC-PERP', interval, 365)
    merged[interval] = df

# Теперь можно анализировать multi-timeframe
```

---

## 📚 Related Docs

- [Data Caching Guide](./DATA_CACHING_GUIDE.md) - система кэширования
- [Hyperliquid Integration](./week-02/HYPERLIQUID_INTEGRATION.md) - API интеграция
- [Data Pipeline](./week-02/DATA_PIPELINE.md) - архитектура данных

---

## 🎉 Summary

**Теперь у вас есть:**

✅ **Parquet storage** - компактное хранение в файлах  
✅ **Mass preloader** - загрузка больших объемов одной командой  
✅ **Multi-timeframe** - все таймфреймы поддерживаются  
✅ **Fast access** - мгновенная загрузка из кэша  
✅ **Python API** - удобная работа через DataManager  
✅ **REST API** - доступ через HTTP  
✅ **Frontend ready** - автоматическое использование в UI  

**Все исторические данные в ваших руках!** 🚀

