import { create } from 'zustand';
import { Theme, setTheme as setThemeLib, getTheme, updateFavicon } from '@/lib/theme';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initialized: boolean;
  initialize: () => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  theme: 'matrix',
  initialized: false,
  
  initialize: () => {
    const savedTheme = getTheme();
    setThemeLib(savedTheme);
    updateFavicon(savedTheme);
    set({ theme: savedTheme, initialized: true });
  },
  
  setTheme: (theme: Theme) => {
    setThemeLib(theme);
    updateFavicon(theme);
    set({ theme });
  },
}));

