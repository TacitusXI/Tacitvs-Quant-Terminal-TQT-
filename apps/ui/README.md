# Tacitvs Quant Terminal - Frontend

Professional-grade quantitative trading terminal interface built with Next.js 15, TypeScript, and TailwindCSS.

## 🎨 Design Philosophy

**65% Retro Cyberpunk + 35% Post-Military Industrial**

- Pure black background (#000000)
- Three operational themes: Matrix (analysis), BlackOps (execution), Neon (post-analysis)
- Monospaced typography (JetBrains Mono / Share Tech Mono)
- Terminal-inspired UI with precise grid layouts
- Subtle scanline effects and glow animations

## 🚀 Quick Start

```bash
# Install dependencies
cd apps/ui
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State**: Zustand
- **Charts**: Lightweight Charts
- **Animation**: Framer Motion
- **Audio**: Web Audio API + streaming radio

### Structure

```
src/
├── app/                    # Next.js pages
│   ├── dashboard/         # Portfolio overview
│   ├── backtest/          # Strategy simulation
│   ├── research/          # Market analysis
│   ├── execution/         # Order management
│   └── settings/          # Configuration
├── components/            # Reusable UI components
├── hooks/                 # React hooks
│   ├── useTheme.ts       # Theme management
│   ├── useAudio.ts       # Audio system
│   └── useWebSocket.ts   # Real-time data
├── lib/                   # Utilities
│   ├── theme.ts          # Theme engine
│   ├── radio.ts          # Ambient audio
│   └── api.ts            # API client
├── styles/                # Global styles
└── workers/               # Web Workers
    └── montecarlo.worker.ts
```

## 🎭 Themes

### Matrix (Green) - Analysis Mode
- **Primary**: #00FF84
- **Secondary**: #00CC66
- **Use**: Simulation, research, deep analysis
- **Radio**: SomaFM Mission Control (space ambient)

### BlackOps (Red/Pink) - Execution Mode
- **Primary**: #fe0174
- **Secondary**: #f82909
- **Use**: Live trading, risk management
- **Radio**: NightDrive FM (dark synthwave)

### Neon (Blue) - Post-Analysis Mode
- **Primary**: #319ff8
- **Secondary**: #422d94
- **Use**: Review, reporting, calm analysis
- **Radio**: SomaFM Deep Space One (deep ambient)

## 🔊 Audio System

### System Sounds
- **Ping**: UI confirmations
- **Tick**: Quick feedback
- **Alert**: Important notifications

All sounds generated via Web Audio API - no external files required.

### Tacitvs Radio
Ambient audio layer that adapts to active theme. Provides non-intrusive background atmosphere for extended sessions.

- Volume independently controllable
- Fade in/out on theme changes
- Can be fully disabled in settings

## 📊 Features

### Dashboard
- Real-time portfolio metrics
- Live price charts
- Position overview
- Strategy performance tracking

### Backtest
- Historical strategy simulation
- Monte Carlo analysis (Web Worker)
- Equity curve visualization
- Trade-by-trade breakdown
- Configurable parameters

### Research
- Correlation matrices
- Volatility analysis
- Market regime detection
- Research note management

### Execution
- Order entry panel (Market/Limit/Stop)
- Position management
- Active order tracking
- Recent trade history
- Real-time P&L

### Settings
- Theme switcher with preview
- Audio configuration
- API endpoint configuration
- System information

## 🔌 API Integration

Configure backend endpoints in Settings or via environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

API client located in `src/lib/api.ts` provides typed endpoints for:
- Market data
- Strategy management
- Order execution
- Risk metrics

## 🎨 Customization

### Adding New Themes

Edit `src/lib/theme.ts`:

```typescript
export const THEMES: Record<Theme, ThemeConfig> = {
  newtheme: {
    name: 'newtheme',
    primary: '#FF00FF',
    secondary: '#AA00AA',
    description: 'Custom Mode',
    atmosphere: 'custom vibe',
    radioStream: 'https://stream.url/here',
  },
  // ...
};
```

Add CSS variables in `src/styles/globals.css`:

```css
html[data-theme="newtheme"] {
  --accent: #FF00FF;
  --accent2: #AA00AA;
}
```

### Creating Components

Follow the established patterns in `src/components/`:

- Use `cn()` utility for conditional classes
- Maintain terminal aesthetic
- Support theme variables
- Include glow effects sparingly

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:8000` |

## 🔧 Development

```bash
# Run with hot reload
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build
```

## 🎯 Design Principles

1. **Minimalism**: Every element serves a purpose
2. **Clarity**: Information hierarchy is strict
3. **Performance**: 60fps animations, lazy loading
4. **Accessibility**: Keyboard navigation, high contrast
5. **Consistency**: Unified design language throughout

## 📦 Dependencies

Core dependencies:
- `next@15.0.2` - React framework
- `react@19.0.0` - UI library
- `typescript@5.6.3` - Type safety
- `tailwindcss@3.4.15` - Styling
- `zustand@5.0.2` - State management
- `lightweight-charts@4.2.1` - Financial charts
- `framer-motion@11.11.11` - Animations

## 🤝 Contributing

This is a professional quant trading terminal. Contributions should maintain:
- Clean, typed TypeScript
- Consistent terminal aesthetic
- Performance-first approach
- Security best practices

## 📄 License

© 2025 Tacitvs Quant Terminal

---

**Status**: OPERATIONAL  
**Version**: 0.1.0  
**Build**: 2025.01.15

