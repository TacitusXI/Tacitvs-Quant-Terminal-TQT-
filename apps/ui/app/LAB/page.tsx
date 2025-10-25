"use client";

import { MainLayout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BacktestRunner } from "@/components/backtest-runner";
import { EquityCurve } from "@/components/charts/equity-curve";
import { DrawdownChart } from "@/components/charts/drawdown-chart";
import { MonteCarloFanChart } from "@/components/charts/monte-carlo-fan";

export default function LAB() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-title">LAB Terminal</h1>
            <p className="text-[#2D8EDF] font-mono text-sm">Research playground for backtests, walk-forward, and optimization</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#7FB7FF] rounded-full cyber-lamp" />
            <span className="text-sm font-mono text-[#7FB7FF] uppercase tracking-wider">RESEARCH MODE</span>
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
    </MainLayout>
  );
}
