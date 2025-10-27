# ⚡ Data Quickstart - Загрузка Исторических Данных

## 🎯 Цель

Загрузить исторические данные **один раз** и использовать их **много раз** без повторных запросов к API.

---

## 🚀 Быстрый Старт

### 1. Загрузить данные для трейдинга (рекомендуется)

```bash
cd /home/user/Documents/GitHub/Tacitvs-Quant-Terminal-TQT
source venv/bin/activate

# BTC, ETH, SOL - все таймфреймы за год
python scripts/preload_historical_data.py \
  --markets BTC-PERP,ETH-PERP,SOL-PERP \
  --days 365 \
  --intervals 1m,5m,15m,1h,4h,1d
```

**Результат:** ~1-2 MB, загрузка ~10-20 секунд

---

### 2. Загрузить ВСЕ популярные рынки

```bash
# Все популярные пары за 6 месяцев (только дневные и часовые)
python scripts/preload_historical_data.py \
  --all-markets \
  --days 180 \
  --intervals 1d,1h
```

**Результат:** ~5 MB, загрузка ~30-60 секунд

**Включает:** BTC, ETH, SOL, AVAX, MATIC, ARB, OP, DOGE

---

### 3. Быстрый тест

```bash
# Проверить что всё работает (7 дней, 1 рынок)
python scripts/preload_historical_data.py \
  --markets BTC-PERP \
  --days 7 \
  --intervals 1d
```

**Результат:** ~10 KB, мгновенно

---

## 📦 Где Хранятся Данные?

```
data/
  historical/
    BTC-PERP/
      1m.parquet   ← Минутные свечи
      5m.parquet   ← 5-минутные
      15m.parquet  ← 15-минутные
      1h.parquet   ← Часовые
      4h.parquet   ← 4-часовые
      1d.parquet   ← Дневные
    ETH-PERP/
      ...
    SOL-PERP/
      ...
```

---

## 🔄 Обновление Данных

```bash
# Обновить существующие данные (перезаписать)
python scripts/preload_historical_data.py \
  --markets BTC-PERP,ETH-PERP \
  --days 30 \
  --force
```

---

## 🎯 Использование

### В UI (автоматически)

Просто откройте график - он автоматически использует закэшированные данные!

```
http://localhost:3003/OPS  ← График BTC
```

### В Python

```python
from core.data.manager import DataManager

dm = DataManager()

# Загрузить данные (из кэша если есть)
df = dm.get_candles('BTC-PERP', '1d', 365)
print(f"Loaded {len(df)} candles")
```

### Через API

```bash
# API автоматически использует кэш
curl "http://localhost:8080/api/candles/BTC-PERP/1d?days_back=365"
```

---

## 📊 Проверить Что Загружено

```bash
# Показать все файлы
ls -lh data/historical/*/

# Размер каждого рынка
du -sh data/historical/*
```

**Пример вывода:**
```
292K    data/historical/BTC-PERP
194K    data/historical/ETH-PERP
183K    data/historical/SOL-PERP
```

---

## 💡 Рекомендации

### Для Scalping (1m, 5m)

```bash
python scripts/preload_historical_data.py \
  --markets BTC-PERP,ETH-PERP \
  --days 30 \
  --intervals 1m,5m
```

### Для Swing Trading (1h, 4h, 1d)

```bash
python scripts/preload_historical_data.py \
  --markets BTC-PERP,ETH-PERP,SOL-PERP \
  --days 365 \
  --intervals 1h,4h,1d
```

### Для Backtesting (только дневные)

```bash
python scripts/preload_historical_data.py \
  --all-markets \
  --days 730 \
  --intervals 1d
```

---

## 🎉 Результат

После загрузки:

✅ **Мгновенные графики** - загрузка <50ms  
✅ **Оффлайн работа** - не нужен интернет  
✅ **Нет лимитов API** - всё локально  
✅ **Быстрый backtesting** - данные всегда под рукой  

---

## 📚 Больше Информации

- [DATA_STORAGE_GUIDE.md](docs/DATA_STORAGE_GUIDE.md) - полное руководство
- [DATA_CACHING_GUIDE.md](docs/DATA_CACHING_GUIDE.md) - архитектура кэширования
- [API_REFERENCE.md](docs/api/API_REFERENCE.md) - API endpoints

---

**Готово! Теперь у вас огромная база исторических данных!** 🚀

