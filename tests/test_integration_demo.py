"""
Integration Demo Test - демонстрация работы всей системы.

Этот скрипт показывает:
1. Генерацию сигналов стратегией Tortoise
2. Расчет размера позиции через Risk Manager
3. Расчет EV с полными издержками
4. Пример полного цикла: signal → sizing → EV check
"""

# ===== ИМПОРТЫ =====

import sys
from pathlib import Path

# Добавляем корневую директорию в path
# Path(__file__) = путь к этому файлу (test_integration_demo.py)
# .parent = директория tests/
# .parent.parent = директория tqt/
ROOT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Наши модули
from core.strategy.tortoise import TortoiseStrategy
from core.strategy.base import BarContext
from core.ev.ev_calculator import EVCalculator
from core.risk.risk_manager import RiskManager, RiskLimits

# Для работы с данными
import pandas as pd
import numpy as np


# ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

def generate_fake_history(days: int = 100) -> pd.DataFrame:
    """
    Генерация fake исторических данных для тестирования.
    
    Создает синтетические OHLCV данные с трендом и волатильностью.
    
    Args:
        days: Количество дней истории
    
    Returns:
        DataFrame с колонками: timestamp, open, high, low, close, volume
    """
    # np.random.seed для воспроизводимости результатов
    np.random.seed(42)
    
    # Начальная цена BTC
    start_price = 40000.0
    
    # Генерируем случайные изменения цены (random walk с трендом)
    # np.random.randn() генерирует случайные числа из нормального распределения
    # mean=0.0005 = небольшой восходящий тренд (+0.05% в день)
    # std=0.02 = волатильность 2% в день
    returns = np.random.randn(days) * 0.02 + 0.0005
    
    # Вычисляем цены через cumulative product
    # (1 + returns) дает множители для каждого дня
    # .cumprod() = cumulative product (произведение)
    # * start_price = умножаем на стартовую цену
    close_prices = start_price * (1 + returns).cumprod()
    
    # Генерируем OHLC данные
    data = []
    for i, close in enumerate(close_prices):
        # Для каждого дня генерируем:
        
        # Open = предыдущий close (или start_price для первого дня)
        open_price = close_prices[i-1] if i > 0 else start_price
        
        # High/Low = close ± случайное отклонение
        # abs() чтобы диапазон был всегда положительным
        daily_range = abs(np.random.randn() * 0.015 * close)
        high = close + daily_range
        low = close - daily_range
        
        # Корректируем если open вышел за пределы high/low
        high = max(high, open_price, close)
        low = min(low, open_price, close)
        
        # Volume = случайный объем
        volume = np.random.uniform(1000, 5000)
        
        # Timestamp = текущее время минус N дней
        # 86400000 = миллисекунд в дне
        timestamp = int((pd.Timestamp.now().timestamp() - (days - i) * 86400) * 1000)
        
        # Добавляем строку в список
        data.append({
            'timestamp': timestamp,
            'open': open_price,
            'high': high,
            'low': low,
            'close': close,
            'volume': volume
        })
    
    # Конвертируем список словарей в DataFrame
    df = pd.DataFrame(data)
    return df


def print_section(title: str):
    """
    Печать красивого заголовка секции.
    
    Args:
        title: Текст заголовка
    """
    # "=" * 80 создает строку из 80 символов =
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80 + "\n")


# ===== MAIN DEMO =====

