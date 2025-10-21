# 🚀 Week 2: Data Integration - Детальный План

**Цель:** Подключить реальные исторические данные с Hyperliquid и создать data pipeline.

**Статус:** 🔄 In Progress  
**Время:** 5-7 дней  
**Сложность:** Medium

---

## 📊 Обзор

После успешного Week 1 (Strategy Framework + EV + Risk) у нас есть:
- ✅ Работающие стратегии (Tortoise)
- ✅ EV калькулятор с полными издержками
- ✅ Risk Manager с sizing
- ✅ Integration demo на fake данных

**Проблема:** Используем синтетические данные → нужны реальные исторические данные.

**Решение:** Подключить Hyperliquid API → скачать данные → сохранить в Parquet → использовать в стратегиях.

---

## 🎯 Цели Week 2

### Главная цель
Запустить Tortoise стратегию на **реальных исторических данных** BTC-PERP за последние 2 года.

### Конкретные deliverables
1. ✅ TypeScript Hyperliquid adapter (REST API)
2. ✅ Python data fetcher (скачивание candles)
3. ✅ Parquet storage (быстрое хранилище)
4. ✅ Historical data для BTC/ETH (1D, 4H, 1H)
5. ✅ Integration test на real data
6. ✅ Сравнение: fake data vs real data results

---

## 📋 Задачи (детально)

### Phase 1: Hyperliquid REST API (День 1-2)

#### Задача 1.1: TypeScript Adapter
**Файл:** `core/exchanges/hyperliquid/HyperliquidExchange.ts`

**Что реализовать:**
```typescript
class HyperliquidExchange implements IExchange {
  // Публичные endpoints (не требуют auth)
  async getCandles(market: string, interval: string, startTime: number, endTime: number)
  async getFunding(market: string)
  async getMarkets(): Promise<Market[]>
  
  // Meta info
  async getFeeSchedule(): Promise<FeeSchedule>
  
  // Уже есть в интерфейсе
  orderbook(pair: string): Promise<OrderBookL2>
  trades(pair: string, since?: number): AsyncIterable<Trade>
}
```

**API endpoints:**
- `POST https://api.hyperliquid.xyz/info` - универсальный endpoint
- Request body: `{"type": "candles", "req": {...}}`
- Response: массив OHLCV

**Параметры:**
- Intervals: `1m`, `5m`, `15m`, `1h`, `4h`, `1d`
- Markets: `BTC`, `ETH`, `SOL`, etc (без `-PERP` суффикса в API)
- Time: Unix timestamp в миллисекундах

**Best practices:**
- Rate limiting: 1200 requests/minute
- Retry logic с exponential backoff
- Error handling для network issues
- Type safety (Zod schemas для validation)

**Пример запроса:**
```typescript
const response = await fetch('https://api.hyperliquid.xyz/info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'candles',
    req: {
      coin: 'BTC',
      interval: '1d',
      startTime: 1640000000000,
      endTime: 1700000000000
    }
  })
})
```

**Testing:**
```bash
# Test endpoint
curl -X POST https://api.hyperliquid.xyz/info \
  -H "Content-Type: application/json" \
  -d '{"type": "candles", "req": {"coin": "BTC", "interval": "1d", "startTime": 1640000000000}}'
```

---

#### Задача 1.2: Python Wrapper
**Файл:** `core/data/hyperliquid_client.py`

**Зачем:** Python проще для data processing, а TypeScript для live trading.

**Что реализовать:**
```python
class HyperliquidClient:
    def __init__(self, base_url: str = "https://api.hyperliquid.xyz"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def get_candles(
        self,
        coin: str,
        interval: str,
        start_time: int,
        end_time: int
    ) -> pd.DataFrame:
        """
        Получить свечи с Hyperliquid.
        
        Returns:
            DataFrame с колонками: timestamp, open, high, low, close, volume
        """
        pass
    
    def get_funding_history(self, coin: str) -> pd.DataFrame:
        """Получить историю funding rates."""
        pass
```

**Best practices:**
- Использовать `requests.Session()` для connection pooling
- Добавить retry decorator (@retry)
- Логирование всех запросов
- Кеширование ответов (optional)

---

### Phase 2: Data Fetcher & Storage (День 2-3)

#### Задача 2.1: Data Fetcher
**Файл:** `core/data/fetcher.py`

**Что делает:**
1. Принимает параметры: market, interval, date range
2. Разбивает на chunks (API лимит ~1000 свечей за запрос)
3. Параллельно скачивает chunks (concurrent requests)
4. Объединяет в один DataFrame
5. Валидирует данные (нет gaps, корректные OHLC)

