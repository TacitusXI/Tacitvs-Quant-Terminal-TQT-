# 🎨 Frontend Detailed Plan - Sci-Fi Terminal

**Дата:** 22 октября 2025  
**Статус:** 📋 DETAILED SPECIFICATION - Ready for Implementation

---

## 🎯 Overview

Этот документ содержит **детальную спецификацию** каждого экрана, компонента, кнопки и графика нашего терминала.

**Design Philosophy:**
- 🚀 **Sci-fi command center** (не биржевой интерфейс)
- 🎨 **Cyberpunk aesthetics** - неоновые акценты, glass морфизм, glow эффекты
- 📊 **Information density** - много данных, но структурировано
- ⚡ **Real-time feel** - live updates, smooth transitions
- 🎮 **Keyboard-first** - command palette, shortcuts

---

## 📐 Global Layout

### Main Structure:
```
┌──────────────────────────────────────────────────────────┐
│  [LOGO]  OPS  LAB  METRICS  CONSOLE     [⚡] [🔔] [⚙️]   │  ← Top Nav (60px)
├──────────────────────────────────────────────────────────┤
│                                                           │
│                                                           │
│                   MAIN CONTENT AREA                       │
│                                                           │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Top Navigation Bar (60px height):
**Left Side:**
- **Logo:** "⚡ TQT" (Tacitus Quant Terminal) - 40px, neon cyan glow
- **Nav Items:** OPS | LAB | METRICS | CONSOLE
  - Font: 14px, uppercase, tracking: 2px
  - Active: cyan underline (2px), text: cyan-400
  - Hover: text: cyan-300, subtle glow
  - Inactive: text: neutral-400

**Right Side:**
- **Connection Status:** Green dot (8px) + "LIVE" | Yellow "CONNECTING" | Red "OFFLINE"
- **Notifications:** Bell icon with badge (unread count)
- **Settings:** Gear icon
- **User Avatar:** Optional (future)

**Background:** bg-[#0a0c12] with bottom border: 1px solid #1a1f2e

---

## 🖥️ Page 1: OPS (Operations Terminal)

### Layout Grid:
```
┌─────────────────────────────────────────────────────────────┐
│  [H1: OPS TERMINAL]                     [STATUS BADGE]      │  ← Header (80px)
├─────────────────┬──────────────────┬────────────────────────┤
│                 │                  │                        │
│   PANEL 1:      │   PANEL 2:       │   PANEL 3:            │
│   TABLE MATRIX  │   CONTROLS       │   OPS LOG             │
│                 │                  │                        │
│   (400px)       │   (360px)        │   (flex-1)            │
│                 │                  │                        │
├─────────────────┴──────────────────┴────────────────────────┤
│                                                              │
│   PANEL 4: PRICE CHART WITH R-RULER                         │
│   (full width, 480px height)                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### PANEL 1: Table Matrix (Left Column, 400px)

**Purpose:** Показать все venue × market combinations с EV lamp индикацией.

**Layout:**
```
┌────────────────────────────────────────┐
│  📊 TABLES                             │  ← Title
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │  🟢 BTC-PERP                     │  │  ← Tile 1
│  │  Hyperliquid                     │  │
│  │  EV: +0.16R  │  P: 45%  │ b̄: 2.5│  │
│  │  ─────────────────────────────── │  │
│  │  Status: ARMED                   │  │
│  │  Position: NONE                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  🟡 ETH-PERP                     │  │  ← Tile 2
│  │  Hyperliquid                     │  │
│  │  EV: -0.02R  │  P: 42%  │ b̄: 2.2│  │
│  │  ─────────────────────────────── │  │
│  │  Status: HOLD                    │  │
│  │  Position: NONE                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  🔴 SOL-PERP                     │  │  ← Tile 3
│  │  Hyperliquid                     │  │
│  │  EV: -0.12R  │  P: 38%  │ b̄: 1.8│  │
│  │  ─────────────────────────────── │  │
│  │  Status: HOLD                    │  │
│  │  Position: NONE                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [+ Add Market]                        │  ← Button
└────────────────────────────────────────┘
```

