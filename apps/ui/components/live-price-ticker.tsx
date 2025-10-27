"use client";

import { usePriceStream } from "@/lib/websocket";
import { useEffect, useState } from "react";

interface LivePriceTickerProps {
  market: string;
  className?: string;
  showChange?: boolean;
  showVolume?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LivePriceTicker({ 
  market, 
  className = "",
  showChange = true,
  showVolume = false,
  size = "md"
}: LivePriceTickerProps) {
  const { price, change24h, volume24h, lastUpdate, isConnected } = usePriceStream(market);
  const [isFlashing, setIsFlashing] = useState(false);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);

  // Flash effect on price change
  useEffect(() => {
    if (price !== null && prevPrice !== null && price !== prevPrice) {
      setPriceDirection(price > prevPrice ? "up" : "down");
      setIsFlashing(true);
      
      const timeout = setTimeout(() => setIsFlashing(false), 300);
      return () => clearTimeout(timeout);
    }
    
    if (price !== null) {
      setPrevPrice(price);
    }
  }, [price, prevPrice]);

  // Size variants
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  const changeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (!isConnected || price === null) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`font-mono font-bold text-neutral-500 ${sizeClasses[size]}`}>
          ---.--
        </div>
        {!isConnected && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
            <span className="text-xs text-yellow-500 font-mono">CONNECTING</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Connection Status Indicator */}
      <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
      
      {/* Price */}
      <div 
        className={`
          font-mono font-bold transition-all duration-300
          ${sizeClasses[size]}
          ${isFlashing && priceDirection === 'up' ? 'text-emerald-400 scale-105' : ''}
          ${isFlashing && priceDirection === 'down' ? 'text-rose-400 scale-105' : ''}
          ${!isFlashing ? 'text-neutral-100' : ''}
        `}
      >
        ${price.toLocaleString(undefined, { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </div>

      {/* Direction Arrow */}
      {priceDirection && (
        <span 
          className={`
            ${changeClasses[size]}
            ${priceDirection === 'up' ? 'text-emerald-400' : 'text-rose-400'}
          `}
        >
          {priceDirection === 'up' ? '▲' : '▼'}
        </span>
      )}

      {/* 24h Change */}
      {showChange && change24h !== null && (
        <div 
          className={`
            font-mono ${changeClasses[size]}
            ${change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}
          `}
        >
          {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
        </div>
      )}

      {/* 24h Volume */}
      {showVolume && volume24h !== null && (
        <div className={`text-neutral-500 font-mono ${changeClasses[size]}`}>
          Vol: ${(volume24h / 1000000).toFixed(1)}M
        </div>
      )}

      {/* Last Update Time */}
      {lastUpdate && (
        <div className="text-[10px] text-neutral-600 font-mono">
          {new Date(lastUpdate).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Compact price ticker for tight spaces
 */
export function CompactPriceTicker({ market, className = "" }: { market: string; className?: string }) {
  const { price, change24h, isConnected } = usePriceStream(market);

  if (!isConnected || price === null) {
    return (
      <span className={`font-mono text-neutral-500 ${className}`}>
        ---.--
      </span>
    );
  }

  return (
    <span className={`font-mono font-bold ${className}`}>
      <span className="text-neutral-100">
        ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </span>
      {change24h !== null && (
        <span className={`ml-1 text-xs ${change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {change24h >= 0 ? '+' : ''}{change24h.toFixed(1)}%
        </span>
      )}
    </span>
  );
}

/**
 * Multi-market price grid
 */
export function LivePriceGrid({ markets, className = "" }: { markets: string[]; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {markets.map((market) => (
        <div 
          key={market}
          className="p-4 rounded-lg bg-[var(--panel)] border border-[var(--border)] hover:border-[var(--accent2)] transition-colors"
        >
          <div className="text-xs text-neutral-500 font-mono mb-2">{market}</div>
          <LivePriceTicker market={market} size="lg" showChange showVolume />
        </div>
      ))}
    </div>
  );
}

