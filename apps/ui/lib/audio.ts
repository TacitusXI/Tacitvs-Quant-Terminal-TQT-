/**
 * 🧠 TACITVS QUANT TERMINAL - Audio System
 * Web Audio API for system sounds and feedback
 * Separate volume control for system sounds and radio
 */

type BeepEvent = 
  | 'sim_start'      // Simulation start
  | 'sim_done'       // Simulation complete
  | 'order_exec'     // Order executed
  | 'error'          // Error alert
  | 'theme_switch'   // Theme changed
  | 'command'        // Command executed
  | 'focus';         // Focus/nav sound

const SOUND_MAP: Record<BeepEvent, { freq: number; duration: number; type?: OscillatorType }> = {
  sim_start: { freq: 880, duration: 70, type: 'square' },
  sim_done: { freq: 660, duration: 100, type: 'square' },
  order_exec: { freq: 1200, duration: 50, type: 'square' },
  error: { freq: 200, duration: 150, type: 'square' },
  theme_switch: { freq: 440, duration: 60, type: 'sine' },
  command: { freq: 550, duration: 40, type: 'sine' },
  focus: { freq: 330, duration: 30, type: 'sine' },
};

let audioContext: AudioContext | null = null;
let systemGainNode: GainNode | null = null;
let radioGainNode: GainNode | null = null;

/**
 * Initialize AudioContext (lazy)
 */
function getAudioContext(): AudioContext {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create separate gain nodes for system sounds and radio
    systemGainNode = audioContext.createGain();
    systemGainNode.gain.value = 0.3; // System sounds at 30% by default
    systemGainNode.connect(audioContext.destination);
    
    radioGainNode = audioContext.createGain();
    radioGainNode.gain.value = 1.0; // Radio at full gain (controlled by HTML5 audio element)
    radioGainNode.connect(audioContext.destination);
  }
  return audioContext!;
}

/**
 * Get system gain node
 */
export function getSystemGainNode(): GainNode | null {
  getAudioContext(); // Ensure context is initialized
  return systemGainNode;
}

/**
 * Get radio gain node
 */
export function getRadioGainNode(): GainNode | null {
  getAudioContext(); // Ensure context is initialized
  return radioGainNode;
}

/**
 * Set system sounds volume (0.0 to 1.0)
 */
export function setSystemVolume(volume: number): void {
  if (systemGainNode) {
    systemGainNode.gain.value = Math.max(0, Math.min(1, volume));
  }
}

/**
 * Crossfade between two audio elements
 * @param fromElement - Element to fade out
 * @param toElement - Element to fade in
 * @param duration - Crossfade duration in seconds
 */
export function crossfade(
  fromElement: HTMLAudioElement,
  toElement: HTMLAudioElement,
  duration: number = 1.5
): Promise<void> {
  return new Promise((resolve) => {
    const steps = 30;
    const interval = (duration * 1000) / steps;
    let step = 0;

    const fromStartVolume = fromElement.volume;
    const toTargetVolume = toElement.volume;
    toElement.volume = 0;

    const fadeInterval = setInterval(() => {
      step++;
      const progress = step / steps;

      // Fade out from element
      fromElement.volume = fromStartVolume * (1 - progress);
      
      // Fade in to element
      toElement.volume = toTargetVolume * progress;

      if (step >= steps) {
        clearInterval(fadeInterval);
        fromElement.pause();
        fromElement.volume = fromStartVolume; // Reset volume
        resolve();
      }
    }, interval);
  });
}

/**
 * Play a beep sound
 */
export function playBeep(
  event: BeepEvent,
  enabled: boolean = true
): void {
  if (!enabled || typeof window === 'undefined') return;
  
  try {
    const ctx = getAudioContext();
    const config = SOUND_MAP[event];
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = config.type || 'square';
    oscillator.frequency.value = config.freq;
    
    oscillator.connect(gainNode);
    
    // Connect to system gain node instead of directly to destination
    if (systemGainNode) {
      gainNode.connect(systemGainNode);
    } else {
      gainNode.connect(ctx.destination);
    }
    
    // Envelope: quick attack, exponential decay
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + config.duration / 1000);
    
    oscillator.start(now);
    oscillator.stop(now + config.duration / 1000 + 0.02);
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
}

/**
 * Play double beep (for completed actions)
 */
export function playDoubleBeep(enabled: boolean = true): void {
  if (!enabled) return;
  
  playBeep('sim_done', enabled);
  setTimeout(() => playBeep('sim_start', enabled), 120);
}

/**
 * Play error buzz
 */
export function playErrorSound(enabled: boolean = true): void {
  if (!enabled) return;
  
  playBeep('error', enabled);
  setTimeout(() => playBeep('error', enabled), 150);
}