**Tile Component Specs:**
- **Size:** 360px × 140px
- **Background:** bg-[#0e1117] (dark card)
- **Border:** 1px solid #1e2433 (subtle)
- **Hover:** border → cyan-500/30, lift 2px, shadow glow
- **Padding:** 16px

**Lamp (Status Indicator):**
- **Position:** Top-left corner (12px circle)
- **Colors:**
  - 🟢 Green (`emerald-400`) - EV > 0.05R → drop-shadow: 0 0 12px rgba(16,185,129,0.8)
  - 🟡 Yellow (`amber-400`) - EV between -0.02 and 0.05R → drop-shadow: 0 0 12px rgba(251,191,36,0.7)
  - 🔴 Red (`rose-400`) - EV < -0.02R → drop-shadow: 0 0 12px rgba(244,63,94,0.7)
- **Animation:** Pulse (scale 1.0 → 1.15 → 1.0) every 2s

**Market Name:**
- **Font:** 18px, semibold
- **Color:** neutral-100
- **Position:** Next to lamp

**Venue Name:**
- **Font:** 12px, uppercase, tracking: 1px
- **Color:** neutral-500
- **Position:** Below market name

**Metrics Row:**
- **Layout:** 3 columns (EV | P | b̄)
- **Font:** 11px, mono
- **Color:** neutral-400
- **Values:** Bold, neutral-200

**Divider:**
- **Height:** 1px
- **Color:** neutral-800
- **Margin:** 8px 0

**Status Row:**
- **Font:** 12px
- **Labels:** neutral-500
- **Values:** 
  - ARMED: emerald-400
  - HOLD: amber-400
  - OFF: neutral-600

**Position Row:**
- **Font:** 12px
- **NONE:** neutral-600
- **LONG:** emerald-400 + size
- **SHORT:** rose-400 + size

---

### PANEL 2: Controls (Center Column, 360px)

**Purpose:** Управление операциями и настройками.

**Layout:**
```
┌────────────────────────────────────────┐
│  ⚙️ CONTROLS                           │  ← Title
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │  OPS MODE                        │  │  ← Section 1
│  │                                  │  │
│  │  [ARM]  [HOLD]  [SIM]  [OFF]    │  │  ← Button Group
│  │   ✓                              │  │  ← Active indicator
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  RISK SETTINGS                   │  │  ← Section 2
│  │                                  │  │
│  │  Risk per Trade: 1.0%            │  │
│  │  [────────●──────────────] 2.0%  │  │  ← Slider
│  │                                  │  │
│  │  Capital: $10,000                │  │
│  │  R ($): $100                     │  │  ← Calculated
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  ROUTING                         │  │  ← Section 3
│  │                                  │  │
│  │  ○ Maker (rebates)               │  │  ← Radio
│  │  ● Taker (fast fill)             │  │
│  │                                  │  │
│  │  Estimated fees: -0.6 bps        │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  SAFETY                          │  │  ← Section 4
│  │                                  │  │
│  │  Daily Loss: -2.5R / 5R          │  │
│  │  [████████░░░░░░░░░░] 50%        │  │  ← Progress bar
│  │                                  │  │
│  │  [🛑 KILL SWITCH]                │  │  ← Emergency button
│  │  Status: ACTIVE                  │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Section Cards:**
- **Background:** bg-[#0e1117]
- **Border:** 1px solid #1e2433
- **Padding:** 16px
- **Margin-bottom:** 16px
- **Border-radius:** 16px

#### Section 1: OPS MODE Buttons
**Button Group (Segmented Control):**
- **Layout:** 4 buttons, equal width
- **Size:** Each 80px × 36px
- **Spacing:** 4px gap

**Button States:**
- **Inactive:**
  - Background: transparent
  - Border: 1px solid #2a3447
  - Text: neutral-400
  - Hover: bg-neutral-900/50
  
- **Active (ARM):**
  - Background: emerald-600/20
  - Border: 1px solid emerald-500
  - Text: emerald-400
  - Glow: drop-shadow: 0 0 16px rgba(16,185,129,0.4)
  
- **Active (HOLD):**
  - Background: amber-600/20
  - Border: 1px solid amber-500
  - Text: amber-400
  
- **Active (SIM):**
  - Background: sky-600/20
  - Border: 1px solid sky-500
  - Text: sky-400
  
- **Active (OFF):**
  - Background: neutral-800
  - Border: 1px solid neutral-700
  - Text: neutral-500

**Checkmark:**
- **Position:** Absolute top-right
- **Size:** 12px
- **Color:** Match button color

#### Section 2: RISK SETTINGS

**Risk Slider:**
- **Track:**
  - Height: 4px
  - Background: neutral-800
  - Border-radius: 2px
- **Fill:**
  - Background: gradient cyan-500 → emerald-400
  - Height: 4px
- **Thumb:**
  - Size: 16px circle
  - Background: white
  - Border: 2px solid cyan-500
  - Shadow: 0 0 12px rgba(6,182,212,0.6)
  - Hover: scale 1.1, glow увеличивается

**Labels:**
- **Font:** 13px, medium
- **Color:** neutral-300
- **Position:** Above slider

**Calculated Values:**
- **Font:** 14px, mono
- **Color:** neutral-200
- **R ($):** emerald-400 (подсвечиваем важное)

#### Section 3: ROUTING

**Radio Buttons:**
- **Inactive:**
  - Circle: 16px, border 2px solid #2a3447
  - Text: neutral-400
  
- **Active:**
  - Circle: 16px, border 2px solid cyan-500
  - Inner dot: 8px, bg cyan-500
  - Text: neutral-200
  - Glow: 0 0 8px rgba(6,182,212,0.4)

**Fees Display:**
- **Font:** 12px, mono
- **Color:** 
  - Positive (rebate): emerald-400
  - Negative (cost): rose-400

#### Section 4: SAFETY

**Daily Loss Bar:**
- **Track:**
  - Height: 24px
  - Background: neutral-900
  - Border: 1px solid #2a3447
  - Border-radius: 8px
  
- **Fill:**
  - Background: gradient from emerald-500 (0%) → amber-500 (50%) → rose-500 (100%)
  - Height: 22px
  - Border-radius: 7px
  - Smooth transition
  
- **Text Overlay:**
  - Font: 11px, bold, mono
  - Color: white
  - Position: center
  - Text-shadow for readability

**Kill Switch Button:**
- **Size:** 280px × 48px (wide, prominent)
- **Background:** Linear gradient rose-600 → rose-700
- **Border:** 2px solid rose-500
- **Text:** "🛑 KILL SWITCH" - 14px, bold, uppercase
- **Color:** white
- **Hover:** 
  - Background: rose-500
  - Glow: 0 0 24px rgba(244,63,94,0.8)
  - Cursor: pointer
  - Scale: 1.02
- **Active (pressed):**
  - Background: rose-900
  - Border: rose-400
  - Text: "✓ STOPPED"

**Status Text:**
- **Font:** 12px
- **Color:** 
  - ACTIVE: emerald-400
  - STOPPED: rose-400

---

### PANEL 3: Ops Log (Right Column, flex-1)

**Purpose:** Реал-тайм лог всех операций.

**Layout:**
```
┌────────────────────────────────────────┐
│  📜 OPS LOG               [Clear]      │  ← Title + action
├────────────────────────────────────────┤
│  14:31:42Z | BTC-PERP | TORTOISE |   │
│             ENTRY L | R_$=120 |      │
│             EV=+0.16 | maker          │
│  ───────────────────────────────────  │
│  14:30:15Z | ETH-PERP | TORTOISE |   │
│             HOLD | EV=-0.02R          │
│  ───────────────────────────────────  │
│  14:28:33Z | BTC-PERP | TORTOISE |   │
│             EXIT | P&L=+2.3R |        │
│             dur=4h32m                  │
│  ───────────────────────────────────  │
│  [... scrollable history ...]         │
└────────────────────────────────────────┘
```

**Container:**
- **Background:** bg-[#0a0e14]
- **Border:** 1px solid #1a1f2e
- **Border-radius:** 16px
- **Padding:** 16px
- **Height:** Match PANEL 1+2 combined
- **Overflow-y:** auto (scrollable)

**Log Entry:**
- **Font:** 11px, mono (monospace важно для alignment)
- **Line-height:** 1.6
- **Color:** neutral-300
- **Padding-bottom:** 12px
- **Border-bottom:** 1px solid #1a1f2e (divider)

**Timestamp:**
- **Color:** neutral-500
- **Format:** HH:MM:SSZ

**Market:**
- **Color:** cyan-400
- **Weight:** semibold

**Strategy:**
- **Color:** neutral-400
- **Weight:** normal

**Actions:**
- **ENTRY:** emerald-400
- **EXIT:** sky-400
- **HOLD:** amber-400
- **ERROR:** rose-400

**Values:**
- **Positive (+R):** emerald-400
- **Negative (-R):** rose-400
- **Neutral:** neutral-300

**Divider:**
- **Character:** "─" repeated (subtle ASCII line)
- **Color:** neutral-800

**Auto-scroll:**
- Новые записи появляются сверху
- Smooth scroll animation (200ms)
- Badge "New" появляется на 2s, потом fade out

**Clear Button:**
- **Size:** 60px × 24px
- **Background:** transparent
- **Border:** 1px solid neutral-700
- **Text:** 10px, uppercase, neutral-500
- **Hover:** bg-neutral-900/50, text: neutral-300

---

### PANEL 4: Price Chart with R-Ruler (Bottom, full width, 480px height)

**Purpose:** Показать цену + ключевые уровни R (entry, stop, target, trail).

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  📈 BTC-PERP | 1D                            [Timeframe ▾]   │  ← Header
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   48,000 ├─────────────────────────────────────────┤ Target │  ← Level lines
│          │                                          │         │
│   46,500 ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤ Trail  │
│          │    /\      /\                            │         │
│   45,000 ├───●●●●────●●●●───────────●──────────────┤ Entry  │  ← Candles
│          │   ││││    ││││           │               │         │
│   43,500 ├───●●●●────●●●●───────────●──────────────┤ Stop   │
│          │                                          │         │
│          └──────────────────────────────────────────┘         │
│          Jan 15     Jan 20     Jan 25     Jan 30              │  ← Time axis
└──────────────────────────────────────────────────────────────┘
```

**Container:**
- **Background:** bg-[#0a0e14]
- **Border:** 1px solid #1a1f2e
- **Border-radius:** 16px
- **Padding:** 16px
- **Height:** 480px

**Chart (Recharts):**
- **Type:** CandlestickChart (custom component)
- **Background:** transparent
- **Grid:**
  - Color: #1a1f2e
  - Opacity: 0.3
  - Dash: [2, 4]
  
**Candles:**
- **Bullish (close > open):**
  - Fill: emerald-500
  - Stroke: emerald-400
  - Opacity: 0.8
  
- **Bearish (close < open):**
  - Fill: rose-500
  - Stroke: rose-400
  - Opacity: 0.8
  
- **Width:** Auto (responsive)
- **Hover:** Opacity 1.0, glow

**R-Ruler Lines:**
- **Entry Line:**
  - Color: cyan-400
  - Width: 2px
  - Style: solid
  - Label: "Entry" (right side, bg cyan-900/50, padding 4px 8px)
  
- **Stop Line:**
  - Color: rose-400
  - Width: 2px
  - Style: dashed [4, 4]
  - Label: "Stop"
  
- **Target Line:**
  - Color: emerald-400
  - Width: 2px
  - Style: dashed [4, 4]
  - Label: "Target"
  
- **Trail Line:**
  - Color: amber-400
  - Width: 1px
  - Style: dashed [2, 2]
  - Label: "Trail" (опционально, если активен)

**Annotations:**
- **Entry Point:** Cyan dot (8px) с pulse animation
- **Exit Point:** Sky dot (8px) (если был exit)
- **Tooltip (hover):**
  - Background: #0a0e14
  - Border: 1px solid #1a1f2e
  - Padding: 12px
  - Content:
    ```
    Date: 2025-01-20
    Open:   $45,123
    High:   $46,789
    Low:    $44,567
    Close:  $46,234
    Volume: 1.2M
    ─────────────────
    Entry:  $45,000
    R ($):  $100
    ```

**Axes:**
- **X-Axis (Time):**
  - Font: 11px, mono
  - Color: neutral-500
  - Format: "Jan 15" (short date)
  
- **Y-Axis (Price):**
  - Font: 11px, mono
  - Color: neutral-500
  - Format: "$45,000" (with commas)
  - Position: right

**Timeframe Selector:**
- **Position:** Top-right
- **Options:** 5m | 15m | 1h | 4h | 1d | 1w
- **Style:** Segmented control (like OPS MODE buttons but smaller)
- **Size:** Each 32px × 28px
- **Active:** cyan-500 border + text

---

## 🧪 Page 2: LAB (Research Terminal)

### Layout:
```
┌─────────────────────────────────────────────────────────────┐
│  [H1: LAB TERMINAL]                                         │  ← Header
├─────────────────────────────────────────────────────────────┤
│  [Backtest] [Walk-Forward] [Monte Carlo] [Optimize]        │  ← Tabs
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                   TAB CONTENT AREA                          │
│                   (dynamic based on active tab)             │
│                                                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Tabs:**
- **Layout:** Horizontal segmented control
- **Size:** Each 140px × 40px
- **Font:** 13px, uppercase, tracking: 1px
- **Active:**
  - Background: bg-[#0e1117]
  - Border-bottom: 3px solid cyan-500
  - Text: cyan-400
- **Inactive:**
  - Background: transparent
  - Text: neutral-500
  - Hover: text neutral-300

---

### TAB 1: Backtest

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┐  ┌───────────────────────────────┐│
│  │  BACKTEST SETUP     │  │  RESULTS                      ││
│  │                     │  │                               ││
│  │  Strategy: [▾]      │  │  Return: +12.5%               ││
│  │  Market: [▾]        │  │  Sharpe: 1.23                 ││
│  │  Interval: [▾]      │  │  Max DD: -8.2%                ││
│  │  Start: [date]      │  │  Win Rate: 42%                ││
│  │  End: [date]        │  │  Avg R: +0.52                 ││
│  │  Capital: [input]   │  │  Total Trades: 48             ││
│  │  Risk %: [slider]   │  │                               ││
│  │                     │  │  ────────────────             ││
│  │  [RUN BACKTEST]     │  │                               ││
│  │                     │  │  [View Full Report]           ││
│  └─────────────────────┘  │  [Export CSV]                 ││
│                            └───────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  📈 EQUITY CURVE                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                      ╱                                │ │
│  │                    ╱                                  │ │
│  │                  ╱─                                   │ │
│  │                ╱                                      │ │
│  │              ╱─                                       │ │
│  │            ╱                                          │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  📊 DRAWDOWN                                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  ────────────────────────────────────────────────     │ │
│  │              │                                         │ │
│  │              │                                         │ │
│  │              └─────                                    │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Left Panel: BACKTEST SETUP (320px width)

**Form Fields:**

1. **Strategy Dropdown:**
   - **Width:** 280px
   - **Height:** 40px
   - **Options:** Tortoise | Mean Reversion | (future strategies)
   - **Style:** Dark dropdown with cyan accent
   
2. **Market Dropdown:**
   - **Options:** BTC-PERP | ETH-PERP | SOL-PERP | ALL
   
3. **Interval Dropdown:**
   - **Options:** 1m | 5m | 15m | 1h | 4h | 1d
   
4. **Date Range:**
   - **Two date pickers** (Start & End)
   - **Quick presets:** 1M | 3M | 6M | 1Y | ALL
   
5. **Capital Input:**
   - **Type:** number
   - **Placeholder:** "$10,000"
   - **Format:** Currency with commas
   
6. **Risk % Slider:**
   - **Range:** 0.1% to 3.0%
   - **Default:** 1.0%
   - **Same style as OPS panel slider**

**Run Button:**
- **Size:** 280px × 48px
- **Background:** Linear gradient cyan-600 → sky-600
- **Text:** "▶ RUN BACKTEST" - 14px, bold
- **Hover:** Glow, scale 1.02
- **Loading State:** 
  - Text: "⏳ RUNNING..."
  - Spinner animation
  - Disabled

#### Right Panel: RESULTS (flex-1)

**Metrics Grid (2 columns):**
```
Return: +12.5%        Sharpe: 1.23
Max DD: -8.2%         Calmar: 1.52
Win Rate: 42%         Avg R: +0.52
Total Trades: 48      Profit Factor: 1.8
```

**Metric Card:**
- **Font (label):** 11px, uppercase, neutral-500
- **Font (value):** 20px, bold, mono
- **Color (value):**
  - Positive: emerald-400
  - Negative: rose-400
  - Neutral: neutral-200

**Action Buttons:**
- **View Full Report:** Sky-600, opens modal with full markdown report
- **Export CSV:** Neutral-700, downloads trades CSV

#### Bottom Section: CHARTS (full width)

**Equity Curve Chart:**
- **Height:** 300px
- **Type:** LineChart (Recharts)
- **Line Color:** Gradient cyan-400 → emerald-400
- **Fill:** Gradient with opacity (glass effect)
- **Grid:** Subtle, #1a1f2e
- **Tooltip:** Same style as price chart
- **Y-Axis:** Show cumulative return %
- **X-Axis:** Date

**Drawdown Chart:**
- **Height:** 200px
- **Type:** AreaChart (inverted, goes down)
- **Fill Color:** rose-500 with opacity 0.3
- **Stroke:** rose-400
- **Grid:** Subtle
- **Y-Axis:** Show DD %
- **X-Axis:** Date

---

### TAB 2: Walk-Forward

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┐  ┌───────────────────────────────┐│
│  │  WF SETUP           │  │  IS vs OOS COMPARISON         ││
│  │                     │  │                               ││
│  │  Strategy: [▾]      │  │  In-Sample (IS):              ││
│  │  Market: [▾]        │  │    Sharpe: 1.45               ││
│  │  Mode: [▾]          │  │    Return: +15.2%             ││
│  │    • Rolling        │  │                               ││
│  │    • Anchored       │  │  Out-of-Sample (OOS):         ││
│  │                     │  │    Sharpe: 0.82  ↓ 43%       ││
│  │  Train: [180] days  │  │    Return: +8.7%  ↓ 43%      ││
│  │  Test:  [60] days   │  │                               ││
│  │  Step:  [30] days   │  │  OOS Consistency: 60%         ││
│  │                     │  │  (3/5 OOS periods profitable) ││
│  │  [RUN WF]           │  │                               ││
│  └─────────────────────┘  │  ────────────────             ││
│                            │  Degradation: -6.5%           ││
│                            │  Status: ⚠️  MODERATE         ││
│                            └───────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  📊 SPLIT COMPARISON                                        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Split #1  │  Split #2  │  Split #3  │  Split #4     │ │
│  │  IS: +12%  │  IS: +15%  │  IS: +18%  │  IS: +14%     │ │
│  │  OOS: +8%  │  OOS: +11% │  OOS: -2%  │  OOS: +9%     │ │
│  │  ✓         │  ✓         │  ✗         │  ✓            │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**

1. **Mode Selector (Rolling vs Anchored):**
   - Visual diagram показывает разницу
   - Rolling: "Train window moves"
   - Anchored: "Train window grows"

2. **Window Size Inputs:**
   - Sliders или number inputs
   - Live preview: "Will create N splits"

3. **Degradation Indicator:**
   - **Formula:** `(OOS - IS) / IS`
   - **Color coding:**
     - < 10%: 🟢 Good
     - 10-20%: 🟡 Moderate
     - \> 20%: 🔴 Overfitting likely

4. **Split Comparison Grid:**
   - Each split = card
   - Show IS vs OOS side-by-side
   - Checkmark/X for OOS profitability
   - Hover: Show detailed metrics

---

### TAB 3: Monte Carlo

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┐  ┌───────────────────────────────┐│
│  │  MC SETUP           │  │  RISK ANALYSIS                ││
│  │                     │  │                               ││
│  │  Load from:         │  │  Probability of Profit:       ││
│  │  ○ Backtest ID      │  │  ████████████░░░ 68%          ││
│  │  ● Trade CSV        │  │                               ││
│  │                     │  │  Median Return: +10.2%        ││
│  │  Simulations:       │  │  P5:  -5.2%                   ││
│  │  [─────●──] 1000    │  │  P95: +28.4%                  ││
│  │                     │  │                               ││
│  │  Method:            │  │  Risk of Ruin (-20%):         ││
│  │  ● Shuffle          │  │  ████░░░░░░░░░░░ 8%           ││
│  │  ○ Bootstrap        │  │                               ││
│  │                     │  │  Expected VaR (95%): -12.3%   ││
│  │  Seed: [1234]       │  │  CVaR (ES): -15.1%            ││
│  │  (reproducible)     │  │                               ││
│  │                     │  │  ────────────────             ││
│  │  [RUN MC]           │  │  Worst Case: -32%             ││
│  └─────────────────────┘  │  Best Case:  +45%             ││
│                            └───────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  📈 MONTE CARLO PATHS (Fan Chart)                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              ╱╱╱╱╱╱                                   │ │
│  │          ╱╱╱╱╱╱╱╱╱╱╱                                 │ │
│  │      ╱╱╱╱────────╱╱╱╱                                │ │  ← P95 (light)
│  │    ╱╱──────────────╱╱                                │ │  ← P75
│  │  ──────────────────────                              │ │  ← P50 (median, bright)
│  │  ╲╲────────────────╱╱                                │ │  ← P25
│  │    ╲╲╲╲──────────╱╱                                  │ │  ← P5 (light)
│  │      ╲╲╲╲╲╲╲╲╲╲╱╱                                    │ │
│  │          ╲╲╲╲╲╲                                       │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Fan Chart Visualization:**
- **Show percentiles:** P5, P25, P50, P75, P95
- **Colors:**
  - P50 (median): cyan-400, width: 3px, opacity: 1.0
  - P25/P75: cyan-400, width: 2px, opacity: 0.6
  - P5/P95: cyan-400, width: 1px, opacity: 0.3
- **Fill between:**
  - P25-P75: cyan-500 fill, opacity: 0.15
  - P5-P95: cyan-500 fill, opacity: 0.05
- **Hover:** Show all percentile values at that point

**Probability Bar:**
- Horizontal bar chart
- Filled portion: emerald for >50%, amber for 30-50%, rose for <30%
- Percentage text overlaid

---

### TAB 4: Optimize

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┐  ┌───────────────────────────────┐│
│  │  PARAMETER GRID     │  │  BEST RESULTS (Top 5)         ││
│  │                     │  │                               ││
│  │  don_break:         │  │  #1  don_break=20, risk=1.0   ││
│  │  [10,15,20,25,30]   │  │      OOS Sharpe: 1.23         ││
│  │                     │  │      Return: +15.2%           ││
│  │  don_exit:          │  │                               ││
│  │  [5,10,15,20]       │  │  #2  don_break=25, risk=0.5   ││
│  │                     │  │      OOS Sharpe: 1.18         ││
│  │  risk_pct:          │  │      Return: +12.8%           ││
│  │  [0.5,1.0,1.5,2.0]  │  │                               ││
│  │                     │  │  #3  don_break=15, risk=1.0   ││
│  │  Combinations: 80   │  │      OOS Sharpe: 1.12         ││
│  │  Est. Time: ~15min  │  │      Return: +11.5%           ││
│  │                     │  │                               ││
│  │  Objective:         │  │  ────────────────             ││
│  │  ● OOS Sharpe       │  │                               ││
│  │  ○ OOS Return       │  │  [View Heatmap]               ││
│  │  ○ Calmar           │  │  [Export All Results]         ││
│  │                     │  │                               ││
│  │  [START]            │  │  Progress: ████░░░░ 48/80     ││
│  │  [STOP]             │  │                               ││
│  └─────────────────────┘  └───────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  📊 PARAMETER SENSITIVITY HEATMAP                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           don_exit: 5    10    15    20              │ │
│  │  don_break=10     [0.8] [1.0] [0.9] [0.7]            │ │
│  │  don_break=15     [0.9] [1.2] [1.1] [0.8]            │ │
│  │  don_break=20     [1.1] [1.5] [1.3] [1.0]   ← Best   │ │
│  │  don_break=25     [1.0] [1.4] [1.2] [0.9]            │ │
│  │  don_break=30     [0.7] [1.1] [0.9] [0.6]            │ │
│  │                                                       │ │
│  │  Color: Blue (low) → Green (medium) → Red (high)     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**

1. **Dynamic Parameter Inputs:**
   - Add/remove parameters
   - Array input for values
   - Shows total combinations

2. **Progress Tracking:**
   - Real-time progress bar
   - Current combination being tested
   - Estimated time remaining

3. **Heatmap:**
   - 2D visualization для 2 параметров
   - Color gradient: cold → hot
   - Hover: Show exact metric value
   - Click cell: Load those params in backtest tab

4. **Best Results List:**
   - Top 5 configurations
   - Click to view full details
   - "Apply" button to use in OPS

---

## 📊 Page 3: METRICS

**Purpose:** Dashboard с ключевыми метриками и визуализациями.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [H1: METRICS DASHBOARD]                  [Time: 24H ▾]    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  EV Net  │ │  Daily   │ │ Win Rate │ │  Sharpe  │      │  ← KPI Cards
│  │  +0.12R  │ │  -2.5R   │ │   45%    │ │   1.23   │      │
│  │  🟢      │ │  🟡      │ │  🟢      │ │  🟢      │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
├─────────────────────────────────────────────────────────────┤
│  📈 ROLLING SHARPE (30-day)                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │        ╱─╲    ╱╲                                      │ │
│  │      ╱─    ╲╱  ╲─╲                                    │ │
│  │    ╱─             ╲                                   │ │
│  │  ╱─                ╲─                                 │ │
│  └───────────────────────────────────────────────────────┘ │
├────────────────────────┬────────────────────────────────────┤
│  📊 RISK BREAKDOWN     │  📉 P&L BY MARKET                 │
│  ┌──────────────────┐  │  ┌──────────────────────────┐    │
│  │  Exposure:       │  │  │  BTC:  +5.2R  ████████░░ │    │
│  │    BTC: 40%      │  │  │  ETH:  -1.3R  ██░░░░░░░░ │    │
│  │    ETH: 30%      │  │  │  SOL:  +2.1R  █████░░░░░ │    │
│  │    SOL: 20%      │  │  │  Total: +6.0R            │    │
│  │    Cash: 10%     │  │  └──────────────────────────┘    │
│  │                  │  │                                   │
│  │  [Pie Chart]     │  │                                   │
│  └──────────────────┘  │                                   │
└────────────────────────┴────────────────────────────────────┘
```

**KPI Cards:**
- **Size:** 240px × 140px
- **Layout:** 2×2 grid (responsive → 4 columns on wide screen)
- **Style:** Same as OPS tiles
- **Icon:** Large emoji/symbol at bottom
- **Value:** 32px, bold, colored
- **Label:** 12px, uppercase, neutral-500
- **Trend:** Small ↑↓ with % change

---

## 🖥️ Page 4: CONSOLE

**Purpose:** Command palette + system notifications.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ CONSOLE                                                  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │  > █                                                  │ │  ← Command input
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  RECENT COMMANDS:                                            │
│  > /status btc                                               │
│  > /backtest tortoise btc 1d 365                             │
│  > /arm                                                      │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  SYSTEM LOG:                                                 │
│  [14:31:42] ✓ Backtest completed                            │
│  [14:30:15] ⚠ EV dropped below threshold for ETH-PERP       │
│  [14:28:33] ✓ Position closed: BTC-PERP +2.3R               │
│  [14:25:10] ℹ Data updated: BTC-PERP 1d (365 candles)       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Command Input:**
- **Font:** 16px, mono
- **Placeholder:** "Type / for commands"
- **Autocomplete:** Dropdown появляется при вводе "/"
- **History:** Arrow up/down для navigation

**Commands List:**
```
/status <market>              - Show market status
/backtest <strategy> <market> - Run backtest
/mc <n>                       - Monte Carlo simulation
/arm                          - ARM trading
/hold                         - HOLD trading
/kill                         - Emergency stop
/clear                        - Clear console
/help                         - Show all commands
```

**System Log:**
- **Font:** 12px, mono
- **Icons:**
  - ✓ Success: emerald-400
  - ⚠ Warning: amber-400
  - ✗ Error: rose-400
  - ℹ Info: sky-400

---

## 🎨 Design System

### Color Palette:

**Base:**
```scss
$bg-primary: #0a0c12      // Main background
$bg-secondary: #0e1117    // Cards
$bg-tertiary: #1a1f2e     // Borders
$text-primary: #e5e7eb    // Main text (neutral-200)
$text-secondary: #9ca3af  // Labels (neutral-400)
$text-tertiary: #6b7280   // Muted (neutral-500)
```

**Accent Colors:**
```scss
$cyan: #22d3ee            // Info, links (cyan-400)
$emerald: #10b981         // Success, positive (emerald-500)
$amber: #fbbf24           // Warning, caution (amber-400)
$rose: #f43f5e            // Error, negative (rose-500)
$sky: #38bdf8             // Secondary accent (sky-400)
```

**Gradients:**
```scss
// Positive
background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);

// Warning
background: linear-gradient(135deg, #fbbf24 0%, #fb923c 100%);

// Error
background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%);

// Info/Neutral
background: linear-gradient(135deg, #22d3ee 0%, #38bdf8 100%);
```

### Typography:

**Font Families:**
```scss
$font-sans: 'Inter', -apple-system, system-ui;
$font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Font Sizes:**
```scss
$text-xs: 11px
$text-sm: 12px
$text-base: 14px
$text-lg: 16px
$text-xl: 18px
$text-2xl: 24px
$text-3xl: 32px
```

**Font Weights:**
```scss
$font-normal: 400
$font-medium: 500
$font-semibold: 600
$font-bold: 700
```

### Spacing:

```scss
$space-1: 4px
$space-2: 8px
$space-3: 12px
$space-4: 16px
$space-5: 20px
$space-6: 24px
$space-8: 32px
$space-10: 40px
$space-12: 48px
$space-16: 64px
```

### Border Radius:

```scss
$radius-sm: 8px
$radius-md: 12px
$radius-lg: 16px
$radius-xl: 24px
$radius-full: 9999px
```

### Shadows & Glow:

```scss
// Card shadow
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

// Hover shadow
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

// Neon glow (cyan)
box-shadow: 0 0 16px rgba(34, 211, 238, 0.5);

// Neon glow (emerald)
box-shadow: 0 0 16px rgba(16, 185, 129, 0.5);
```

### Animations:

```scss
// Fade in
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

// Pulse (for lamps)
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.8; }
}

