"use client";

import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { SkeletonChart } from "@/components/ui/skeleton";

interface MonteCarloFanChartProps {
  data?: {
    percentiles: {
      p5: number[];
      p25: number[];
      p50: number[];
      p75: number[];
      p95: number[];
    };
    simulations: number;
    prob_profit: number;
    median_return_pct: number;
  };
  height?: number;
  className?: string;
  isLoading?: boolean;
}

function MonteCarloFanChartInner({ data, height = 300, className, isLoading = false }: MonteCarloFanChartProps) {
  // Loading state
  if (isLoading) {
    return <SkeletonChart className={className} height={height} />;
  }
  // Mock data if no data provided
  const mockData = data || {
    percentiles: {
      p5: [10000, 9500, 9000, 8500, 8000, 7500, 7000, 6500, 6000, 5500],
      p25: [10000, 10200, 10400, 10600, 10800, 11000, 11200, 11400, 11600, 11800],
      p50: [10000, 10300, 10600, 10900, 11200, 11500, 11800, 12100, 12400, 12700],
      p75: [10000, 10400, 10800, 11200, 11600, 12000, 12400, 12800, 13200, 13600],
      p95: [10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500, 14000, 14500],
    },
    simulations: 1000,
    prob_profit: 0.65,
    median_return_pct: 12.5,
  };

  // Transform data for chart
  const chartData = mockData.percentiles.p50.map((_, index) => ({
    period: index + 1,
    p5: mockData.percentiles.p5[index],
    p25: mockData.percentiles.p25[index],
    p50: mockData.percentiles.p50[index],
    p75: mockData.percentiles.p75[index],
    p95: mockData.percentiles.p95[index],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length >= 5) {
      return (
        <div className="bg-[#0e1117] border border-[#1a1f2e] rounded-lg p-3 shadow-lg">
          <p className="text-neutral-400 text-sm mb-2">{`Period: ${label}`}</p>
          <div className="space-y-1">
            <p className="text-rose-400 font-mono text-xs">
              {`P5: $${payload[0]?.value?.toLocaleString() || 'N/A'}`}
            </p>
            <p className="text-amber-400 font-mono text-xs">
              {`P25: $${payload[1]?.value?.toLocaleString() || 'N/A'}`}
            </p>
            <p className="text-neutral-200 font-mono text-xs">
              {`P50: $${payload[2]?.value?.toLocaleString() || 'N/A'}`}
            </p>
            <p className="text-emerald-400 font-mono text-xs">
              {`P75: $${payload[3]?.value?.toLocaleString() || 'N/A'}`}
            </p>
            <p className="text-cyan-400 font-mono text-xs">
              {`P95: $${payload[4]?.value?.toLocaleString() || 'N/A'}`}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-[var(--accent)]">🎲</span> Monte Carlo Simulation Fan Chart
          <span className="text-xs text-neutral-500 font-mono font-normal">
            ({mockData.simulations.toLocaleString()} simulations)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 50, left: 20, bottom: 20 }}>
              <defs>
                {/* Gradient for P5-P25 band (worst outcomes) */}
                <linearGradient id="bandP5P25" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05} />
                </linearGradient>
                
                {/* Gradient for P25-P50 band (below median) */}
                <linearGradient id="bandP25P50" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.08} />
                </linearGradient>
                
                {/* Gradient for P50-P75 band (above median) */}
                <linearGradient id="bandP50P75" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.08} />
                </linearGradient>
                
                {/* Gradient for P75-P95 band (best outcomes) */}
                <linearGradient id="bandP75P95" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" vertical={false} />
              
              <XAxis 
                dataKey="period" 
                stroke="var(--accent2)"
                fontSize={11}
                fontFamily="monospace"
                label={{ 
                  value: 'Trading Period', 
                  position: 'insideBottom', 
                  offset: -10,
                  fill: "var(--accent2)",
                  fontSize: 11
                }}
              />
              
              <YAxis 
                stroke="var(--accent2)"
                fontSize={11}
                fontFamily="monospace"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{ 
                  value: 'Portfolio Value', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: "var(--accent2)",
                  fontSize: 11
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Area bands showing probability ranges */}
              {/* P5-P25 Band (5th-25th percentile) */}
              <Area
                type="monotone"
                dataKey="p25"
                stroke="none"
                fill="url(#bandP5P25)"
                fillOpacity={1}
              />
              
              {/* P25-P50 Band (25th-50th percentile) */}
              <Area
                type="monotone"
                dataKey="p50"
                stroke="none"
                fill="url(#bandP25P50)"
                fillOpacity={1}
              />
              
              {/* P50-P75 Band (50th-75th percentile) */}
              <Area
                type="monotone"
                dataKey="p75"
                stroke="none"
                fill="url(#bandP50P75)"
                fillOpacity={1}
              />
              
              {/* P75-P95 Band (75th-95th percentile) */}
              <Area
                type="monotone"
                dataKey="p95"
                stroke="none"
                fill="url(#bandP75P95)"
                fillOpacity={1}
              />
              
              {/* Percentile Lines */}
              <Line
                type="monotone"
                dataKey="p5"
                stroke="#EF4444"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                name="5th Percentile (Worst Case)"
              />
              
              <Line
                type="monotone"
                dataKey="p25"
                stroke="#fbbf24"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="25th Percentile"
              />
              
              {/* P50 Line (Median) - thicker and solid */}
              <Line
                type="monotone"
                dataKey="p50"
                stroke="#e5e7eb"
                strokeWidth={2.5}
                dot={false}
                name="Median (50th Percentile)"
              />
              
              <Line
                type="monotone"
                dataKey="p75"
                stroke="#10B981"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="75th Percentile"
              />
              
              <Line
                type="monotone"
                dataKey="p95"
                stroke="var(--accent)"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                name="95th Percentile (Best Case)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#1a1f2e]">
          <div className="text-center">
            <div className="text-xs text-neutral-500">Simulations</div>
            <div className="text-neutral-200 font-mono text-sm">
              {mockData.simulations.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500">Prob Profit</div>
            <div className="text-emerald-400 font-mono text-sm">
              {(mockData.prob_profit * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500">Median Return</div>
            <div className="text-neutral-200 font-mono text-sm">
              {mockData.median_return_pct >= 0 ? "+" : ""}{mockData.median_return_pct.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Legend with detailed explanation */}
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="text-xs text-neutral-500 mb-2 font-mono">PERCENTILE BANDS</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 bg-rose-400 opacity-20 rounded mt-0.5"></div>
              <div>
                <div className="text-rose-400 font-mono font-bold">5th-25th</div>
                <div className="text-neutral-500 text-[10px]">Worst 25%</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 bg-amber-400 opacity-30 rounded mt-0.5"></div>
              <div>
                <div className="text-amber-400 font-mono font-bold">25th-50th</div>
                <div className="text-neutral-500 text-[10px]">Below median</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 bg-emerald-400 opacity-30 rounded mt-0.5"></div>
              <div>
                <div className="text-emerald-400 font-mono font-bold">50th-75th</div>
                <div className="text-neutral-500 text-[10px]">Above median</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 bg-[var(--accent)] opacity-40 rounded mt-0.5"></div>
              <div>
                <div className="text-[var(--accent)] font-mono font-bold">75th-95th</div>
                <div className="text-neutral-500 text-[10px]">Best 25%</div>
              </div>
            </div>
          </div>
          
          {/* Interpretation help */}
          <div className="mt-3 p-2 bg-[var(--panel)] rounded border border-[var(--border)] text-[10px] text-neutral-400 font-mono">
            <span className="text-neutral-300">💡 Reading:</span> The median line shows typical outcome. 
            Wider bands = higher uncertainty. 50% of simulations fall within the yellow-green range.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export with error boundary
export function MonteCarloFanChart(props: MonteCarloFanChartProps) {
  return (
    <ChartErrorBoundary>
      <MonteCarloFanChartInner {...props} />
    </ChartErrorBoundary>
  );
}
