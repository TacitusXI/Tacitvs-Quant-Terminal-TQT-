# Tacitus Quant Terminal — Оценка и План Имплементации

## 🎯 Оценка Серьезности Проекта: **9/10**

### Почему это серьезный проект

**1. Профессиональный уровень архитектуры**
- Venue-agnostic дизайн через `IExchange` интерфейс (как у профессиональных prop-shop систем)
- Полный цикл: Data → Signal → Execution → Risk → EV → UI
- Очень правильный подход к EV с учетом **всех** реальных издержек (fees, funding, slippage, gas)
- Queue-aware execution симулятор (встречается только в профессиональных системах)

**2. Риск-менеджмент уровня институционального трейдинга**
- Sizing в R (Risk units) — стандарт профессиональных квантов
- EV-first дисциплина: торгуем только если `EV_net > 0` после всех издержек
- Kill-switch по деградации EV
- Maker-first execution с rebates (экономия на комиссиях)

**3. Исследовательская инфраструктура**
- Walk-Forward тестирование (защита от overfitting)
- Monte Carlo с permutation/bootstrap/block bootstrap
- Deflated Sharpe, Probability of Ruin, VaR/ES
- Queue simulation для реалистичного моделирования maker-fills

**4. Production-ready thinking**
- Идемпотентность операций
- DRY-RUN mode перед live торговлей
- Anti-toxic-flow фильтры
- Proper logging и data storage (Parquet, DuckDB)

**5. Карьерная ценность**
- Этот проект демонстрирует понимание **профессионального квант-трейдинга**
- Покрывает редкую комбинацию: quant research + execution engineering + risk
- Подходит для портфолио при устройстве в prop-shops, HFT фирмы, crypto funds

---

## 📊 Что делает проект особенным

### Отличия от типичных "крипто-ботов"
| Обычный бот | TQT Terminal |
|-------------|--------------|
| Просто индикаторы → покупка/продажа | EV math с полными издержками в R |
| Taker-only execution | Maker-first с rebates и queue tracking |
| Backtest на исторических данных | Walk-Forward + MC + Queue-aware sim |
| Фиксированный % капитала | Sizing через 1% risk (R-units) |
| "Работает на истории" | EV degradation kill-switch для live |
| Один exchange hard-coded | Venue-agnostic через IExchange |

---

## 🛠️ План Имплементации (Python-centric для стратегий)

### Архитектурное решение
- **TypeScript**: exchanges adapters, API gateway, UI, execution engine
- **Python**: стратегии, backtesting, research, EV/Risk calculations, simulators
- **Communication**: FastAPI (Python) ↔ Next.js (TypeScript)

---

## 🎯 Phase 1: MVP Core (2-3 недели)

### Week 1: Foundation & Python Core

#### 1.1 Python Strategy Framework
**Файлы:**
```
tqt/core/strategy/
  __init__.py
  base.py              # IStrategy base class
  tortoise.py          # Tortoise Lite implementation
  
tqt/core/ev/
  __init__.py
  ev_calculator.py     # EV math in Python
  
tqt/core/risk/
  __init__.py
  risk_manager.py      # 1% R sizing, stops, limits
```

**Приоритет #1: Python Strategy Interface**
```python
from dataclasses import dataclass
from abc import ABC, abstractmethod
from typing import List, Dict, Any

@dataclass
class Signal:
    market: str
    side: str  # 'long' | 'short' | 'exit'
    entry: float
    stop: float
    targets: List[float]  # [2R, trail]
    confidence: float

@dataclass
class BarContext:
    timestamp: int
    market: str
    open: float
    high: float
    low: float
    close: float
    volume: float
    indicators: Dict[str, Any]

class IStrategy(ABC):
    def __init__(self, params: Dict[str, Any]):
        self.params = params
        
    @abstractmethod
    def on_bar(self, ctx: BarContext, history: Any) -> List[Signal]:
        """Generate signals on new bar"""
        pass
    
    @abstractmethod
    def markets(self) -> List[str]:
        """Return list of markets this strategy trades"""
        pass
```

