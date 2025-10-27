# 📦 TQT Data Caching System

## Overview

**Tacitvs Quant Terminal** использует многоуровневую систему кэширования исторических данных для максимальной производительности и минимизации API запросов к Hyperliquid.

### 🎯 Цели

- **Быстрая загрузка**: данные загружаются мгновенно из локального кэша
- **Минимальный трафик**: подгружаем только недостающие данные
- **Оффлайн работа**: можно работать с историческими данными без интернета
- **Масштабируемость**: поддержка всех таймфреймов и рынков

---

## 🏗️ Архитектура

### Трёхуровневая система кэширования

```
┌─────────────────┐
│   Frontend      │
│   IndexedDB     │  ← Уровень 1: Браузер (постоянное хранилище)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │
│   DataManager   │  ← Уровень 2: Python RAM/Parquet кэш
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Hyperliquid    │
│     API         │  ← Уровень 3: Источник данных
└─────────────────┘
```

### Поток данных

1. **Первый запрос**: Frontend → IndexedDB miss → Backend → Hyperliquid API → сохранение в оба кэша
2. **Последующие запросы**: Frontend → IndexedDB hit → мгновенный ответ
3. **Инкрементальное обновление**: Backend проверяет что уже есть и подгружает только новые свечи

---

## 📡 Backend API

### Endpoints

#### `GET /api/candles/{market}/{interval}`

Получить исторические свечи для рынка.

**Parameters:**
- `market` (path): Рынок (например `BTC-PERP`, `ETH-PERP`)
- `interval` (path): Таймфрейм (`1m`, `5m`, `15m`, `1h`, `4h`, `1d`)
- `days_back` (query): Количество дней истории (default: 7, max: 365)
- `force_refresh` (query): Игнорировать кэш и загрузить свежие данные (default: false)

**Response:**
```json
{
  "market": "BTC-PERP",
  "interval": "1d",
  "candles": [
    {
      "timestamp": "2025-10-19T00:00:00",
      "open": 107143.0,
      "high": 109407.0,
      "low": 106056.0,
      "close": 108591.0,
      "volume": 20172.98134
    },
    ...
  ],
  "from_cache": false,
  "count": 7
}
```

**Example:**
```bash
curl "http://localhost:8080/api/candles/BTC-PERP/1d?days_back=30"
```

---

#### `POST /api/candles/batch`

Получить данные для нескольких рынков одновременно.

**Request Body:**
```json
{
  "markets": ["BTC-PERP", "ETH-PERP", "SOL-PERP"],
  "interval": "1h",
  "days_back": 7
}
```

**Response:**
```json
{
  "data": {
    "BTC-PERP": { ... },
    "ETH-PERP": { ... },
    "SOL-PERP": { ... }
  },
  "total_candles": 504
}
```

**Example:**
```bash
curl -X POST "http://localhost:8080/api/candles/batch" \
  -H "Content-Type: application/json" \
  -d '{"markets": ["BTC-PERP", "ETH-PERP"], "interval": "1d", "days_back": 7}'
```

---

#### `GET /api/candles/intervals`

Получить список поддерживаемых таймфреймов.

**Response:**
```json
{
  "intervals": ["1m", "5m", "15m", "1h", "4h", "1d"],
  "description": {
    "1m": "1 minute",
    "5m": "5 minutes",
    "15m": "15 minutes",
    "1h": "1 hour",
    "4h": "4 hours",
    "1d": "1 day"
  }
}
```

---

## 💾 Frontend Caching

### IndexedDB Structure

**Database:** `tqt-candle-cache`

**Object Store:** `candles`

**Schema:**
```typescript
interface CachedCandles {
  market: string;           // "BTC-PERP"
  interval: string;         // "1d"
  candles: CandleData[];    // Array of OHLCV data
  lastUpdate: number;       // Timestamp последнего обновления
  firstTimestamp: number;   // Самая ранняя свеча
  lastTimestamp: number;    // Самая поздняя свеча
}

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

### Usage in Components

```typescript
import { useCandles } from '@/lib/hooks';

