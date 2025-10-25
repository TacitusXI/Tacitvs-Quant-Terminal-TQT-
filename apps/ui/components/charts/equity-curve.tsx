"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartErrorBoundary } from "@/components/chart-error-boundary";
import { SkeletonChart } from "@/components/ui/skeleton";

interface EquityCurveProps {
  data?: Array<{
    date: string;
    equity: number;
    drawdown: number;
  }>;
  height?: number;
  className?: string;
  isLoading?: boolean;
}

function EquityCurveInner({ data, height = 300, className, isLoading = false }: EquityCurveProps) {
  // Loading state
  if (isLoading) {
    return <SkeletonChart className={className} height={height} />;
  }

  // Mock data if no data provided
  const mockData = data || [
    { date: "2024-01-01", equity: 10000, drawdown: 0 },
    { date: "2024-02-01", equity: 10500, drawdown: -200 },
    { date: "2024-03-01", equity: 9800, drawdown: -500 },
    { date: "2024-04-01", equity: 11200, drawdown: -100 },
    { date: "2024-05-01", equity: 10800, drawdown: -300 },
    { date: "2024-06-01", equity: 12000, drawdown: 0 },
    { date: "2024-07-01", equity: 11500, drawdown: -400 },
    { date: "2024-08-01", equity: 12500, drawdown: -200 },
    { date: "2024-09-01", equity: 13000, drawdown: 0 },
    { date: "2024-10-01", equity: 12800, drawdown: -300 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const equity = payload[0]?.value;
      // Get drawdown from the original data point
      const dataPoint = mockData.find(d => d.date === label);
      const drawdown = dataPoint?.drawdown;
      
      return (
        <div className="bg-[#0e1117] border border-[#1a1f2e] rounded-lg p-3 shadow-lg">
          <p className="text-neutral-400 text-sm mb-2">{`Date: ${label}`}</p>
          <p className="text-emerald-400 font-mono text-sm">
            {`Equity: $${equity?.toLocaleString() || 'N/A'}`}
          </p>
          {drawdown !== undefined && (
            <p className="text-rose-400 font-mono text-sm">
              {`Drawdown: ${drawdown.toFixed(2)}%`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Equity Curve
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="equity"
                stroke="#2D8EDF"
                strokeWidth={2}
                dot={{ fill: "#2D8EDF", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#2D8EDF", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#1a1f2e]">
          <div className="text-center">
            <div className="text-xs text-neutral-500">Total Return</div>
            <div className="text-emerald-400 font-mono text-sm">
              +{((mockData[mockData.length - 1].equity / mockData[0].equity - 1) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500">Max DD</div>
            <div className="text-rose-400 font-mono text-sm">
              {Math.min(...mockData.map(d => d.drawdown)).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500">Current</div>
            <div className="text-neutral-200 font-mono text-sm">
              ${mockData[mockData.length - 1].equity.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export with error boundary
export function EquityCurve(props: EquityCurveProps) {
  return (
    <ChartErrorBoundary>
      <EquityCurveInner {...props} />
    </ChartErrorBoundary>
  );
}
