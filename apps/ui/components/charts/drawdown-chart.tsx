"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { SkeletonChart } from "@/components/ui/skeleton";

interface DrawdownChartProps {
  data?: Array<{
    date: string;
    drawdown: number;
    equity: number;
  }>;
  height?: number;
  className?: string;
  isLoading?: boolean;
}

function DrawdownChartInner({ data, height = 300, className, isLoading = false }: DrawdownChartProps) {
  // Loading state
  if (isLoading) {
    return <SkeletonChart className={className} height={height} />;
  }
  // Mock data if no data provided
  const mockData = data || [
    { date: "2024-01-01", drawdown: 0, equity: 10000 },
    { date: "2024-02-01", drawdown: -2.0, equity: 10500 },
    { date: "2024-03-01", drawdown: -5.0, equity: 9800 },
    { date: "2024-04-01", drawdown: -1.0, equity: 11200 },
    { date: "2024-05-01", drawdown: -3.0, equity: 10800 },
    { date: "2024-06-01", drawdown: 0, equity: 12000 },
    { date: "2024-07-01", drawdown: -4.0, equity: 11500 },
    { date: "2024-08-01", drawdown: -2.0, equity: 12500 },
    { date: "2024-09-01", drawdown: 0, equity: 13000 },
    { date: "2024-10-01", drawdown: -3.0, equity: 12800 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const drawdown = payload[0]?.value;
      // Get equity from the original data point
      const dataPoint = mockData.find(d => d.date === label);
      const equity = dataPoint?.equity;
      
      return (
        <div className="bg-[#0e1117] border border-[#1a1f2e] rounded-lg p-3 shadow-lg">
          <p className="text-neutral-400 text-sm mb-2">{`Date: ${label}`}</p>
          <p className="text-rose-400 font-mono text-sm">
            {`Drawdown: ${drawdown?.toFixed(2) || 'N/A'}%`}
          </p>
          {equity !== undefined && (
            <p className="text-neutral-200 font-mono text-sm">
              {`Equity: $${equity.toLocaleString()}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const maxDrawdown = Math.min(...mockData.map(d => d.drawdown));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📉 Drawdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                domain={['dataMin - 1', 1]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="url(#drawdownGradient)"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#1a1f2e]">
          <div className="text-center">
            <div className="text-xs text-neutral-500">Max DD</div>
            <div className="text-rose-400 font-mono text-sm">
              {maxDrawdown.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500">Current DD</div>
            <div className="text-neutral-200 font-mono text-sm">
              {mockData[mockData.length - 1].drawdown.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500">Recovery</div>
            <div className="text-emerald-400 font-mono text-sm">
              {mockData[mockData.length - 1].drawdown === 0 ? "Recovered" : "In DD"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export with error boundary
export function DrawdownChart(props: DrawdownChartProps) {
  return (
    <ChartErrorBoundary>
      <DrawdownChartInner {...props} />
    </ChartErrorBoundary>
  );
}
