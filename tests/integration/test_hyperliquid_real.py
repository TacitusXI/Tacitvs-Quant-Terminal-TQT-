"""
Integration test с REAL Hyperliquid API.

⚠️ Slow test - делает настоящие API запросы!
"""

import pytest
import pandas as pd
from core.data.hyperliquid_client import HyperliquidClient
from datetime import datetime, timedelta


@pytest.mark.integration
@pytest.mark.slow
class TestHyperliquidRealAPI:
    """
    Integration tests с real API.
    
    Запуск: pytest -m integration tests/integration/test_hyperliquid_real.py
    """
    
    def test_get_candles_btc_real_api(self):
        """
        TEST: Загрузка реальных BTC свечей с Hyperliquid.
        
        Загружаем последние 7 дней 1d candles для BTC.
        Проверяем что данные валидны.
        """
        client = HyperliquidClient()
        
        # Calculate time range (last 7 days)
        end_time = int(datetime.now().timestamp() * 1000)
        start_time = int((datetime.now() - timedelta(days=7)).timestamp() * 1000)
        
        print(f"\n🔄 Загружаем BTC свечи...")
        print(f"   Start: {datetime.fromtimestamp(start_time/1000)}")
        print(f"   End: {datetime.fromtimestamp(end_time/1000)}")
        
        # Download candles
        df = client.get_candles(
            coin='BTC',
            interval='1d',
            start_time=start_time,
            end_time=end_time
        )
        
        print(f"✅ Загружено {len(df)} свечей")
        
        # Verify data
        assert len(df) >= 6, f"Expected >= 6 candles, got {len(df)}"
        assert len(df) <= 8, f"Expected <= 8 candles, got {len(df)}"
        
        # Check columns
        assert list(df.columns) == ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        
        # Check data types
        # timestamp теперь datetime после обработки в client (Week 2 change)
        assert pd.api.types.is_datetime64_any_dtype(df['timestamp'])
        assert df['open'].dtype == 'float64'
        
        # Check OHLC relationships
        assert (df['high'] >= df['open']).all(), "Some high < open"
        assert (df['high'] >= df['close']).all(), "Some high < close"
        assert (df['low'] <= df['open']).all(), "Some low > open"
        assert (df['low'] <= df['close']).all(), "Some low > close"
        
        # Check volume >= 0
        assert (df['volume'] >= 0).all(), "Some volume < 0"
        
        # Check prices are reasonable (BTC should be > $10k)
        assert (df['close'] > 10000).all(), "BTC price < $10k (unrealistic)"
        
        print(f"\n📊 Последняя свеча:")
        print(f"   Close: ${df['close'].iloc[-1]:,.2f}")
        print(f"   Volume: {df['volume'].iloc[-1]:,.0f}")
        
        print("\n✅ Все проверки прошли!")


if __name__ == '__main__':
    # Можно запустить напрямую для быстрой проверки
    test = TestHyperliquidRealAPI()
    test.test_get_candles_btc_real_api()

