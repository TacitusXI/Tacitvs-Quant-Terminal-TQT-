#!/usr/bin/env python3
"""
🚀 Preload Historical Data - массовая загрузка исторических данных.

Загружает данные с Hyperliquid и сохраняет в Parquet файлы для быстрого доступа.

Usage:
    python scripts/preload_historical_data.py --markets BTC-PERP,ETH-PERP --days 365
    python scripts/preload_historical_data.py --all-markets --days 180
    python scripts/preload_historical_data.py --config config.yaml
"""

import sys
from pathlib import Path
import argparse
from datetime import datetime, timedelta
import time

# Add project root to path
ROOT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT_DIR))

from core.data.manager import DataManager
from core.data.hyperliquid_client import HyperliquidClient


# Popular markets
POPULAR_MARKETS = [
    'BTC-PERP',
    'ETH-PERP',
    'SOL-PERP',
    'AVAX-PERP',
    'MATIC-PERP',
    'ARB-PERP',
    'OP-PERP',
    'DOGE-PERP',
]

# All supported intervals
ALL_INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d']


def preload_market_data(
    market: str,
    intervals: list[str],
    days_back: int,
    data_manager: DataManager,
    force: bool = False
):
    """
    Загрузить данные для одного рынка по всем таймфреймам.
    
    Args:
        market: Рынок (например 'BTC-PERP')
        intervals: Список интервалов для загрузки
        days_back: Количество дней истории
        data_manager: DataManager instance
        force: Перезаписать существующие данные
    """
    print(f"\n{'='*60}")
    print(f"📊 {market}")
    print(f"{'='*60}")
    
    for interval in intervals:
        try:
            # Check if data already exists
            if not force and data_manager.storage.exists(market, interval):
                print(f"  {interval:>4s} | ✅ Already cached (use --force to reload)")
                continue
            
            start_time = time.time()
            
            # Fetch data
            print(f"  {interval:>4s} | 📥 Fetching from Hyperliquid...", end='', flush=True)
            
            df = data_manager.get_candles(
                market=market,
                interval=interval,
                days_back=days_back,
                force_refresh=force
            )
            
            elapsed = time.time() - start_time
            
            if df is not None and len(df) > 0:
                # Get file size
                file_path = data_manager.storage._get_file_path(market, interval)
                file_size = file_path.stat().st_size if file_path.exists() else 0
                file_size_kb = file_size / 1024
                
                print(f"\r  {interval:>4s} | ✅ {len(df):>5d} candles | {elapsed:>5.1f}s | {file_size_kb:>6.1f} KB")
            else:
                print(f"\r  {interval:>4s} | ❌ No data available")
                
        except Exception as e:
            print(f"\r  {interval:>4s} | ❌ Error: {e}")
        
        # Small delay to avoid rate limits
        time.sleep(0.5)


def main():
    parser = argparse.ArgumentParser(
        description='Preload historical data from Hyperliquid',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Load BTC and ETH for 1 year, all intervals
  python scripts/preload_historical_data.py --markets BTC-PERP,ETH-PERP --days 365
  
  # Load all popular markets for 6 months, only daily and hourly
  python scripts/preload_historical_data.py --all-markets --days 180 --intervals 1d,1h
  
  # Force reload even if cached
  python scripts/preload_historical_data.py --markets SOL-PERP --days 90 --force
  
  # Quick test - 7 days, 1d interval
  python scripts/preload_historical_data.py --markets BTC-PERP --days 7 --intervals 1d
        """
    )
    
    parser.add_argument(
        '--markets',
        type=str,
        help='Comma-separated list of markets (e.g. BTC-PERP,ETH-PERP)'
    )
    
    parser.add_argument(
        '--all-markets',
        action='store_true',
        help='Load all popular markets'
    )
    
    parser.add_argument(
        '--intervals',
        type=str,
        default='1m,5m,15m,1h,4h,1d',
        help='Comma-separated list of intervals (default: all)'
    )
    
    parser.add_argument(
        '--days',
        type=int,
        default=365,
        help='Number of days to load (default: 365)'
    )
    
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force reload even if data exists'
    )
    
    args = parser.parse_args()
    
    # Determine markets to load
    if args.all_markets:
        markets = POPULAR_MARKETS
    elif args.markets:
        markets = [m.strip() for m in args.markets.split(',')]
    else:
        print("❌ Error: Must specify --markets or --all-markets")
        parser.print_help()
        sys.exit(1)
    
    # Parse intervals
    intervals = [i.strip() for i in args.intervals.split(',')]
    
    # Validate intervals
    for interval in intervals:
        if interval not in ALL_INTERVALS:
            print(f"❌ Error: Invalid interval '{interval}'")
            print(f"   Valid intervals: {', '.join(ALL_INTERVALS)}")
            sys.exit(1)
    
    # Initialize DataManager
    print("\n" + "="*60)
    print("  🚀 TACITVS QUANT TERMINAL - DATA PRELOADER")
    print("="*60)
    print(f"Markets:   {', '.join(markets)}")
    print(f"Intervals: {', '.join(intervals)}")
    print(f"Days:      {args.days}")
    print(f"Force:     {args.force}")
    print("="*60)
    
    data_manager = DataManager()
    
    # Load data
    start_time = time.time()
    
    for market in markets:
        preload_market_data(
            market=market,
            intervals=intervals,
            days_back=args.days,
            data_manager=data_manager,
            force=args.force
        )
    
    total_time = time.time() - start_time
    
    # Summary
    print("\n" + "="*60)
    print(f"✅ COMPLETE")
    print("="*60)
    print(f"Total time: {total_time:.1f}s")
    print(f"Data stored in: {ROOT_DIR}/data/historical/")
    print("\nFile structure:")
    
    # Show what was created
    data_dir = ROOT_DIR / 'data' / 'historical'
    for market in markets:
        market_dir = data_dir / market
        if market_dir.exists():
            files = list(market_dir.glob('*.parquet'))
            if files:
                total_size = sum(f.stat().st_size for f in files) / (1024 * 1024)
                print(f"  {market}/")
                for f in sorted(files):
                    size_kb = f.stat().st_size / 1024
                    print(f"    ├─ {f.name:>12s} ({size_kb:>7.1f} KB)")
                print(f"    └─ Total: {total_size:.2f} MB")
    
    print("\n💡 Tip: Run API server to access this data:")
    print("   python apps/api/main.py")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()

