# ⚡ Quick Start - Chart System (FIXED)

## 🎯 Что было исправлено

### ❌ Проблемы:
1. `chart.addCandlestickSeries is not a function` - неправильный API для lightweight-charts v5
2. `Failed to fetch` - Backend API не запущен
3. Timestamp conversion error - неправильная обработка datetime типов

### ✅ Исправления:
1. Использую `chart.addSeries('Candlestick', {...})` вместо `addCandlestickSeries`
2. Создал автоматические startup скрипты
3. Исправил обработку timestamp (datetime → epoch seconds)

---

## 🚀 Запуск за 10 секунд

### Способ 1: Автоматический скрипт (РЕКОМЕНДУЕТСЯ)

```bash
cd /home/user/Documents/GitHub/Tacitvs-Quant-Terminal-TQT
./start_chart_system.sh
```

**Скрипт автоматически:**
- ✅ Запускает Backend API (port 8080)
- ✅ Запускает Frontend UI (port 3000)
- ✅ Проверяет что все работает
- ✅ Показывает ссылки для доступа

**Остановить систему:**
```bash
./stop_chart_system.sh
```

---

### Способ 2: Ручной запуск

**Терминал 1 - Backend:**
```bash
cd /home/user/Documents/GitHub/Tacitvs-Quant-Terminal-TQT
source venv/bin/activate
cd apps/api
python main.py
```

**Терминал 2 - Frontend:**
```bash
cd /home/user/Documents/GitHub/Tacitvs-Quant-Terminal-TQT/apps/ui
npm run dev
```

---

## 🌐 Доступ к системе

После запуска откройте в браузере:

### 🧪 LAB (Графики + Backtesting)
```
http://localhost:3000/LAB
```

### 🎮 OPS (Operations)
```
http://localhost:3000/OPS
```

### 📊 API Documentation
```
http://localhost:8080/docs
```

---

## 📊 Использование графиков

1. **Выберите символ:** Нажмите `BTC-PERP`, `ETH-PERP` или `SOL-PERP`
2. **Выберите таймфрейм:** `1M`, `5M`, `15M`, `1H`, `4H`, `1D`
3. **Добавьте индикатор:** Dropdown → `EMA(20)`, `RSI(14)`, `SMA(20)`, etc.
4. **Обновите данные:** Кнопка `↻ REFRESH`

График мгновенно загружается с данными! ⚡

---

## 🧪 Тестирование

### Проверить API:
```bash
python test_chart_api.py
```

### Или вручную:
```bash
# Health check
curl http://localhost:8080/health

# Получить свечи BTC
curl "http://localhost:8080/api/candles?symbol=BTC-PERP&tf=1d&limit=5"

# Получить RSI
curl "http://localhost:8080/api/indicators?symbol=BTC-PERP&tf=1d&indicator=rsi&length=14&limit=5"
```

---

## 📝 Логи

Если что-то не работает:

```bash
# API logs
tail -f /tmp/api.log

# Frontend logs
tail -f /tmp/frontend.log
```

---

## 🐛 Troubleshooting

### ❌ "Port 8080 already in use"
```bash
# Остановить все процессы
./stop_chart_system.sh

# Или вручную
kill $(lsof -t -i:8080)
```

### ❌ "Port 3000 already in use"
```bash
kill $(lsof -t -i:3000)
```

### ❌ График не загружается
1. Проверьте что Backend API запущен: `curl http://localhost:8080/health`
2. Проверьте данные: `ls -la data/historical/BTC-PERP/`
3. Откройте Browser Console (F12) для ошибок

### ❌ "Failed to fetch"
Backend не запущен. Запустите: `./start_chart_system.sh`

---

## ✅ Checklist

После запуска проверьте:

- [ ] Backend API отвечает: `curl http://localhost:8080/health`
- [ ] Frontend доступен: `curl http://localhost:3000`
- [ ] LAB страница открывается: `http://localhost:3000/LAB`
- [ ] График отображается
- [ ] Можно переключать символы
- [ ] Можно менять таймфреймы
- [ ] Индикаторы работают

---

## 🎉 Готово!

Теперь у вас работает:

✅ **Lightweight Charts** с candlestick visualization  
✅ **6 timeframes** + **3 symbols**  
✅ **4 indicators** (RSI, EMA, SMA, BBands)  
✅ **Ultra-fast API** (Polars + NumPy)  
✅ **Dark sci-fi UI** в стиле TQT  
✅ **Автоматические скрипты** для запуска/остановки  

---

## 📚 Документация

- `START_CHART_SYSTEM.md` - Подробная инструкция
- `CHART_IMPLEMENTATION.md` - Техническая документация
- `FINAL_FIX_SUMMARY.md` - Список всех исправлений
- `QUICKSTART_FIXED.md` - Этот файл

---

**Enjoy your Quant Terminal! 🚀📊**

