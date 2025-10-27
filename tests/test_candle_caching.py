"""
Test Candle Caching System - проверка всех таймфреймов и кэширования.
"""

import requests
import time
from datetime import datetime


BASE_URL = "http://localhost:8080"
MARKETS = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP']
INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d']


def test_intervals():
    """Test intervals endpoint."""
    print("=" * 60)
    print("TEST: Supported Intervals")
    print("=" * 60)
    
    response = requests.get(f"{BASE_URL}/api/candles/intervals")
    assert response.status_code == 200
    
    data = response.json()
    print(f"✅ Intervals: {data['intervals']}")
    print(f"✅ Descriptions: {list(data['description'].keys())}")
    print()


def test_single_market_all_intervals():
    """Test fetching BTC-PERP for all intervals."""
    print("=" * 60)
    print("TEST: BTC-PERP All Intervals")
    print("=" * 60)
    
    results = []
    
    for interval in INTERVALS:
        start_time = time.time()
        
        response = requests.get(
            f"{BASE_URL}/api/candles/BTC-PERP/{interval}",
            params={'days_back': 7}
        )
        
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            results.append({
                'interval': interval,
                'count': data['count'],
                'from_cache': data['from_cache'],
                'time_ms': int(elapsed * 1000)
            })
            
            cache_status = "🟢 CACHE" if data['from_cache'] else "🔴 API"
            print(f"{interval:>4s} | {data['count']:>5d} candles | {elapsed*1000:>6.0f}ms | {cache_status}")
        else:
            print(f"{interval:>4s} | ❌ ERROR: {response.status_code}")
    
    print()
    return results


def test_cache_performance():
    """Test that second request is faster (cache hit)."""
    print("=" * 60)
    print("TEST: Cache Performance")
    print("=" * 60)
    
    market = 'BTC-PERP'
    interval = '1d'
    
    # First request (cold)
    start = time.time()
    r1 = requests.get(f"{BASE_URL}/api/candles/{market}/{interval}?days_back=30")
    time1 = time.time() - start
    data1 = r1.json()
    
    print(f"First request:  {time1*1000:.0f}ms | from_cache: {data1['from_cache']}")
    
    # Second request (should be cached)
    start = time.time()
    r2 = requests.get(f"{BASE_URL}/api/candles/{market}/{interval}?days_back=30")
    time2 = time.time() - start
    data2 = r2.json()
    
    print(f"Second request: {time2*1000:.0f}ms | from_cache: {data2['from_cache']}")
    
    speedup = time1 / time2 if time2 > 0 else 0
    print(f"Speedup: {speedup:.1f}x faster")
    
    assert data2['from_cache'] == True, "Second request should be from cache!"
    print("✅ Cache is working!")
    print()


def test_batch_request():
    """Test batch endpoint."""
    print("=" * 60)
    print("TEST: Batch Request (3 markets)")
    print("=" * 60)
    
    start = time.time()
    
    response = requests.post(
        f"{BASE_URL}/api/candles/batch",
        json={
            'markets': MARKETS,
            'interval': '1d',
            'days_back': 7
        }
    )
    
    elapsed = time.time() - start
    
    assert response.status_code == 200
    data = response.json()
    
    print(f"Total candles: {data['total_candles']}")
    print(f"Time: {elapsed*1000:.0f}ms")
    
    for market in MARKETS:
        market_data = data['data'][market]
        print(f"  {market}: {market_data['count']} candles (cache: {market_data['from_cache']})")
    
    print()


def test_data_integrity():
    """Test that candle data is valid."""
    print("=" * 60)
    print("TEST: Data Integrity")
    print("=" * 60)
    
    response = requests.get(f"{BASE_URL}/api/candles/BTC-PERP/1d?days_back=7")
    assert response.status_code == 200
    
    data = response.json()
    candles = data['candles']
    
    print(f"Checking {len(candles)} candles...")
    
    for i, candle in enumerate(candles):
        # Check required fields
        assert 'timestamp' in candle
        assert 'open' in candle
        assert 'high' in candle
        assert 'low' in candle
        assert 'close' in candle
        assert 'volume' in candle
        
        # Check OHLC relationships
        assert candle['high'] >= candle['open'], f"Candle {i}: high < open"
        assert candle['high'] >= candle['close'], f"Candle {i}: high < close"
        assert candle['high'] >= candle['low'], f"Candle {i}: high < low"
        assert candle['low'] <= candle['open'], f"Candle {i}: low > open"
        assert candle['low'] <= candle['close'], f"Candle {i}: low > close"
        
        # Check positive values
        assert candle['volume'] >= 0, f"Candle {i}: negative volume"
    
    print(f"✅ All {len(candles)} candles are valid!")
    print(f"✅ OHLC relationships correct")
    print(f"✅ No negative values")
    
    # Print sample candle
    sample = candles[0]
    print(f"\nSample candle:")
    print(f"  Time: {sample['timestamp']}")
    print(f"  O: {sample['open']:.2f}")
    print(f"  H: {sample['high']:.2f}")
    print(f"  L: {sample['low']:.2f}")
    print(f"  C: {sample['close']:.2f}")
    print(f"  V: {sample['volume']:.2f}")
    print()


def run_all_tests():
    """Run all tests."""
    print("\n" + "="*60)
    print("  🧪 TACITVS QUANT TERMINAL - CANDLE CACHE TESTS")
    print("="*60 + "\n")
    
    try:
        test_intervals()
        test_single_market_all_intervals()
        test_cache_performance()
        test_batch_request()
        test_data_integrity()
        
        print("="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Cannot connect to API at {BASE_URL}")
        print("   Make sure backend is running: python apps/api/main.py")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    run_all_tests()

