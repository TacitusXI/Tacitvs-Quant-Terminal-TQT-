/**
 * 🧠 TACITVS QUANT TERMINAL - Global Store
 * Zustand store for theme, audio, and app state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeName = 'matrix' | 'blackops' | 'neon';

export interface AppState {
  // Theme
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  
  // Audio
  audioEnabled: boolean;
  toggleAudio: () => void;
  
  // Simulation state
  isSimulating: boolean;
  setSimulating: (value: boolean) => void;
  
  // Connection status
  apiConnected: boolean;
  setApiConnected: (value: boolean) => void;
  
  // Command Palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'matrix',
      setTheme: (theme) => {
        set({ theme });
        // Update DOM attribute for CSS
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
      
      // Audio
      audioEnabled: true,
      toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
      
      // Simulation
      isSimulating: false,
      setSimulating: (value) => set({ isSimulating: value }),
      
      // API Connection
      apiConnected: false,
      setApiConnected: (value) => set({ apiConnected: value }),
      
      // Command Palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (value) => set({ commandPaletteOpen: value }),
    }),
    {
      name: 'tqt-storage',
      partialize: (state) => ({
        theme: state.theme,
        audioEnabled: state.audioEnabled,
      }),
    }
  )
);

