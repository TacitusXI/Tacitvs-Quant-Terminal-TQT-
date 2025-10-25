"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BacktestRunner } from "@/components/backtest-runner";
import { EquityCurve } from "@/components/charts/equity-curve";
import { DrawdownChart } from "@/components/charts/drawdown-chart";
import { MonteCarloFanChart } from "@/components/charts/monte-carlo-fan";
import { Timestamp } from "@/components/ui/timestamp";
import Image from "next/image";

export default function LAB() {
  return (
    <div className="min-h-screen bg-[#0a0c12] p-6">
      <div className="space-y-6">
        {/* Header with Logo */}
        <div className="flex items-center justify-between border-b border-[#1a1f2e] pb-4">
          <div className="flex items-center gap-4">
            <Image src="/logo.webp" alt="TQT" width={40} height={40} className="rounded-lg" />
            <div>
              <h1 className="text-3xl font-bold cyber-title">LAB Terminal</h1>
              <p className="text-[#2D8EDF] font-mono text-sm">Research playground for backtests, walk-forward, and optimization</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Timestamp />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#7FB7FF] rounded-full cyber-lamp" />
              <span className="text-sm font-mono text-[#7FB7FF] uppercase tracking-wider">RESEARCH MODE</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0e1117] p-1 rounded-xl border border-[#1a1f2e]">
          {[
            { id: "backtest", label: "Backtest", icon: "🧪" },
            { id: "walk-forward", label: "Walk-Forward", icon: "📊" },
            { id: "monte-carlo", label: "Monte Carlo", icon: "🎲" },
            { id: "optimize", label: "Optimize", icon: "⚙️" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={tab.id === "backtest" ? "primary" : "ghost"}
              size="sm"
              className="flex-1"
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content Area */}
        <BacktestRunner />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EquityCurve />
          <DrawdownChart />
        </div>

        {/* Monte Carlo Fan Chart */}
        <MonteCarloFanChart />
      </div>
    </div>
  );
}
