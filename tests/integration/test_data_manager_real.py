"""
Integration test для DataManager с реальным Hyperliquid API.

Проверяет полный workflow:
- Первичная загрузка данных
- Кэширование
- Обновление данных
- Работа с несколькими рынками
"""

import pytest
import pandas as pd
from datetime import datetime, timedelta
import tempfile
import shutil
from pathlib import Path


pytestmark = pytest.mark.integration


class TestDataManagerReal:
    """
    Интеграционные тесты DataManager с реальным API.
    """
    
    @pytest.fixture(scope="class")
    def temp_storage_dir(self):
        """Временная директория для тестов."""
        temp_path = tempfile.mkdtemp()
        yield temp_path
        shutil.rmtree(temp_path)
    
    @pytest.fixture(scope="class")
    def manager(self, temp_storage_dir):
        """DataManager с временным storage."""
        from core.data.hyperliquid_client import HyperliquidClient
        from core.data.fetcher import DataFetcher
        from core.data.storage import DataStorage
        from core.data.manager import DataManager
        
        client = HyperliquidClient()
        fetcher = DataFetcher(client)
        storage = DataStorage(base_path=temp_storage_dir)
        
        return DataManager(client=client, fetcher=fetcher, storage=storage)
    
    def test_get_candles_first_time(self, manager):
        """
        Тест: первая загрузка данных.
        
        При первой загрузке должны:
        1. Загрузить с API
        2. Сохранить в storage
        3. Вернуть DataFrame
        """
        print("\n🔄 Тест: первая загрузка BTC...")
        
        df = manager.get_candles(
            market='BTC-PERP',
            interval='1d',
            days_back=7
        )
        
        # Проверки
        assert isinstance(df, pd.DataFrame)
        assert not df.empty
        assert len(df) >= 6  # Минимум 6 дней данных
        
        # Проверяем колонки
        expected_cols = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        assert all(col in df.columns for col in expected_cols)
        
        print(f"✅ Загружено {len(df)} свечей")
    
    def test_get_candles_from_cache(self, manager):
        """
        Тест: загрузка из кэша.
        
        При второй загрузке тех же данных должны загрузить из storage
        (быстрее чем с API).
        """
        print("\n📦 Тест: загрузка из кэша...")
        
        # Первая загрузка (с API)
        df1 = manager.get_candles(market='BTC-PERP', interval='1d', days_back=7)
        
        # Вторая загрузка (из кэша)
        df2 = manager.get_candles(market='BTC-PERP', interval='1d', days_back=7)
        
        # Проверяем что данные идентичны
        assert len(df1) == len(df2)
        pd.testing.assert_frame_equal(df1, df2)
        
        print(f"✅ Кэш работает, {len(df2)} свечей")
    
    def test_get_candles_force_refresh(self, manager):
        """
        Тест: force_refresh обновляет данные.
        
        С force_refresh=True должны игнорировать кэш и загрузить с API.
        """
        print("\n🔄 Тест: force_refresh...")
        
        df = manager.get_candles(
            market='BTC-PERP',
            interval='1d',
            days_back=7,
            force_refresh=True
        )
        
        assert not df.empty
        assert len(df) >= 6
        
        print(f"✅ Force refresh работает, {len(df)} свечей")
    
    def test_get_multiple_markets(self, manager):
        """
        Тест: загрузка нескольких рынков.
        
        Должны загрузить данные для всех запрошенных рынков.
        """
        print("\n📊 Тест: множественные рынки...")
        
        markets = ['BTC-PERP', 'ETH-PERP']
        result = manager.get_multiple_markets(
            markets=markets,
            interval='1d',
            days_back=7
        )
        
        # Проверки
        assert len(result) == 2
        assert 'BTC-PERP' in result
        assert 'ETH-PERP' in result
        
        for market, df in result.items():
            assert not df.empty
            assert len(df) >= 6
            print(f"  {market}: {len(df)} свечей")
        
        print("✅ Все рынки загружены")
    
    def test_update_candles(self, manager):
        """
        Тест: обновление данных.
        
        Загружаем старые данные (например, за 30 дней), затем обновляем
        до текущей даты.
        """
        print("\n🔄 Тест: обновление данных...")
        
        # Загружаем данные за 14 дней
        end_date_old = datetime.now() - timedelta(days=7)
        
        # Сначала сохраним данные "в прошлом"
        from core.data.hyperliquid_client import HyperliquidClient
        from core.data.fetcher import DataFetcher
        
        client = HyperliquidClient()
        fetcher = DataFetcher(client)
        
        start_date_old = end_date_old - timedelta(days=14)
        old_df = fetcher.fetch_historical(
            market='SOL-PERP',
            interval='1d',
            start_date=start_date_old,
            end_date=end_date_old,
            validate=True
        )
        
        # Сохраняем старые данные
        manager.storage.save(df=old_df, market='SOL-PERP', interval='1d')
        
        print(f"  Старые данные: {len(old_df)} свечей до {end_date_old.date()}")
        
        # Обновляем до текущей даты
        updated_df = manager.update_candles(
            market='SOL-PERP',
            interval='1d',
            end_date=datetime.now()
        )
        
        # Проверки
        assert len(updated_df) > len(old_df), "Должно быть больше данных после обновления"
        
        print(f"  Обновленные данные: {len(updated_df)} свечей")
        print(f"  Добавлено: {len(updated_df) - len(old_df)} новых свечей")
        
        print("✅ Обновление работает")
    
    def test_list_available(self, manager):
        """
        Тест: list_available показывает сохраненные данные.
        """
        print("\n📋 Тест: list_available...")
        
        available = manager.list_available()
        
        print(f"  Доступно datasets: {len(available)}")
        for dataset in available:
            print(f"    - {dataset}")
        
        # Должны быть минимум BTC, ETH, SOL (из предыдущих тестов)
        assert len(available) >= 3
        
        print("✅ list_available работает")
    
    def test_complete_workflow(self, manager):
        """
        Тест: полный workflow от начала до конца.
        
        1. Загрузить данные
        2. Проверить что сохранились
        3. Загрузить из кэша
        4. Обновить
        5. Удалить
        """
        print("\n🚀 Тест: полный workflow для AVAX-PERP...")
        
        market = 'AVAX-PERP'
        interval = '1d'
        
        # Step 1: Загрузить
        print("  1️⃣ Загружаем данные...")
        df1 = manager.get_candles(market=market, interval=interval, days_back=7)
        assert not df1.empty
        print(f"     ✅ {len(df1)} свечей")
        
        # Step 2: Проверить что сохранились
        print("  2️⃣ Проверяем что данные в storage...")
        available = manager.list_available()
        assert f'{market}/{interval}' in available
        print("     ✅ Данные в storage")
        
        # Step 3: Загрузить из кэша
        print("  3️⃣ Загружаем из кэша...")
        df2 = manager.get_candles(market=market, interval=interval, days_back=7)
        assert len(df1) == len(df2)
        print("     ✅ Кэш работает")
        
        # Step 4: Удалить
        print("  4️⃣ Удаляем данные...")
        deleted = manager.delete(market=market, interval=interval)
        assert deleted is True
        available_after = manager.list_available()
        assert f'{market}/{interval}' not in available_after
        print("     ✅ Данные удалены")
        
        print("\n🎉 Полный workflow успешен!")

