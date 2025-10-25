"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lamp } from "@/components/ui/lamp";
import { Skeleton } from "@/components/ui/skeleton";
import { SpinnerDots } from "@/components/ui/spinner";
import { Timestamp } from "@/components/ui/timestamp";
import { useHealth, useDataList } from "@/lib/hooks";

export function ApiStatus() {
  const { data: health, isLoading: healthLoading, error: healthError } = useHealth();
  const { data: dataList, isLoading: dataLoading } = useDataList();

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
            isConnected ? "text-[#16A34A]" : "text-[#F43F5E]"
          }`}>
            {healthLoading ? (
              <div className="flex items-center gap-2">
                <SpinnerDots size="sm" color="cyan" />
                <span className="text-[#2D8EDF]">CONNECTING</span>
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
