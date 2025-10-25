# Tacitus Quant Terminal - Frontend

**Status:** ✅ Foundation Complete | 🎨 Silent Blade Design System Active

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend running on port 8080

### Setup
```bash
cd apps/ui
npm install
```

### Development
```bash
npm run dev
```

Opens on: http://localhost:3000

### Environment Variables
Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 📁 Project Structure

```
apps/ui/
├── app/                    # Next.js App Router pages
│   ├── OPS/               # Operations Terminal
│   ├── LAB/               # Research Terminal  
│   ├── METRICS/           # Metrics Dashboard
│   ├── CONSOLE/           # Console & Commands
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Splash screen
│   └── icon.webp          # Favicon (Silent Blade logo)
├── components/
│   ├── ui/                # Base UI components
│   │   ├── button.tsx     # Button with cyber styling
│   │   ├── card.tsx       # Glass morphism cards
│   │   ├── lamp.tsx       # EV lamp indicator
│   │   ├── slider.tsx     # Risk slider
│   │   └── timestamp.tsx  # Client-side timestamp
│   ├── charts/            # Chart components
│   │   ├── price-chart.tsx
│   │   ├── equity-curve.tsx
│   │   ├── drawdown-chart.tsx
│   │   ├── monte-carlo-fan.tsx
│   │   └── rolling-metrics.tsx
│   ├── providers/
│   │   └── query-provider.tsx  # React Query provider
│   ├── navigation.tsx     # Top navigation
│   ├── market-matrix.tsx  # Market grid with EV
│   ├── backtest-runner.tsx
│   └── api-status.tsx
├── lib/
│   ├── api.ts            # Backend API client
│   ├── hooks.ts          # React Query hooks
│   ├── store.ts          # Zustand state management
│   └── utils.ts          # Utility functions
├── public/
│   └── logo.webp         # Silent Blade logo
└── app/globals.css       # Silent Blade Design System
```

---

## 🎨 Silent Blade Design System

### Philosophy
**"Precision forged in darkness"** — A cyberpunk aesthetic combining military-grade precision with laboratory elegance. Cold steel meets quantum computing.

### Core Palette (The Blade)

#### Primary Colors
```css
--neon-purple: #6243DD  /* Violet core - intelligence, premium */
--neon-cyan: #2D8EDF    /* Cyber blue - reliability, tech */
--neon-blue: #00f3ff    /* Electric accent - energy */
```

#### Base Colors (The Steel)
```css
--void-black: #0a0b0e   /* Gunmetal background */
--deep-space: #0a0a14   /* Card backgrounds */
--abyss: #050508        /* Deepest shadows */
--border-steel: #1b2230 /* Metal borders */
--grid-color: rgba(115, 74, 253, 0.08) /* Subtle grid */
```

#### Rare Accents (≤5% usage - The Edge)
```css
--ion-green: #8AFF00    /* Laser precision - critical wins */
--magenta-shock: #FF2E88 /* Alert state - danger zones */
--amber-forge: #FFB020   /* Warm metal - important CTA */
```

#### Status Colors (Trading Signals)
```css
--success-emerald: #16A34A  /* Profitable, EV > 0.05R */
--warning-amber: #FFB020    /* Caution, EV 0-0.05R */
--danger-rose: #F43F5E      /* Loss, EV < 0R */
--info-cyan: #7FB7FF        /* Information, neutral */
```

### Material System

#### Glass Morphism (Laboratory Aesthetic)
```css
/* Cyber Card - Standard */
background: rgba(10, 10, 20, 0.8);
backdrop-filter: blur(20px);
border: 1px solid rgba(115, 74, 253, 0.3);
box-shadow: 
  0 0 30px rgba(115, 74, 253, 0.2),
  inset 0 0 30px rgba(49, 164, 253, 0.05),
  0 8px 32px rgba(0, 0, 0, 0.4);
```

#### Metal Specular (Blade Edge)
```css
/* Specular highlights on hover */
background:
  linear-gradient(180deg, rgba(255,255,255,0.04), transparent),
  linear-gradient(22.5deg, rgba(98,67,221,0.12), rgba(45,142,223,0.12)),
  #0b0f16;
```

