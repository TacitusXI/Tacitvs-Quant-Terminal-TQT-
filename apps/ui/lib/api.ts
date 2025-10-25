/**
 * 🧠 TACITVS QUANT TERMINAL - API Client
 * FastAPI backend integration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Signal {
  market: string;
  side: 'LONG' | 'SHORT';
  entry: number;
  stop: number;
  target: number;
  r_usd: number;
  r_ratio: number;
  confidence: number;
}

export interface EVResult {
  ev_gross: number;
  ev_net: number;
  win_rate: number;
  avg_win_r: number;
  avg_loss_r: number;
  fees_r: number;
  funding_r: number;
  slippage_r: number;
  profitable: boolean;
}

export interface RiskCheck {
  can_open: boolean;
  reason?: string;
  daily_trades: number;
  daily_pnl: number;
  max_positions: number;
}

export interface BacktestParams {
  strategy: string;
  market: string;
  timeframe: string;
  start_date?: string;
  end_date?: string;
}

export interface BacktestResult {
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  total_trades: number;
  avg_ev: number;
  trades: Array<{
    timestamp: string;
    market: string;
    side: string;
    pnl: number;
    pnl_r: number;
  }>;
}

/**
 * API Client
 */
export const api = {
  // Health check
  async health(): Promise<{ status: string; version: string }> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('API health check failed');
    return res.json();
  },

  // Get signal
  async getSignal(market: string): Promise<Signal> {
    const res = await fetch(`${API_BASE_URL}/signal/${market}`);
    if (!res.ok) throw new Error('Failed to fetch signal');
    return res.json();
  },

  // Calculate EV
  async calculateEV(params: {
    win_rate: number;
    avg_win_r: number;
    avg_loss_r?: number;
    notional: number;
    r_usd: number;
  }): Promise<EVResult> {
    const res = await fetch(`${API_BASE_URL}/ev/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to calculate EV');
    return res.json();
  },

  // Risk check
  async checkRisk(params: {
    market: string;
    size: number;
    side: string;
  }): Promise<RiskCheck> {
    const res = await fetch(`${API_BASE_URL}/risk/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to check risk');
    return res.json();
  },

  // Run backtest
  async runBacktest(params: BacktestParams): Promise<BacktestResult> {
    const res = await fetch(`${API_BASE_URL}/backtest/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to run backtest');
    return res.json();
  },

  // Get markets
  async getMarkets(): Promise<Array<{ symbol: string; price: number; volume_24h: number }>> {
    const res = await fetch(`${API_BASE_URL}/markets`);
    if (!res.ok) throw new Error('Failed to fetch markets');
    return res.json();
  },
};

/**
 * Query keys for TanStack Query
 */
export const queryKeys = {
  health: ['health'],
  signal: (market: string) => ['signal', market],
  markets: ['markets'],
  backtest: (params: BacktestParams) => ['backtest', params],
} as const;

