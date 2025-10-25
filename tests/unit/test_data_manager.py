"""
Unit tests для DataManager.

DataManager - unified interface для работы с данными.
Объединяет HyperliquidClient, DataFetcher, DataStorage.
"""

import pytest
from unittest.mock import Mock, MagicMock, patch
import pandas as pd
from datetime import datetime, timedelta


class TestDataManager:
    """Тесты для DataManager."""
    
    @pytest.fixture
    def mock_client(self):
        """Mock HyperliquidClient."""
        return Mock()
    
    @pytest.fixture
    def mock_fetcher(self):
        """Mock DataFetcher."""
        fetcher = Mock()
        # По умолчанию возвращаем sample DataFrame
        fetcher.fetch_historical.return_value = pd.DataFrame({
            'timestamp': pd.to_datetime(['2022-01-01', '2022-01-02']),
            'open': [50000.0, 50500.0],
            'high': [51000.0, 52000.0],
            'low': [49000.0, 50000.0],
            'close': [50500.0, 51500.0],
            'volume': [1000.0, 1200.0]
        })
        return fetcher
    
    @pytest.fixture
    def mock_storage(self):
        """Mock DataStorage."""
        return Mock()
    
    @pytest.fixture
    def manager(self, mock_client, mock_fetcher, mock_storage):
        """DataManager с mock dependencies."""
        from core.data.manager import DataManager
        return DataManager(
            client=mock_client,
            fetcher=mock_fetcher,
            storage=mock_storage
        )
    
    def test_init_stores_dependencies(self, mock_client, mock_fetcher, mock_storage):
        """Тест: DataManager сохраняет все dependencies при инициализации."""
        from core.data.manager import DataManager
        
        manager = DataManager(
            client=mock_client,
            fetcher=mock_fetcher,
            storage=mock_storage
        )
        
        assert manager.client == mock_client
        assert manager.fetcher == mock_fetcher
        assert manager.storage == mock_storage
    
    def test_get_candles_loads_from_storage_if_exists(self, manager, mock_storage):
        """
        Тест: get_candles загружает из storage если данные существуют.
        
        Если данные есть локально, не должны делать API запрос.
        """
        # Setup: данные существуют
        mock_storage.exists.return_value = True
        mock_storage.load.return_value = pd.DataFrame({
            'timestamp': pd.to_datetime(['2022-01-01']),
            'close': [50000.0]
        })
        
        # Call
        df = manager.get_candles(market='BTC-PERP', interval='1d')
        
        # Verify: загрузили из storage
        mock_storage.exists.assert_called_once_with(market='BTC-PERP', interval='1d')
        mock_storage.load.assert_called_once()
        assert len(df) == 1
    
    def test_get_candles_fetches_if_not_exists(self, manager, mock_storage, mock_fetcher):
        """
        Тест: get_candles загружает с API если данных нет локально.
        
        Если данных нет, должны:
        1. Вызвать fetcher.fetch_historical
        2. Сохранить в storage
        """
        # Setup: данных нет
        mock_storage.exists.return_value = False
        
        # Call
        df = manager.get_candles(
            market='BTC-PERP',
            interval='1d',
            days_back=7
        )
        
        # Verify: загрузили с API
        mock_storage.exists.assert_called_once()
        mock_fetcher.fetch_historical.assert_called_once()
        
        # Verify: сохранили в storage
        mock_storage.save.assert_called_once()
        
        assert len(df) > 0
    
    def test_get_candles_with_force_refresh(self, manager, mock_storage, mock_fetcher):
        """
        Тест: get_candles с force_refresh=True всегда загружает с API.
        
        Даже если данные есть локально, должны перезагрузить с API.
        """
        # Setup: данные существуют
        mock_storage.exists.return_value = True
        
        # Call with force_refresh
        df = manager.get_candles(
            market='BTC-PERP',
            interval='1d',
            force_refresh=True
        )
        
        # Verify: не проверяли exists, сразу fetched
        # exists может быть вызван для других целей, но fetch должен быть вызван
        mock_fetcher.fetch_historical.assert_called_once()
        mock_storage.save.assert_called_once()
    
    def test_get_candles_validates_interval(self, manager):
        """Тест: get_candles валидирует interval."""
        with pytest.raises(ValueError, match="Invalid interval"):
            manager.get_candles(
                market='BTC-PERP',
                interval='invalid',
                days_back=7
            )
    
    def test_get_multiple_markets(self, manager, mock_storage, mock_fetcher):
        """
        Тест: get_multiple_markets загружает данные для нескольких рынков.
        
        Должны вызвать get_candles для каждого рынка.
        """
        # Setup
        markets = ['BTC-PERP', 'ETH-PERP']
        mock_storage.exists.return_value = False
        
        # Call
        result = manager.get_multiple_markets(
            markets=markets,
            interval='1d',
            days_back=7
        )
        
        # Verify
        assert len(result) == 2
        assert 'BTC-PERP' in result
        assert 'ETH-PERP' in result
        
        # Verify fetcher был вызван для каждого рынка
        assert mock_fetcher.fetch_historical.call_count == 2
    
    def test_update_candles_appends_new_data(self, manager, mock_storage, mock_fetcher):
        """
        Тест: update_candles добавляет только новые данные.
        
        Если у нас есть данные до 2022-01-05, а мы запрашиваем до 2022-01-10,
        должны загрузить только с 2022-01-06 по 2022-01-10.
        """
        # Setup: есть старые данные до 2022-01-05
        old_df = pd.DataFrame({
            'timestamp': pd.to_datetime(['2022-01-01', '2022-01-05']),
            'close': [50000.0, 51000.0]
        })
        mock_storage.exists.return_value = True
        mock_storage.load.return_value = old_df
        
        # Setup: новые данные
        new_df = pd.DataFrame({
            'timestamp': pd.to_datetime(['2022-01-06', '2022-01-10']),
            'close': [52000.0, 53000.0]
        })
        mock_fetcher.fetch_historical.return_value = new_df
        
        # Call
        df = manager.update_candles(
            market='BTC-PERP',
            interval='1d',
            end_date=datetime(2022, 1, 10)
        )
        
        # Verify: получили объединенные данные
        assert len(df) == 4  # 2 старых + 2 новых
        
        # Verify: fetcher вызван с правильным start_date (после последней свечи)
        call_args = mock_fetcher.fetch_historical.call_args
        # start_date должна быть после 2022-01-05
    
    def test_list_available_delegates_to_storage(self, manager, mock_storage):
        """Тест: list_available делегирует вызов в storage."""
        mock_storage.list_available.return_value = ['BTC-PERP/1d', 'ETH-PERP/1d']
        
        result = manager.list_available()
        
        mock_storage.list_available.assert_called_once()
        assert len(result) == 2
    
    def test_delete_delegates_to_storage(self, manager, mock_storage):
        """Тест: delete делегирует вызов в storage."""
        manager.delete(market='BTC-PERP', interval='1d')
        
        mock_storage.delete.assert_called_once_with(market='BTC-PERP', interval='1d')