#### Grid Engineering (Blueprint)
```css
/* Technical grid overlay */
background-image: 
  linear-gradient(var(--grid-color) 1.5px, transparent 1.5px),
  linear-gradient(90deg, var(--grid-color) 1.5px, transparent 1.5px);
background-size: 40px 40px;
```

### Typography

#### Fonts
- **Display/Titles:** JetBrains Mono (cyber aesthetic, monospaced precision)
- **Body:** Inter (clean, readable, modern)
- **Code/Numbers:** JetBrains Mono (technical data)

#### Text Effects
```css
/* Cyber Title - Holographic gradient */
.cyber-title {
  background: linear-gradient(135deg, #6243DD, #2D8EDF, #00f3ff);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 15px rgba(115, 74, 253, 0.6));
  animation: gradient-shift 8s ease infinite;
}

/* Glitch Effect - Rare use for critical alerts */
.glitch-title::before {
  animation: glitch-1 3s infinite linear alternate-reverse;
  color: var(--neon-purple);
}
```

### Animation Language (Motion Physics)

#### Pulse Rhythm (Laboratory)
```css
/* Subtle, scientific - 6-8% brightness change */
@keyframes lamp-pulse {
  0%, 100% { 
    box-shadow: 0 0 20px currentColor;
  }
  50% { 
    box-shadow: 0 0 40px currentColor;
  }
}
/* Duration: 2s ease-in-out */
```

#### Gradient Flow (Holographic)
```css
/* Diagonal blade gradient - 22.5° angle */
background: linear-gradient(22.5deg, #6243dd 0%, #2d8edf 100%);
animation: gradient-rotate 8s ease infinite;
```

#### Hover Response (Tactical)
```css
/* Button hover - outline glow, not fill */
.cyber-btn:hover {
  transform: translateY(-2px);
  border-color: var(--neon-cyan);
  box-shadow: 
    0 0 40px rgba(49, 164, 253, 0.6),
    inset 0 0 30px rgba(115, 74, 253, 0.2);
}
/* Transition: 300ms cubic-bezier(0.4, 0, 0.2, 1) */
```

### Component Styling Guide

#### EV Lamp (Status Indicator)
```tsx
// Color logic
EV > 0.05R  → emerald-400 (tradeable)
EV 0-0.05R  → amber-400 (caution)
EV < 0R     → rose-400 (avoid)

// Visual treatment
- 2s pulse animation
- Glow intensity: 0.5 opacity
- Size variants: sm(8px), md(12px), lg(16px)
```

#### Cyber Button (Primary CTA)
```css
/* Ion Green accent for critical actions */
.btn-critical {
  border: 2px solid #8AFF00;
  box-shadow: 0 0 20px rgba(138, 255, 0, 0.4);
  filter: drop-shadow(0 0 8px rgba(138, 255, 0, 0.45));
}

/* Standard primary */
.cyber-btn {
  border: 2px solid #6243DD;
  color: #2D8EDF;
  background: rgba(10, 10, 20, 0.9);
  /* Sweep effect on hover */
}
```

#### Card Hierarchy
1. **Standard Card** - Base cyber-card, most common
2. **Elevated Card** - `neon-glow-cyan` class, important panels
3. **Critical Card** - Ion green or magenta accent border, alerts only

### Accessibility & Contrast

#### WCAG AAA Compliance
- All text/background combinations: ≥7:1 contrast
- Interactive elements: ≥4.5:1 minimum
- Status colors verified for color-blind users

#### Focus States
```css
/* Keyboard navigation - Ion green ring */
:focus-visible {
  outline: 2px solid #8AFF00;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(138, 255, 0, 0.2);
}
```

### Responsive Behavior

#### Breakpoints
- Mobile: 320px - 640px (compact, single column)
- Tablet: 641px - 1024px (sidebar collapses)
- Desktop: 1025px+ (full layout, dual panel)

#### Grid Adjustments
```css
@media (max-width: 768px) {
  body {
    background-size: 30px 30px; /* Finer grid on mobile */
  }
  .cyber-card {
    border-radius: 12px; /* Softer on touch */
  }
}
```

---

## 📱 Pages Overview

### OPS Terminal (`/OPS`)
**Purpose:** Live trading operations with real-time EV monitoring

