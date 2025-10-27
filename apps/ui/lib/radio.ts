/**
 * 🧠 TACITVS QUANT TERMINAL - Radio System
 * Dynamic audio streaming system with theme-aware station switching
 */

import type { ThemeName } from './store';

export interface RadioStation {
  name: string;
  url: string;
  genre?: string;
  bitrate?: string;
}

/**
 * Radio stations mapped to themes
 * Each theme has its own sonic identity
 * 
 * Station Selection Criteria:
 * - Bitrate: 128 kbps minimum (prefer 192-320 kbps)
 * - CORS: Must support cross-origin streaming
 * - Uptime: Reliable 24/7 streams
 * - Genre match: Aligned with theme sonic identity
 */
export const RADIO_STATIONS: Record<ThemeName, RadioStation[]> = {
  matrix: [
    { 
      name: "Deep Space One", 
      url: "https://ice1.somafm.com/deepspaceone-128-mp3",
      genre: "Ambient Electronic",
      bitrate: "128 kbps"
    },
    { 
      name: "Space Station Soma", 
      url: "https://ice1.somafm.com/spacestation-128-mp3",
      genre: "Space Music",
      bitrate: "128 kbps"
    },
    { 
      name: "Synthwave Paradise", 
      url: "https://stream.laut.fm/synthwave",
      genre: "Synthwave",
      bitrate: "128 kbps"
    },
    { 
      name: "Vaporwave Network", 
      url: "https://stream.laut.fm/vaporwave",
      genre: "Vaporwave",
      bitrate: "128 kbps"
    },
  ],
  blackops: [
    { 
      name: "DI.FM Hard Techno", 
      url: "https://prem2.di.fm/hardtechno?mp3",
      genre: "Hard Techno",
      bitrate: "128 kbps"
    },
    { 
      name: "Doomed • Industrial", 
      url: "https://ice1.somafm.com/doomed-128-mp3",
      genre: "Industrial / EBM",
      bitrate: "128 kbps"
    },
    { 
      name: "DI.FM Industrial", 
      url: "https://prem2.di.fm/industrial?mp3",
      genre: "Industrial",
      bitrate: "128 kbps"
    },
    { 
      name: "DI.FM Dark Techno", 
      url: "https://prem2.di.fm/darkdnb?mp3",
      genre: "Dark Techno",
      bitrate: "128 kbps"
    },
  ],
  neon: [
    { 
      name: "Drone Zone", 
      url: "https://ice1.somafm.com/dronezone-128-mp3",
      genre: "Drone Ambient",
      bitrate: "128 kbps"
    },
    { 
      name: "Ambient Focus", 
      url: "https://stream.laut.fm/ambient",
      genre: "Ambient",
      bitrate: "128 kbps"
    },
    { 
      name: "Sonic Universe", 
      url: "https://ice1.somafm.com/sonicuniverse-128-mp3",
      genre: "Ambient / Space",
      bitrate: "128 kbps"
    },
    { 
      name: "Mission Control", 
      url: "https://ice1.somafm.com/missioncontrol-128-mp3",
      genre: "Ambient Chillout",
      bitrate: "128 kbps"
    },
  ],
};

/**
 * Get stations for a specific theme
 */
export function getStationsForTheme(theme: ThemeName): RadioStation[] {
  return RADIO_STATIONS[theme] || RADIO_STATIONS.matrix;
}

/**
 * Get station by theme and index
 */
export function getStation(theme: ThemeName, index: number): RadioStation | null {
  const stations = getStationsForTheme(theme);
  return stations[index] || stations[0] || null;
}

