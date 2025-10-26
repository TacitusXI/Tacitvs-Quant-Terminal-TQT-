export type Theme = 'matrix' | 'blackops' | 'neon';

export interface ThemeConfig {
  name: Theme;
  primary: string;
  secondary: string;
  description: string;
  atmosphere: string;
  radioStream?: string;
}

export const THEMES: Record<Theme, ThemeConfig> = {
  matrix: {
    name: 'matrix',
    primary: '#00FF84',
    secondary: '#00CC66',
    description: 'Simulation / Research',
    atmosphere: 'аналитическая точность',
    radioStream: 'https://ice2.somafm.com/missioncontrol-128-mp3',
  },
  blackops: {
    name: 'blackops',
    primary: '#fe0174',
    secondary: '#f82909',
    description: 'Execution / Risk',
    atmosphere: 'агрессивный режим действий',
    radioStream: 'https://stream.laut.fm/nightdrivefm',
  },
  neon: {
    name: 'neon',
    primary: '#319ff8',
    secondary: '#422d94',
    description: 'Post-Analysis',
    atmosphere: 'спокойствие, порядок',
    radioStream: 'https://ice2.somafm.com/deepspaceone-128-mp3',
  },
};

export function setTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tacitvs-theme', theme);
  }
}

export function getTheme(): Theme {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('tacitvs-theme') as Theme;
    if (stored && THEMES[stored]) {
      return stored;
    }
  }
  return 'matrix';
}

export function getThemeConfig(theme: Theme): ThemeConfig {
  return THEMES[theme];
}

// Generate dynamic favicon based on theme
export function updateFavicon(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const config = THEMES[theme];
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  // Draw background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 64, 64);

  // Draw accent border
  ctx.strokeStyle = config.primary;
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 56, 56);

  // Draw "T" letter
  ctx.fillStyle = config.primary;
  ctx.font = 'bold 40px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('T', 32, 34);

  // Update favicon
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = canvas.toDataURL();
  document.getElementsByTagName('head')[0].appendChild(link);
}

