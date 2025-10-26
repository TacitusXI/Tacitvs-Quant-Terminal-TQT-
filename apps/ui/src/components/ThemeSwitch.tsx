'use client';

import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { THEMES } from '@/lib/theme';
import { useAudio } from '@/hooks/useAudio';

export default function ThemeSwitch() {
  const { theme, setTheme: changeTheme, initialize, initialized } = useTheme();
  const { playTick } = useAudio();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  const handleThemeChange = (newTheme: typeof theme) => {
    playTick();
    changeTheme(newTheme);
  };

  return (
    <div className="flex items-center space-x-2">
      {Object.entries(THEMES).map(([key, config]) => (
        <button
          key={key}
          onClick={() => handleThemeChange(key as typeof theme)}
          className={`px-3 py-1 text-xs uppercase tracking-wider transition-all border ${
            theme === key
              ? 'border-accent text-accent glow-sm'
              : 'border-grid text-fg/60 hover:border-accent2 hover:text-accent2'
          }`}
          title={config.description}
        >
          {key}
        </button>
      ))}
    </div>
  );
}

