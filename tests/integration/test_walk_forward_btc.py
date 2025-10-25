"""
Integration test: Walk-Forward с реальными BTC данными.

Демонстрирует:
- Как данные разделяются на train/test
- Разницу между anchored и rolling
- Визуализацию splits
"""

import pytest
from datetime import datetime


pytestmark = pytest.mark.integration


class TestWalkForwardBTC:
    """Walk-Forward analysis на реальных BTC данных."""
    
    @pytest.fixture(scope="class")
    def btc_data(self):
        """Загрузка 6 месяцев BTC данных."""
        from core.data.manager import DataManager
        
        manager = DataManager()
        df = manager.get_candles(
            market='BTC-PERP',
            interval='1d',
            days_back=180
        )
        
        return df
    
    def test_rolling_window_splits_btc(self, btc_data):
        """
        Тест: Rolling window на BTC данных.
        
        Демонстрирует как данные разделяются.
        """
        from core.research.walk_forward import WalkForwardSplitter
        
        print(f"\n📊 BTC данных: {len(btc_data)} дней")
        print(f"   Период: {btc_data['timestamp'].iloc[0].date()} - {btc_data['timestamp'].iloc[-1].date()}")
        
        # Создаем splitter
        splitter = WalkForwardSplitter(
            train_days=90,   # 3 месяца обучения
            test_days=30,    # 1 месяц тестирования
            step_days=30,    # Сдвиг на 1 месяц
            anchored=False   # Rolling window
        )
        
        print(f"\n📐 Splitter: {splitter}")
        
        # Разделяем данные
        splits = splitter.split(btc_data)
        
        print(f"\n✅ Создано {len(splits)} splits")
        
        # Получаем метаданные
        split_info = splitter.get_split_info(splits)
        
        # Выводим информацию о каждом split
        print(f"\n{'='*70}")
        print(f"{'Split':<8} {'Train Period':<30} {'Test Period':<30}")
        print(f"{'='*70}")
        
        for info in split_info:
            train_period = f"{info['train_start'].date()} - {info['train_end'].date()}"
            test_period = f"{info['test_start'].date()} - {info['test_end'].date()}"
            print(f"#{info['split_id']:<7} {train_period:<30} {test_period:<30}")
        
        print(f"{'='*70}")
        
        # Проверки
        assert len(splits) > 0, "Должен быть минимум один split"
        
        # Каждый split должен иметь правильные размеры
        for split in splits:
            assert len(split['train']) == 90, "Train должен быть 90 дней"
            assert len(split['test']) == 30, "Test должен быть 30 дней"
        
        print(f"\n✅ Все splits валидны!")
    
    def test_anchored_window_splits_btc(self, btc_data):
        """
        Тест: Anchored window на BTC данных.
        
        Показывает как train window растет.
        """
        from core.research.walk_forward import WalkForwardSplitter
        
        print(f"\n📊 Anchored Window Analysis")
        
        splitter = WalkForwardSplitter(
            train_days=90,
            test_days=30,
            step_days=30,
            anchored=True    # Anchored mode
        )
        
        splits = splitter.split(btc_data)
        split_info = splitter.get_split_info(splits)
        
        print(f"\n✅ Создано {len(splits)} anchored splits")
        print(f"\n{'='*80}")
        print(f"{'Split':<8} {'Train Size':<12} {'Train Period':<35} {'Test Period':<20}")
        print(f"{'='*80}")
        
        for info in split_info:
            train_period = f"{info['train_start'].date()} - {info['train_end'].date()}"
            test_period = f"{info['test_start'].date()} - {info['test_end'].date()}"
            print(f"#{info['split_id']:<7} {info['train_size']:<12} {train_period:<35} {test_period:<20}")
        
        print(f"{'='*80}")
        
        # Проверяем что train растет
        if len(splits) >= 2:
            first_train_size = len(splits[0]['train'])
            second_train_size = len(splits[1]['train'])
            
            assert second_train_size > first_train_size, "Anchored train должен расти"
            print(f"\n✅ Train window растет: {first_train_size} → {second_train_size} дней")
    
    def test_compare_modes(self, btc_data):
        """
        Тест: Сравнение Rolling vs Anchored.
        
        Показывает разницу между режимами.
        """
        from core.research.walk_forward import WalkForwardSplitter
        
        print(f"\n🔬 Сравнение Rolling vs Anchored")
        
        # Rolling
        rolling_splitter = WalkForwardSplitter(
            train_days=90, test_days=30, step_days=30, anchored=False
        )
        rolling_splits = rolling_splitter.split(btc_data)
        
        # Anchored
        anchored_splitter = WalkForwardSplitter(
            train_days=90, test_days=30, step_days=30, anchored=True
        )
        anchored_splits = anchored_splitter.split(btc_data)
        
        print(f"\n📊 Результаты:")
        print(f"   Rolling:  {len(rolling_splits)} splits")
        print(f"   Anchored: {len(anchored_splits)} splits")
        
        print(f"\n📈 Размеры train windows:")
        print(f"   Rolling:  все по {len(rolling_splits[0]['train'])} дней")
        print(f"   Anchored: от {len(anchored_splits[0]['train'])} до {len(anchored_splits[-1]['train'])} дней")
        
        # Rolling имеет фиксированный размер train
        rolling_train_sizes = [len(s['train']) for s in rolling_splits]
        assert len(set(rolling_train_sizes)) == 1, "Rolling train должен быть одинакового размера"
        
        # Anchored растет
        anchored_train_sizes = [len(s['train']) for s in anchored_splits]
        assert anchored_train_sizes == sorted(anchored_train_sizes), "Anchored train должен расти"
        
        print(f"\n✅ Режимы работают корректно!")

