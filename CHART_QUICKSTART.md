# 📊 Chart Visualization - Quick Start

## ⚡ Быстрый старт за 3 минуты

### 1️⃣ Запустить Backend API

```bash
cd apps/api
python main.py
```

API запустится на `http://localhost:8080`

**Проверка:**
```bash
curl http://localhost:8080/health
# Должен вернуть: {"status":"healthy"}
```

### 2️⃣ Запустить Frontend

В **новом терминале**:

```bash
cd apps/ui
npm run dev
```

UI запустится на `http://localhost:3000`

### 3️⃣ Открыть LAB

Перейдите по адресу:
```
http://localhost:3000/LAB
```

Вы увидите:
- ✅ Свечной график BTC-PERP (1d по умолчанию)
- ✅ Селекторы символов (BTC, ETH, SOL)
- ✅ Переключатель таймфреймов (1m, 5m, 15m, 1h, 4h, 1d)
- ✅ Выбор индикаторов (EMA, RSI, SMA)

## 🧪 Тестирование API

```bash
# Запустить тесты
python test_chart_api.py
```

Или вручную:

```bash
# Получить свечи BTC-PERP на 1d
curl "http://localhost:8080/api/candles?symbol=BTC-PERP&tf=1d&limit=10"

# Получить RSI индикатор
curl "http://localhost:8080/api/indicators?symbol=BTC-PERP&tf=1d&indicator=rsi&length=14&limit=10"

# Список доступных данных
curl "http://localhost:8080/api/candles/available"

# Список индикаторов
curl "http://localhost:8080/api/indicators/available"
```

## 🎯 Что доступно

### Символы
- BTC-PERP
- ETH-PERP  
- SOL-PERP

### Таймфреймы
- 1m (1 минута)
- 5m (5 минут)
- 15m (15 минут)
- 1h (1 час)
- 4h (4 часа)
- 1d (1 день)

### Индикаторы
- **RSI** - Relative Strength Index (default: 14)
- **EMA** - Exponential Moving Average (20, 50)
- **SMA** - Simple Moving Average (20)
- **Bollinger Bands** - 3 линии (upper, middle, lower)

## 🎨 UI Controls

### Символ
Выберите рынок: **BTC-PERP** | **ETH-PERP** | **SOL-PERP**

### Таймфрейм  
Выберите интервал: **1M** | **5M** | **15M** | **1H** | **4H** | **1D**

### Индикатор
Dropdown меню:
- None (только свечи)
- EMA(20) - зеленый
- EMA(50) - оранжевый
- RSI(14) - синий
- SMA(20) - желтый

### Refresh
Кнопка **↻ REFRESH** - обновить данные

## 📁 Структура файлов

```
apps/
├── api/
│   ├── main.py                    # FastAPI app (добавлены роутеры)
│   └── routes/
│       ├── candles.py            # API для свечей (NEW)
│       └── indicators.py         # API для индикаторов (NEW)
│
└── ui/
    ├── components/
    │   ├── Chart.tsx             # Компонент графика (NEW)
    │   └── ChartPanel.tsx        # Панель с контролами (NEW)
    │
    ├── lib/
    │   └── api.ts                # API client (обновлен)
    │
    └── app/
        └── LAB/
            └── page.tsx          # LAB страница (обновлена)
```

## 🔧 Конфигурация

### Environment Variables

Создайте `apps/ui/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### API Port

Изменить порт API в `apps/api/main.py`:

```python
uvicorn.run(
    "main:app",
    host="0.0.0.0",
    port=8080,  # <-- Change here
    reload=True
)
```

## 🐛 Troubleshooting

### ❌ "Failed to fetch candles"

**Причина:** API не запущен или данные отсутствуют

**Решение:**
1. Проверьте что API запущен: `curl http://localhost:8080/health`
2. Проверьте наличие файлов:
   ```bash
   ls -la data/historical/BTC-PERP/
   # Должны быть: 1m.parquet, 5m.parquet, 15m.parquet, 1h.parquet, 4h.parquet, 1d.parquet
   ```
3. Если файлов нет - скачайте данные (см. `docs/week-02/DATA_PIPELINE.md`)

### ❌ График не отображается

**Причина:** Lightweight Charts не установлен или candles пустой массив

**Решение:**
1. Проверьте установку:
   ```bash
   cd apps/ui
   npm list lightweight-charts
   ```
2. Если не установлен:
   ```bash
   npm install lightweight-charts
   ```
3. Откройте Browser Console (F12) для ошибок

### ❌ CORS errors

**Причина:** Frontend и Backend на разных портах

**Решение:** CORS уже настроен в `apps/api/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    ...
)
```

В production измените на конкретный origin:
```python
allow_origins=["http://localhost:3000"]
```

### ❌ Timestamps не отображаются правильно

**Причина:** Формат timestamp (миллисекунды vs секунды)

**Решение:** Код автоматически конвертирует. Если проблема остается:
1. Проверьте формат в Parquet:
   ```python
   import polars as pl
   df = pl.read_parquet('data/historical/BTC-PERP/1d.parquet')
   print(df['timestamp'].head())
   # Должны быть Unix timestamps (seconds или milliseconds)
   ```

## 🚀 Следующие шаги

### 1. Добавить volume bars

```typescript
// В Chart.tsx
const volumeSeries = chart.addHistogramSeries({
  color: '#26a69a',
  priceFormat: { type: 'volume' },
  priceScaleId: '',
});
```

### 2. Добавить live WebSocket

```python
# Backend: routes/websocket.py
@router.websocket("/ws/ticks/{symbol}")
async def stream_ticks(ws: WebSocket, symbol: str):
    await ws.accept()
    while True:
        tick = await get_latest_tick(symbol)
        await ws.send_json(tick)
        await asyncio.sleep(1)
```

```typescript
// Frontend: useWebSocket hook
const ws = new WebSocket(`ws://localhost:8080/ws/ticks/${symbol}`);
ws.onmessage = (e) => {
  const tick = JSON.parse(e.data);
  candleSeries.update(tick);
};
```

### 3. Добавить drawing tools

- Horizontal lines (support/resistance)
- Trendlines
- Trade markers (entry/exit с бэктеста)

### 4. Интегрировать с бэктестом

```typescript
// Overlay trades на график
trades.forEach(trade => {
  const marker = {
    time: trade.entry_time,
    position: trade.side === 'long' ? 'belowBar' : 'aboveBar',
    color: trade.pnl > 0 ? '#26a69a' : '#ef5350',
    shape: 'arrowUp',
    text: `${trade.pnl.toFixed(2)}R`
  };
  candleSeries.setMarkers([marker]);
});
```

## 📚 Полная документация

См. `docs/CHART_IMPLEMENTATION.md` для детальной информации:
- API Reference
- Data formats
- Customization guide
- Performance optimization
- Advanced features

## ✅ Checklist

- [x] Lightweight Charts установлен
- [x] Chart.tsx компонент создан
- [x] ChartPanel.tsx с контролами
- [x] API endpoints для candles и indicators
- [x] Роутеры подключены к main.py
- [x] LAB страница обновлена
- [x] API client функции добавлены
- [x] Тестовый скрипт создан

## 🎉 Готово!

Теперь у вас есть полноценный график визуализации рыночных данных:

✅ Свечные графики с OHLCV  
✅ Множество таймфреймов  
✅ Технические индикаторы  
✅ Быстрая обработка данных (Polars)  
✅ Готов к интеграции с бэктестом  
✅ Sci-fi дизайн в стиле TQT  

**Enjoy your Quant Terminal! 🚀**