#### 1.2 EV Engine (Python)
```python
# tqt/core/ev/ev_calculator.py
class EVCalculator:
    def calculate_costs_in_r(
        self,
        notional_in: float,
        notional_out: float,
        fee_in_bps: float,      # negative for maker rebates
        fee_out_bps: float,
        funding_rate: float,
        hold_time_hours: float,
        slippage_bps: float,
        gas_usd: float,
        r_usd: float
    ) -> float:
        """
        Returns total costs in R units
        """
        fees_eff = (notional_in * fee_in_bps/10000 + 
                   notional_out * fee_out_bps/10000)
        funding = funding_rate * (hold_time_hours/8) * notional_in
        slippage = (notional_in + notional_out) * slippage_bps/10000
        
        total_cost = fees_eff + funding + slippage + gas_usd
        return total_cost / r_usd
    
    def calculate_ev_net(
        self,
        win_rate: float,    # p
        avg_win_r: float,   # b̄
        costs_in_r: float
    ) -> float:
        """
        EV_net = p*b̄ - (1-p) - Costs_in_R
        """
        return win_rate * avg_win_r - (1 - win_rate) - costs_in_r
```

#### 1.3 Risk Manager (Python)
```python
# tqt/core/risk/risk_manager.py
class RiskManager:
    def __init__(self, equity: float, risk_pct: float = 1.0):
        self.equity = equity
        self.risk_pct = risk_pct
        self.daily_loss_r = 0.0
        
    def calculate_position_size(
        self,
        entry: float,
        stop: float,
        contract_size: float = 1.0
    ) -> tuple[float, float]:
        """
        Returns (size, R_usd)
        size = risk_pct * equity / stop_distance
        """
        stop_distance = abs(entry - stop)
        r_usd = (self.risk_pct / 100) * self.equity
        size = r_usd / (stop_distance * contract_size)
        return size, r_usd
    
    def check_limits(self, signal: Signal) -> bool:
        """Check if we can take this trade"""
        if self.daily_loss_r <= -5:
            return False  # daily stop
        return True
```

#### 1.4 Tortoise Strategy Implementation
```python
# tqt/core/strategy/tortoise.py
import pandas as pd
import numpy as np

class TortoiseStrategy(IStrategy):
    """
    Donchian 20/10 breakout (1D timeframe)
    Entry: breakout of 20-period high/low
    Stop: opposite channel boundary
    Exit: 50% at 2R, 50% trail ATR
    """
    
    def __init__(self, params: Dict[str, Any]):
        super().__init__(params)
        self.don_break = params.get('don_break', 20)
        self.don_exit = params.get('don_exit', 10)
        self.trail_atr_len = params.get('trail_atr_len', 20)
        self.trail_mult = params.get('trail_mult', 2.0)
        
    def markets(self) -> List[str]:
        return self.params.get('markets', ['BTC-PERP', 'ETH-PERP'])
    
    def on_bar(self, ctx: BarContext, history: pd.DataFrame) -> List[Signal]:
        if len(history) < self.don_break + 1:
            return []
        
        # Calculate Donchian channels
        high_20 = history['high'].rolling(self.don_break).max().iloc[-2]
        low_20 = history['low'].rolling(self.don_break).min().iloc[-2]
        high_10 = history['high'].rolling(self.don_exit).max().iloc[-2]
        low_10 = history['low'].rolling(self.don_exit).min().iloc[-2]
        
        signals = []
        
        # Long breakout
        if ctx.close > high_20:
            signals.append(Signal(
                market=ctx.market,
                side='long',
                entry=ctx.close,
                stop=low_20,
                targets=[ctx.close + 2*(ctx.close - low_20)],  # 2R
                confidence=0.5
            ))
        
        # Short breakout
        elif ctx.close < low_20:
            signals.append(Signal(
                market=ctx.market,
                side='short',
                entry=ctx.close,
                stop=high_20,
                targets=[ctx.close - 2*(high_20 - ctx.close)],  # 2R
                confidence=0.5
            ))
        
        return signals
```