**Features:**
- ✅ Market Matrix (6x6 grid) with pulsing EV lamps
- ✅ Mode Controls (ARM/HOLD/SIM/OFF) with cyber styling
- ✅ Risk Slider with dynamic R calculation
- ✅ Routing selector (Maker/Taker)
- ✅ Safety section with kill switch (magenta accent)
- ✅ Ops Log with timestamp and color-coded events
- ✅ Price Chart with R-Ruler overlay (Recharts)
- ✅ API Status indicator

**Design Notes:**
- Ion green used ONLY on "ARM" active state
- Kill switch uses magenta-shock border
- Chart uses dual-gradient: purple → cyan for bullish, inverted for bearish

### LAB Terminal (`/LAB`)
**Purpose:** Strategy research and backtesting laboratory

**Features:**
- ✅ Tab Navigation (Backtest, Walk-Forward, Monte Carlo, Optimize)
- ✅ Backtest Runner with form inputs
- ✅ Results display with key metrics
- ✅ Equity Curve (Recharts line chart)
- ✅ Drawdown Chart (area chart, danger-rose fill)
- ✅ Monte Carlo Fan Chart (confidence bands)

**Design Notes:**
- Results cards use glass morphism heavily
- Winning trades: emerald glow
- Losing trades: rose glow
- Charts use 22.5° gradient angle for consistency

### METRICS Dashboard (`/METRICS`)
**Purpose:** Performance KPIs and risk analytics

**Features:**
- ✅ KPI Cards (EV Net, P&L, Win Rate, Sharpe)
- ✅ Rolling Metrics Chart
- 📋 Risk breakdown (planned)

**Design Notes:**
- KPI cards have subtle specular highlights
- Positive values: ion green accent (rare!)
- Negative values: standard rose

### CONSOLE (`/CONSOLE`)
**Purpose:** Command interface and system logs

**Features:**
- 📋 Command input (Cmd+K palette)
- 📋 System logs with matrix text effect

**Design Notes:**
- Terminal aesthetic: matrix-text class
- Green-on-black fallback for accessibility
- Glitch effect on errors only

---

## 🔧 State Management

### Zustand Stores

#### UI Store (`lib/store.ts`)
```typescript
interface UIState {
  opsMode: "ARM" | "HOLD" | "SIM" | "OFF";
  riskPct: number;
  routing: "maker" | "taker";
  activePage: string;
  backendConnected: boolean;
  lastHealthCheck: number;
}
```

#### Market Store
```typescript
interface MarketStore {
  markets: Record<string, MarketData>;
  selectedMarket: string | null;
  updateMarket: (symbol: string, data: MarketData) => void;
}
```

---

## 🌐 API Integration (React Query)

### Backend Endpoints
- `GET /health` - Health check
- `GET /api/data/list` - Available datasets
- `GET /api/data/candles` - Market candles
- `POST /api/ev/calculate` - EV calculation
- `POST /api/risk/position-size` - Position sizing
- `POST /api/strategy/signal` - Strategy signals
- `POST /api/backtest/run` - Run backtest
- `POST /api/backtest/walk-forward` - Walk-forward analysis
- `POST /api/backtest/monte-carlo` - Monte Carlo simulation
- `POST /api/backtest/optimize` - Parameter optimization

### React Query Hooks (`lib/hooks.ts`)
```typescript
// Queries
useHealth()              // Poll every 10s
useCandles(market, interval, daysBack)
useMarketData(markets)   // Real-time EV polling
useMarketsData(markets)  // Batch market data

// Mutations
useRunBacktest(params)
useRunWalkForward(params)
useRunMonteCarlo(params)
```

---

## 🎯 Current Status

### ✅ Completed
- [x] Silent Blade Design System (full implementation)
- [x] Core UI components (Button, Card, Lamp, Slider, Timestamp)
- [x] Navigation with logo and status indicator
- [x] OPS Terminal (full functionality)
- [x] LAB Terminal (Backtest, WF, MC runners)
- [x] METRICS Dashboard (KPIs, Rolling charts)
- [x] React Query integration (hooks, providers)
- [x] Recharts implementation (5 chart types)
- [x] API Status component
- [x] Market Matrix with real API data
- [x] Logo and favicon (Silent Blade branding)

### 🚧 In Progress
- [ ] CONSOLE terminal (command palette)
- [ ] Keyboard shortcuts (Cmd+K)
- [ ] Advanced animations (Framer Motion)
- [ ] Error boundaries
- [ ] E2E testing