// Slide up
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

// Glow pulse
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(34, 211, 238, 0.4); }
  50% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.8); }
}
```

---

## ⌨️ Keyboard Shortcuts

**Global:**
- `Ctrl/Cmd + K` - Open command palette
- `Ctrl/Cmd + /` - Focus console input
- `Ctrl/Cmd + ,` - Open settings
- `Escape` - Close modals/dropdowns

**Navigation:**
- `1` - OPS page
- `2` - LAB page
- `3` - METRICS page
- `4` - CONSOLE page

**OPS Controls:**
- `A` - ARM mode
- `H` - HOLD mode
- `S` - SIM mode
- `O` - OFF mode
- `K` - Kill switch (requires confirmation)
- `R` - Refresh data

**LAB:**
- `Space` - Run backtest/simulation
- `Enter` - Submit form
- `Tab` - Switch between tabs

---

## 📱 Responsive Breakpoints

```scss
$breakpoint-sm: 640px   // Mobile
$breakpoint-md: 768px   // Tablet
$breakpoint-lg: 1024px  // Laptop
$breakpoint-xl: 1280px  // Desktop
$breakpoint-2xl: 1536px // Large Desktop
```

**Adaptive Layout:**

**Mobile (< 768px):**
- Single column layout
- Panels stack vertically
- Simplified nav (hamburger menu)
- Charts reduce height

**Tablet (768px - 1024px):**
- 2 column grid where possible
- Side panels collapse to tabs
- Full charts

**Desktop (> 1024px):**
- Full 3 column layout (OPS)
- Side-by-side panels (LAB)
- Maximum chart sizes

---

## 🔄 Data Flow & State Management

### React Query:
```typescript
// Polling EV data every 5s
const { data: evData } = useQuery({
  queryKey: ['ev', market],
  queryFn: () => api.getEV(market),
  refetchInterval: 5000,
  staleTime: 2000
});

