"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { SkeletonChart } from "@/components/ui/skeleton";

interface RollingMetricsProps {
  data?: Array<{
    date: string;
    sharpe: number;
    volatility: number;
    calmar: number;
    sortino: number;
  }>;
  height?: number;
  className?: string;
  isLoading?: boolean;
}

function RollingMetricsInner({ data, height = 300, className, isLoading = false }: RollingMetricsProps) {
  // Loading state
  if (isLoading) {
    return <SkeletonChart className={className} height={height} />;
  }
  // Mock data if no data provided
  const mockData = data || [
    { date: "2024-01-01", sharpe: 1.2, volatility: 0.15, calmar: 0.8, sortino: 1.5 },
    { date: "2024-02-01", sharpe: 1.4, volatility: 0.18, calmar: 1.0, sortino: 1.7 },
    { date: "2024-03-01", sharpe: 0.8, volatility: 0.22, calmar: 0.5, sortino: 1.0 },
    { date: "2024-04-01", sharpe: 1.6, volatility: 0.16, calmar: 1.2, sortino: 2.0 },
    { date: "2024-05-01", sharpe: 1.1, volatility: 0.19, calmar: 0.7, sortino: 1.3 },
    { date: "2024-06-01", sharpe: 1.8, volatility: 0.14, calmar: 1.5, sortino: 2.2 },
    { date: "2024-07-01", sharpe: 1.3, volatility: 0.17, calmar: 0.9, sortino: 1.6 },
    { date: "2024-08-01", sharpe: 1.7, volatility: 0.15, calmar: 1.3, sortino: 2.1 },
    { date: "2024-09-01", sharpe: 1.5, volatility: 0.16, calmar: 1.1, sortino: 1.8 },
    { date: "2024-10-01", sharpe: 1.4, volatility: 0.18, calmar: 1.0, sortino: 1.7 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-[#0e1117] border border-[#1a1f2e] rounded-lg p-3 shadow-lg">
          <p className="text-neutral-400 text-sm mb-2">{`Date: ${label}`}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="font-mono text-xs" style={{ color: entry?.color || '#fff' }}>
                {`${entry?.dataKey || 'Unknown'}: ${entry?.value?.toFixed(2) || 'N/A'}`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const currentValues = mockData[mockData.length - 1];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Rolling Metrics (30-day)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line
                type="monotone"
                dataKey="sharpe"
                stroke="#2D8EDF"
                strokeWidth={2}
                dot={false}
                name="Sharpe"
              />
              <Line
                type="monotone"
                dataKey="volatility"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
                name="Volatility"
              />
              <Line
                type="monotone"
                dataKey="calmar"
                stroke="#16A34A"
                strokeWidth={2}
                dot={false}
                name="Calmar"
              />
              <Line
                type="monotone"
                dataKey="sortino"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
                name="Sortino"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Current Values */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#1a1f2e]">
          <div className="text-center">
            <div className="text-xs text-neutral-500">Sharpe</div>
            <div className="text-cyan-400 font-mono text-sm">
              {currentValues.sharpe.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500">Volatility</div>
            <div className="text-amber-400 font-mono text-sm">
              {(currentValues.volatility * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500">Calmar</div>
            <div className="text-emerald-400 font-mono text-sm">
              {currentValues.calmar.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500">Sortino</div>
            <div className="text-rose-400 font-mono text-sm">
              {currentValues.sortino.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export with error boundary
export function RollingMetrics(props: RollingMetricsProps) {
  return (
    <ChartErrorBoundary>
      <RollingMetricsInner {...props} />
    </ChartErrorBoundary>
  );
}
