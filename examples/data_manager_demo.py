#!/usr/bin/env python3
"""
DataManager Demo - демонстрация работы с историческими данными.

Показывает:
1. Простая загрузка данных BTC
2. Кэширование (повторная загрузка быстрее)
3. Загрузка нескольких рынков
4. Обновление данных
5. Визуализация (опционально)
"""

import sys
from pathlib import Path

# Добавляем корневую директорию в path для импортов
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.data.manager import DataManager
import pandas as pd
from datetime import datetime


def demo_basic_usage():
    """Демо: базовое использование DataManager."""
    print("="*60)
    print("DEMO 1: Базовое использование DataManager")
    print("="*60)
    
    # Создаем DataManager (все dependencies создаются автоматически)
    manager = DataManager()
    
    print("\n📥 Загружаем BTC за последние 30 дней...")
    df = manager.get_candles(
        market='BTC-PERP',
        interval='1d',
        days_back=30
    )
    
    print(f"\n📊 Получено {len(df)} свечей")
    print("\nПервые 3 свечи:")
    print(df.head(3))
    
    print("\n📈 Статистика:")
    print(f"  Max price: ${df['high'].max():,.2f}")
    print(f"  Min price: ${df['low'].min():,.2f}")
    print(f"  Avg price: ${df['close'].mean():,.2f}")
    print(f"  Total volume: {df['volume'].sum():,.2f}")


def demo_caching():
    """Демо: кэширование данных."""
    print("\n\n" + "="*60)
    print("DEMO 2: Кэширование данных")
    print("="*60)
    
    manager = DataManager()
    
    print("\n⏱️  Первая загрузка BTC (с API)...")
    import time
    start = time.time()
    df1 = manager.get_candles(market='BTC-PERP', interval='1d', days_back=30)
    time1 = time.time() - start
    
    print(f"  Время: {time1:.2f}s")
    
    print("\n⏱️  Вторая загрузка BTC (из кэша)...")
    start = time.time()
    df2 = manager.get_candles(market='BTC-PERP', interval='1d', days_back=30)
    time2 = time.time() - start
    
    print(f"  Время: {time2:.2f}s")
    print(f"\n🚀 Ускорение: {time1/time2:.1f}x быстрее!")


def demo_multiple_markets():
    """Демо: загрузка нескольких рынков."""
    print("\n\n" + "="*60)
    print("DEMO 3: Множественные рынки")
    print("="*60)
    
    manager = DataManager()
    
    markets = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP']
    
    print(f"\n📊 Загружаем {len(markets)} рынков...")
    data = manager.get_multiple_markets(
        markets=markets,
        interval='1d',
        days_back=7
    )
    
    print("\n📈 Сравнение:")
    for market, df in data.items():
        last_close = df['close'].iloc[-1]
        first_close = df['close'].iloc[0]
        change_pct = ((last_close - first_close) / first_close) * 100
        
        emoji = "🟢" if change_pct > 0 else "🔴"
        print(f"  {emoji} {market:12s}: ${last_close:>10,.2f}  ({change_pct:>+6.2f}%)")


def demo_update_data():
    """Демо: обновление существующих данных."""
    print("\n\n" + "="*60)
    print("DEMO 4: Обновление данных")
    print("="*60)
    
    manager = DataManager()
    
    print("\n🔄 Обновляем BTC до последних данных...")
    df = manager.update_candles(
        market='BTC-PERP',
        interval='1d',
        end_date=datetime.now()
    )
    
    print(f"\n✅ Теперь имеем {len(df)} свечей")
    print("\nПоследние 3 свечи:")
    print(df.tail(3))


def demo_list_available():
    """Демо: список доступных данных."""
    print("\n\n" + "="*60)
    print("DEMO 5: Список доступных данных")
    print("="*60)
    
    manager = DataManager()
    
    available = manager.list_available()
    
    print(f"\n📋 Доступно {len(available)} datasets:")
    for dataset in available:
        print(f"  • {dataset}")


def demo_analysis():
    """Демо: простой анализ данных."""
    print("\n\n" + "="*60)
    print("DEMO 6: Простой анализ")
    print("="*60)
    
    manager = DataManager()
    
    print("\n📊 Анализ BTC за последние 30 дней...")
    df = manager.get_candles(market='BTC-PERP', interval='1d', days_back=30)
    
    # Вычисляем дневные изменения
    df['daily_change'] = df['close'].pct_change() * 100
    
    # Статистика
    print(f"\n📈 Волатильность:")
    print(f"  Средний дневной рост: {df['daily_change'].mean():>+6.2f}%")
    print(f"  Макс дневной рост:    {df['daily_change'].max():>+6.2f}%")
    print(f"  Макс дневное падение: {df['daily_change'].min():>+6.2f}%")
    print(f"  Ст. отклонение:       {df['daily_change'].std():>6.2f}%")
    
    # Лучшие и худшие дни
    best_day = df.loc[df['daily_change'].idxmax()]
    worst_day = df.loc[df['daily_change'].idxmin()]
    
    print(f"\n🟢 Лучший день:")
    print(f"  Дата: {best_day['timestamp'].date()}")
    print(f"  Рост: +{best_day['daily_change']:.2f}%")
    
    print(f"\n🔴 Худший день:")
    print(f"  Дата: {worst_day['timestamp'].date()}")
    print(f"  Падение: {worst_day['daily_change']:.2f}%")


def main():
    """Главная функция - запускает все демо."""
    print("""
╔════════════════════════════════════════════════════════════════╗
║              DataManager Demo - Tacitus Quant Terminal         ║
║                   Работа с историческими данными               ║
╚════════════════════════════════════════════════════════════════╝
""")
    
    try:
        # Запускаем все демо по очереди
        demo_basic_usage()
        demo_caching()
        demo_multiple_markets()
        demo_update_data()
        demo_list_available()
        demo_analysis()
        
        print("\n\n" + "="*60)
        print("🎉 Все демо успешно завершены!")
        print("="*60)
        
        print("""
💡 Следующие шаги:
   1. Попробуйте изменить параметры (markets, intervals, days_back)
   2. Интегрируйте с вашими стратегиями
   3. Используйте данные для backtesting
   
📚 Документация: docs/week-02/WEEK_02_PROGRESS.md
""")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Демо прервано пользователем")
    except Exception as e:
        print(f"\n\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()

