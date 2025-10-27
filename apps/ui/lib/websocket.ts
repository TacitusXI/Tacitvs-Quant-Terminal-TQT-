/**
 * 🧠 TACITVS QUANT TERMINAL - WebSocket Manager
 * Real-time price updates for trading terminal
 */

type PriceUpdate = {
  market: string;
  price: number;
  timestamp: number;
  volume24h?: number;
  change24h?: number;
};

type WebSocketCallback = (data: PriceUpdate) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Set<WebSocketCallback>> = new Map();
  private isConnecting = false;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  
  /**
   * Connect to WebSocket server
   */
  connect(url?: string): void {
    if (this.isConnecting || this.isConnected) {
      console.log('[WS] Already connecting or connected');
      return;
    }

    // In development mode, skip WebSocket connection and use mock data only
    if (process.env.NODE_ENV === 'development' && !url) {
      console.log('[WS] Development mode - using mock updates only (no WebSocket)');
      this.isConnected = true;
      this.isConnecting = false;
      return;
    }

    this.isConnecting = true;
    
    // Default to Hyperliquid WebSocket (or mock for development)
    const wsUrl = url || this.getMockWebSocketUrl();
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('[WS] Connected to', wsUrl);
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        
        // Subscribe to all markets that have subscribers
        this.resubscribeAll();
      };
      
      this.ws.onmessage = (event) => {
        // Check if data looks like JSON before parsing
        const message = event.data;
        if (typeof message !== 'string' || !message.startsWith('{') && !message.startsWith('[')) {
          // Not JSON, ignore (echo server returns plain text)
          return;
        }
        
        try {
          const data = JSON.parse(message);
          this.handleMessage(data);
        } catch (error) {
          // Silently ignore parse errors
          // In production with real exchange WebSocket, this will be valid JSON
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error);
        this.isConnecting = false;
      };
      
      this.ws.onclose = () => {
        console.log('[WS] Connection closed');
        this.isConnected = false;
        this.isConnecting = false;
        this.ws = null;
        
        // Attempt to reconnect
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('[WS] Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }
  
  /**
   * Get mock WebSocket URL for development
   * In production, this should be replaced with actual exchange WebSocket
   */
  private getMockWebSocketUrl(): string {
    // For development, we'll use a mock WebSocket server
    // In production, use: wss://api.hyperliquid.xyz/ws
    return 'wss://echo.websocket.org/'; // Echo server for testing
  }
  
  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max reconnection attempts reached');
      return;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts); // Exponential backoff
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
  
  /**
   * Resubscribe to all markets
   */
  private resubscribeAll(): void {
    for (const market of this.subscribers.keys()) {
      this.sendSubscribe(market);
    }
  }
  
  /**
   * Send subscribe message to WebSocket
   */
  private sendSubscribe(market: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    
    // Format depends on exchange API
    // For Hyperliquid: { "type": "subscribe", "channel": "ticker", "market": "BTC-PERP" }
    const message = JSON.stringify({
      type: 'subscribe',
      channel: 'ticker',
      market: market,
    });
    
    this.ws.send(message);
    console.log('[WS] Subscribed to', market);
  }
  
  /**
   * Send unsubscribe message to WebSocket
   */
  private sendUnsubscribe(market: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    
    const message = JSON.stringify({
      type: 'unsubscribe',
      channel: 'ticker',
      market: market,
    });
    
    this.ws.send(message);
    console.log('[WS] Unsubscribed from', market);
  }
  
  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: any): void {
    // Parse message based on exchange format
    // This is a mock implementation - adapt to actual exchange format
    
    if (data.type === 'ticker' || data.channel === 'ticker') {
      const priceUpdate: PriceUpdate = {
        market: data.market || data.symbol,
        price: parseFloat(data.price || data.last),
        timestamp: data.timestamp || Date.now(),
        volume24h: data.volume24h ? parseFloat(data.volume24h) : undefined,
        change24h: data.change24h ? parseFloat(data.change24h) : undefined,
      };
      
      this.notifySubscribers(priceUpdate);
    }
  }
  
  /**
   * Notify all subscribers of a price update
   */
  private notifySubscribers(update: PriceUpdate): void {
    const callbacks = this.subscribers.get(update.market);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          console.error('[WS] Subscriber callback error:', error);
        }
      });
    }
  }
  
  /**
   * Subscribe to market updates
   */
  subscribe(market: string, callback: WebSocketCallback): () => void {
    if (!this.subscribers.has(market)) {
      this.subscribers.set(market, new Set());
    }
    
    this.subscribers.get(market)!.add(callback);
    
    // If connected, send subscribe message
    if (this.isConnected) {
      this.sendSubscribe(market);
    } else if (!this.isConnecting) {
      // Connect if not already connecting
      this.connect();
    }
    
    // Return unsubscribe function
    return () => this.unsubscribe(market, callback);
  }
  
  /**
   * Unsubscribe from market updates
   */
  unsubscribe(market: string, callback: WebSocketCallback): void {
    const callbacks = this.subscribers.get(market);
    if (callbacks) {
      callbacks.delete(callback);
      
      // If no more subscribers, unsubscribe from WebSocket
      if (callbacks.size === 0) {
        this.subscribers.delete(market);
        this.sendUnsubscribe(market);
      }
    }
  }
  
  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
    this.subscribers.clear();
  }
  
  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; connecting: boolean } {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting,
    };
  }
  
  /**
   * Simulate price updates for development
   * Remove in production
   */
  startMockUpdates(): void {
    console.log('[WS] Starting mock price updates...');
    const markets = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP'];
    const basePrices: Record<string, number> = {
      'BTC-PERP': 50000,
      'ETH-PERP': 3000,
      'SOL-PERP': 100,
    };
    
    // Immediate first update
    markets.forEach(market => {
      const update: PriceUpdate = {
        market,
        price: basePrices[market],
        timestamp: Date.now(),
        volume24h: Math.random() * 1000000000,
        change24h: (Math.random() - 0.5) * 10,
      };
      this.notifySubscribers(update);
    });
    
    // Then update every second
    setInterval(() => {
      markets.forEach(market => {
        if (this.subscribers.has(market) && this.subscribers.get(market)!.size > 0) {
          const basePrice = basePrices[market];
          const volatility = 0.002; // 0.2% volatility
          const change = (Math.random() - 0.5) * 2 * volatility;
          const newPrice = basePrice * (1 + change);
          
          // Update base price for next iteration
          basePrices[market] = newPrice;
          
          const update: PriceUpdate = {
            market,
            price: newPrice,
            timestamp: Date.now(),
            volume24h: Math.random() * 1000000000 + 500000000,
            change24h: (Math.random() - 0.5) * 10,
          };
          
          this.notifySubscribers(update);
        }
      });
    }, 1000); // Update every second
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

/**
 * Get WebSocket manager instance
 */
export function getWebSocketManager(): WebSocketManager {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return null as any;
  }
  
  if (!wsManager) {
    wsManager = new WebSocketManager();
    
    // Start mock updates for development
    // Remove this in production
    if (process.env.NODE_ENV === 'development') {
      wsManager.startMockUpdates();
    }
  }
  
  return wsManager;
}

/**
 * React hook for subscribing to price updates
 */
export function usePriceStream(market: string): {
  price: number | null;
  volume24h: number | null;
  change24h: number | null;
  lastUpdate: number | null;
  isConnected: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      price: null,
      volume24h: null,
      change24h: null,
      lastUpdate: null,
      isConnected: false,
    };
  }
  
  const [price, setPrice] = useState<number | null>(null);
  const [volume24h, setVolume24h] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const ws = getWebSocketManager();
    if (!ws) return;
    
    // Update connection status
    const checkStatus = () => {
      const status = ws.getStatus();
      setIsConnected(status.connected);
    };
    checkStatus();
    const statusInterval = setInterval(checkStatus, 1000);
    
    // Subscribe to price updates
    const unsubscribe = ws.subscribe(market, (update) => {
      setPrice(update.price);
      setVolume24h(update.volume24h || null);
      setChange24h(update.change24h || null);
      setLastUpdate(update.timestamp);
    });
    
    return () => {
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, [market]);
  
  return {
    price,
    volume24h,
    change24h,
    lastUpdate,
    isConnected,
  };
}

// Export types
export type { PriceUpdate, WebSocketCallback };

import { useEffect, useState } from "react";

