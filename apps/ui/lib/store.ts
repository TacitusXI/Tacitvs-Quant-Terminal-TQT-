import { create } from "zustand";

// OPS Mode types
export type OpsMode = "ARM" | "HOLD" | "SIM" | "OFF";
export type RoutingMode = "maker" | "taker";

// UI State interface
interface UIState {
  // OPS State
  opsMode: OpsMode;
  riskPct: number;
  routing: RoutingMode;
  
  // UI State
  paletteOpen: boolean;
  activePage: string;
  
  // Backend connection
  backendConnected: boolean;
  lastHealthCheck: number;
  
  // Actions
  setOpsMode: (mode: OpsMode) => void;
  setRiskPct: (pct: number) => void;
  setRouting: (mode: RoutingMode) => void;
  togglePalette: () => void;
  setActivePage: (page: string) => void;
  setBackendConnected: (connected: boolean) => void;
  updateHealthCheck: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  opsMode: "SIM",
  riskPct: 1.0,
  routing: "maker",
  paletteOpen: false,
  activePage: "ops",
  backendConnected: false,
  lastHealthCheck: 0,
  
  // Actions
  setOpsMode: (mode) => set({ opsMode: mode }),
  setRiskPct: (pct) => set({ riskPct: pct }),
  setRouting: (mode) => set({ routing: mode }),
  togglePalette: () => set((state) => ({ paletteOpen: !state.paletteOpen })),
  setActivePage: (page) => set({ activePage: page }),
  setBackendConnected: (connected) => set({ backendConnected: connected }),
  updateHealthCheck: () => set({ lastHealthCheck: Date.now() }),
}));

// Market data interface
export interface MarketData {
  market: string;
  venue: string;
  ev: number;
  winRate: number;
  avgWin: number;
  status: "ARMED" | "HOLD" | "OFF";
  position: "NONE" | "LONG" | "SHORT";
  positionSize?: number;
  lastUpdate?: number;
}

// Ops log entry interface
export interface OpsLogEntry {
  timestamp: number;
  market: string;
  strategy: string;
  action: "ENTRY" | "EXIT" | "HOLD" | "ERROR";
  message: string;
  rValue?: number;
  ev?: number;
  router?: string;
}

// Store for market data
interface MarketStore {
  markets: MarketData[];
  opsLog: OpsLogEntry[];
  
  // Actions
  updateMarket: (market: string, data: Partial<MarketData>) => void;
  addLogEntry: (entry: OpsLogEntry) => void;
  clearLog: () => void;
  setMarkets: (markets: MarketData[]) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  // Initial state
  markets: [
    {
      market: "BTC-PERP",
      venue: "Hyperliquid",
      ev: 0.16,
      winRate: 0.45,
      avgWin: 2.5,
      status: "ARMED",
      position: "NONE",
      lastUpdate: Date.now(),
    },
    {
      market: "ETH-PERP",
      venue: "Hyperliquid",
      ev: -0.02,
      winRate: 0.42,
      avgWin: 2.2,
      status: "HOLD",
      position: "NONE",
      lastUpdate: Date.now(),
    },
    {
      market: "SOL-PERP",
      venue: "Hyperliquid",
      ev: -0.12,
      winRate: 0.38,
      avgWin: 1.8,
      status: "HOLD",
      position: "NONE",
      lastUpdate: Date.now(),
    },
  ],
  opsLog: [
    {
      timestamp: Date.now() - 30000,
      market: "BTC-PERP",
      strategy: "TORTOISE",
      action: "ENTRY",
      message: "ENTRY L | R_$=120 | EV=+0.16 | maker",
      rValue: 120,
      ev: 0.16,
      router: "maker",
    },
    {
      timestamp: Date.now() - 60000,
      market: "ETH-PERP",
      strategy: "TORTOISE",
      action: "HOLD",
      message: "HOLD | EV=-0.02R",
      ev: -0.02,
    },
    {
      timestamp: Date.now() - 120000,
      market: "BTC-PERP",
      strategy: "TORTOISE",
      action: "EXIT",
      message: "EXIT | P&L=+2.3R | dur=4h32m",
      rValue: 2.3,
    },
  ],
  
  // Actions
  updateMarket: (market, data) =>
    set((state) => ({
      markets: state.markets.map((m) =>
        m.market === market ? { ...m, ...data, lastUpdate: Date.now() } : m
      ),
    })),
  
  addLogEntry: (entry) =>
    set((state) => ({
      opsLog: [entry, ...state.opsLog],
    })),
  
  clearLog: () => set({ opsLog: [] }),
  
  setMarkets: (markets) => set({ markets }),
}));
