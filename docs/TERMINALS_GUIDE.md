# 🖥️ TQT Terminals User Guide

**Complete guide to all 4 terminal interfaces in Tacitus Quant Terminal**

---

## 📋 Table of Contents

1. [OPS Terminal](#ops-terminal) - Operations & Live Trading
2. [LAB Terminal](#lab-terminal) - Research & Backtesting
3. [METRICS Terminal](#metrics-terminal) - Performance Analytics
4. [CONSOLE Terminal](#console-terminal) - Developer CLI

---

## 🎮 OPS Terminal

**Location:** `/OPS`  
**Shortcut:** `Cmd+1` or `Ctrl+1`  
**Purpose:** Main operations dashboard for live trading and market monitoring

### 📊 What You See

#### **Market Matrix (6 Markets)**
Real-time grid display showing:
- **BTC-PERP** - Bitcoin perpetual futures
- **ETH-PERP** - Ethereum perpetual futures
- **SOL-PERP** - Solana perpetual futures
- **AVAX-PERP** - Avalanche perpetual futures
- **MATIC-PERP** - Polygon perpetual futures
- **ARB-PERP** - Arbitrum perpetual futures

Each market tile shows:
- 🟢/🟡/🔴 **Status Lamp** - EV-based color (Green=Good, Yellow=Neutral, Red=Bad)
- **EV Value** - Expected Value in R-units (e.g., +0.15R)
- **Win Rate** - Probability of winning trade (e.g., 45%)
- **Avg Win** - Average win size in R-units (e.g., 2.5R)
- **Avg Loss** - Average loss size in R-units (e.g., -1.0R)
- **Last Update** - Timestamp of last data refresh

#### **Backend Status Card**
Shows:
- 🟢 **LIVE** - Backend connected and operational
- 🔴 **OFFLINE** - Backend disconnected
- **Last Health Check** - When backend was last pinged
- **Available Data** - Number of datasets loaded

#### **Operations Mode Controls**
Three modes for trading safety:

1. **STANDBY Mode** 🔵
   - Default safe mode
   - No trading allowed
   - Read-only market monitoring
   - Risk-free observation

2. **ARM Mode** 🟡
   - Strategy armed and ready
   - Can execute trades on signal
   - Manual confirmation required
   - Safety protocols active

3. **LIVE Mode** 🟢
   - Fully automated trading
   - Strategy executes without confirmation
   - Real capital at risk
   - All systems operational

#### **Risk Controls**
- **Risk Slider** - Adjust risk per trade (1-5%)
- **R Value Display** - Shows dollar amount at risk
- **Kill Switch** - Emergency stop all trading

#### **Price Chart with R-Ruler**
- Live OHLCV candlestick chart
- **Entry Line** (blue) - Planned entry price
- **Stop Line** (red) - Stop loss price (-1R)
- **Target Line** (green) - Take profit price (+2R)
- Visual risk/reward visualization

### 🎯 What You Can Do

✅ **Monitor Markets**
- Watch 6 markets simultaneously
- See real-time EV updates
- Track win rates and R-multiples

✅ **Control Trading Mode**
- Switch between STANDBY/ARM/LIVE
- Emergency stop with Kill Switch
- Adjust risk percentage per trade

✅ **Visualize Risk**
- See entry/stop/target on chart
- Understand R-units visually
- Plan trades with R-Ruler overlay

✅ **Check System Status**
- Verify backend connection
- Monitor data availability
- View last update times

### 🚫 What You Cannot Do (Yet)

❌ Manual order entry (coming in Week 5)
❌ Position management (coming in Week 5)
❌ Order book view (coming in Week 5)
❌ Trade history (available in METRICS)

---

## 🧪 LAB Terminal

**Location:** `/LAB`  
**Shortcut:** `Cmd+2` or `Ctrl+2`  
**Purpose:** Research playground for strategy testing and optimization

### 📊 What You See

#### **4 Research Tabs**

##### 1️⃣ **Backtest Tab** 🧪 (ACTIVE)
Current implementation:

**Backtest Setup Form:**
- **Strategy Selection** - Choose strategy (Tortoise, etc.)
- **Market Selection** - Pick market to test (BTC-PERP, ETH-PERP, etc.)
- **Interval Selection** - Timeframe (1d, 4h, 1h)
- **Days Back** - Historical period to test (30, 60, 90, 180, 365)
- **Capital** - Starting capital in USD
- **Risk %** - Risk per trade (1-5%)

**Results Section:**
After running backtest, you see:
- **📈 Equity Curve** - Portfolio growth over time
- **📉 Drawdown Chart** - Risk periods visualization
- **🎲 Monte Carlo Fan** - Probability distribution
- **📊 Trade Statistics** - Win rate, R-multiple, etc.

##### 2️⃣ **Walk-Forward Tab** 📊 (COMING SOON)
What it will do:
- Split data into train/test periods
- Optimize on training data
- Validate on out-of-sample test data
- Detect overfitting
- Show IS vs OOS performance degradation

##### 3️⃣ **Monte Carlo Tab** 🎲 (COMING SOON)
What it will do:
- Shuffle trade order 1000+ times
- Generate probability distribution
- Calculate risk of ruin
- Show best/worst/median cases
- Percentile curves (P5, P25, P50, P75, P95)

##### 4️⃣ **Optimize Tab** ⚙️ (COMING SOON)
What it will do:
- Grid search parameter space
- Test multiple combinations
- Rank by OOS performance
- Prevent overfitting
- Find robust parameters

### 🎯 What You Can Do

✅ **Run Backtests**
- Test Tortoise strategy on any market
- Choose timeframe and period
- See visual results immediately
- Analyze equity and drawdown

✅ **Configure Tests**
- Adjust capital and risk settings
- Test different markets side-by-side
- Compare intervals (1d vs 4h vs 1h)

✅ **Visual Analysis**
- Equity curve with return %
- Drawdown chart with max DD
- Monte Carlo simulation results
- Trade-by-trade breakdown

✅ **Quick Iteration**
- Change parameters and re-run instantly
- Compare multiple backtests
- Identify best setups

### 🚫 What You Cannot Do (Yet)

❌ Walk-Forward analysis (Tab 2)
❌ Pure Monte Carlo simulation (Tab 3)
❌ Parameter optimization (Tab 4)
❌ Multi-strategy comparison
❌ Custom strategy creation (need Python)

---

## 📈 METRICS Terminal

**Location:** `/METRICS`  
**Shortcut:** `Cmd+3` or `Ctrl+3`  
**Purpose:** Comprehensive performance analytics and reporting

### 📊 What You See

#### **1. Performance Overview Cards**
Grid of key metrics:

- **Total Return**
  - Percentage return on starting capital
  - Shows overall profitability
  - Color-coded: Green (profit) / Red (loss)

- **Sharpe Ratio**
  - Risk-adjusted return metric
  - Higher = better risk/reward
  - Industry standard: >1.0 good, >2.0 excellent

- **Max Drawdown**
  - Largest peak-to-trough decline
  - Shows worst-case scenario
  - Critical for position sizing

- **Win Rate**
  - Percentage of winning trades
  - Context: 40-50% is normal for trend following
  - Not the only metric that matters

#### **2. Equity & Drawdown Analysis**

**Equity Curve Chart:**
- Line chart showing portfolio growth
- X-axis: Time (dates)
- Y-axis: Account balance ($)
- Shows cumulative returns
- Identifies growth periods

**Drawdown Chart:**
- Area chart showing risk periods
- Shows underwater periods
- Displays recovery time
- Highlights max drawdown point

#### **3. Risk Metrics Chart**

**Rolling Metrics Over Time:**
- **Sharpe Ratio** - Risk-adjusted returns
- **Calmar Ratio** - Return / Max Drawdown
- **Sortino Ratio** - Downside deviation focus
- **Volatility** - Price movement magnitude

Each metric plotted on same chart to see:
- How risk profile changes over time
- Periods of stability vs chaos
- Strategy consistency

#### **4. Monte Carlo Analysis**

**Fan Chart showing:**
- **P5 Line** (5th percentile) - Worst 5% of cases
- **P25 Line** (25th percentile) - Below average
- **P50 Line** (50th percentile) - Median outcome
- **P75 Line** (75th percentile) - Above average
- **P95 Line** (95th percentile) - Best 5% of cases

**Statistics:**
- **Simulations** - Number of permutations run
- **Prob Profit** - Probability of positive return
- **Median Return** - Middle outcome expectation

#### **5. Trade Quality Section** (COMING SOON)
Will show:
- Win/Loss distribution
- R-multiple histogram
- Best/Worst trades
- Trade duration analysis

### 🎯 What You Can Do

✅ **Analyze Performance**
- See overall strategy profitability
- Understand risk-adjusted returns
- Identify periods of strength/weakness

✅ **Risk Assessment**
- Evaluate max drawdown tolerance
- Check if risk matches expectations
- Compare Sharpe/Sortino/Calmar

✅ **Visualize Outcomes**
- See equity growth trajectory
- Understand drawdown periods
- Monte Carlo probability ranges

✅ **Compare Metrics**
- Multiple risk metrics side-by-side
- Rolling window analysis
- Identify metric degradation

### 🚫 What You Cannot Do (Yet)

❌ Export reports (coming soon)
❌ Trade journal entries
❌ Compare multiple strategies
❌ Filter by time period
❌ Custom metric calculations

---

## 💻 CONSOLE Terminal

**Location:** `/CONSOLE`  
**Shortcut:** `Cmd+4` or `Ctrl+4`  
**Purpose:** Developer command-line interface for power users

### 📊 What You See

#### **Terminal Interface**
- Command input line with cursor
- Scrollable output window
- Command history
- Color-coded messages:
  - 🟢 **Green** - Success messages
  - 🔴 **Red** - Errors
  - 🟡 **Yellow** - Warnings
  - ⚪ **Gray** - Info/neutral

### 🎯 Available Commands

#### **help**
```bash
> help
```
Shows list of all available commands with descriptions

#### **clear**
```bash
> clear
```
Clears the console output

#### **status**
```bash
> status
```
Shows system status:
- Backend connection
- API health
- Data availability
- Current mode (STANDBY/ARM/LIVE)

#### **markets**
```bash
> markets
```
Lists all available markets:
- BTC-PERP, ETH-PERP, SOL-PERP, etc.
- Shows which markets have data loaded
- Displays market status

#### **backtest [strategy] [market]**
```bash
> backtest tortoise BTC-PERP
```
Runs a quick backtest:
- Executes strategy on specified market
- Uses default parameters
- Shows results in console
- Faster than LAB UI for quick tests

**Arguments:**
- `strategy` - Strategy name (tortoise, etc.)
- `market` - Market symbol (BTC-PERP, ETH-PERP, etc.)

#### **ev [market]**
```bash
> ev BTC-PERP
```
Calculates Expected Value for market:
- Shows EV in R-units
- Displays win rate
- Shows avg win/loss
- Indicates if tradeable (EV > 0)

**Arguments:**
- `market` - Market symbol to analyze

#### **history**
```bash
> history
```
Shows command history:
- Last 50 commands
- Numbered list
- Can use up/down arrows to navigate

#### **theme [dark|light]** (COMING SOON)
```bash
> theme dark
```
Changes UI theme:
- `dark` - Dark mode (current)
- `light` - Light mode (coming)

### 🎯 What You Can Do

✅ **Quick Commands**
- Run backtests without UI
- Check EV instantly
- View market status
- System diagnostics

✅ **Command History**
- Use ↑/↓ arrows to navigate
- Re-run previous commands
- See history with `history` command

✅ **Keyboard Shortcuts**
- `Cmd+L` or `Ctrl+L` - Clear console
- `↑` - Previous command
- `↓` - Next command
- `Enter` - Execute command
- `Esc` - Clear input

✅ **Scripting Potential**
- Chain commands together
- Automate common tasks
- Power user workflows

### 🚫 What You Cannot Do (Yet)

❌ Custom command aliases
❌ Scripting/macros
❌ Output export
❌ Command piping
❌ Advanced data queries

---

## 🔄 Cross-Terminal Features

### **Global Keyboard Shortcuts**

Available from ANY terminal:

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open Command Palette |
| `Cmd/Ctrl + 1` | Go to OPS |
| `Cmd/Ctrl + 2` | Go to LAB |
| `Cmd/Ctrl + 3` | Go to METRICS |
| `Cmd/Ctrl + 4` | Go to CONSOLE |
| `Cmd/Ctrl + B` | Run Backtest (on LAB) |
| `Cmd/Ctrl + /` | Show Shortcuts Help |
| `Esc` | Close Modals |

### **Command Palette**
Press `Cmd+K` to open:
- Fuzzy search commands
- Navigate to any terminal
- Execute actions
- Discover features

### **Navigation Bar** (All Pages)

**Left Side:**
- TQT Logo (click to go home)

**Center:**
- Terminal tabs (OPS, LAB, METRICS, CONSOLE)
- Current page highlighted with neon glow

**Right Side:**
- 🟢/🔴 Backend status indicator
- 🔔 Notifications (coming soon)
- ⚙️ Settings (coming soon)
- ⌘K Command palette trigger
- ⌨️ Shortcuts hint

---

## 📊 Feature Matrix

| Feature | OPS | LAB | METRICS | CONSOLE |
|---------|-----|-----|---------|---------|
| **Live Data** | ✅ | ✅ | ✅ | ✅ |
| **Historical Data** | ✅ | ✅ | ✅ | ✅ |
| **Backtesting** | ❌ | ✅ | ❌ | ✅ (CLI) |
| **Trading Controls** | ✅ | ❌ | ❌ | ❌ |
| **Performance Charts** | ✅ | ✅ | ✅ | ❌ |
| **Risk Metrics** | ✅ | ✅ | ✅ | ❌ |
| **Command Line** | ❌ | ❌ | ❌ | ✅ |
| **Mode Control** | ✅ | ❌ | ❌ | ✅ (status) |
| **Multi-Market View** | ✅ | ❌ | ❌ | ✅ (list) |
| **R-Ruler** | ✅ | ❌ | ❌ | ❌ |

---

## 🎯 Typical Workflows

### **Workflow 1: Daily Trading Routine**

1. **Start in OPS** (`Cmd+1`)
   - Check backend status (🟢 LIVE)
   - Review overnight market changes
   - Verify all 6 markets updated

2. **Switch to METRICS** (`Cmd+3`)
   - Review yesterday's performance
   - Check if still on equity curve
   - Verify no excessive drawdown

3. **Back to OPS** (`Cmd+1`)
   - Adjust risk % if needed
   - Switch to ARM mode
   - Monitor for signals
   - Execute trades manually or let strategy run

4. **End of Day in METRICS** (`Cmd+3`)
   - Review trade results
   - Update performance tracking
   - Check risk metrics

### **Workflow 2: Strategy Research**

1. **Start in LAB** (`Cmd+2`)
   - Open Backtest tab
   - Select Tortoise strategy
   - Choose BTC-PERP market

2. **First Test**
   - Days back: 365
   - Interval: 1d
   - Capital: $10,000
   - Risk: 1%
   - Click "Run Backtest"

3. **Analyze Results**
   - Check equity curve slope
   - Review max drawdown
   - Look at win rate

4. **Switch to METRICS** (`Cmd+3`)
   - Deep dive into risk metrics
   - Check Sharpe ratio
   - Analyze Monte Carlo outcomes

5. **Back to LAB** (`Cmd+2`)
   - Try different interval (4h, 1h)
   - Test different markets
   - Compare results

6. **Use CONSOLE** (`Cmd+4`)
   - Quick EV checks: `ev BTC-PERP`
   - Rapid backtests: `backtest tortoise ETH-PERP`
   - System diagnostics: `status`

### **Workflow 3: Problem Diagnosis**

1. **CONSOLE** (`Cmd+4`)
   ```bash
   > status
   ```
   - Check if backend alive
   - Verify data loaded

2. **If Backend Issues:**
   ```bash
   > markets
   ```
   - See which markets available
   - Identify missing data

3. **If Strategy Issues:**
   - Go to LAB (`Cmd+2`)
   - Run backtest on problem market
   - Check if EV still positive

4. **If Performance Issues:**
   - Go to METRICS (`Cmd+3`)
   - Check recent drawdown
   - Review rolling Sharpe
   - Identify degradation point

---

## 💡 Tips & Best Practices

### **OPS Terminal**
✅ Always start in STANDBY mode
✅ Use Risk Slider to adjust to market conditions
✅ Check R-Ruler before every trade
✅ Keep Kill Switch easily accessible
❌ Never go LIVE without checking backend status
❌ Don't ignore declining EV values

### **LAB Terminal**
✅ Test multiple intervals before trusting results
✅ Always check 180+ days of data
✅ Compare multiple markets
✅ Look for consistent patterns
❌ Don't overfit to one market
❌ Don't trust single backtest (use Walk-Forward)

### **METRICS Terminal**
✅ Check metrics daily
✅ Watch for Sharpe degradation
✅ Monitor drawdown duration
✅ Compare current to historical performance
❌ Don't panic on single bad day
❌ Don't ignore sustained metric decline

### **CONSOLE Terminal**
✅ Use for quick checks
✅ Learn command shortcuts
✅ Keep history of important commands
✅ Use `help` when stuck
❌ Don't rely on console for complex analysis
❌ Don't forget to check visual charts too

---

## 🚀 Coming Soon (Week 5+)

### **OPS Terminal**
- 📝 Manual order entry form
- 📊 Position management panel
- 📖 Live order book display
- 📈 Real-time P&L tracking
- 🔔 Trade notifications
- 📱 Mobile-friendly view

### **LAB Terminal**
- 📊 Walk-Forward complete implementation
- 🎲 Standalone Monte Carlo analysis
- ⚙️ Parameter optimizer with heatmaps
- 📝 Custom strategy builder (UI)
- 🔄 Multi-strategy comparison
- 📦 Strategy import/export

### **METRICS Terminal**
- 📊 Trade journal with notes
- 📈 Custom metric builder
- 📉 Advanced filtering (by date, market, strategy)
- 📄 PDF/CSV report export
- 📊 Multi-strategy comparison charts
- 🎯 Performance attribution analysis

### **CONSOLE Terminal**
- 💾 Command aliases
- 📝 Script execution
- 🔄 Command piping
- 📊 Data export commands
- 🔍 Advanced queries (SQL-like)
- 🎨 Theme customization

---

## 📚 Related Documentation

- **[PROJECT_STATUS.md](../PROJECT_STATUS.md)** - Full project overview
- **[QUICKSTART.md](QUICKSTART.md)** - Installation guide
- **[API_REFERENCE.md](api/API_REFERENCE.md)** - Backend API docs
- **[STRATEGY_FRAMEWORK.md](strategies/STRATEGY_FRAMEWORK.md)** - Create strategies
- **[FRONTEND_DETAILED_PLAN.md](FRONTEND_DETAILED_PLAN.md)** - UI specifications

---

## 🆘 Troubleshooting

### **Problem: Backend shows OFFLINE**
**Solution:**
1. Go to CONSOLE (`Cmd+4`)
2. Type: `status`
3. Check if backend process running
4. Restart backend: `cd apps/api && python main.py`

### **Problem: No data in Market Matrix**
**Solution:**
1. Go to CONSOLE (`Cmd+4`)
2. Type: `markets`
3. Check which markets loaded
4. Verify Hyperliquid API accessible

### **Problem: Backtest button does nothing**
**Solution:**
1. Check browser console (F12)
2. Verify all form fields filled
3. Go to CONSOLE and try: `backtest tortoise BTC-PERP`
4. Check backend logs for errors

### **Problem: Charts not loading**
**Solution:**
1. Check if SkeletonChart appears (loading state)
2. Wait for data to load (can take 5-10s)
3. Check backend status in OPS
4. Try refreshing page (F5)

---

**Last Updated:** October 25, 2025  
**Version:** Week 4 Complete  
**Status:** All 4 terminals operational ✅

