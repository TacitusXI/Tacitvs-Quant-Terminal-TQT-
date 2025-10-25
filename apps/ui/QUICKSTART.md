# 🚀 TACITVS QUANT TERMINAL - Quick Start Guide

## 📦 Installation

```bash
cd /home/user/Documents/GitHub/Tacitvs-Quant-Terminal-TQT/apps/ui

# Install dependencies
npm install

# Run development server
npm run dev
```

The terminal will be available at: **http://localhost:3000**

---

## ⚙️ Configuration

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Make sure your FastAPI backend is running on port 8080.

---

## 🎯 Features

### Keyboard Shortcuts
- **⌘K / Ctrl+K** - Open Command Palette
- **⌘1** - Dashboard
- **⌘2** - LAB (Research)
- **⌘3** - OPS (Live Trading)

### Themes
- **Matrix** 🟢 - Research/Simulation mode (#00FF84)
- **BlackOps** 🔴 - Execution/Risk mode (#fe0174)
- **Neon** 🔵 - Post-Analysis mode (#319ff8)

### Audio Feedback
System sounds for:
- Simulation start/complete
- Order execution
- Errors
- Navigation
- Theme changes

Toggle audio with the button in navigation bar.

---

## 📊 Pages

### Dashboard (`/`)
- System overview & metrics
- Equity, P&L, positions
- Risk management status
- EV metrics
- Active markets
- Recent activity log

### LAB (`/LAB`)
- Backtest engine
- Monte Carlo simulation
- Performance metrics
- Trade history
- Strategy testing

### OPS (`/OPS`)
- Live execution terminal
- Position management
- Risk controls
- Execution statistics
- Operations log

---

## 🔧 Development

### Build for Production
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

---

## 🎨 Design System

### Colors
- Background: `#000000` (pure black)
- Primary accent: Theme-dependent
- Grid: `#101010`
- Panel: `#0b0b0b`
- Border: `#1a1a1a`

### Typography
- Sans: Geist
- Mono: Geist Mono (for metrics)

### Status Colors
- ✅ OK: `#00FF84`
- ⚠️ Warning: `#FFB800`
- ❌ Error: `#fe0174`
- ◾ Neutral: `#d0d0d0`

---

## 📝 Next Steps

1. **Start Backend:**
   ```bash
   cd apps/api
   python main.py
   ```

2. **Start Frontend:**
   ```bash
   cd apps/ui
   npm run dev
   ```

3. **Open Browser:**
   Navigate to http://localhost:3000

4. **Try It Out:**
   - Switch themes
   - Press ⌘K for commands
   - Navigate between modules
   - Toggle audio feedback

---

## 🎯 Production Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```bash
docker build -t tqt-ui .
docker run -p 3000:3000 tqt-ui
```

### Environment Variables
Set in production:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 🐛 Troubleshooting

**Issue:** API shows OFFLINE  
**Solution:** Make sure FastAPI backend is running on the configured port

**Issue:** Audio not working  
**Solution:** Check browser permissions, ensure audio toggle is ON

**Issue:** Theme not persisting  
**Solution:** Check browser localStorage permissions

---

## 📚 Documentation

- [Full README](./README.md) - Complete implementation details
- [Design Document](../../IMPORTANT_FRONTEND_NOTES.md) - Design philosophy
- [Project Structure](../../docs/PROJECT_STRUCTURE.md) - Architecture overview

---

Built with ❤️ using Next.js 15, TypeScript, and TailwindCSS

