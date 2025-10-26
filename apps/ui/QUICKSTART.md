# 🚀 Tacitvs Quant Terminal - Quick Start Guide

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager

## Installation & Setup

### 1. Navigate to the UI directory

```bash
cd /home/user/Documents/GitHub/Tacitvs-Quant-Terminal-TQT/apps/ui
```

### 2. Install dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Zustand (state management)
- Lightweight Charts
- Framer Motion

### 3. Configure environment (optional)

If you want to connect to a backend API:

```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your API endpoints
nano .env.local
```

### 4. Run development server

```bash
npm run dev
```

The application will start at **http://localhost:3000**

### 5. Build for production (optional)

```bash
npm run build
npm start
```

## 🎨 Features

### Themes
- **Matrix** (Green): Analysis and research mode
- **BlackOps** (Red): Execution and risk management
- **Neon** (Blue): Post-analysis and reporting

Switch themes in the top-right corner or in Settings.

### Pages

1. **Dashboard** - Portfolio overview, positions, strategy performance
2. **Backtest** - Strategy simulation with Monte Carlo analysis
3. **Research** - Correlation matrices, volatility analysis, market regime
4. **Execution** - Order entry, position management, live trading
5. **Settings** - Theme configuration, audio settings, API setup

### Audio System

- **System Sounds**: UI feedback (ping, tick, alert)
- **Tacitvs Radio**: Ambient background audio that changes with theme
  - Can be toggled in Settings
  - Volume independently controllable

## 🔧 Troubleshooting

### Port already in use

```bash
# Use a different port
PORT=3001 npm run dev
```

### Type errors

```bash
# Run type check
npx tsc --noEmit
```

### Build errors

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📁 Project Structure

```
apps/ui/
├── src/
│   ├── app/              # Pages (Next.js App Router)
│   ├── components/       # Reusable UI components
│   ├── hooks/           # React hooks
│   ├── lib/             # Utilities (theme, audio, API)
│   ├── styles/          # Global CSS
│   ├── workers/         # Web Workers
│   └── types/           # TypeScript types
├── public/              # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🎯 Next Steps

1. **Connect to Backend**: Configure API endpoints in Settings
2. **Customize Themes**: Edit `src/lib/theme.ts` to add new color schemes
3. **Add Strategies**: Integrate your trading strategies in the Backtest page
4. **WebSocket Integration**: Use `useWebSocket` hook for real-time data

## 📚 Documentation

- Full README: `apps/ui/README.md`
- Design spec: `/IMPORTANT_FRONTEND_NOTES.md`
- Component docs: Check individual component files

## 🤝 Support

For issues or questions, check:
1. The detailed README in `apps/ui/README.md`
2. TypeScript type definitions in components
3. Browser console for runtime errors

---

**Status**: ✅ OPERATIONAL  
**Version**: 0.1.0  
**Last Updated**: 2025-01-15

