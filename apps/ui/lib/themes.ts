/**
 * TQT Theme System
 * 
 * Centralized color palettes and theme definitions
 * Switch themes via CONSOLE: theme <name>
 */

export type ThemeName = "blade" | "matrix" | "crimson" | "ocean" | "sunset" | "inferno";

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
 * Crimson Theme
 * Red/orange aggressive trading aesthetic
 */
export const crimsonTheme: Theme = {
  name: "crimson",
  displayName: "Crimson",
  description: "Red/orange aggressive trading aesthetic",
  colors: {
    primary: "#DC2626",      // Red
    secondary: "#F97316",    // Orange
    accent: "#EF4444",       // Bright red
    
    ion: "#10B981",          // Green for contrast
    shock: "#EC4899",        // Pink
    
    voidBlack: "#0f0a0a",
    deepSpace: "#1a0f0f",
    
    neutral100: "#fef2f2",
    neutral200: "#fee2e2",
    neutral300: "#fecaca",
    neutral400: "#fca5a5",
    neutral500: "#f87171",
    neutral600: "#ef4444",
    
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#DC2626",
    info: "#F97316",
    
    glowPrimary: "rgba(220, 38, 38, 0.7)",
    glowSecondary: "rgba(249, 115, 22, 0.7)",
    glowSuccess: "rgba(16, 185, 129, 0.6)",
    glowDanger: "rgba(220, 38, 38, 0.8)",
  },
  effects: {
    glassBlur: "10px",
    metalSpecular: "linear-gradient(135deg, rgba(255,100,100,0.1) 0%, transparent 50%)",
    scanlineOpacity: "0.05",
  },
};

/**
 * Ocean Theme
 * Blue/teal calm trading aesthetic
 */
export const oceanTheme: Theme = {
  name: "ocean",
  displayName: "Ocean",
  description: "Blue/teal calm professional aesthetic",
  colors: {
    primary: "#0EA5E9",      // Sky Blue
    secondary: "#14B8A6",    // Teal
    accent: "#06B6D4",       // Cyan
    
    ion: "#10B981",          // Green
    shock: "#EC4899",        // Pink
    
    voidBlack: "#0a0f12",
    deepSpace: "#0f1419",
    
    neutral100: "#f0f9ff",
    neutral200: "#e0f2fe",
    neutral300: "#bae6fd",
    neutral400: "#7dd3fc",
    neutral500: "#38bdf8",
    neutral600: "#0ea5e9",
    
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#0EA5E9",
    
    glowPrimary: "rgba(14, 165, 233, 0.6)",
    glowSecondary: "rgba(20, 184, 166, 0.6)",
    glowSuccess: "rgba(16, 185, 129, 0.6)",
    glowDanger: "rgba(239, 68, 68, 0.6)",
  },
  effects: {
    glassBlur: "14px",
    metalSpecular: "linear-gradient(135deg, rgba(100,200,255,0.1) 0%, transparent 50%)",
    scanlineOpacity: "0.02",
  },
};

/**
 * Sunset Theme
 * Orange/purple warm aesthetic
 */
export const sunsetTheme: Theme = {
  name: "sunset",
  displayName: "Sunset",
  description: "Orange/purple warm evening aesthetic",
  colors: {
    primary: "#F97316",      // Orange
    secondary: "#A855F7",    // Purple
    accent: "#FB923C",       // Light orange

    ion: "#84CC16",          // Lime
    shock: "#EC4899",        // Pink

    voidBlack: "#0f0a08",
    deepSpace: "#1a0f0d",

    neutral100: "#fff7ed",
    neutral200: "#ffedd5",
    neutral300: "#fed7aa",
    neutral400: "#fdba74",
    neutral500: "#fb923c",
    neutral600: "#f97316",

    success: "#84CC16",
    warning: "#EAB308",
    danger: "#EF4444",
    info: "#A855F7",

    glowPrimary: "rgba(249, 115, 22, 0.6)",
    glowSecondary: "rgba(168, 85, 247, 0.6)",
    glowSuccess: "rgba(132, 204, 22, 0.6)",
    glowDanger: "rgba(239, 68, 68, 0.6)",
  },
  effects: {
    glassBlur: "12px",
    metalSpecular: "linear-gradient(135deg, rgba(255,150,100,0.1) 0%, transparent 50%)",
    scanlineOpacity: "0.04",
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
  crimson: crimsonTheme,
  ocean: oceanTheme,
  sunset: sunsetTheme,
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

