'use client';

import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAudio } from '@/hooks/useAudio';
import { getRadio } from '@/lib/radio';

export default function TacitvsRadio() {
  const { theme, initialized } = useTheme();
  const { radioEnabled, radioVolume } = useAudio();

  useEffect(() => {
    if (!initialized) return;

    const radio = getRadio();
    radio.setEnabled(radioEnabled);
    radio.setVolume(radioVolume);

    if (radioEnabled) {
      radio.switchTheme(theme);
    }

    return () => {
      radio.stop();
    };
  }, [theme, radioEnabled, radioVolume, initialized]);

  return null;
}

