# TQT Theming System

## Overview

The Tacitus Quant Terminal includes a powerful theming system that allows you to switch between different visual aesthetics while maintaining the same functionality. All themes are centrally defined and can be switched via the **CONSOLE** terminal.

## Available Themes

### 1. **Silent Blade** (Default) - `blade`
- **Colors**: Purple/Cyan cyberpunk aesthetic
- **Primary**: `#6243DD` (Neon Purple)
- **Secondary**: `#2D8EDF` (Neon Cyan)
- **Accent**: `#8B5CF6` (Purple variant)
- **Rare Accents**: Ion Green (`#8AFF00`), Magenta Shock (`#F43F5E`)
- **Description**: Cyberpunk purple/cyan aesthetic with neon accents
- **Best For**: Default professional trading interface with premium feel
- **Emoji**: ⚔️

### 2. **Matrix** - `matrix`
- **Colors**: Green monochrome terminal aesthetic
- **Primary**: `#00FF41` (Matrix Green)
- **Secondary**: `#00D936` (Darker Green)
- **Accent**: `#39FF14` (Neon Green)
- **Description**: Green monochrome terminal aesthetic inspired by The Matrix
- **Best For**: Terminal purists, retro enthusiasts, pure data focus
- **Emoji**: 💚

### 3. **Inferno** - `inferno`
- **Colors**: Fiery red/magenta on pure black
- **Primary**: `#F82907` (Blazing Red-Orange)
- **Secondary**: `#9F004A` (Deep Magenta)
- **Accent**: `#FF4500` (Orange Red)
- **Background**: `#000000` (Pure Black)
- **Description**: Fiery red/magenta on pure black - aggressive trading heat
- **Best For**: High-stakes trading, aggressive conditions, maximum intensity
- **Emoji**: 🔥

## How to Switch Themes

### Via CONSOLE Terminal

Navigate to the **CONSOLE** terminal (shortcut: `Cmd/Ctrl+4`) and use the `theme` command:

```bash
# Show current theme and list all available themes
> theme

# Switch to a specific theme
> theme matrix    # Switch to Matrix theme (green)
> theme inferno   # Switch to Inferno theme (red/magenta)
> theme blade     # Switch back to default Silent Blade theme
```

### Theme Persistence

- Your theme preference is automatically saved to `localStorage`
- The theme will persist across browser sessions
- The theme is loaded automatically when you visit the site

## Theme Architecture

### Files Involved

1. **`apps/ui/lib/themes.ts`**
   - Centralized theme definitions
   - All color palettes, effects, and metadata
   - Helper functions: `getTheme()`, `applyTheme()`, `loadSavedTheme()`

2. **`apps/ui/app/globals.css`**
   - CSS variables (`:root`)
   - Dynamically updated by `applyTheme()`
   - Legacy aliases for backward compatibility

3. **`apps/ui/components/providers/theme-provider.tsx`**
   - Client-side theme initialization
   - Loads saved theme from localStorage on mount
   - Updates Zustand store

4. **`apps/ui/lib/store.ts`**
   - `currentTheme` state (Zustand)
   - `setTheme()` action
   - Synced with localStorage

5. **`apps/ui/app/CONSOLE/page.tsx`**
   - `theme` command handler
   - User interface for switching themes

### How It Works

1. **On page load**:
   - `ThemeProvider` loads saved theme from localStorage
   - Applies CSS variables via `applyTheme()`
   - Updates Zustand store

2. **When user switches theme**:
   - User types `theme <name>` in CONSOLE
   - `applyTheme()` updates CSS variables on `:root`
   - Theme name saved to localStorage
   - Zustand store updated
   - All components re-render with new colors

3. **CSS Variables**:
   - All components use CSS variables like `var(--color-primary)`
   - Changing theme updates these variables globally
   - No component code changes needed

## Creating a New Theme

To add a new theme, edit `apps/ui/lib/themes.ts`:

