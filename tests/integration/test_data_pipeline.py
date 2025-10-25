"""
Integration test для полного data pipeline.

Тест проверяет:
1. Загрузку данных через HyperliquidClient
2. Обработку через DataFetcher
3. Сохранение через DataStorage
4. Загрузку обратно из Storage
"""

import pytest
import pandas as pd
from datetime import datetime, timedelta
import tempfile
import shutil
from pathlib import Path


pytestmark = pytest.mark.integration


class TestDataPipeline:
    """
    Интеграционные тесты для полного data pipeline.
    """
    
    @pytest.fixture(scope="class")
    def temp_storage_dir(self):
        """Временная директория для хранения данных."""
        temp_path = tempfile.mkdtemp()
        yield temp_path
        # Cleanup после всех тестов
        shutil.rmtree(temp_path)
    
    @pytest.fixture(scope="class")
    def client(self):
        """HyperliquidClient для реальных запросов."""
        from core.data.hyperliquid_client import HyperliquidClient
        return HyperliquidClient()
    
    @pytest.fixture(scope="class")
    def fetcher(self, client):
        """DataFetcher с реальным client."""
        from core.data.fetcher import DataFetcher
        return DataFetcher(client)
    
    @pytest.fixture(scope="class")
    def storage(self, temp_storage_dir):
        """DataStorage с временной директорией."""
        from core.data.storage import DataStorage
        return DataStorage(base_path=temp_storage_dir)
    
    def test_full_pipeline_btc(self, fetcher, storage):
        """
        Тест полного pipeline: fetch -> validate -> save -> load.
        
        Загружаем 7 дней BTC данных, валидируем, сохраняем и загружаем обратно.
        """
        print("\n🚀 Запуск full data pipeline для BTC...")
        
        # Step 1: Fetch data
        print("📥 Step 1: Загрузка данных с Hyperliquid...")
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        df = fetcher.fetch_historical(
            market='BTC-PERP',
            interval='1d',
            start_date=start_date,
            end_date=end_date,
            validate=True  # Включаем валидацию
        )
        
        # Проверяем что данные получены
        assert not df.empty, "DataFrame не должен быть пустым"
        assert len(df) >= 7, f"Ожидалось минимум 7 свечей, получено {len(df)}"
        print(f"✅ Получено {len(df)} свечей")
        
        # Step 2: Save data
        print("\n💾 Step 2: Сохранение в Parquet...")
        storage.save(df=df, market='BTC-PERP', interval='1d')
        
        # Проверяем что файл создан
        assert storage.exists(market='BTC-PERP', interval='1d'), "Файл должен существовать"
        print("✅ Данные сохранены")
        
        # Step 3: Load data
        print("\n📤 Step 3: Загрузка из Parquet...")
        loaded_df = storage.load(market='BTC-PERP', interval='1d')
        
        # Проверяем что данные загрузились
        assert loaded_df is not None, "Loaded DataFrame не должен быть None"
        assert len(loaded_df) == len(df), "Количество записей должно совпадать"
        print(f"✅ Загружено {len(loaded_df)} свечей")
        
        # Step 4: Verify data integrity
        print("\n🔍 Step 4: Проверка целостности данных...")
        
        # Проверяем колонки
        expected_cols = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        assert all(col in loaded_df.columns for col in expected_cols), "Все колонки должны присутствовать"
        
        # Проверяем типы данных
        assert pd.api.types.is_datetime64_any_dtype(loaded_df['timestamp']), "timestamp должен быть datetime"
        
        # Проверяем что цены положительные
        assert (loaded_df['close'] > 0).all(), "Все цены должны быть положительными"
        
        print("✅ Данные прошли проверку целостности")
        
        # Step 5: Display sample
        print("\n📊 Sample данных:")
        print(loaded_df.head(3))
        
        print("\n🎉 Full pipeline успешно завершен!")
    
    def test_multiple_markets_and_intervals(self, fetcher, storage):
        """
        Тест pipeline для множественных рынков и интервалов.
        
        Проверяем что можем работать с разными парами и интервалами одновременно.
        """
        print("\n🚀 Тест множественных рынков...")
        
        # Определяем конфигурации для теста
        configs = [
            {'market': 'BTC-PERP', 'interval': '1d', 'days': 7},
            {'market': 'ETH-PERP', 'interval': '1d', 'days': 7},
        ]
        
        for config in configs:
            print(f"\n📥 Загрузка {config['market']} ({config['interval']})...")
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=config['days'])
            
            # Fetch
            df = fetcher.fetch_historical(
                market=config['market'],
                interval=config['interval'],
                start_date=start_date,
                end_date=end_date,
                validate=True
            )
            
            assert not df.empty, f"DataFrame для {config['market']} не должен быть пустым"
            
            # Save
            storage.save(df=df, market=config['market'], interval=config['interval'])
            
            # Verify saved
            assert storage.exists(market=config['market'], interval=config['interval'])
            
            print(f"✅ {config['market']}/{config['interval']}: {len(df)} свечей сохранено")
        
        # Проверяем list_available
        print("\n📋 Проверка list_available...")
        available = storage.list_available()
        
        print(f"Доступные данные: {available}")
        
        assert 'BTC-PERP/1d' in available
        assert 'ETH-PERP/1d' in available
        
        print("\n🎉 Множественные рынки успешно обработаны!")
    
    def test_data_validation_detects_issues(self, fetcher):
        """
        Тест что валидация действительно работает.
        
        Создаем поддельные данные с ошибками и проверяем что валидация их находит.
        """
        print("\n🔍 Тест валидации данных...")
        
        # Создаем DataFrame с намеренными ошибками
        bad_df = pd.DataFrame({
            'timestamp': pd.to_datetime(['2022-01-01', '2022-01-02']),
            'open': [50000.0, 50500.0],
            'high': [49000.0, 50000.0],  # HIGH < LOW - ошибка!
            'low': [51000.0, 52000.0],
            'close': [50500.0, 51500.0],
            'volume': [1000.0, 1200.0]
        })
        
        # Валидируем
        errors = fetcher.validate_ohlc(bad_df)
        
        # Проверяем что ошибки найдены
        assert len(errors) > 0, "Валидация должна найти ошибки в плохих данных"
        print(f"✅ Валидация нашла {len(errors)} ошибок:")
        for err in errors:
            print(f"  - {err}")
        
        print("\n🎉 Валидация работает корректно!")

