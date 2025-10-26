import { create } from 'zustand';

interface AudioStore {
  enabled: boolean;
  volume: number;
  radioEnabled: boolean;
  radioVolume: number;
  audioContext: AudioContext | null;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setRadioEnabled: (enabled: boolean) => void;
  setRadioVolume: (volume: number) => void;
  initAudioContext: () => void;
  playPing: () => void;
  playTick: () => void;
  playAlert: () => void;
}

export const useAudio = create<AudioStore>((set, get) => ({
  enabled: true,
  volume: 0.3,
  radioEnabled: false,
  radioVolume: 0.2,
  audioContext: null,

  setEnabled: (enabled) => {
    localStorage.setItem('tacitvs-audio-enabled', String(enabled));
    set({ enabled });
  },

  setVolume: (volume) => {
    localStorage.setItem('tacitvs-audio-volume', String(volume));
    set({ volume });
  },

  setRadioEnabled: (enabled) => {
    localStorage.setItem('tacitvs-radio-enabled', String(enabled));
    set({ radioEnabled: enabled });
  },

  setRadioVolume: (volume) => {
    localStorage.setItem('tacitvs-radio-volume', String(volume));
    set({ radioVolume: volume });
  },

  initAudioContext: () => {
    if (typeof window !== 'undefined' && !get().audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      set({ audioContext: ctx });
    }
  },

  playPing: () => {
    const { enabled, volume, audioContext } = get();
    if (!enabled || !audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silent fail on audio errors
    }
  },

  playTick: () => {
    const { enabled, volume, audioContext } = get();
    if (!enabled || !audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1200;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(volume * 0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (error) {
      // Silent fail on audio errors
    }
  },

  playAlert: () => {
    const { enabled, volume, audioContext } = get();
    if (!enabled || !audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silent fail on audio errors
    }
  },
}));

