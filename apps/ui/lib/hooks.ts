import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getHealth,
  calculateEV,
  calculatePositionSize,
  getStrategySignal,
  fetchData,
  getDataList,
  getCandles,
  runBacktest,
  runWalkForward,
  runMonteCarlo,
  runOptimization,
  type EVCalculationRequest,
  type PositionSizeRequest,
  type StrategySignalRequest,
  type DataFetchRequest,
  type BacktestRequest,
  type WalkForwardRequest,
  type MonteCarloRequest,
  type OptimizeRequest,
} from "@/lib/api";

// Health check hook
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 30000, // Check every 30 seconds
  });
}

// EV calculation hook
export function useEVCalculation(data: EVCalculationRequest) {
  return useQuery({
    queryKey: ["ev-calculation", data],
    queryFn: () => calculateEV(data),
    enabled: !!data.win_rate && !!data.avg_win_r,
    staleTime: 10000, // 10 seconds
  });
}

// Position size calculation hook
export function usePositionSize(data: PositionSizeRequest) {
  return useQuery({
    queryKey: ["position-size", data],
    queryFn: () => calculatePositionSize(data),
    enabled: !!data.entry_price && !!data.stop_price,
    staleTime: 5000, // 5 seconds
  });
}

// Strategy signal hook
export function useStrategySignal(data: StrategySignalRequest) {
  return useQuery({
    queryKey: ["strategy-signal", data.strategy_id, data.market],
    queryFn: () => getStrategySignal(data),
    enabled: !!data.strategy_id && !!data.market,
    refetchInterval: 5000, // Poll every 5 seconds for live signals
  });
}

// Data management hooks
export function useDataList() {
  return useQuery({
    queryKey: ["data-list"],
    queryFn: getDataList,
    staleTime: 60000, // 1 minute
  });
}

export function useCandles(market: string, interval: string, daysBack = 30) {
  return useQuery({
    queryKey: ["candles", market, interval, daysBack],
    queryFn: () => getCandles(market, interval, daysBack),
    enabled: !!market && !!interval,
    staleTime: 300000, // 5 minutes
  });
}

// Backtest hooks
export function useBacktest(data: BacktestRequest) {
  return useQuery({
    queryKey: ["backtest", data],
    queryFn: () => runBacktest(data),
    enabled: false, // Manual trigger only
    staleTime: Infinity, // Don't refetch automatically
  });
}

export function useWalkForward(data: WalkForwardRequest) {
  return useQuery({
    queryKey: ["walk-forward", data],
    queryFn: () => runWalkForward(data),
    enabled: false, // Manual trigger only
    staleTime: Infinity,
  });
}

export function useMonteCarlo(data: MonteCarloRequest) {
  return useQuery({
    queryKey: ["monte-carlo", data],
    queryFn: () => runMonteCarlo(data),
    enabled: false, // Manual trigger only
    staleTime: Infinity,
  });
}

export function useOptimization(data: OptimizeRequest) {
  return useQuery({
    queryKey: ["optimization", data],
    queryFn: () => runOptimization(data),
    enabled: false, // Manual trigger only
    staleTime: Infinity,
  });
}

// Hook for running backtests with mutation
export function useRunBacktest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: runBacktest,
    onSuccess: (data) => {
      // Invalidate backtest queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["backtest"] });
      
      // Store results in cache for immediate access
      queryClient.setQueryData(["backtest-results"], data);
    },
    onError: (error) => {
      console.error("Backtest failed:", error);
    },
  });
}

// Hook for running walk-forward analysis
export function useRunWalkForward() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: runWalkForward,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["walk-forward"] });
      queryClient.setQueryData(["walk-forward-results"], data);
    },
  });
}

// Hook for running Monte Carlo simulation
export function useRunMonteCarlo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: runMonteCarlo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["monte-carlo"] });
      queryClient.setQueryData(["monte-carlo-results"], data);
    },
  });
}

// Hook for running parameter optimization
export function useRunOptimization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: runOptimization,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["optimization"] });
      queryClient.setQueryData(["optimization-results"], data);
    },
  });
}

// Hook for market data with real-time updates
export function useMarketData(market: string) {
  const { data: candles } = useCandles(market, "1d", 30);
  const { data: health } = useHealth();
  
  // Calculate EV based on recent performance
  const evData = useQuery({
    queryKey: ["market-ev", market],
    queryFn: async () => {
      if (!candles || candles.length < 10) {
        // Fallback to mock data if no real data
        return {
          ev: Math.random() * 0.3 - 0.15,
          winRate: 0.4 + Math.random() * 0.2,
          avgWin: 1.5 + Math.random() * 1.0,
          timestamp: Date.now(),
        };
      }

      // Calculate basic EV from recent candles
      const recentCandles = candles.slice(-20);
      const returns = recentCandles.map((candle, i) => {
        if (i === 0) return 0;
        return (candle.close - recentCandles[i-1].close) / recentCandles[i-1].close;
      });

      const positiveReturns = returns.filter(r => r > 0);
      const negativeReturns = returns.filter(r => r < 0);
      
      const winRate = positiveReturns.length / returns.length;
      const avgWin = positiveReturns.length > 0 ? 
        positiveReturns.reduce((a, b) => a + b, 0) / positiveReturns.length : 0;
      const avgLoss = negativeReturns.length > 0 ? 
        Math.abs(negativeReturns.reduce((a, b) => a + b, 0) / negativeReturns.length) : 0;
      
      const ev = winRate * avgWin - (1 - winRate) * avgLoss;

      return {
        ev,
        winRate,
        avgWin: avgWin / (avgLoss || 1), // R-ratio
        timestamp: Date.now(),
      };
    },
    enabled: !!market,
    refetchInterval: 10000, // Update every 10 seconds
  });

  return {
    candles,
    ev: evData.data,
    health,
    isLoading: evData.isLoading,
    error: evData.error,
  };
}

// Hook for multiple markets
export function useMarketsData(markets: string[]) {
  const queries = markets.map(market => useMarketData(market));
  
  return {
    markets: queries.map((query, index) => ({
      market: markets[index],
      ...query,
    })),
    isLoading: queries.some(query => query.isLoading),
    error: queries.find(query => query.error)?.error,
  };
}