```typescript
export const myCustomTheme: Theme = {
  name: "custom",
  displayName: "My Custom Theme",
  description: "A custom color scheme",
  colors: {
    primary: "#FF6B35",      // Your primary color
    secondary: "#004E89",    // Your secondary color
    accent: "#F77F00",       // Your accent color
    ion: "#06FFA5",          // Success/Ion accent
    shock: "#EF476F",        // Danger/Shock accent
    voidBlack: "#000000",    // Background
    deepSpace: "#0a0a0a",    // Card background
    // ... neutral colors, status colors, glows
  },
  effects: {
    glassBlur: "12px",
    metalSpecular: "linear-gradient(...)",
    scanlineOpacity: "0.03",
  },
};

// Add to registry
export const themes: Record<ThemeName, Theme> = {
  blade: bladeTheme,
  matrix: matrixTheme,
  crimson: crimsonTheme,
  ocean: oceanTheme,
  sunset: sunsetTheme,
  custom: myCustomTheme,  // Add here
};

// Update ThemeName type
export type ThemeName = "blade" | "matrix" | "crimson" | "ocean" | "sunset" | "custom";
```

## Theme Properties

### Colors Object

- **primary**: Main brand color, used for primary buttons, accents
- **secondary**: Secondary brand color, complementary to primary
- **accent**: Tertiary color for subtle accents
- **ion**: Success/positive accent (rare, <5% usage)
- **shock**: Danger/alert accent (rare, <5% usage)
- **voidBlack**: Deepest background
- **deepSpace**: Card/panel backgrounds
- **neutral100-600**: Gray scale for text and borders
- **success**: Positive status (EV > 0.05R)
- **warning**: Caution status (EV 0-0.05R)
- **danger**: Negative status (EV < 0R)
- **info**: Informational status
- **glowPrimary, glowSecondary, glowSuccess, glowDanger**: Shadow colors for neon effects

### Effects Object

- **glassBlur**: Blur amount for glassmorphism effects
- **metalSpecular**: Linear gradient for metallic shine
- **scanlineOpacity**: CRT scanline effect opacity

## Design Guidelines

### Color Usage Philosophy

1. **Primary/Secondary (80-90%)**
   - Most UI elements
   - Navigation, buttons, borders
   - Chart lines, data visualization

2. **Status Colors (5-10%)**
   - Success/Warning/Danger states
   - Market conditions, P&L, EV values
   - Alert badges, status indicators

3. **Rare Accents (<5%)**
   - Critical wins (Ion Green)
   - Danger zones (Shock/Magenta)
   - Call-to-action buttons
   - Use sparingly for maximum impact

### Accessibility

- Ensure sufficient contrast ratios (WCAG AA minimum)
- Test readability on both light and dark text
- Glow effects should enhance, not obscure text
- Consider colorblind users (don't rely solely on color for critical info)

## Troubleshooting

### Theme not applying on page load
- Check browser console for errors
- Verify `ThemeProvider` is wrapping app in `layout.tsx`
- Clear localStorage: `localStorage.removeItem('tqt-theme')`

### Colors not changing
- Ensure components use CSS variables, not hardcoded colors
- Check `:root` CSS variables in DevTools
- Verify `applyTheme()` is being called

### Theme resets on refresh
- Check localStorage is enabled in browser
- Verify `loadSavedTheme()` runs in `ThemeProvider`
- Check for console errors

## Command Reference

| Command | Description |
|---------|-------------|
| `theme` | Show current theme and list all available themes |
| `theme <name>` | Switch to specified theme |
| `status` | Show current theme in system status |

## Future Enhancements

- [ ] Theme editor UI
- [ ] Import/export custom themes (JSON)
- [ ] Per-terminal themes (different theme for OPS vs LAB)
- [ ] Light mode support
- [ ] Theme marketplace/community themes
- [ ] Animated theme transitions
- [ ] Time-based theme switching (e.g., "sunset" at 6pm)

---

**Pro Tip**: Try `matrix` theme for a classic terminal feel, or `crimson` for high-stakes trading sessions! 🎨

