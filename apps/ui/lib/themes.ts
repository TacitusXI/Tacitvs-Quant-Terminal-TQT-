/**
 * TQT Theme System
 * 
 * Centralized color palettes and theme definitions
 * Switch themes via CONSOLE: theme <name>
 */

export type ThemeName = "blade" | "matrix" | "inferno";

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: {
    // Primary colors
    primary: string;
    secondary: string;
    accent: string;
    
    // Rare accents
    ion: string;
    shock: string;
    
    // Base colors
    voidBlack: string;
    deepSpace: string;
    
    // Neutral grays
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
    neutral500: string;
    neutral600: string;
    
    // Status colors
    success: string;
    warning: string;
    danger: string;
    info: string;
    
    // Glow effects (shadow colors)
    glowPrimary: string;
    glowSecondary: string;
    glowSuccess: string;
    glowDanger: string;
  };
  
  effects: {
    glassBlur: string;
    metalSpecular: string;
    scanlineOpacity: string;
  };
}

/**
 * Silent Blade Theme (Default)
 * Cyberpunk purple/cyan aesthetic
 */
export const bladeTheme: Theme = {
  name: "blade",
  displayName: "Silent Blade",
  description: "Cyberpunk purple/cyan aesthetic with neon accents",
  colors: {
    primary: "#6243DD",      // Neon Purple
    secondary: "#2D8EDF",    // Neon Cyan
    accent: "#8B5CF6",       // Purple variant
    
    ion: "#8AFF00",          // Ion Green
    shock: "#F43F5E",        // Magenta Shock
    
    voidBlack: "#0a0c12",
    deepSpace: "#0e1117",
    
    neutral100: "#f5f5f5",
    neutral200: "#e5e5e5",
    neutral300: "#d4d4d4",
    neutral400: "#a3a3a3",
    neutral500: "#737373",
    neutral600: "#525252",
    
    success: "#16A34A",
    warning: "#FFB020",
    danger: "#F43F5E",
    info: "#2D8EDF",
    
    glowPrimary: "rgba(98, 67, 221, 0.6)",
    glowSecondary: "rgba(45, 142, 223, 0.6)",
    glowSuccess: "rgba(22, 163, 74, 0.6)",
    glowDanger: "rgba(244, 63, 94, 0.6)",
  },
  effects: {
    glassBlur: "12px",
    metalSpecular: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
    scanlineOpacity: "0.03",
  },
};

/**
 * Matrix Theme
 * Green monochrome like The Matrix
 */
export const matrixTheme: Theme = {
  name: "matrix",
  displayName: "Matrix",
  description: "Green monochrome terminal aesthetic",
  colors: {
    primary: "#00FF41",      // Matrix Green
    secondary: "#00D936",    // Darker green
    accent: "#39FF14",       // Neon Green
    
    ion: "#00FF41",          // Same green
    shock: "#FF0040",        // Red for danger
    
    voidBlack: "#000000",
    deepSpace: "#0a0a0a",
    
    neutral100: "#00FF41",
    neutral200: "#00E639",
    neutral300: "#00CC33",
    neutral400: "#00B32D",
    neutral500: "#009926",
    neutral600: "#008020",
    
    success: "#00FF41",
    warning: "#FFFF00",
    danger: "#FF0040",
    info: "#00D936",
    
    glowPrimary: "rgba(0, 255, 65, 0.8)",
    glowSecondary: "rgba(0, 217, 54, 0.8)",
    glowSuccess: "rgba(0, 255, 65, 0.8)",
    glowDanger: "rgba(255, 0, 64, 0.8)",
  },
  effects: {
    glassBlur: "8px",
    metalSpecular: "linear-gradient(135deg, rgba(0,255,65,0.1) 0%, transparent 50%)",
    scanlineOpacity: "0.08",
  },
};

/**
 * Inferno Theme
 * Fiery red/magenta on pure black - aggressive and intense
 */