// Backtest mutation
const backtestMutation = useMutation({
  mutationFn: api.runBacktest,
  onSuccess: (data) => {
    toast.success('Backtest complete!');
    navigate('/lab/results');
  }
});
```

### Zustand Store:
```typescript
// lib/store.ts
interface UIStore {
  // OPS State
  opsMode: 'ARM' | 'HOLD' | 'SIM' | 'OFF';
  riskPct: number;
  routing: 'maker' | 'taker';
  
  // UI State
  paletteOpen: boolean;
  activePage: string;
  
  // Actions
  setOpsMode: (mode) => void;
  setRiskPct: (pct) => void;
  togglePalette: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  opsMode: 'SIM',
  riskPct: 1.0,
  routing: 'maker',
  paletteOpen: false,
  activePage: 'ops',
  
  setOpsMode: (mode) => set({ opsMode: mode }),
  setRiskPct: (pct) => set({ riskPct: pct }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen }))
}));
```

---

## 📦 Component Library

### Core Components:

**File:** `components/ui/Card.tsx`
```tsx
export const Card = ({ children, className, glow = false }) => (
  <div className={cn(
    'rounded-2xl bg-[#0e1117] border border-[#1e2433] p-4',
    glow && 'shadow-[0_0_16px_rgba(34,211,238,0.3)]',
    className
  )}>
    {children}
  </div>
);
```

**File:** `components/ui/Button.tsx`
```tsx
export const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  ...props 
}) => (
  <button className={cn(
    'rounded-xl font-medium transition-all',
    variant === 'primary' && 'bg-cyan-600 hover:bg-cyan-500 text-white',
    variant === 'success' && 'bg-emerald-600 hover:bg-emerald-500 text-white',
    variant === 'danger' && 'bg-rose-600 hover:bg-rose-500 text-white',
    size === 'sm' && 'px-3 py-1.5 text-sm',
    size === 'md' && 'px-4 py-2 text-base',
    size === 'lg' && 'px-6 py-3 text-lg'
  )} {...props}>
    {children}
  </button>
);
```

**File:** `components/Lamp.tsx`
```tsx
export const Lamp = ({ ev }: { ev: number }) => {
  const color = 
    ev > 0.05 ? 'emerald' :
    ev > -0.02 ? 'amber' :
    'rose';
    
  return (
    <div className={cn(
      'w-3 h-3 rounded-full animate-pulse',
      `bg-${color}-400 shadow-[0_0_12px_rgba(var(--${color}-rgb),0.8)]`
    )} />
  );
};
```

**File:** `components/OpsLog.tsx`
```tsx
export const OpsLog = ({ entries }: { entries: LogEntry[] }) => (
  <Card className="h-full overflow-auto font-mono text-xs">
    {entries.map((entry, i) => (
      <div key={i} className="border-b border-neutral-800 pb-2 mb-2">
        <span className="text-neutral-500">{entry.timestamp}</span>
        <span className="text-cyan-400 ml-2">{entry.market}</span>
        <span className="text-neutral-400 ml-2">{entry.strategy}</span>
        <div className={cn(
          'mt-1',
          entry.action === 'ENTRY' && 'text-emerald-400',
          entry.action === 'EXIT' && 'text-sky-400',
          entry.action === 'HOLD' && 'text-amber-400'
        )}>
          {entry.message}
        </div>
      </div>
    ))}
  </Card>
);
```

---

## 🧪 Testing Strategy

### Unit Tests:
```typescript
// Button.test.tsx
describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="success">Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-emerald-600');
  });
  
  it('handles click events', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Integration Tests (Playwright):
```typescript
// ops.spec.ts
test('OPS terminal workflow', async ({ page }) => {
  await page.goto('/OPS');
  
  // Check initial state
  await expect(page.locator('h1')).toContainText('OPS TERMINAL');
  
  // Switch to ARM mode
  await page.click('button:has-text("ARM")');
  await expect(page.locator('.opsMode')).toHaveText('ARM');
  
  // Adjust risk slider
  await page.locator('input[type="range"]').fill('1.5');
  await expect(page.locator('.riskDisplay')).toContainText('1.5%');
  
  // Check EV lamp updates
  await page.waitForSelector('.lamp.emerald');
});
```

---

## 📈 Performance Budget

**Targets:**
- **LCP (Largest Contentful Paint):** < 1.8s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTI (Time to Interactive):** < 2.5s

**Optimizations:**
- Code splitting по страницам
- Lazy load для charts (только при scroll)
- Image optimization (Next.js Image)
- Font subsetting
- Tree shaking (unused components)

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Day 1-2)
- [ ] Setup project structure
- [ ] Implement design system (colors, typography, spacing)
- [ ] Create base components (Card, Button, Input)
- [ ] Setup Zustand store
- [ ] Setup React Query