**Структура:**
```python
class DataFetcher:
    def __init__(self, client: HyperliquidClient):
        self.client = client
    
    def fetch_historical(
        self,
        market: str,
        interval: str,
        start_date: str,  # "2022-01-01"
        end_date: str,    # "2024-10-01"
        validate: bool = True
    ) -> pd.DataFrame:
        """
        Скачать исторические данные с проверками.
        """
        # 1. Parse dates → timestamps
        # 2. Calculate chunks (1000 candles per request)
        # 3. Fetch chunks (parallel with rate limiting)
        # 4. Merge & sort
        # 5. Validate (no gaps, OHLC valid)
        # 6. Return DataFrame
        pass
    
    def _validate_candles(self, df: pd.DataFrame) -> bool:
        """Проверка корректности данных."""
        # Check: high >= open/close/low
        # Check: low <= open/close/high
        # Check: no gaps in timestamps
        # Check: volume >= 0
        pass
```

**Параллельная загрузка:**
```python
import asyncio
import aiohttp

async def fetch_chunk_async(coin, interval, start, end):
    async with aiohttp.ClientSession() as session:
        # async request
        pass

# Fetch multiple chunks in parallel
chunks = await asyncio.gather(*[
    fetch_chunk_async(coin, interval, chunk_start, chunk_end)
    for chunk_start, chunk_end in chunk_ranges
])
```

---

#### Задача 2.2: Parquet Storage
**Файл:** `core/data/storage.py`

**Зачем Parquet:**
- Columnar format → быстрее чем CSV (10-100x)
- Compression → меньше места (до 10x)
- Metadata → типы данных сохраняются
- Pandas native support

**Структура хранилища:**
```
data/
  candles/
    BTC-PERP/
      1d.parquet       # Дневные свечи
      4h.parquet       # 4-часовые
      1h.parquet       # Часовые
    ETH-PERP/
      1d.parquet
      ...
  funding/
    BTC-PERP.parquet   # История funding rates
  metadata/
    last_update.json   # Когда последний раз обновляли
```

**Код:**
```python
class ParquetStorage:
    def __init__(self, data_dir: Path = Path("./data")):
        self.data_dir = data_dir
    
    def save_candles(
        self,
        market: str,
        interval: str,
        df: pd.DataFrame
    ):
        """Сохранить свечи в Parquet."""
        path = self.data_dir / "candles" / market / f"{interval}.parquet"
        path.parent.mkdir(parents=True, exist_ok=True)
        df.to_parquet(path, compression='snappy', index=False)
    
    def load_candles(
        self,
        market: str,
        interval: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> pd.DataFrame:
        """Загрузить свечи из Parquet с фильтрацией по дате."""
        path = self.data_dir / "candles" / market / f"{interval}.parquet"
        df = pd.read_parquet(path)
        
        # Filter by date range
        if start_date:
            df = df[df['timestamp'] >= pd.to_datetime(start_date).timestamp() * 1000]
        if end_date:
            df = df[df['timestamp'] <= pd.to_datetime(end_date).timestamp() * 1000]
        
        return df
    
    def update_candles(self, market: str, interval: str, new_df: pd.DataFrame):
        """Incremental update: добавить только новые свечи."""
        try:
            existing = self.load_candles(market, interval)
            # Merge: keep existing + add new
            combined = pd.concat([existing, new_df]).drop_duplicates(subset='timestamp')
            combined = combined.sort_values('timestamp').reset_index(drop=True)
            self.save_candles(market, interval, combined)
        except FileNotFoundError:
            # First time - just save
            self.save_candles(market, interval, new_df)
```

---

### Phase 3: Initial Data Download (День 3-4)

#### Задача 3.1: Скрипт загрузки
**Файл:** `scripts/download_initial_data.py`

**Что скачиваем:**

| Market | Intervals | Period | Примерный размер |
|--------|-----------|--------|------------------|
| BTC-PERP | 1d, 4h, 1h | 2 года | ~50 MB |
| ETH-PERP | 1d, 4h, 1h | 2 года | ~50 MB |

**Скрипт:**
```python
#!/usr/bin/env python3
"""
Скрипт для первичной загрузки исторических данных.

Usage:
    python scripts/download_initial_data.py --market BTC-PERP --days 730
    python scripts/download_initial_data.py --all  # Загрузить всё
"""

import argparse
from core.data.hyperliquid_client import HyperliquidClient
from core.data.fetcher import DataFetcher
from core.data.storage import ParquetStorage

def download_market_data(market: str, days: int = 730):
    """Скачать данные для одного рынка."""
    print(f"📥 Downloading {market} data...")
    
    client = HyperliquidClient()
    fetcher = DataFetcher(client)
    storage = ParquetStorage()
    
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Download each interval
    for interval in ['1d', '4h', '1h']:
        print(f"  ⏳ Fetching {interval} candles...")
        df = fetcher.fetch_historical(
            market=market,
            interval=interval,
            start_date=start_date.strftime('%Y-%m-%d'),
            end_date=end_date.strftime('%Y-%m-%d')
        )
        
        print(f"  ✅ {len(df)} candles fetched")
        storage.save_candles(market, interval, df)
        print(f"  💾 Saved to data/candles/{market}/{interval}.parquet")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--market', help='Market to download (e.g., BTC-PERP)')
    parser.add_argument('--days', type=int, default=730, help='Days of history')
    parser.add_argument('--all', action='store_true', help='Download all markets')
    args = parser.parse_args()
    
    if args.all:
        markets = ['BTC-PERP', 'ETH-PERP']
        for market in markets:
            download_market_data(market, args.days)
    elif args.market:
        download_market_data(args.market, args.days)
    else:
        print("❌ Specify --market or --all")
        sys.exit(1)
    
    print("\n🎉 Download complete!")

if __name__ == '__main__':
    main()
```

