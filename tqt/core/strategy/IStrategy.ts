export interface Bar { ts: number; o: number; h: number; l: number; c: number; v?: number; }
export interface Signal {
  type: 'entry'|'exit';
  side?: 'buy'|'sell';
  pair: string;
  stopR?: number;
  targetR?: number;
  meta?: Record<string, any>;
}
export interface BarCtx {
  pair: string;
  bars: Bar[];
  equity: number;
}
export interface IStrategy {
  id: string;
  markets: string[];
  params: Record<string, any>;
  onBar(ctx: BarCtx): Signal[];
}