### Phase 2: OPS Terminal (Day 3-4)
- [ ] Table Matrix with Lamp logic
- [ ] Controls panel (ARM/HOLD/SIM)
- [ ] Risk slider with real-time calc
- [ ] Ops Log component
- [ ] Price chart with R-Ruler
- [ ] API integration (polling EV)

### Phase 3: LAB Terminal (Day 5-6)
- [ ] Backtest tab (form + results)
- [ ] Equity curve chart
- [ ] Drawdown chart
- [ ] Walk-Forward tab
- [ ] Monte Carlo tab with fan chart
- [ ] Parameter Optimizer tab

### Phase 4: METRICS & CONSOLE (Day 7)
- [ ] Metrics dashboard
- [ ] KPI cards
- [ ] Rolling Sharpe chart
- [ ] Console with command input
- [ ] System log

### Phase 5: Polish (Day 8-9)
- [ ] Command palette (Cmd+K)
- [ ] Keyboard shortcuts
- [ ] Animations (Framer Motion)
- [ ] Responsive layout
- [ ] Loading states
- [ ] Error handling
- [ ] Toasts/notifications

### Phase 6: Testing (Day 10)
- [ ] Unit tests (Jest + RTL)
- [ ] E2E tests (Playwright)
- [ ] Visual regression (Chromatic)
- [ ] Accessibility audit
- [ ] Performance audit

