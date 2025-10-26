import { THEMES, Theme } from './theme';

class TacitvsRadio {
  private audio: HTMLAudioElement | null = null;
  private currentTheme: Theme | null = null;
  private volume: number = 0.2;
  private enabled: boolean = false;
  private fadeInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.crossOrigin = 'anonymous';
      
      // Load saved preferences
      const savedVolume = localStorage.getItem('tacitvs-radio-volume');
      if (savedVolume) {
        this.volume = parseFloat(savedVolume);
      }
      
      const savedEnabled = localStorage.getItem('tacitvs-radio-enabled');
      if (savedEnabled) {
        this.enabled = savedEnabled === 'true';
      }
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    localStorage.setItem('tacitvs-radio-volume', String(this.volume));
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('tacitvs-radio-enabled', String(enabled));
    
    if (!enabled) {
      this.stop();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  switchTheme(theme: Theme) {
    if (!this.enabled || !this.audio) return;
    
    const config = THEMES[theme];
    
    // If same theme or no radio stream, do nothing
    if (this.currentTheme === theme || !config.radioStream) {
      return;
    }

    // Fade out current stream
    if (this.currentTheme) {
      this.fadeOut(() => {
        this.currentTheme = theme;
        this.play(config.radioStream!);
      });
    } else {
      this.currentTheme = theme;
      this.play(config.radioStream);
    }
  }

  private play(streamUrl: string) {
    if (!this.audio || !this.enabled) return;

    this.audio.src = streamUrl;
    this.audio.volume = 0;
    
    // Handle autoplay policy
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.fadeIn();
      }).catch((error) => {
        // User interaction required or other playback error
        console.warn('Radio autoplay prevented:', error.message);
        // Try to play after user interaction
        if (typeof document !== 'undefined') {
          const resumePlay = () => {
            if (this.audio && this.enabled) {
              this.audio.play().catch(() => {});
              document.removeEventListener('click', resumePlay);
            }
          };
          document.addEventListener('click', resumePlay, { once: true });
        }
      });
    }
  }

  private fadeIn() {
    if (!this.audio) return;
    
    let currentVolume = 0;
    const targetVolume = this.volume;
    const step = 0.02;
    const interval = 50;

    this.fadeInterval = setInterval(() => {
      if (!this.audio) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        return;
      }

      currentVolume += step;
      if (currentVolume >= targetVolume) {
        this.audio.volume = targetVolume;
        if (this.fadeInterval) clearInterval(this.fadeInterval);
      } else {
        this.audio.volume = currentVolume;
      }
    }, interval);
  }

  private fadeOut(callback: () => void) {
    if (!this.audio) {
      callback();
      return;
    }

    let currentVolume = this.audio.volume;
    const step = 0.02;
    const interval = 50;

    this.fadeInterval = setInterval(() => {
      if (!this.audio) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        callback();
        return;
      }

      currentVolume -= step;
      if (currentVolume <= 0) {
        this.audio.volume = 0;
        this.audio.pause();
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        callback();
      } else {
        this.audio.volume = currentVolume;
      }
    }, interval);
  }

  stop() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    
    if (this.audio) {
      this.audio.pause();
      this.audio.volume = 0;
      this.currentTheme = null;
    }
  }

  getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }
}

// Singleton instance
let radioInstance: TacitvsRadio | null = null;

export function getRadio(): TacitvsRadio {
  if (!radioInstance) {
    radioInstance = new TacitvsRadio();
  }
  return radioInstance;
}

export default TacitvsRadio;