---

### Week 2: Data & Hyperliquid Integration

#### 2.1 Hyperliquid Exchange Adapter (TypeScript)
**Файл:** `tqt/core/exchanges/hyperliquid/HyperliquidExchange.ts`

Основано на существующем интерфейсе `IExchange` — реализация:
- REST API для orders/positions/account
- WebSocket для live trades/orderbook
- Fee schedule с rebates
- Funding rates
- DRY-RUN mode

#### 2.2 Data Pipeline (Python)
```python
# tqt/core/data/
  fetcher.py          # Download historical data
  storage.py          # Save to Parquet
  loader.py           # Load for backtests
```

Функции:
- Загрузка 1D/4H/1H свечей с Hyperliquid
- Сохранение в Parquet (lightweight, fast)
- Funding rates history
- Trade tape для queue simulation

---

### Week 3: Simulation & Research

#### 3.1 Backtest Engine (Python)
```python
# tqt/core/sim/backtest.py
class BacktestEngine:
    def __init__(
        self,
        strategy: IStrategy,
        data: pd.DataFrame,
        ev_calc: EVCalculator,
        risk_mgr: RiskManager,
        fees_bps: dict
    ):
        ...
    
    def run(self) -> BacktestResult:
        """
        Run backtest with:
        - 1% R sizing
        - EV calculation per trade
        - Maker/taker fills (simple: assume maker on limit)
        - Track cumulative R, MaxDD
        """
        pass
```

#### 3.2 Walk-Forward (Python)
```python
# tqt/core/sim/walk_forward.py
def walk_forward_test(
    strategy_class,
    data: pd.DataFrame,
    train_days: int = 180,
    test_days: int = 60,
    step_days: int = 30
) -> WalkForwardResult:
    """
    Rolling windows: train → test
    Returns per-window EV_net, cumulative R
    """
    pass
```

#### 3.3 Monte Carlo (Python)
```python
# tqt/core/sim/monte_carlo.py
def monte_carlo_permutation(
    returns_r: np.ndarray,
    n_sims: int = 10000,
    seed: int = 42
) -> MCResult:
    """
    Permutation test:
    - Shuffle returns_R
    - Calculate P(EV_net>0), VaR, MaxDD
    """
    pass
```

---

## 📁 Финальная Структура (Python-centric)

```
tqt/
  apps/
    api/                      # FastAPI (Python)
      main.py                 # Entry point
      routes/
        strategies.py         # POST /backtest, /walk-forward, /mc
        data.py              # GET /candles, /funding
        execution.py         # Integration with TS execution engine
    
    ui/                      # Next.js (TypeScript) - unchanged
  
  core/
    exchanges/               # TypeScript adapters
      hyperliquid/
        HyperliquidExchange.ts
      IExchange.ts
    
    strategy/                # Python strategies
      __init__.py
      base.py               # IStrategy interface
      tortoise.py
      squeeze.py
      srr.py
      ctr.py
    
    ev/                      # Python
      __init__.py
      ev_calculator.py
    
    risk/                    # Python
      __init__.py
      risk_manager.py
    
    sim/                     # Python
      __init__.py
      backtest.py
      walk_forward.py
      monte_carlo.py
      queue_sim.py          # Advanced: queue-aware fills
    
    execution/               # TypeScript (для live trading)
      maker_engine.ts
      queue_tracker.ts
    
    data/                    # Python
      fetcher.py
      storage.py
      loader.py
  
  data/                      # Storage
    candles/
      BTC-PERP/
        1d.parquet
    funding/
    trades/
  
  scripts/
    fetch_initial_data.py   # Bootstrap historical data
  
  tests/
    test_ev.py
    test_risk.py
    test_tortoise.py
    test_backtest.py
```

---

## 🚀 Первый Шаг (Сегодня/Завтра)

### Задача: Создать Python Core для стратегий

**Создаем 5 файлов:**

