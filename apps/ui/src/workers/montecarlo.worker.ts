// Monte Carlo simulation worker for backtesting
// Runs simulations in background thread to avoid blocking UI

export interface MonteCarloConfig {
  strategy: string;
  symbol: string;
  initialCapital: number;
  numSimulations: number;
  timeframe: string;
  startDate: string;
  endDate: string;
}

export interface MonteCarloResult {
  simulation: number;
  finalCapital: number;
  returns: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: number;
}

// Worker message handler
if (typeof self !== 'undefined') {
  self.onmessage = (event: MessageEvent<MonteCarloConfig>) => {
    const config = event.data;
    const results: MonteCarloResult[] = [];

    for (let i = 0; i < config.numSimulations; i++) {
      // Simulate strategy performance with randomness
      const result = runSimulation(config, i);
      results.push(result);

      // Send progress updates
      if ((i + 1) % 10 === 0 || i === config.numSimulations - 1) {
        self.postMessage({
          type: 'progress',
          progress: ((i + 1) / config.numSimulations) * 100,
          currentSimulation: i + 1,
          totalSimulations: config.numSimulations,
        });
      }
    }

    // Send final results
    self.postMessage({
      type: 'complete',
      results,
      summary: calculateSummary(results),
    });
  };
}

function runSimulation(config: MonteCarloConfig, seed: number): MonteCarloResult {
  // Simple Monte Carlo simulation
  // In production, this would use actual historical data and strategy logic
  
  const random = seededRandom(seed);
  let capital = config.initialCapital;
  let maxCapital = capital;
  let minCapital = capital;
  let trades = 0;

  // Simulate 100 trading days
  const days = 100;
  for (let day = 0; day < days; day++) {
    // Random win/loss based on simplified strategy
    const tradeOccurs = random() > 0.7;
    
    if (tradeOccurs) {
      trades++;
      const winProbability = 0.6; // 60% win rate
      const win = random() < winProbability;
      
      if (win) {
        capital += capital * (0.01 + random() * 0.02); // 1-3% gain
      } else {
        capital -= capital * (0.005 + random() * 0.01); // 0.5-1.5% loss
      }
      
      maxCapital = Math.max(maxCapital, capital);
      minCapital = Math.min(minCapital, capital);
    }
  }

  const returns = (capital - config.initialCapital) / config.initialCapital;
  const maxDrawdown = (minCapital - maxCapital) / maxCapital;
  const sharpeRatio = returns / (Math.abs(maxDrawdown) + 0.01) * Math.sqrt(252);

  return {
    simulation: seed,
    finalCapital: capital,
    returns,
    maxDrawdown,
    sharpeRatio,
    trades,
  };
}

function calculateSummary(results: MonteCarloResult[]) {
  const returns = results.map((r) => r.returns);
  const sharpes = results.map((r) => r.sharpeRatio);
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const avgSharpe = sharpes.reduce((a, b) => a + b, 0) / sharpes.length;
  
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const medianReturn = sortedReturns[Math.floor(sortedReturns.length / 2)];
  
  const percentile5 = sortedReturns[Math.floor(sortedReturns.length * 0.05)];
  const percentile95 = sortedReturns[Math.floor(sortedReturns.length * 0.95)];

  return {
    avgReturn,
    medianReturn,
    avgSharpe,
    percentile5,
    percentile95,
    bestReturn: Math.max(...returns),
    worstReturn: Math.min(...returns),
  };
}

// Seeded random number generator for reproducibility
function seededRandom(seed: number) {
  let value = seed;
  return function() {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

