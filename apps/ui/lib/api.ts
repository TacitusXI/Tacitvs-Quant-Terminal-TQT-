// API client for backend integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Health check
export async function getHealth(): Promise<{ ok: boolean }> {
  return apiCall("/health");
}

// EV calculation
export interface EVCalculationRequest {
  win_rate: number;
  avg_win_r: number;
  avg_loss_r?: number;
  notional_in: number;
  r_usd: number;
  fees_eff?: number;
  funding?: number;
  slippage?: number;
  gas?: number;
}

export interface EVCalculationResponse {
  ev_gross: number;
  ev_net: number;
  costs_in_r: number;
  fees_cost: number;
  funding_cost: number;
  slippage_cost: number;
  gas_cost: number;
}

export async function calculateEV(
  data: EVCalculationRequest
): Promise<EVCalculationResponse> {
  return apiCall("/api/ev/calculate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Risk management
export interface PositionSizeRequest {
  entry_price: number;
  stop_price: number;
  equity: number;
  risk_pct: number;
}

export interface PositionSizeResponse {
  position_size: number;
  r_usd: number;
  notional: number;
}

export async function calculatePositionSize(
  data: PositionSizeRequest
): Promise<PositionSizeResponse> {
  return apiCall("/api/risk/position-size", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Strategy signals
export interface StrategySignalRequest {
  strategy_id: string;
  market: string;
  current_bar: any;
  history: any[];
}

export interface StrategySignalResponse {
  signal: {
    side: "LONG" | "SHORT" | "EXIT";
    entry_price: number;
    stop_price: number;
    target_price: number;
    r_ratio: number;
  };
  confidence: number;
}

export async function getStrategySignal(
  data: StrategySignalRequest
): Promise<StrategySignalResponse> {
  return apiCall("/api/strategy/signal", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Data management
export interface DataFetchRequest {
  market: string;
  interval: string;
  days_back?: number;
  start_date?: string;
  end_date?: string;
}

export async function fetchData(data: DataFetchRequest): Promise<any> {
  return apiCall("/api/data/fetch", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getDataList(): Promise<string[]> {
  return apiCall("/api/data/list");
}

export async function getCandles(
  market: string,
  interval: string,
  days_back = 30
): Promise<any[]> {
  return apiCall(`/api/data/candles?market=${market}&interval=${interval}&days_back=${days_back}`);
}

// Backtest operations
export interface BacktestRequest {
  strategy: string;
  market: string;
  interval: string;
  days_back: number;
  initial_capital: number;
  risk_pct?: number;
}

export interface BacktestResponse {
  results: {
    metrics: {
      return_pct: number;
      sharpe: number;
      max_dd_pct: number;
      win_rate: number;
      avg_r: number;
      total_trades: number;
      profit_factor: number;
    };
    trades: any[];
    equity_curve: any[];
  };
}

export async function runBacktest(data: BacktestRequest): Promise<BacktestResponse> {
  return apiCall("/api/backtest/run", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Walk-Forward analysis
export interface WalkForwardRequest {
  strategy: string;
  market: string;
  interval: string;
  train_days: number;
  test_days: number;
  step_days: number;
  mode: "rolling" | "anchored";
}

export interface WalkForwardResponse {
  n_splits: number;
  is_metrics: any;
  oos_metrics: any;
  oos_consistency: number;
  is_to_oos_degradation: number;
  splits: any[];
}

export async function runWalkForward(data: WalkForwardRequest): Promise<WalkForwardResponse> {
  return apiCall("/api/backtest/walk-forward", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Monte Carlo simulation
export interface MonteCarloRequest {
  trades: any[];
  n_simulations?: number;
  method?: "shuffle" | "bootstrap";
  seed?: number;
}

export interface MonteCarloResponse {
  simulations: number;
  prob_profit: number;
  median_return_pct: number;
  percentiles: {
    p5: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p95: number[];
  };
  risk_analysis: {
    prob_ruin_20pct: number;
    var_95: number;
    cvar_95: number;
  };
}

export async function runMonteCarlo(data: MonteCarloRequest): Promise<MonteCarloResponse> {
  return apiCall("/api/backtest/monte-carlo", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Parameter optimization
export interface OptimizeRequest {
  strategy: string;
  market: string;
  interval: string;
  param_grid: Record<string, any[]>;
  objective: "oos_sharpe" | "oos_return" | "calmar";
  train_days: number;
  test_days: number;
}

export interface OptimizeResponse {
  best_params: Record<string, any>;
  best_score: number;
  all_results: any[];
  sensitivity: Record<string, string>;
}

export async function runOptimization(data: OptimizeRequest): Promise<OptimizeResponse> {
  return apiCall("/api/backtest/optimize", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