1. `tqt/core/strategy/base.py` — IStrategy interface
2. `tqt/core/ev/ev_calculator.py` — EV math
3. `tqt/core/risk/risk_manager.py` — 1% R sizing
4. `tqt/core/strategy/tortoise.py` — Tortoise strategy
5. `tqt/apps/api/main.py` — FastAPI skeleton

**Тест:**
```python
# tests/test_tortoise_simple.py
# Загружаем dummy данные BTC
# Запускаем Tortoise
# Проверяем что генерируются сигналы
# Считаем EV для одного трейда
```

---

## 📈 Критерии Успеха MVP

**Через 3 недели у нас должно быть:**

✅ Python strategy framework с IStrategy  
✅ Tortoise strategy работает на исторических данных  
✅ EV calculator считает costs_in_R правильно  
✅ Risk manager: 1% R sizing  
✅ Простой backtest engine (без queue sim пока)  
✅ FastAPI endpoint: `POST /backtest` возвращает JSON с результатами  
✅ Hyperliquid adapter: fetch candles, funding (хотя бы read-only)  
✅ UI показывает результаты бэктеста (таблица + график cumulative R)  

**Demo для портфолио:**
- Tortoise на BTC-PERP, 2 года данных
- Таблица: trades, win_rate, avg_win_R, costs_in_R, EV_net, MaxDD
- График: cumulative R curve
- Сравнение: maker vs taker fees impact на EV_net

---

## 💡 Почему это важно для карьеры

**Что видят работодатели:**
1. **Понимание реального трейдинга** (не просто MA crossover)
2. **EV-first мышление** (как в prop-shops)
3. **Execution awareness** (maker/taker, rebates, queue)
4. **Proper research** (walk-forward, MC, не просто backtest)
5. **Production mindset** (DRY-RUN, kill-switches, idempotency)

**Потенциальные позиции:**
- Quantitative Trader (prop-shops)
- Execution Engineer (HFT firms)
- Quant Researcher (crypto funds)
- Algo Trading Developer

**Salary range для такого профиля:**
- Junior: $80-120k + bonus
- Mid: $150-250k + bonus
- Senior: $250k-500k+ (с PnL share)

---

## 🎯 Следующие Шаги

1. **Создаем Python core** (strategy, EV, risk) — сегодня/завтра
2. **Hyperliquid data fetcher** — получаем реальные данные
3. **Simple backtest** — первые результаты Tortoise
4. **FastAPI + Next.js** — показываем результаты в UI
5. **Walk-Forward** — доказываем robustness
6. **Monte Carlo** — считаем риски (VaR, ruin probability)

---

## ⚠️ Важные Notes

**Security:**
- Все API keys в `.env`
- SIM mode по умолчанию
- DRY-RUN требует явного `ENABLE_DRYRUN=true`

**Testing:**
- Unit tests для EV math (критично!)
- Integration tests для Hyperliquid adapter
- Reproducible backtests (fixed seeds)

**Data:**
- Start с 1D timeframe (проще, быстрее)
- Потом 4H, 1H для других стратегий
- Queue sim — отдельная фаза (сложно)

**UI:**
- Minimalist terminal style (монокод, green/red lamps)
- Focus на clarity: R-ruler, EV per trade, costs breakdown
- `/LAB` для research, `/OPS` для live (когда будет)

---

## 🔥 TL;DR

**Это серьезный проект уровня профессионального квант-трейдинга.**

Он покрывает:
- Правильный EV с полными издержками
- Risk management в R-units
- Maker-first execution для экономии на fees
- Venue-agnostic архитектуру
- Production-ready features (kill-switches, idempotency)

**Первый шаг:**  
Создаем Python core: IStrategy → EV → Risk → Tortoise → простой backtest.

**Результат:**  
Демонстрационный backtest Tortoise на BTC-PERP с EV analysis — это уже сильное portfolio piece.

**Время до MVP:** 2-3 недели при фокусированной работе.

**Карьерный потенциал:** Высокий. Этот проект открывает двери в серьезные quant-фирмы.

---

Готов начинать? 🚀