def main():
    """
    Главная функция демонстрации.
    """
    print_section("🚀 TACITUS QUANT TERMINAL - Integration Demo")
    
    # ========================================
    # 1) ГЕНЕРАЦИЯ FAKE ДАННЫХ
    # ========================================
    print_section("1️⃣  Генерация исторических данных")
    
    # Генерируем 100 дней истории
    history = generate_fake_history(days=100)
    
    print(f"✅ Сгенерировано {len(history)} дней истории")
    print(f"📊 Первые 5 строк:")
    # .head(5) показывает первые 5 строк DataFrame
    # .to_string() конвертирует в красиво отформатированную строку
    print(history.head(5).to_string())
    
    # Последняя и предпоследняя свечи (для сигнала)
    # .iloc[-1] = последняя строка
    # .iloc[-2] = предпоследняя строка
    last_bar = history.iloc[-1]
    prev_bar = history.iloc[-2]
    
    print(f"\n📈 Последняя свеча:")
    print(f"   Close: ${last_bar['close']:.2f}")
    print(f"   High:  ${last_bar['high']:.2f}")
    print(f"   Low:   ${last_bar['low']:.2f}")
    
    # ========================================
    # 2) СОЗДАНИЕ СТРАТЕГИИ
    # ========================================
    print_section("2️⃣  Инициализация стратегии Tortoise")
    
    # Создаем стратегию с параметрами
    strategy = TortoiseStrategy({
        'don_break': 20,
        'don_exit': 10,
        'trail_atr_len': 20,
        'trail_mult': 2.0,
        'markets': ['BTC-PERP']
    })
    
    print(f"✅ Стратегия создана: {strategy}")
    print(f"📋 Параметры:")
    print(f"   Breakout channel: {strategy.don_break} periods")
    print(f"   Exit channel:     {strategy.don_exit} periods")
    print(f"   ATR length:       {strategy.trail_atr_len} periods")
    
    # ========================================
    # 3) ГЕНЕРАЦИЯ СИГНАЛА
    # ========================================
    print_section("3️⃣  Генерация торгового сигнала")
    
    # Создаем контекст для последней свечи
    ctx = BarContext(
        timestamp=int(last_bar['timestamp']),
        market='BTC-PERP',
        open=float(last_bar['open']),
        high=float(last_bar['high']),
        low=float(last_bar['low']),
        close=float(last_bar['close']),
        volume=float(last_bar['volume']),
        indicators={}
    )
    
    # Генерируем сигналы
    # Передаем контекст текущей свечи и всю историю
    signals = strategy.on_bar(ctx, history)
    
    print(f"🔍 Проверка условий входа...")
    print(f"   Найдено сигналов: {len(signals)}")
    
    if not signals:
        print(f"⚠️  Нет сигналов на текущей свече")
        print(f"   (Это нормально - сигналы редки для трендовых стратегий)")
        print(f"\n💡 Для демонстрации создадим искусственный сигнал...")
        
        # Создаем fake сигнал для демонстрации остальных компонентов
        from core.strategy.base import Signal, SignalSide
        
        fake_signal = Signal(
            market='BTC-PERP',
            side=SignalSide.LONG,
            entry=float(last_bar['close']),
            stop=float(last_bar['close']) * 0.95,  # Стоп -5%
            targets=[float(last_bar['close']) * 1.10],  # Цель +10%
            confidence=0.5,
            metadata={'reason': 'demo_signal'}
        )
        signals = [fake_signal]
    
    # Берем первый сигнал для анализа
    signal = signals[0]
    
    print(f"\n📊 СИГНАЛ ДЕТАЛЬ:")
    print(f"   Market:     {signal.market}")
    print(f"   Direction:  {signal.side.value.upper()}")
    print(f"   Entry:      ${signal.entry:.2f}")
    print(f"   Stop:       ${signal.stop:.2f}")
    print(f"   Target:     ${signal.targets[0]:.2f}")
    print(f"   Risk dist:  ${signal.risk_distance():.2f}")
    print(f"   Reward dist: ${signal.reward_distance():.2f}")
    print(f"   R:R ratio:  {signal.risk_reward_ratio():.2f}")
    
    # ========================================
    # 4) RISK MANAGEMENT & SIZING
    # ========================================
    print_section("4️⃣  Risk Management & Position Sizing")
    
    # Создаем Risk Manager
    # Предположим equity = $10,000
    equity = 10000.0
    
    # Создаем лимиты риска
    limits = RiskLimits(
        per_trade_risk_pct=1.0,        # 1% риска на сделку
        max_daily_loss_r=5.0,          # Максимум 5R убытка в день
        max_concurrent_positions=3,     # Максимум 3 открытых позиции
        max_position_size_usd=50000.0,  # Максимум $50k на позицию
        min_ev_net=0.0                  # Минимальный EV = 0 (break-even)
    )
    
    risk_mgr = RiskManager(equity=equity, limits=limits)
    
    print(f"💰 Капитал: ${equity:,.2f}")
    print(f"⚙️  Лимиты:")
    print(f"   Risk per trade:  {limits.per_trade_risk_pct}%")
    print(f"   Daily loss limit: {limits.max_daily_loss_r}R")
    print(f"   Max positions:    {limits.max_concurrent_positions}")
    
    # Рассчитываем размер позиции
    size, r_usd = risk_mgr.calculate_position_size(
        entry_price=signal.entry,
        stop_price=signal.stop,
        contract_size=1.0  # Для BTC-PERP contract_size обычно 1.0
    )
    
    print(f"\n📐 SIZING РАСЧЕТ:")
    print(f"   Position size: {size:.4f} BTC")
    print(f"   Risk (1R):     ${r_usd:.2f}")
    print(f"   Notional:      ${size * signal.entry:,.2f}")
    print(f"   % of equity:   {(size * signal.entry / equity) * 100:.1f}%")
    
    # Проверяем можно ли открыть позицию
    # Для этого нужен EV_net (рассчитаем его далее, пока используем 0.1)
    can_open, reason = risk_mgr.can_open_position(
        market=signal.market,
        size=size,
        entry_price=signal.entry,
        r_usd=r_usd,
        current_ev_net=0.1  # Предположим EV_net = 0.1R (положительный)
    )
    
    print(f"\n🚦 ПРОВЕРКА ЛИМИТОВ:")
    print(f"   Can open: {'✅ YES' if can_open else '❌ NO'}")
    print(f"   Reason:   {reason}")
    
    # ========================================
    # 5) EV CALCULATION
    # ========================================
    print_section("5️⃣  Expected Value (EV) Calculation")
    
    # Создаем EV calculator
    ev_calc = EVCalculator(
        default_maker_bps=-1.5,  # Maker rebate (получаем 0.015%)
        default_taker_bps=4.5    # Taker fee (платим 0.045%)
    )
    
    print(f"💵 Fee structure:")
    print(f"   Maker: -1.5 bps (rebate)")
    print(f"   Taker: +4.5 bps (fee)")
    
    # Предположим статистику стратегии из бэктеста
    # (в реальности это будет из backtest результатов)
    win_rate = 0.45          # 45% winrate
    avg_win_r = 2.5          # В среднем берем 2.5R прибыли
    avg_loss_r = -1.0        # Проигрыши обычно 1R (срабатывает стоп)
    
    # Notional для расчета комиссий
    notional = size * signal.entry
    
    # Hold time для funding (предположим держим 1 день = 24 часа)
    hold_time_hours = 24.0
    
    # Funding rate (предположим 0.01% за 8 часов)
    funding_rate = 0.0001
    
    # Рассчитываем EV
    ev_result = ev_calc.calculate_ev_result(
        win_rate=win_rate,
        avg_win_r=avg_win_r,
        avg_loss_r=avg_loss_r,
        notional_in=notional,
        notional_out=notional,  # Предполагаем одинаковый размер
        fee_in_bps=None,  # Используем default maker
        fee_out_bps=None,  # Используем default maker
        funding_rate=funding_rate,
        hold_time_hours=hold_time_hours,
        slippage_bps=1.0,  # 1 bps slippage
        gas_usd=0.0,       # Hyperliquid = gasless
        r_usd=r_usd
    )
    
    print(f"\n📈 СТАТИСТИКА СТРАТЕГИИ:")
    print(f"   Win rate:     {win_rate*100:.1f}%")
    print(f"   Avg win:      {avg_win_r:.2f}R")
    print(f"   Avg loss:     {avg_loss_r:.2f}R")
    
    print(f"\n💸 ИЗДЕРЖКИ (в R-units):")
    print(f"   Fees:         {ev_result.fees_eff_r:+.4f}R  {'📈 rebate!' if ev_result.fees_eff_r < 0 else '📉 cost'}")
    print(f"   Funding:      {ev_result.funding_r:+.4f}R")
    print(f"   Slippage:     {ev_result.slippage_r:+.4f}R")
    print(f"   Gas:          {ev_result.gas_r:+.4f}R")
    print(f"   ─────────────────────────")
    print(f"   Total costs:  {ev_result.total_costs_r:+.4f}R")
    
    print(f"\n🎯 EXPECTED VALUE:")
    print(f"   EV gross:     {ev_result.ev_gross:+.4f}R")
    print(f"   EV net:       {ev_result.ev_net:+.4f}R")
    print(f"   Tradeable:    {'✅ YES' if ev_result.is_tradeable() else '❌ NO'}")
    
    # Интерпретация EV_net
    if ev_result.ev_net > 0:
        # Рассчитываем ожидаемую прибыль на сделку в долларах
        expected_profit_per_trade = ev_result.ev_net * r_usd
        print(f"\n✅ Стратегия ПРИБЫЛЬНА!")
        print(f"   Ожидаемая прибыль на сделку: ${expected_profit_per_trade:.2f}")
        print(f"   При 100 сделках: ${expected_profit_per_trade * 100:,.2f}")
    else:
        expected_loss_per_trade = ev_result.ev_net * r_usd
        print(f"\n❌ Стратегия УБЫТОЧНА!")
        print(f"   Ожидаемый убыток на сделку: ${expected_loss_per_trade:.2f}")
        print(f"   НЕ ТОРГОВАТЬ!")
    
    # ========================================
    # 6) РЕЗЮМЕ
    # ========================================
    print_section("6️⃣  Резюме полного цикла")
    
    print(f"📋 TRADE SETUP:")
    print(f"   Market:       {signal.market}")
    print(f"   Direction:    {signal.side.value.upper()}")
    print(f"   Entry:        ${signal.entry:.2f}")
    print(f"   Stop:         ${signal.stop:.2f}")
    print(f"   Target (2R):  ${signal.targets[0]:.2f}")
    print(f"   Size:         {size:.4f} BTC")
    print(f"   Risk:         ${r_usd:.2f} ({limits.per_trade_risk_pct}% of equity)")
    
    print(f"\n💡 DECISION:")
    if can_open and ev_result.is_tradeable():
        print(f"   ✅ МОЖНО ОТКРЫВАТЬ ПОЗИЦИЮ")
        print(f"   📊 EV_net = {ev_result.ev_net:.4f}R > 0")
        print(f"   🚦 Все risk limits OK")
    elif not can_open:
        print(f"   ❌ НЕЛЬЗЯ ОТКРЫВАТЬ ПОЗИЦИЮ")
        print(f"   🚫 Risk limit: {reason}")
    elif not ev_result.is_tradeable():
        print(f"   ❌ НЕЛЬЗЯ ОТКРЫВАТЬ ПОЗИЦИЮ")
        print(f"   📉 EV_net = {ev_result.ev_net:.4f}R ≤ 0")
    
    print_section("✅ Demo завершена успешно!")
    
    print(f"\n📚 Что мы показали:")
    print(f"   1. ✅ Генерация исторических данных")
    print(f"   2. ✅ Создание и работа стратегии Tortoise")
    print(f"   3. ✅ Генерация торговых сигналов")
    print(f"   4. ✅ Risk Management & Position Sizing (1% R)")
    print(f"   5. ✅ EV расчет с полными издержками")
    print(f"   6. ✅ Полный цикл: Signal → Sizing → EV check → Decision")
    
    print(f"\n🚀 Следующие шаги:")
    print(f"   - Подключить реальные данные с Hyperliquid")
    print(f"   - Реализовать полный backtest engine")
    print(f"   - Добавить Walk-Forward и Monte Carlo")
    print(f"   - Создать UI для визуализации")


# ===== ЗАПУСК =====

if __name__ == "__main__":
    # Запускаем main функцию
    main()