### 📋 Planned
- [ ] Real-time WebSocket updates
- [ ] Parameter optimization heatmap
- [ ] Advanced R-Ruler interactions
- [ ] Export functionality (CSV, PNG)
- [ ] Responsive mobile layout
- [ ] Dark/Light mode toggle (if needed)
- [ ] Performance monitoring

---

## 🧪 Testing

### Current Setup
- ✅ Jest + React Testing Library configured
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ No hydration errors

### Test Coverage Goals
- [ ] Unit tests: 80%+ (components, utils)
- [ ] Integration tests: Key user flows
- [ ] E2E tests: Playwright (OPS, LAB flows)
- [ ] Visual regression: Chromatic (optional)

### Running Tests
```bash
npm test              # Run all tests
npm test:watch        # Watch mode
npm test:coverage     # Coverage report
```

---

## 📚 Tech Stack

### Core
- **Next.js 16.0.0** - App Router, Turbopack, React 19
- **TypeScript 5+** - Type safety
- **Tailwind CSS 4** - Utility-first styling

### UI & Animation
- **Framer Motion 12.23+** - Advanced animations
- **Recharts 3.3+** - Data visualization
- **Lucide React** - Icon library

### State & Data
- **Zustand 5.0+** - Lightweight state management
- **React Query 5.90+** - Server state, caching, real-time
- **clsx** - Conditional classNames

### Development
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** (planned) - E2E testing
- **ESLint** - Code linting

---

## 🚀 Success Criteria

**Frontend MVP готов когда:**

1. ✅ **OPS Terminal полностью функционален:**
   - Market Matrix показывает real-time EV lamps
   - Controls работают (ARM/HOLD/SIM/OFF)
   - Risk slider обновляет R ($)
   - Ops Log получает события
   - Price chart с R-Ruler работает
   - API Status показывает LIVE/OFFLINE

2. ✅ **LAB Terminal позволяет:**
   - Запустить backtest через форму
   - Увидеть results (metrics + charts)
   - Провести Walk-Forward analysis
   - Запустить Monte Carlo simulation
   - Оптимизировать параметры (UI ready)

3. ✅ **API Integration работает:**
   - React Query polling для EV
   - Mutations для backtest/WF/MC
   - Error handling
   - Loading states
   - Cache управление

4. 🚧 **UX на высоте:**
   - ✅ Silent Blade aesthetic консистентен
   - ✅ Все анимации smooth (60fps)
   - 📋 Command palette (Cmd+K)
   - 📋 Keyboard shortcuts
   - 📋 Responsive на всех breakpoints

---

## 🎨 Design Implementation Notes

### Ion Green Usage (≤5%)
**Allowed contexts:**
- ARM mode active indicator (dot only)
- Exceptional win streak badge (>10 wins)
- "EV flip" notification (negative → positive)

**NOT allowed:**
- Regular buttons
- Standard success states
- Bulk text

### Magenta Shock Usage (≤3%)
**Allowed contexts:**
- Kill switch border
- Critical error alerts
- Stop-loss breach warnings

**NOT allowed:**
- Decorative elements
- Regular hover states

### Gradient Angles
- **22.5°** - Primary blade gradient (buttons, titles)
- **67.5°** - Secondary gradient (cards, backgrounds)
- **135°** - Holographic text (cyber-title)

### Glow Intensity Rules
- **Idle**: 20-30% opacity
- **Hover**: 40-50% opacity
- **Active/Focus**: 60-70% opacity
- **Critical**: 80%+ opacity (rare!)

---

## 📖 Resources

### Documentation
- [Project Structure](../../docs/PROJECT_STRUCTURE.md)
- [Backend API Reference](../../docs/api/API_REFERENCE.md)
- [Strategy Framework](../../docs/strategies/STRATEGY_FRAMEWORK.md)
- [Week 1-3 Progress](../../docs/week-03/WEEK_03_PROGRESS.md)

### Design References
- Silent Blade Logo: `/public/logo.webp`
- Color Palette: See "Silent Blade Design System" above
- Animation Guide: `app/globals.css` (keyframes section)

---

**Last Updated:** 25 октября 2025  
**Status:** Silent Blade Design Active 🎨 | API Integration Complete ✅  
**Next:** CONSOLE Terminal & Keyboard Shortcuts ⌨️
