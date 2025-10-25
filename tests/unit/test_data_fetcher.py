"""
Unit tests для DataFetcher.

Тестируем:
- Chunking logic
- Date validation
- OHLC validation
- Gap detection
"""

import pytest
from unittest.mock import Mock, patch
import pandas as pd
from datetime import datetime, timedelta


class TestDataFetcher:
    """Тесты для DataFetcher."""
    
    @pytest.fixture
    def mock_client(self):
        """Mock HyperliquidClient для тестов."""
        client = Mock()
        # Mock get_candles возвращает dummy data
        client.get_candles.return_value = pd.DataFrame({
            'timestamp': [1640000000000, 1640086400000],
            'open': [50000.0, 50500.0],
            'high': [51000.0, 52000.0],
            'low': [49000.0, 50000.0],
            'close': [50500.0, 51500.0],
            'volume': [1000.0, 1200.0]
        })
        return client
    
    @pytest.fixture
    def fetcher(self, mock_client):
        """DataFetcher с mock client."""
        from core.data.fetcher import DataFetcher
        return DataFetcher(mock_client)
    
    def test_init_stores_client(self, mock_client):
        """Тест: DataFetcher сохраняет client при инициализации."""
        from core.data.fetcher import DataFetcher
        
        fetcher = DataFetcher(mock_client)
        
        assert fetcher.client == mock_client
    
    def test_fetch_historical_validates_dates(self, fetcher):
        """
        Тест: fetch_historical валидирует даты.
        
        start_date должна быть раньше end_date.
        """
        with pytest.raises(ValueError, match="start_date must be before end_date"):
            fetcher.fetch_historical(
                market='BTC-PERP',
                interval='1d',
                start_date='2024-01-01',
                end_date='2022-01-01'  # Wrong!
            )
    
    def test_fetch_historical_returns_dataframe(self, fetcher, mock_client):
        """
        Тест: fetch_historical возвращает DataFrame.
        
        Проверяем что client вызван и результат это DataFrame.
        """
        df = fetcher.fetch_historical(
            market='BTC-PERP',
            interval='1d',
            start_date='2022-01-01',
            end_date='2022-01-10'
        )
        
        assert isinstance(df, pd.DataFrame)
        assert len(df) > 0
        mock_client.get_candles.assert_called()
    
    def test_validate_ohlc_detects_high_less_than_low(self, fetcher):
        """
        Тест: validate_ohlc находит ошибку high < low.
        
        Это физически невозможно - должна быть ошибка.
        """
        # Bad data: high < low
        bad_df = pd.DataFrame({
            'timestamp': [1640000000000],
            'open': [50000.0],
            'high': [49000.0],  # HIGH < LOW!
            'low': [51000.0],
            'close': [50500.0],
            'volume': [1000.0]
        })
        
        errors = fetcher.validate_ohlc(bad_df)
        
        assert len(errors) > 0
        assert any('high' in err.lower() and 'low' in err.lower() for err in errors)
    
    def test_validate_ohlc_detects_high_less_than_close(self, fetcher):
        """Тест: validate_ohlc находит ошибку high < close."""
        bad_df = pd.DataFrame({
            'timestamp': [1640000000000],
            'open': [50000.0],
            'high': [50000.0],  # HIGH < CLOSE!
            'low': [49000.0],
            'close': [51000.0],
            'volume': [1000.0]
        })
        
        errors = fetcher.validate_ohlc(bad_df)
        
        assert len(errors) > 0
        assert any('high' in err.lower() for err in errors)
    
    def test_validate_ohlc_accepts_valid_data(self, fetcher):
        """Тест: validate_ohlc не выдает ошибок для валидных данных."""
        good_df = pd.DataFrame({
            'timestamp': [1640000000000],
            'open': [50000.0],
            'high': [52000.0],  # high >= all
            'low': [48000.0],   # low <= all
            'close': [51000.0],
            'volume': [1000.0]
        })
        
        errors = fetcher.validate_ohlc(good_df)
        
        assert len(errors) == 0
    
    def test_check_gaps_detects_missing_candle(self, fetcher):
        """
        Тест: check_gaps находит пропущенные свечи.
        
        Для 1d interval каждая свеча должна быть +86400000ms от предыдущей.
        """
        # Data with gap (missing one day)
        df_with_gap = pd.DataFrame({
            'timestamp': [
                1640000000000,
                1640086400000,  # +1 day OK
                1640259200000   # +2 days SKIP! (should be 1640172800000)
            ],
            'open': [50000.0, 50500.0, 51000.0],
            'high': [51000.0, 52000.0, 53000.0],
            'low': [49000.0, 50000.0, 50500.0],
            'close': [50500.0, 51500.0, 52500.0],
            'volume': [1000.0, 1200.0, 1100.0]
        })
        
        gaps = fetcher.check_gaps(df_with_gap, interval='1d')
        
        assert len(gaps) == 1
        assert gaps[0] == 2  # Gap at index 2
    
    def test_check_gaps_no_gaps_in_continuous_data(self, fetcher):
        """Тест: check_gaps не находит gaps в непрерывных данных."""
        continuous_df = pd.DataFrame({
            'timestamp': [
                1640000000000,
                1640086400000,  # +1 day
                1640172800000   # +1 day
            ],
            'open': [50000.0, 50500.0, 51000.0],
            'high': [51000.0, 52000.0, 53000.0],
            'low': [49000.0, 50000.0, 50500.0],
            'close': [50500.0, 51500.0, 52500.0],
            'volume': [1000.0, 1200.0, 1100.0]
        })
        
        gaps = fetcher.check_gaps(continuous_df, interval='1d')
        
        assert len(gaps) == 0

