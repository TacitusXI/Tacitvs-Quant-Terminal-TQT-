"use client";

import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lamp } from "@/components/ui/lamp";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketsData } from "@/lib/hooks";
import { useMarketStore } from "@/lib/store";
import { formatR, formatCurrency } from "@/lib/utils";
import { Timestamp } from "@/components/ui/timestamp";

interface MarketTileProps {
  market: string;
}

export function MarketTile({ market }: MarketTileProps) {
  const { markets, isLoading, error } = useMarketsData([market]);
  const marketData = markets[0];
  const { updateMarket } = useMarketStore();

  // Update market data when EV changes
  useEffect(() => {
    if (marketData?.ev) {
      updateMarket(market, {
        ev: marketData.ev.ev,
        winRate: marketData.ev.winRate,
        avgWin: marketData.ev.avgWin,
        lastUpdate: marketData.ev.timestamp,
      });
    }
  }, [marketData?.ev, market, updateMarket]);

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-[#0e1117] border border-[#1a1f2e]">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton variant="circular" width={12} height={12} />
          <Skeleton width={60} height={16} />
        </div>
        <Skeleton width={80} height={24} className="mb-2" />
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Skeleton width="100%" height={12} />
            <Skeleton width="80%" height={10} />
          </div>
          <div className="space-y-1">
            <Skeleton width="100%" height={12} />
            <Skeleton width="80%" height={10} />
          </div>
          <div className="space-y-1">
            <Skeleton width="100%" height={12} />
            <Skeleton width="80%" height={10} />
          </div>
        </div>
        <Skeleton width="60%" height={10} className="mt-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-[#0e1117] border border-rose-500/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-rose-400 rounded-full glow-rose" />
          <span className="font-semibold text-neutral-100">{market}</span>
        </div>
        <div className="text-xs text-rose-400">Connection Error</div>
      </div>
    );
  }

  const status = marketData?.ev && marketData.ev.ev > 0.05 ? "ARMED" : 
                 marketData?.ev && marketData.ev.ev > -0.02 ? "HOLD" : "OFF";

  return (
    <div className="p-4 rounded-xl bg-[#0e1117] border border-[#1a1f2e] hover:border-cyan-500/30 transition-smooth">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Lamp ev={marketData?.ev?.ev || 0} size="md" />
          <span className="font-semibold text-neutral-100">{market}</span>
        </div>
               {marketData?.ev?.timestamp && (
                 <Timestamp 
                   timestamp={marketData.ev.timestamp} 
                   className="text-xs text-neutral-500"
                 />
               )}
      </div>
      
      <div className="text-xs text-neutral-500 mb-2">Hyperliquid</div>
      
      <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-2">
        <div>
          <div className="text-neutral-500">EV</div>
          <div className="text-neutral-200">{formatR(marketData?.ev?.ev || 0)}</div>
        </div>
        <div>
          <div className="text-neutral-500">P</div>
          <div className="text-neutral-200">{Math.round((marketData?.ev?.winRate || 0) * 100)}%</div>
        </div>
        <div>
          <div className="text-neutral-500">b̄</div>
          <div className="text-neutral-200">{(marketData?.ev?.avgWin || 0).toFixed(1)}</div>
        </div>
      </div>
      
      <div className="border-t border-neutral-800 pt-2">
        <div className="flex justify-between text-xs">
          <div>
            <span className="text-neutral-500">Status: </span>
            <span className={
              status === "ARMED" ? "text-[var(--color-ion)]" :
              status === "HOLD" ? "text-[var(--color-warning)]" :
              "text-neutral-600"
            }>
              {status}
            </span>
          </div>
          <div>
            <span className="text-neutral-500">Position: </span>
            <span className="text-neutral-600">NONE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MarketMatrix() {
  const markets = ["BTC-PERP", "ETH-PERP", "SOL-PERP"];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Tables
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {markets.map((market) => (
          <MarketTile key={market} market={market} />
        ))}
        
        <Button variant="ghost" className="w-full mt-4">
          + Add Market
        </Button>
      </CardContent>
    </Card>
  );
}