export const infernoTheme: Theme = {
  name: "inferno",
  displayName: "Inferno",
  description: "Fiery red/magenta on pure black - aggressive trading heat",
  colors: {
    primary: "#F82907",      // Blazing Red-Orange
    secondary: "#9F004A",    // Deep Magenta
    accent: "#FF4500",       // Orange Red

    ion: "#FF1493",          // Deep Pink (for success)
    shock: "#FF0000",        // Pure Red

    voidBlack: "#000000",    // Pure Black
    deepSpace: "#0a0000",    // Almost black with red tint

    neutral100: "#FFE5E5",
    neutral200: "#FFCCCC",
    neutral300: "#FF9999",
    neutral400: "#FF6666",
    neutral500: "#FF3333",
    neutral600: "#CC0000",

    success: "#FF1493",      // Deep Pink for wins
    warning: "#FF6600",      // Orange warning
    danger: "#F82907",       // Primary red
    info: "#9F004A",         // Magenta for info

    glowPrimary: "rgba(248, 41, 7, 0.8)",     // Intense red glow
    glowSecondary: "rgba(159, 0, 74, 0.8)",   // Magenta glow
    glowSuccess: "rgba(255, 20, 147, 0.7)",   // Pink glow
    glowDanger: "rgba(248, 41, 7, 0.9)",      // Danger red glow
  },
  effects: {
    glassBlur: "8px",        // Sharp, less blur for intensity
    metalSpecular: "linear-gradient(135deg, rgba(255,50,50,0.15) 0%, transparent 50%)",
    scanlineOpacity: "0.06", // More visible scanlines for aggression
  },
};

/**
 * Theme registry
 */
export const themes: Record<ThemeName, Theme> = {
  blade: bladeTheme,
  matrix: matrixTheme,
  inferno: infernoTheme,
};

/**
 * Get theme by name
 */
export function getTheme(name: ThemeName): Theme {
  return themes[name] || themes.blade;
}

/**
 * Get all available theme names
 */
export function getThemeNames(): ThemeName[] {
  return Object.keys(themes) as ThemeName[];
}

/**
 * Apply theme to document root
 */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
    // Apply CSS variables
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);

    root.style.setProperty('--color-ion', theme.colors.ion);
    root.style.setProperty('--color-shock', theme.colors.shock);

    root.style.setProperty('--color-void-black', theme.colors.voidBlack);
    root.style.setProperty('--color-deep-space', theme.colors.deepSpace);

    root.style.setProperty('--color-neutral-100', theme.colors.neutral100);
    root.style.setProperty('--color-neutral-200', theme.colors.neutral200);
    root.style.setProperty('--color-neutral-300', theme.colors.neutral300);
    root.style.setProperty('--color-neutral-400', theme.colors.neutral400);
    root.style.setProperty('--color-neutral-500', theme.colors.neutral500);
    root.style.setProperty('--color-neutral-600', theme.colors.neutral600);

    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-danger', theme.colors.danger);
    root.style.setProperty('--color-info', theme.colors.info);

    root.style.setProperty('--glow-primary', theme.colors.glowPrimary);
    root.style.setProperty('--glow-secondary', theme.colors.glowSecondary);
    root.style.setProperty('--glow-success', theme.colors.glowSuccess);
    root.style.setProperty('--glow-danger', theme.colors.glowDanger);
    
    // Calculate glow-ion from ion color
    const ionColor = theme.colors.ion;
    const ionGlow = `${ionColor}72`; // Add alpha
    root.style.setProperty('--glow-ion', ionGlow);

    root.style.setProperty('--effect-glass-blur', theme.effects.glassBlur);
    root.style.setProperty('--effect-scanline-opacity', theme.effects.scanlineOpacity);
    
    // Apply extended colors (lighter variants)
    root.style.setProperty('--color-accent-light', theme.colors.info);
    root.style.setProperty('--color-success-bright', '#22c55e');
    root.style.setProperty('--color-warning-bright', '#fbbf24');
    root.style.setProperty('--color-danger-light', '#f87171');
    root.style.setProperty('--color-electric', theme.colors.secondary);
  
  // Store theme preference
  if (typeof window !== 'undefined') {
    localStorage.setItem('tqt-theme', theme.name);
  }
}

/**
 * Load saved theme from localStorage
 */
export function loadSavedTheme(): Theme {
  if (typeof window === 'undefined') {
    return bladeTheme;
  }
  
  const savedThemeName = localStorage.getItem('tqt-theme') as ThemeName;
  return savedThemeName ? getTheme(savedThemeName) : bladeTheme;
}