**Запуск:**
```bash
# Загрузить BTC за 2 года
python scripts/download_initial_data.py --market BTC-PERP --days 730

# Загрузить всё
python scripts/download_initial_data.py --all
```

---

### Phase 4: Integration с Стратегиями (День 4-5)

#### Задача 4.1: Модифицировать Tortoise
**Файл:** `core/strategy/tortoise.py`

**Что изменить:**
- Убрать fake data generation
- Использовать real data из Parquet storage

**До:**
```python
# В demo тесте генерировали:
history = generate_fake_history(days=100)
```

**После:**
```python
# Загружаем из storage:
from core.data.storage import ParquetStorage

storage = ParquetStorage()
history = storage.load_candles(
    market='BTC-PERP',
    interval='1d',
    start_date='2022-01-01',
    end_date='2024-10-01'
)
```

---

#### Задача 4.2: Новый Integration Test
**Файл:** `tests/test_real_data_integration.py`

**Что тестируем:**
```python
def test_tortoise_on_real_data():
    """
    Тест Tortoise стратегии на реальных данных BTC.
    """
    # 1. Load real data
    storage = ParquetStorage()
    history = storage.load_candles('BTC-PERP', '1d', '2023-01-01', '2024-01-01')
    
    # 2. Initialize strategy
    strategy = TortoiseStrategy({...})
    
    # 3. Run through all bars
    signals = []
    for i in range(20, len(history)):  # Start after warmup period
        bar = history.iloc[i]
        ctx = BarContext(...)
        sigs = strategy.on_bar(ctx, history[:i])
        signals.extend(sigs)
    
    # 4. Analyze results
    print(f"Total signals: {len(signals)}")
    print(f"Long signals: {sum(1 for s in signals if s.side == 'long')}")
    print(f"Short signals: {sum(1 for s in signals if s.side == 'short')}")
    
    # 5. Assert
    assert len(signals) > 0, "No signals generated!"
```

---

### Phase 5: Data Quality & Monitoring (День 5)

#### Задача 5.1: Data Validation
**Файл:** `core/data/validator.py`

**Проверки:**
```python
class DataValidator:
    @staticmethod
    def validate_ohlc(df: pd.DataFrame) -> List[str]:
        """Validate OHLC relationships."""
        errors = []
        
        # High >= all others
        if (df['high'] < df['open']).any():
            errors.append("High < Open detected")
        if (df['high'] < df['close']).any():
            errors.append("High < Close detected")
        if (df['high'] < df['low']).any():
            errors.append("High < Low detected")
        
        # Low <= all others
        if (df['low'] > df['open']).any():
            errors.append("Low > Open detected")
        if (df['low'] > df['close']).any():
            errors.append("Low > Close detected")
        
        # Volume >= 0
        if (df['volume'] < 0).any():
            errors.append("Negative volume detected")
        
        return errors
    
    @staticmethod
    def check_gaps(df: pd.DataFrame, interval: str) -> List[int]:
        """Find timestamp gaps."""
        interval_ms = {
            '1m': 60_000,
            '5m': 300_000,
            '15m': 900_000,
            '1h': 3_600_000,
            '4h': 14_400_000,
            '1d': 86_400_000
        }[interval]
        
        gaps = []
        for i in range(1, len(df)):
            expected = df.iloc[i-1]['timestamp'] + interval_ms
            actual = df.iloc[i]['timestamp']
            if actual != expected:
                gaps.append(i)
        
        return gaps
```

---

#### Задача 5.2: Metadata Tracking
**Файл:** `data/metadata/last_update.json`

**Формат:**
```json
{
  "BTC-PERP": {
    "1d": {
      "last_timestamp": 1697932800000,
      "last_update": "2024-10-21T10:30:00Z",
      "total_candles": 730,
      "first_timestamp": 1634083200000
    },
    "4h": {...},
    "1h": {...}
  },
  "ETH-PERP": {...}
}
```

