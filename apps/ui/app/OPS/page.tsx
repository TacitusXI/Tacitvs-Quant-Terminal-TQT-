"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MarketMatrix } from "@/components/market-matrix";
import { PriceChart } from "@/components/charts/price-chart";
import { ApiStatus } from "@/components/api-status";
import { useUIStore, useMarketStore } from "@/lib/store";
import { Timestamp } from "@/components/ui/timestamp";
import { formatR, formatCurrency, cn } from "@/lib/utils";
import Image from "next/image";

export default function OPS() {
  const { opsMode, riskPct, routing, setOpsMode, setRiskPct, setRouting } = useUIStore();
  const { opsLog } = useMarketStore();

  const opsModes: Array<{ id: "ARM" | "HOLD" | "SIM" | "OFF"; label: string; variant: "success" | "warning" | "primary" | "ghost" }> = [
    { id: "ARM", label: "ARM", variant: "success" },
    { id: "HOLD", label: "HOLD", variant: "warning" },
    { id: "SIM", label: "SIM", variant: "primary" },
    { id: "OFF", label: "OFF", variant: "ghost" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0c12] p-6">
      <div className="space-y-6">
        {/* Header with Logo */}
        <div className="flex items-center justify-between border-b border-[#1a1f2e] pb-4">
          <div className="flex items-center gap-4">
            <Image src="/logo.webp" alt="TQT" width={40} height={40} className="rounded-lg" />
            <div>
              <h1 className="text-3xl font-bold cyber-title">OPS Terminal</h1>
              <p className="text-[#2D8EDF] font-mono text-sm">Live trading operations and monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Timestamp />
            <div className="flex items-center gap-2">
              {opsMode === "ARM" ? (
                <>
                  <div className="w-3 h-3 bg-[#8AFF00] rounded-full neon-glow-ion animate-pulse" />
                  <span className="text-sm font-mono text-ion uppercase tracking-wider">⚡ ARMED</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-[#16A34A] rounded-full cyber-lamp" />
                  <span className="text-sm font-mono text-[#16A34A] uppercase tracking-wider">SYSTEM ACTIVE</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table Matrix */}
          <div className="space-y-4">
            <MarketMatrix />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <ApiStatus />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚙️ Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* OPS Mode */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-300 mb-3">OPS MODE</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {opsModes.map((mode) => (
                      <Button
                        key={mode.id}
                        variant={opsMode === mode.id ? mode.variant : "ghost"}
                        size="sm"
                        onClick={() => setOpsMode(mode.id)}
                        className={cn(
                          "relative",
                          mode.id === "ARM" && opsMode === "ARM" && "border-[#8AFF00] text-[#8AFF00] neon-glow-ion"
                        )}
                      >
                        {mode.id === "ARM" && "⚡ "}
                        {mode.label}
                        {opsMode === mode.id && (
                          <span className="absolute top-1 right-1 text-xs">✓</span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Risk Settings */}
                <div>
                  <Slider
                    label="Risk per Trade"
                    valueLabel={`${riskPct.toFixed(1)}%`}
                    min={0.1}
                    max={3.0}
                    step={0.1}
                    value={riskPct}
                    onChange={(e) => setRiskPct(Number(e.target.value))}
                  />
                  <div className="mt-2 text-xs text-neutral-500">
                    <div>Capital: {formatCurrency(10000)}</div>
                    <div className="text-[#16A34A]">R ($): {formatCurrency(riskPct * 100)}</div>
                  </div>
                </div>

                {/* Routing */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-300 mb-3">ROUTING</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="routing"
                        checked={routing === "maker"}
                        onChange={() => setRouting("maker")}
                        className="w-4 h-4 text-[#2D8EDF]"
                      />
                      <span className="text-sm text-neutral-300">Maker (rebates)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="routing"
                        checked={routing === "taker"}
                        onChange={() => setRouting("taker")}
                        className="w-4 h-4 text-[#2D8EDF]"
                      />
                      <span className="text-sm text-neutral-300">Taker (fast fill)</span>
                    </label>
                  </div>
                  <div className="mt-2 text-xs text-[#16A34A]">
                    Estimated fees: -0.6 bps
                  </div>
                </div>

                {/* Safety */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-300 mb-3">SAFETY</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Daily Loss: -2.5R / 5R</span>
                        <span>50%</span>
                      </div>
                      <div className="w-full h-6 bg-neutral-900 rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-300"
                          style={{ width: "50%" }}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      variant="danger" 
                      className="w-full border-[#FF2E88] text-[#FF2E88] neon-glow-magenta hover:bg-[#FF2E88]/10"
                      onClick={() => {
                        // Kill switch logic
                        console.log("Kill switch activated!");
                      }}
                    >
                      🛑 KILL SWITCH
                    </Button>
                    
                    <div className="text-xs text-[#16A34A]">
                      Status: ACTIVE
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ops Log */}
          <div className="space-y-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    📜 Ops Log
                  </span>
                  <Button variant="ghost" size="sm">
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto space-y-2 font-mono text-xs">
                  {opsLog.map((entry, index) => (
                    <div key={index} className="border-b border-neutral-800 pb-2">
                      <Timestamp 
                        timestamp={entry.timestamp} 
                        className="text-neutral-500"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#2D8EDF]">{entry.market}</span>
                        <span className="text-neutral-400">{entry.strategy}</span>
                      </div>
                      <div className={`mt-1 ${
                        entry.action === "ENTRY" ? "text-[#16A34A]" :
                        entry.action === "EXIT" ? "text-[#7FB7FF]" :
                        entry.action === "HOLD" ? "text-[#FFB020]" :
                        "text-[#F43F5E]"
                      }`}>
                        {entry.message}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Price Chart with R-Ruler */}
        <PriceChart 
          showRRuler={true}
          entryPrice={50000}
          stopPrice={48000}
          targetPrice={54000}
        />
      </div>
    </div>
  );
}