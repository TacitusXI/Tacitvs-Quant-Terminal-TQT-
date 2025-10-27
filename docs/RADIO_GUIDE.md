# 📡 Tacitvs Radio — Dynamic Audio System Guide

## Overview

Tacitvs Radio is a built-in streaming radio system that automatically adapts to your current theme. Each theme has its own curated set of stations designed to match the sonic identity of that theme.

## Features

- **🎨 Theme-Aware**: Automatically switches station lineup when you change themes
- **🔄 Auto-Fallback**: If a station fails, automatically tries the next one
- **🎚️ Volume Control**: Independent volume control from system sounds
- **⌨️ Keyboard Shortcuts**: Control via Command Palette (⌘K / Ctrl+K)
- **💾 Persistent State**: Remembers your volume and last station

## Theme Station Maps

### Matrix Theme (Research / Simulation)
**Sonic Identity**: Ambient Electronic, Space Music, Synthwave, Vaporwave

Stations:
- **Deep Space One** - Ambient Electronic (128 kbps) — SomaFM
- **Space Station Soma** - Space Music (128 kbps) — SomaFM
- **Synthwave Paradise** - Synthwave (128 kbps) — Laut.fm
- **Vaporwave Network** - Vaporwave (128 kbps) — Laut.fm

*Best for*: Deep analysis work, backtesting, research mode

### BlackOps Theme (Execution / Risk Mode)
**Sonic Identity**: Hard Techno, Industrial, EBM, Dark Techno

Stations:
- **DI.FM Hard Techno** - Hard Techno (128 kbps) — "Tough-as-nails warehouse jams"
- **Doomed • Industrial** - Industrial / EBM (128 kbps) — SomaFM
- **DI.FM Industrial** - Industrial (128 kbps) — Electronic Body Music
- **DI.FM Dark Techno** - Dark Techno (128 kbps) — Raw & aggressive

*Best for*: Live trading, high-stakes execution, risk management, intense focus

### Neon Theme (Post-Analysis / Reporting)
**Sonic Identity**: Drone Ambient, Ambient, Space

Stations:
- **Drone Zone** - Drone Ambient (128 kbps) — SomaFM
- **Ambient Focus** - Ambient (128 kbps) — Laut.fm
- **Sonic Universe** - Ambient / Space (128 kbps) — SomaFM
- **Mission Control** - Ambient Chillout (128 kbps) — SomaFM

*Best for*: Report generation, documentation, post-mortem analysis

## Controls

### Radio Panel (Bottom of Screen)

When radio is off:
```
[▶ PLAY]
```

When radio is on:
```
📡 Tacitvs Radio • Station Name [192 kbps]
[■ STOP]  [VOL 50]  [↻ NEXT]  [THEME]
```

### Command Palette (⌘K / Ctrl+K)

Available radio commands:
- **Start Radio** / **Stop Radio** - Toggle playback
- **Next Radio Station** - Skip to next station
- **Radio Volume +10%** - Increase volume
- **Radio Volume -10%** - Decrease volume

## Automatic Behaviors

### Theme Switching
When you switch themes (e.g., Matrix → BlackOps):
1. Radio automatically loads the first station of the new theme
2. Crossfade effect (1.5s) for smooth transition
3. Station index resets to 0

### Error Recovery
If a stream fails to load:
1. Error message displays: "Failed to load Station Name"
2. Automatically tries next station after 1 second
3. Continues until a working station is found

### State Persistence
The following settings are saved to localStorage:
- Radio enabled/disabled state
- Volume level
- Last station index (per theme)

## Integration with Audio System

### Separate Volume Controls
- **System Sounds**: Beeps, alerts, feedback (separate gain node)
- **Radio Stream**: Internet radio (HTML5 audio + independent control)

### Web Audio API
Radio uses dual gain nodes:
- `systemGainNode`: Controls UI beeps (default 30%)
- `radioGainNode`: Future integration point for radio (currently uses HTML5 audio)

### Crossfade
When switching stations, a smooth 1.5s crossfade is applied:
- Old station fades out linearly
- New station fades in linearly
- Prevents abrupt audio changes

## Technical Details

### Files
- `lib/radio.ts` - Station configuration and utilities
- `components/TacitvsRadio.tsx` - Main radio UI component
- `lib/store.ts` - Zustand state management
- `lib/audio.ts` - Audio system with gain node management
- `app/globals.css` - Radio panel styling

### State Management (Zustand)
```typescript
{
  radioEnabled: boolean;      // Is radio playing?
  radioVolume: number;         // 0.0 to 1.0
  radioStationIndex: number;   // Current station index
  toggleRadio: () => void;
  setRadioVolume: (v: number) => void;
  nextRadioStation: () => void;
}
```

### Station Structure
```typescript
interface RadioStation {
  name: string;      // Display name
  url: string;       // Stream URL
  genre?: string;    // Music genre
  bitrate?: string;  // Stream quality
}
```

## Troubleshooting

### Radio won't start
- Check browser console for errors
- Some streams may be blocked by CORS - fallback will activate
- Ensure autoplay is allowed in your browser

### No sound
- Check volume slider in radio panel
- Verify system audio is not muted
- Some streams may be offline - try next station

### Buffering issues
- May occur on slow connections
- Radio will show `[BUFFERING...]` indicator
- Consider switching to a lower bitrate station

### Theme switch not working
- Radio should auto-switch stations on theme change
- If stuck, manually stop and start radio

## Best Practices

1. **Use theme-appropriate radio**
   - Matrix theme → Electronic/Ambient for focus
   - BlackOps theme → Industrial/Metal for intensity
   - Neon theme → Ambient/Drone for calm analysis

2. **Volume balance**
   - Keep radio at 40-60% for comfortable background
   - System sounds will play over radio at important moments

3. **Station quality**
   - Higher bitrate = better quality but more bandwidth
   - 128 kbps is sufficient for background work

4. **Keyboard workflow**
   - Use ⌘K → "Next Radio Station" for quick switching
   - No need to reach for mouse

## Future Enhancements

Planned features:
- [ ] Custom station lists (user-defined URLs)
- [ ] Metadata display (current track, artist)
- [ ] Equalizer controls
- [ ] Station favorites/presets
- [ ] Visualizer integration
- [ ] Podcast/audiobook support

## Credits

- Stream sources: SomaFM, Laut.fm, NPO Radio
- Inspiration: NOAA Weather Radio, Winamp, Terminal music players

---

**Tacitvs Radio** — Sonic companion for quantitative trading 🎧