function MyChart() {
  const { data, isLoading } = useCandles('BTC-PERP', '1d', 30);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Candles: {data.candles.length}</p>
      <p>From cache: {data.from_cache ? 'Yes' : 'No'}</p>
      {/* Render chart */}
    </div>
  );
}
```

### Smart Caching Logic

`useCandles` hook автоматически:

1. ✅ Проверяет IndexedDB
2. ✅ Если данных достаточно → возвращает из кэша
3. ✅ Если данных не хватает → запрашивает у backend
4. ✅ Backend проверяет свой кэш
5. ✅ Backend запрашивает только недостающие данные у Hyperliquid
6. ✅ Новые данные сохраняются в оба кэша

---

## 🔧 Backend Implementation

### DataManager

`core/data/manager.py` отвечает за кэширование на backend:

**Features:**
- In-memory DataFrame кэш для быстрого доступа
- Автоматическое сохранение в Parquet файлы
- Ленивая загрузка данных
- Поддержка множественных рынков и интервалов

**File Structure:**
```
data/
  historical/
    BTC-PERP/
      1m.parquet
      5m.parquet
      15m.parquet
      1h.parquet
      4h.parquet
      1d.parquet
    ETH-PERP/
      ...
```

### Hyperliquid Client

`core/data/hyperliquid_client.py` обрабатывает все запросы к API:

**Features:**
- Rate limit handling с exponential backoff
- Автоматический retry при ошибках
- Валидация параметров
- Connection pooling

**Example:**
```python
from core.data.hyperliquid_client import HyperliquidClient

client = HyperliquidClient()
df = client.get_candles(
    coin='BTC',
    interval='1d',
    start_time=start_ms,
    end_time=end_ms
)
```

---

## 🚀 Performance

### Benchmarks

| Scenario | Time | API Calls |
|----------|------|-----------|
| First load (30 days, 1d) | ~800ms | 1 |
| Cached load (30 days, 1d) | ~10ms | 0 |
| Incremental update (1 new day) | ~300ms | 1 |
| Multiple markets (3x, cached) | ~15ms | 0 |

### Storage

- **1 minute candles, 1 year**: ~525,600 candles ≈ 20 MB
- **1 hour candles, 1 year**: ~8,760 candles ≈ 350 KB
- **1 day candles, 1 year**: ~365 candles ≈ 15 KB

**IndexedDB Limit:** ~50 MB (Chrome), ~100 MB (Firefox) — достаточно для множества рынков и таймфреймов!

---

## 🛠️ Управление кэшем

### Очистка кэша

#### Frontend (Console)

```javascript
// Clear all cache
const cache = await import('./lib/candle-cache').then(m => m.getCandleCache());
await cache.clearAll();

// Clear specific market
await cache.clearMarket('BTC-PERP');

// Get cache stats
const stats = await cache.getStats();
console.log(stats);
// {
//   totalEntries: 12,
//   totalCandles: 5040,
//   markets: ['BTC-PERP', 'ETH-PERP', ...],
//   intervals: ['1d', '1h', '5m']
// }
```

#### Backend (Python)

```python
from core.data.manager import DataManager

dm = DataManager()

# Clear specific market/interval
dm.clear_cache('BTC-PERP', '1d')

# Or manually delete files
import shutil
shutil.rmtree('data/historical/BTC-PERP')
```

---

## 📊 Мониторинг

### Console Logs

Frontend логирует все операции с кэшем:

```
[CandleCache] IndexedDB initialized
[useCandles] IndexedDB hit: 30 candles for BTC-PERP
[useCandles] Backend: 30 candles for BTC-PERP (from_cache: true)
[CandleCache] Stored 30 candles for BTC-PERP:1d
```

### API Logs

Backend логирует:
- Все входящие запросы
- Cache hits/misses
- Hyperliquid API calls

---

## 🔮 Roadmap

### Planned Features

- [ ] **Gap Detection**: автоматическое обнаружение и заполнение пробелов в данных
- [ ] **Compression**: сжатие старых данных для экономии места
- [ ] **Offline Mode**: полностью оффлайн режим с pre-loaded данными
- [ ] **Real-time Updates**: WebSocket интеграция для live обновления последней свечи
- [ ] **Multi-exchange**: поддержка нескольких бирж (Binance, Bybit, etc.)

---

## 📚 Related Docs

- [Data Pipeline](./week-02/DATA_PIPELINE.md) - общая архитектура данных
- [Hyperliquid Integration](./week-02/HYPERLIQUID_INTEGRATION.md) - детали интеграции
- [API Reference](./api/API_REFERENCE.md) - все API endpoints

---

## 🙏 Credits

Built with:
- **IndexedDB** via [idb](https://github.com/jakearchibald/idb)
- **Hyperliquid API** - decentralized perpetual exchange
- **FastAPI** - modern Python web framework
- **Pandas** - data manipulation
- **PyArrow** - Parquet file format

