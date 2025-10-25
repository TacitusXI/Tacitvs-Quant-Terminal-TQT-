"""
Unit tests для Hyperliquid API client.

Test-First подход: пишем тесты ДО кода.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import pandas as pd


class TestHyperliquidClient:
    """Тесты для HyperliquidClient."""
    
    def test_init_creates_session(self):
        """
        Тест: client создаёт requests.Session при инициализации.
        
        Проверяем:
        - Session создан
        - Base URL установлен правильно
        """
        from core.data.hyperliquid_client import HyperliquidClient
        
        client = HyperliquidClient()
        
        assert client.session is not None
        assert client.base_url == "https://api.hyperliquid.xyz"
    
    @patch('requests.Session.post')
    def test_get_candles_success(self, mock_post):
        """
        Тест: get_candles возвращает DataFrame при успешном запросе.
        
        Mock: API возвращает корректные данные
        Проверяем: DataFrame имеет правильные колонки и типы
        """
        from core.data.hyperliquid_client import HyperliquidClient
        
        # Setup mock response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {
                "t": 1640000000000,  # timestamp
                "o": "50000.0",      # open
                "h": "51000.0",      # high
                "l": "49000.0",      # low
                "c": "50500.0",      # close
                "v": "1000.0"        # volume
            },
            {
                "t": 1640086400000,
                "o": "50500.0",
                "h": "52000.0",
                "l": "50000.0",
                "c": "51500.0",
                "v": "1200.0"
            }
        ]
        mock_post.return_value = mock_response
        
        # Execute
        client = HyperliquidClient()
        df = client.get_candles(
            coin='BTC',
            interval='1d',
            start_time=1640000000000,
            end_time=1640172800000
        )
        
        # Verify
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 2
        assert list(df.columns) == ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        # timestamp теперь datetime после обработки в client
        assert pd.api.types.is_datetime64_any_dtype(df['timestamp'])
        assert df['close'].iloc[0] == 50500.0
        
        # Verify API was called correctly
        mock_post.assert_called_once()
        call_args = mock_post.call_args
        assert 'https://api.hyperliquid.xyz/info' in str(call_args)
    
    def test_get_candles_validates_interval(self):
        """
        Тест: client валидирует interval перед запросом.
        
        Allowed: 1m, 5m, 15m, 1h, 4h, 1d
        Invalid interval должен вызвать ValueError
        """
        from core.data.hyperliquid_client import HyperliquidClient
        
        client = HyperliquidClient()
        
        with pytest.raises(ValueError, match="Invalid interval"):
            client.get_candles('BTC', '3h', 0, 1000)  # 3h не поддерживается