**Зачем:**
- Знаем когда последний раз обновляли
- Incremental updates (скачиваем только новые данные)
- Мониторинг актуальности данных

---

## 🧪 Testing Strategy

### Unit Tests
```python
# test_hyperliquid_client.py
def test_get_candles():
    client = HyperliquidClient()
    df = client.get_candles('BTC', '1d', start, end)
    assert len(df) > 0
    assert 'close' in df.columns

# test_storage.py
def test_save_load_parquet():
    storage = ParquetStorage()
    df_original = ...
    storage.save_candles('BTC-PERP', '1d', df_original)
    df_loaded = storage.load_candles('BTC-PERP', '1d')
    assert df_original.equals(df_loaded)
```

### Integration Tests
```python
# test_end_to_end_data_pipeline.py
def test_full_pipeline():
    # 1. Fetch from API
    # 2. Save to Parquet
    # 3. Load from Parquet
    # 4. Use in strategy
    # 5. Generate signals
    pass
```

---

## 📈 Success Metrics

Завершение Week 2 считается успешным если:

✅ **Data Pipeline Works**
- [ ] Можем скачать 2 года BTC-PERP данных за < 5 минут
- [ ] Данные сохраняются в Parquet (< 100 MB для BTC+ETH)
- [ ] Загрузка данных из Parquet < 1 секунды

✅ **Data Quality**
- [ ] 0 OHLC validation errors
- [ ] < 5 timestamp gaps (допустимы в выходные/праздники)
- [ ] Volume > 0 для всех свечей

✅ **Strategy Integration**
- [ ] Tortoise генерирует сигналы на real data
- [ ] Signals count: 10-50 за 2 года (реалистично для трендовой стратегии)
- [ ] EV_net остается > 0 на real data

✅ **Documentation**
- [ ] Hyperliquid API guide написан
- [ ] Data pipeline документирован
- [ ] Примеры использования работают

---

## 🚨 Потенциальные проблемы

### Problem 1: Rate Limiting
**Symptom:** 429 Too Many Requests  
**Solution:**
- Добавить delay между requests (0.05s)
- Использовать exponential backoff
- Parallel requests с semaphore (max 10 concurrent)

### Problem 2: Data Gaps
**Symptom:** Missing candles в некоторые периоды  
**Solution:**
- Логировать gaps но не падать
- Опциональная интерполяция (forward fill)
- Пометка в metadata

### Problem 3: Inconsistent Data
**Symptom:** High < Low, negative volume  
**Solution:**
- Строгая валидация после скачивания
- Отбрасывать invalid candles
- Логировать для анализа

### Problem 4: API Changes
**Symptom:** Response format изменился  
**Solution:**
- Zod schemas для runtime validation
- Version в API client
- Unit tests на реальных responses (fixtures)

---

## 📊 Deliverables Checklist

### Code
- [ ] `core/exchanges/hyperliquid/HyperliquidExchange.ts`
- [ ] `core/data/hyperliquid_client.py`
- [ ] `core/data/fetcher.py`
- [ ] `core/data/storage.py`
- [ ] `core/data/validator.py`
- [ ] `scripts/download_initial_data.py`
- [ ] `scripts/update_data.py` (incremental updates)

### Data
- [ ] `data/candles/BTC-PERP/1d.parquet`
- [ ] `data/candles/BTC-PERP/4h.parquet`
- [ ] `data/candles/BTC-PERP/1h.parquet`
- [ ] `data/candles/ETH-PERP/...` (same structure)
- [ ] `data/metadata/last_update.json`

### Tests
- [ ] `tests/test_hyperliquid_client.py`
- [ ] `tests/test_data_fetcher.py`
- [ ] `tests/test_storage.py`
- [ ] `tests/test_real_data_integration.py`

### Documentation
- [ ] `docs/week-02/HYPERLIQUID_INTEGRATION.md`
- [ ] `docs/week-02/DATA_PIPELINE.md`
- [ ] Update `docs/QUICKSTART.md` with real data instructions

---

## 🎯 Next Steps (Week 3 Preview)

После завершения Week 2 у нас будет:
- ✅ Real historical data
- ✅ Tortoise генерирует сигналы на real data

Week 3:
- 🎯 **Simple Backtest Engine** - прогон по всей истории
- 🎯 **Trade Log** - запись всех сделок с P&L
- 🎯 **Metrics** - Sharpe, MaxDD, cumulative R
- 🎯 **Walk-Forward** - защита от overfitting
- 🎯 **Monte Carlo** - оценка рисков

---

## 📞 Вопросы?

Весь код будет прокомментирован построчно на русском!

**Следующий файл:** [HYPERLIQUID_INTEGRATION.md](HYPERLIQUID_INTEGRATION.md) - детали API

---

**Создано:** 21 октября 2025  
**Статус:** Ready to implement  
**ETA:** 5-7 дней

