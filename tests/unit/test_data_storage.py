"""
Unit tests для DataStorage (Parquet сохранение/загрузка).

Тестируем:
- Сохранение DataFrame в Parquet
- Загрузку DataFrame из Parquet
- Проверку существования файлов
- Обновление существующих данных
"""

import pytest
import pandas as pd
from pathlib import Path
import tempfile
import shutil


class TestDataStorage:
    """Тесты для DataStorage."""
    
    @pytest.fixture
    def temp_dir(self):
        """Временная директория для тестов."""
        temp_path = tempfile.mkdtemp()
        yield temp_path
        # Cleanup после теста
        shutil.rmtree(temp_path)
    
    @pytest.fixture
    def storage(self, temp_dir):
        """DataStorage с временной директорией."""
        from core.data.storage import DataStorage
        return DataStorage(base_path=temp_dir)
    
    @pytest.fixture
    def sample_df(self):
        """Sample DataFrame для тестов."""
        return pd.DataFrame({
            'timestamp': pd.to_datetime(['2022-01-01', '2022-01-02', '2022-01-03']),
            'open': [50000.0, 50500.0, 51000.0],
            'high': [51000.0, 52000.0, 53000.0],
            'low': [49000.0, 50000.0, 50500.0],
            'close': [50500.0, 51500.0, 52500.0],
            'volume': [1000.0, 1200.0, 1100.0]
        })
    
    def test_init_creates_base_path(self, temp_dir):
        """Тест: DataStorage создает базовую директорию при инициализации."""
        from core.data.storage import DataStorage
        
        new_path = Path(temp_dir) / "new_storage"
        storage = DataStorage(base_path=str(new_path))
        
        assert new_path.exists()
        assert storage.base_path == new_path
    
    def test_save_loads_dataframe(self, storage, sample_df, temp_dir):
        """
        Тест: save сохраняет DataFrame в Parquet и load загружает его обратно.
        
        Данные должны остаться идентичными после сохранения/загрузки.
        """
        # Сохраняем
        storage.save(
            df=sample_df,
            market='BTC-PERP',
            interval='1d'
        )
        
        # Проверяем что файл создан
        expected_file = Path(temp_dir) / 'BTC-PERP' / '1d.parquet'
        assert expected_file.exists()
        
        # Загружаем обратно
        loaded_df = storage.load(market='BTC-PERP', interval='1d')
        
        # Проверяем что данные идентичны
        assert loaded_df is not None
        assert len(loaded_df) == len(sample_df)
        pd.testing.assert_frame_equal(loaded_df, sample_df)
    
    def test_exists_returns_true_for_existing_file(self, storage, sample_df):
        """Тест: exists возвращает True для существующего файла."""
        # Сохраняем файл
        storage.save(df=sample_df, market='BTC-PERP', interval='1d')
        
        # Проверяем что exists возвращает True
        assert storage.exists(market='BTC-PERP', interval='1d') is True
    
    def test_exists_returns_false_for_missing_file(self, storage):
        """Тест: exists возвращает False для несуществующего файла."""
        assert storage.exists(market='BTC-PERP', interval='1d') is False
    
    def test_load_returns_none_for_missing_file(self, storage):
        """Тест: load возвращает None для несуществующего файла."""
        result = storage.load(market='BTC-PERP', interval='1d')
        
        assert result is None
    
    def test_save_overwrites_existing_file(self, storage, sample_df):
        """
        Тест: save перезаписывает существующий файл.
        
        При повторном сохранении старые данные должны быть заменены.
        """
        # Первое сохранение
        storage.save(df=sample_df, market='BTC-PERP', interval='1d')
        
        # Второе сохранение с другими данными
        new_df = sample_df.copy()
        new_df['close'] = [99999.0, 99999.0, 99999.0]  # Изменяем данные
        
        storage.save(df=new_df, market='BTC-PERP', interval='1d')
        
        # Загружаем и проверяем что данные обновились
        loaded_df = storage.load(market='BTC-PERP', interval='1d')
        
        assert loaded_df['close'].iloc[0] == 99999.0
    
    def test_list_available_returns_saved_markets(self, storage, sample_df):
        """Тест: list_available возвращает список сохраненных рынков."""
        # Сохраняем несколько рынков
        storage.save(df=sample_df, market='BTC-PERP', interval='1d')
        storage.save(df=sample_df, market='ETH-PERP', interval='1d')
        storage.save(df=sample_df, market='BTC-PERP', interval='4h')
        
        available = storage.list_available()
        
        # Проверяем что все рынки в списке
        assert 'BTC-PERP/1d' in available
        assert 'ETH-PERP/1d' in available
        assert 'BTC-PERP/4h' in available
        assert len(available) == 3
    
    def test_delete_removes_file(self, storage, sample_df, temp_dir):
        """Тест: delete удаляет файл."""
        # Сохраняем файл
        storage.save(df=sample_df, market='BTC-PERP', interval='1d')
        
        # Проверяем что файл существует
        assert storage.exists(market='BTC-PERP', interval='1d') is True
        
        # Удаляем
        storage.delete(market='BTC-PERP', interval='1d')
        
        # Проверяем что файл удален
        assert storage.exists(market='BTC-PERP', interval='1d') is False

