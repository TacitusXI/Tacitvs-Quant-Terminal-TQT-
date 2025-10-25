/**
 * 🧠 TACITVS QUANT TERMINAL - Theme Manager
 * Dynamic theme switching with logo and favicon updates
 */

import type { ThemeName } from './store';

export const THEMES = {
  matrix: {
    name: 'Matrix',
    primary: '#00FF84',
    secondary: '#00CC66',
    description: 'Research / Simulation',
  },
  blackops: {
    name: 'BlackOps',
    primary: '#fe0174',
    secondary: '#f82909',
    description: 'Execution / Risk Mode',
  },
  neon: {
    name: 'Neon',
    primary: '#319ff8',
    secondary: '#422d94',
    description: 'Post-Analysis / Reporting',
  },
} as const;

/**
 * Update HTML data-theme attribute
 */
export function setTheme(theme: ThemeName): void {
  if (typeof window === 'undefined') return;
  
  document.documentElement.setAttribute('data-theme', theme);
  updateFavicon();
}

/**
 * Get current theme colors from CSS variables
 */
export function getThemeColors(): { accent: string; accent2: string } {
  if (typeof window === 'undefined') {
    return { accent: '#00FF84', accent2: '#00CC66' };
  }
  
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: styles.getPropertyValue('--accent').trim(),
    accent2: styles.getPropertyValue('--accent2').trim(),
  };
}

/**
 * Generate dynamic favicon based on current theme
 */
export function updateFavicon(): void {
  if (typeof window === 'undefined') return;
  
  const { accent } = getThemeColors();
  
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 64, 64);
  
  // Draw "T" shape in accent color
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.lineCap = 'square';
  
  // Horizontal bar of T
  ctx.beginPath();
  ctx.moveTo(16, 20);
  ctx.lineTo(48, 20);
  ctx.stroke();
  
  // Vertical bar of T
  ctx.beginPath();
  ctx.moveTo(32, 20);
  ctx.lineTo(32, 48);
  ctx.stroke();
  
  // Update favicon
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? 
               document.createElement('link');
  link.rel = 'icon';
  link.href = canvas.toDataURL('image/png');
  
  if (!document.querySelector('link[rel="icon"]')) {
    document.head.appendChild(link);
  }
}

/**
 * Initialize theme on mount
 */
export function initializeTheme(theme: ThemeName): void {
  setTheme(theme);
}

