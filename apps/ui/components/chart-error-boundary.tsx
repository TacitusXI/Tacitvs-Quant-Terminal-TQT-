"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { logBoundaryError } from "@/lib/error-logger";
import { ReactNode } from "react";

interface ChartErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

function ChartErrorFallback({ error, resetError }: ChartErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px] p-8 bg-[#0a0a14] border border-[#F43F5E]/30 rounded-lg">
      <div className="text-center space-y-4">
        <div className="text-4xl">📊</div>
        <div>
          <div className="text-lg font-bold text-[#F43F5E] mb-1">
            Chart Failed to Load
          </div>
          <div className="text-sm text-neutral-500">
            {error?.message || "Unable to render chart data"}
          </div>
        </div>
        {resetError && (
          <button
            onClick={resetError}
            className="px-4 py-2 text-sm bg-[#6243DD] hover:bg-[#2D8EDF] text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

interface ChartErrorBoundaryProps {
  children: ReactNode;
}

export function ChartErrorBoundary({ children }: ChartErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={<ChartErrorFallback />}
      onError={(error, errorInfo) => {
        logBoundaryError(error, errorInfo, {
          boundaryType: "ChartErrorBoundary",
          chartComponent: true,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

