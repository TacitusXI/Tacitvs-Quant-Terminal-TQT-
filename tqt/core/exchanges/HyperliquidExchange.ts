import type { IExchange, OrderBookL2, Trade, FundingInfo, FeeSchedule, RiskParams, PlaceOrder, Placed, Position, AccountInfo } from "./IExchange";

export class HyperliquidExchange implements IExchange {
  constructor(private cfg: { wsUrl: string; restUrl: string; apiKey?: string; apiSecret?: string; }){}
  name() { return "hyperliquid"; }
  async time(): Promise<number> { return Date.now(); }
  async orderbook(pair: string): Promise<OrderBookL2> { return { bids: [], asks: [], ts: Date.now() }; }
  async *trades(pair: string, since?: number): AsyncIterable<Trade> { if (false) yield { ts: 0, price: 0, size: 0, side: 'buy' }; }
  async funding(pair: string): Promise<FundingInfo> { return { rate: 0, nextTs: Date.now()+3600000 }; }
  async fees(tier?: string): Promise<FeeSchedule> { return { makerBps: -1.5, takerBps: 4.5 }; }
  async riskParams(pair: string): Promise<RiskParams> { return { initMargin: 0.05, maintMargin: 0.03 }; }
  async place(o: PlaceOrder): Promise<Placed> { return { id: `mock-${Date.now()}`, status: 'accepted' }; }
  async cancel(id: string): Promise<void> { return; }
  async positions(): Promise<Position[]> { return []; }
  async account(): Promise<AccountInfo> { return { equity: 0, balances: {} }; }
}
