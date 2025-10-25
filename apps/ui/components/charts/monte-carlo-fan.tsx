"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
          🎲 Monte Carlo Fan Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
              <XAxis 
                dataKey="period" 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Period', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* P5 Line */}
              <Line
                type="monotone"
                dataKey="p5"
                stroke="var(--color-danger)"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="5th Percentile"
              />
              
              {/* P25 Line */}
              <Line
                type="monotone"
                dataKey="p25"
                stroke="#fbbf24"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="25th Percentile"
              />
              
              {/* P50 Line (Median) */}
              <Line
                type="monotone"
                dataKey="p50"
                stroke="#e5e7eb"
                strokeWidth={2}
                dot={false}
                name="50th Percentile (Median)"
              />
              
              {/* P75 Line */}
              <Line
                type="monotone"
                dataKey="p75"
                stroke="#16A34A"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="75th Percentile"
              />
              
              {/* P95 Line */}
              <Line
                type="monotone"
                dataKey="p95"
                stroke="var(--color-secondary)"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="95th Percentile"
              />
            </LineChart>
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

        {/* Legend */}
        <div className="mt-4 grid grid-cols-5 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-1 bg-rose-400"></div>
            <span className="text-neutral-400">P5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-1 bg-amber-400"></div>
            <span className="text-neutral-400">P25</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-1 bg-neutral-200"></div>
            <span className="text-neutral-400">P50</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-1 bg-emerald-400"></div>
            <span className="text-neutral-400">P75</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-1 bg-cyan-400"></div>
            <span className="text-neutral-400">P95</span>
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
