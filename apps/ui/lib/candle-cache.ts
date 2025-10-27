/**
 * 🧠 TACITVS QUANT TERMINAL - Candle Data Cache
 * IndexedDB-based caching for historical candle data
 * 
 * Features:
 * - Store large amounts of historical data locally
 * - Incremental updates (only fetch missing data)
 * - Multiple timeframes supported
 * - Automatic expiry management
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CachedCandles {
  market: string;
  interval: string;
  candles: CandleData[];
  lastUpdate: number;
  firstTimestamp: number;
  lastTimestamp: number;
}

interface CandleCacheDB extends DBSchema {
  candles: {
    key: string; // `${market}:${interval}`
    value: CachedCandles;
    indexes: {
      'by-market': string;
      'by-interval': string;
      'by-last-update': number;
    };
  };
}

class CandleCache {
  private db: IDBPDatabase<CandleCacheDB> | null = null;
  private dbName = 'tqt-candle-cache';
  private dbVersion = 1;

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<CandleCacheDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          // Create candles object store
          const store = db.createObjectStore('candles', { keyPath: ['market', 'interval'] });
          
          // Create indexes
          store.createIndex('by-market', 'market');
          store.createIndex('by-interval', 'interval');
          store.createIndex('by-last-update', 'lastUpdate');
        },
      });
      
      console.log('[CandleCache] IndexedDB initialized');
    } catch (error) {
      console.error('[CandleCache] Failed to initialize:', error);
    }
  }

  /**
   * Generate cache key
   */
  private getCacheKey(market: string, interval: string): string {
    return `${market}:${interval}`;
  }

  /**
   * Get cached candles
   */
  async get(market: string, interval: string): Promise<CachedCandles | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    try {
      const key = this.getCacheKey(market, interval);
      const cached = await this.db.get('candles', [market, interval] as any);
      
      if (cached) {
        console.log(`[CandleCache] Hit for ${key}: ${cached.candles.length} candles`);
        return cached;
      }
      
      console.log(`[CandleCache] Miss for ${key}`);
      return null;
    } catch (error) {
      console.error('[CandleCache] Get error:', error);
      return null;
    }
  }

  /**
   * Store candles in cache
   */
  async set(market: string, interval: string, candles: CandleData[]): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db || candles.length === 0) return;

    try {
      const timestamps = candles.map(c => c.timestamp);
      const cached: CachedCandles = {
        market,
        interval,
        candles,
        lastUpdate: Date.now(),
        firstTimestamp: Math.min(...timestamps),
        lastTimestamp: Math.max(...timestamps),
      };

      await this.db.put('candles', cached);
      console.log(`[CandleCache] Stored ${candles.length} candles for ${market}:${interval}`);
    } catch (error) {
      console.error('[CandleCache] Set error:', error);
    }
  }

  /**
   * Merge new candles with existing cache
   * Useful for incremental updates
   */
  async merge(market: string, interval: string, newCandles: CandleData[]): Promise<void> {
    const existing = await this.get(market, interval);
    
    if (!existing) {
      await this.set(market, interval, newCandles);
      return;
    }

    // Merge and deduplicate
    const merged = [...existing.candles, ...newCandles];
    const uniqueMap = new Map<number, CandleData>();
    
    merged.forEach(candle => {
      uniqueMap.set(candle.timestamp, candle);
    });

    const uniqueCandles = Array.from(uniqueMap.values())
      .sort((a, b) => a.timestamp - b.timestamp);

    await this.set(market, interval, uniqueCandles);
  }

  /**
   * Get missing time ranges
   * Returns array of [start, end] timestamps that need to be fetched
   */
  async getMissingRanges(
    market: string,
    interval: string,
    desiredStart: number,
    desiredEnd: number
  ): Promise<Array<[number, number]>> {
    const cached = await this.get(market, interval);
    
    if (!cached || cached.candles.length === 0) {
      // No cache, need entire range
      return [[desiredStart, desiredEnd]];
    }

    const ranges: Array<[number, number]> = [];

    // Need data before cached range
    if (desiredStart < cached.firstTimestamp) {
      ranges.push([desiredStart, cached.firstTimestamp]);
    }

    // Need data after cached range
    if (desiredEnd > cached.lastTimestamp) {
      ranges.push([cached.lastTimestamp, desiredEnd]);
    }

    // TODO: Check for gaps in the middle (more complex logic)

    return ranges;
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    try {
      await this.db.clear('candles');
      console.log('[CandleCache] All cache cleared');
    } catch (error) {
      console.error('[CandleCache] Clear error:', error);
    }
  }

  /**
   * Clear cache for specific market
   */
  async clearMarket(market: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    try {
      const tx = this.db.transaction('candles', 'readwrite');
      const index = tx.store.index('by-market');
      
      for await (const cursor of index.iterate(market)) {
        cursor.delete();
      }
      
      await tx.done;
      console.log(`[CandleCache] Cleared cache for ${market}`);
    } catch (error) {
      console.error('[CandleCache] Clear market error:', error);
    }
  }

  /**
   * Get cache stats
   */
  async getStats(): Promise<{
    totalEntries: number;
    totalCandles: number;
    markets: string[];
    intervals: string[];
  }> {
    if (!this.db) await this.init();
    if (!this.db) return { totalEntries: 0, totalCandles: 0, markets: [], intervals: [] };

    try {
      const all = await this.db.getAll('candles');
      const markets = new Set<string>();
      const intervals = new Set<string>();
      let totalCandles = 0;

      all.forEach(entry => {
        markets.add(entry.market);
        intervals.add(entry.interval);
        totalCandles += entry.candles.length;
      });

      return {
        totalEntries: all.length,
        totalCandles,
        markets: Array.from(markets),
        intervals: Array.from(intervals),
      };
    } catch (error) {
      console.error('[CandleCache] Stats error:', error);
      return { totalEntries: 0, totalCandles: 0, markets: [], intervals: [] };
    }
  }
}

// Singleton instance
let candleCache: CandleCache | null = null;

/**
 * Get CandleCache singleton
 */
export function getCandleCache(): CandleCache {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return null as any;
  }

  if (!candleCache) {
    candleCache = new CandleCache();
  }

  return candleCache;
}

// Export types
export type { CandleData, CachedCandles };

