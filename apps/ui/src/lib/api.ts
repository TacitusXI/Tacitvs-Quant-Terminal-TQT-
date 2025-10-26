export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || 'Request failed',
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    };
  }
}

// Market data endpoints
export const marketApi = {
  getHistorical: (symbol: string, timeframe: string) =>
    fetchApi(`/api/market/historical/${symbol}/${timeframe}`),
  
  getLive: (symbol: string) =>
    fetchApi(`/api/market/live/${symbol}`),
  
  getSymbols: () =>
    fetchApi('/api/market/symbols'),
};

// Strategy endpoints
export const strategyApi = {
  list: () =>
    fetchApi('/api/strategies'),
  
  get: (id: string) =>
    fetchApi(`/api/strategies/${id}`),
  
  backtest: (strategyId: string, params: any) =>
    fetchApi('/api/backtest', {
      method: 'POST',
      body: JSON.stringify({ strategy_id: strategyId, ...params }),
    }),
};

// Execution endpoints
export const executionApi = {
  getPositions: () =>
    fetchApi('/api/execution/positions'),
  
  placeOrder: (order: any) =>
    fetchApi('/api/execution/order', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  
  cancelOrder: (orderId: string) =>
    fetchApi(`/api/execution/order/${orderId}`, {
      method: 'DELETE',
    }),
};

// Risk endpoints
export const riskApi = {
  getMetrics: () =>
    fetchApi('/api/risk/metrics'),
  
  getExposure: () =>
    fetchApi('/api/risk/exposure'),
};

