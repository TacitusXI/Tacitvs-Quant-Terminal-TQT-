export interface OrderBookLevel { price: number; size: number; }
export interface OrderBookL2 { bids: OrderBookLevel[]; asks: OrderBookLevel[]; ts: number; }
export interface Trade { ts: number; price: number; size: number; side: 'buy'|'sell'; }
export interface FundingInfo { rate: number; nextTs: number; }
export interface FeeSchedule { makerBps: number; takerBps: number; makerRebateBps?: number; }
export interface RiskParams { initMargin: number; maintMargin: number; }

export type TIF = 'GTC' | 'IOC' | 'FOK';
export interface PlaceOrder {
  pair: string; side: 'buy'|'sell'; qty: number; price?: number;
  postOnly?: boolean; tif?: TIF; reduceOnly?: boolean; clientId?: string;
}
export interface Placed { id: string; status: 'accepted'|'rejected'; }

export interface Position { pair: string; qty: number; entryPx: number; }

export interface AccountInfo { equity: number; balances: Record<string, number>; tier?: string; }

export interface IExchange {
  name(): string;
  time(): Promise<number>;
  orderbook(pair: string): Promise<OrderBookL2>;
  trades(pair: string, since?: number): AsyncIterable<Trade>;
  funding(pair: string): Promise<FundingInfo>;
  fees(tier?: string): Promise<FeeSchedule>;
  riskParams(pair: string): Promise<RiskParams>;
  place(o: PlaceOrder): Promise<Placed>;
  cancel(id: string): Promise<void>;
  positions(): Promise<Position[]>;
  account(): Promise<AccountInfo>;
}
