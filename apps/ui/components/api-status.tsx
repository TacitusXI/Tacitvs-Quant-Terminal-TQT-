"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lamp } from "@/components/ui/lamp";
import { Skeleton } from "@/components/ui/skeleton";
import { SpinnerDots } from "@/components/ui/spinner";
import { Timestamp } from "@/components/ui/timestamp";
import { useHealth, useDataList } from "@/lib/hooks";
import { useUIStore } from "@/lib/store";

export function ApiStatus() {
  const { dataMode } = useUIStore();
  
  // Only fetch API status in LIVE mode
  const { data: health, isLoading: healthLoading, error: healthError } = useHealth();
  const { data: dataList, isLoading: dataLoading } = useDataList();

  // In MOCK mode, show mock status
  if (dataMode === "MOCK") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎭 Data Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lamp ev={0.1} size="md" />
              <span className="font-semibold text-neutral-100">
                Mock Data Active
              </span>
            </div>
            <div className="text-sm font-mono text-[var(--color-accent-light)]">
              MOCK
            </div>
          </div>
          <div className="text-xs text-neutral-500">
            Using simulated data for visualization. Switch to LIVE mode in CONSOLE to connect to backend.
          </div>
        </CardContent>
      </Card>
    );
  }

  // LIVE mode - show actual API status
  const isConnected = health?.ok && !healthError;
  const status = isConnected ? "LIVE" : "OFFLINE";
  const statusColor = isConnected ? "emerald" : "rose";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔌 API Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {healthLoading ? (
              <Skeleton variant="circular" width={12} height={12} />
            ) : (
              <Lamp ev={isConnected ? 0.1 : -0.1} size="md" />
            )}
            <span className="font-semibold text-neutral-100">
              Backend Connection
            </span>
          </div>
          <div className={`text-sm font-mono ${
            isConnected ? "text-[#16A34A]" : "text-[var(--color-danger)]"
          }`}>
            {healthLoading ? (
              <div className="flex items-center gap-2">
                <SpinnerDots size="sm" color="cyan" />
                <span className="text-[var(--color-secondary)]">CONNECTING</span>
              </div>
            ) : (
              status
            )}
          </div>
        </div>

        {isConnected && (
          <div className="space-y-2">
            <div className="text-xs text-neutral-500">
              Last Health Check: {health?.timestamp ? 
                <Timestamp timestamp={health.timestamp} className="inline" /> : 
                "Unknown"
              }
            </div>
            
            <div className="text-xs text-neutral-500">
              Available Data: {dataLoading ? "Loading..." : 
                `${dataList?.length || 0} datasets`
              }
            </div>
          </div>
        )}

        {healthError && (
          <div className="text-xs text-rose-400">
            Error: {healthError.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