---

## ✅ Success Criteria

**Frontend MVP считается complete когда:**

1. ✅ **OPS Terminal полностью функционален:**
   - Table Matrix показывает EV lamps
   - Controls работают (ARM/HOLD/SIM)
   - Risk slider обновляет R ($)
   - Ops Log получает реал-тайм updates
   - Price chart показывает R-Ruler

2. ✅ **LAB Terminal позволяет:**
   - Запустить backtest через форму
   - Увидеть results (metrics + charts)
   - Провести Walk-Forward analysis
   - Запустить Monte Carlo simulation
   - Оптимизировать параметры

3. ✅ **API Integration работает:**
   - React Query polling для EV
   - Mutations для backtest/WF/MC
   - Error handling
   - Loading states

4. ✅ **UX на высоте:**
   - Все анимации smooth (60fps)
   - Command palette работает (Cmd+K)
   - Keyboard shortcuts
   - Responsive на всех breakpoints
   - Accessibilty (a11y) проходит audit

5. ✅ **Code Quality:**
   - TypeScript strict mode
   - 80%+ test coverage (components)
   - E2E tests для critical flows
   - No console errors
   - Performance budget соблюден

---

## 📞 Resources

### Design Inspiration:
- Vercel Dashboard
- Linear App
- Raycast
- GitHub Copilot UI
- Cyberpunk 2077 UI

### Component Libraries:
- shadcn/ui - https://ui.shadcn.com
- Recharts - https://recharts.org
- Framer Motion - https://www.framer.com/motion
- Radix UI - https://www.radix-ui.com

### Tools:
- Figma (design mockups)
- Chromatic (visual regression)
- Playwright (E2E testing)
- Lighthouse (performance)

---

**Этот план дает ТОЧНЫЕ спецификации для каждого компонента, кнопки и графика!** 🎨🚀

Теперь мы знаем:
- Где будет каждый график
- Как выглядит каждая кнопка
- Какие цвета, размеры, анимации
- Точный layout каждой страницы
- Все interactions и states

**Готовы к имплементации!** ✨

