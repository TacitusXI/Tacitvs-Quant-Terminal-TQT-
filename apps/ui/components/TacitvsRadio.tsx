/**
 * 🧠 TACITVS QUANT TERMINAL - Radio Component
 * Dynamic streaming radio that adapts to theme
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { getStationsForTheme, type RadioStation } from '@/lib/radio';
import { playBeep } from '@/lib/audio';

export function TacitvsRadio() {
  const theme = useAppStore((state) => state.theme);
  const radioEnabled = useAppStore((state) => state.radioEnabled);
  const radioVolume = useAppStore((state) => state.radioVolume);
  const radioStationIndex = useAppStore((state) => state.radioStationIndex);
  const audioEnabled = useAppStore((state) => state.audioEnabled);
  const toggleRadio = useAppStore((state) => state.toggleRadio);
  const setRadioVolume = useAppStore((state) => state.setRadioVolume);
  const nextRadioStation = useAppStore((state) => state.nextRadioStation);
  const setRadioStationIndex = useAppStore((state) => state.setRadioStationIndex);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);

  const stations = getStationsForTheme(theme);
  const stationIndex = radioStationIndex % stations.length;

  // Crossfade management
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load and play station
   */
  const loadStation = useCallback(async (station: RadioStation) => {
    if (!audioRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Stop current playback
      if (audioRef.current.src) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      // Set new source
      audioRef.current.src = station.url;
      audioRef.current.volume = radioVolume;
      audioRef.current.load();

      // Try to play
      await audioRef.current.play();
      setIsPlaying(true);
      setCurrentStation(station);
      setIsLoading(false);
      
      if (audioEnabled) {
        playBeep('command', audioEnabled);
      }
    } catch (err) {
      console.warn(`Failed to load station: ${station.name}`, err);
      setError(`Failed to load ${station.name}`);
      setIsLoading(false);
      setIsPlaying(false);
      
      // Try next station on error (fallback)
      const nextIndex = (stationIndex + 1) % stations.length;
      if (nextIndex !== stationIndex) {
        setTimeout(() => {
          setRadioStationIndex(nextIndex);
        }, 1000);
      }
    }
  }, [radioVolume, audioEnabled, stationIndex, stations.length, setRadioStationIndex]);

  /**
   * Handle theme change - switch station list and reset to first
   */
  useEffect(() => {
    setRadioStationIndex(0);
    setError(null);
  }, [theme, setRadioStationIndex]);

  /**
   * Handle station change
   */
  useEffect(() => {
    if (!radioEnabled || !stations[stationIndex]) return;

    const station = stations[stationIndex];
    
    // Crossfade effect
    if (audioRef.current && currentStation) {
      // Fade out
      const startVolume = audioRef.current.volume;
      const fadeSteps = 15;
      const fadeInterval = 100; // 1.5s total
      
      let step = 0;
      const fadeOut = setInterval(() => {
        if (audioRef.current) {
          step++;
          audioRef.current.volume = startVolume * (1 - step / fadeSteps);
          
          if (step >= fadeSteps) {
            clearInterval(fadeOut);
            loadStation(station);
          }
        }
      }, fadeInterval);
      
      return () => clearInterval(fadeOut);
    } else {
      loadStation(station);
    }
  }, [stationIndex, radioEnabled, stations, loadStation, currentStation]);

  /**
   * Handle volume changes
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = radioVolume;
    }
  }, [radioVolume]);

  /**
   * Handle play/pause
   */
  useEffect(() => {
    if (!audioRef.current) return;

    if (radioEnabled && !isPlaying && stations[stationIndex]) {
      loadStation(stations[stationIndex]);
    } else if (!radioEnabled && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [radioEnabled, isPlaying, stations, stationIndex, loadStation]);

  /**
   * Handle next station
   */
  const handleNext = useCallback(() => {
    const nextIndex = (stationIndex + 1) % stations.length;
    setRadioStationIndex(nextIndex);
    if (audioEnabled) {
      playBeep('focus', audioEnabled);
    }
  }, [stationIndex, stations.length, setRadioStationIndex, audioEnabled]);

  /**
   * Handle volume change
   */
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setRadioVolume(newVolume);
  }, [setRadioVolume]);

  /**
   * Handle toggle radio
   */
  const handleToggle = useCallback(() => {
    toggleRadio();
    if (audioEnabled) {
      playBeep('theme_switch', audioEnabled);
    }
  }, [toggleRadio, audioEnabled]);

  // Error auto-recovery
  useEffect(() => {
    if (!audioRef.current) return;

    const handleError = () => {
      setError('Stream error - trying next station...');
      setTimeout(() => {
        handleNext();
      }, 2000);
    };

    audioRef.current.addEventListener('error', handleError);
    return () => {
      audioRef.current?.removeEventListener('error', handleError);
    };
  }, [handleNext]);

  const station = stations[stationIndex];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--accent2)] bg-[var(--bg-primary)] backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-2 font-mono text-sm">
        {/* Left: Station Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={handleToggle}
            className={`
              px-3 py-1 rounded border transition-all font-bold
              ${radioEnabled 
                ? 'bg-[var(--bg-primary)] text-[var(--accent)] border-[var(--accent)] shadow-[0_0_4px_rgba(var(--accent-rgb),0.3)]' 
                : 'bg-transparent text-[var(--accent2)] border-[var(--accent2)] hover:bg-[var(--grid)] hover:border-[var(--accent)]'
              }
            `}
            title={radioEnabled ? 'Stop Radio' : 'Start Radio'}
          >
            {radioEnabled ? '■ STOP' : '▶ PLAY'}
          </button>

          {radioEnabled && (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[var(--accent)] whitespace-nowrap">
                  📡 Tacitvs Radio
                </span>
                <span className="text-[var(--accent2)] truncate">
                  • {station?.name || 'Loading...'}
                </span>
                {isLoading && (
                  <span className="text-[var(--accent2)] animate-pulse">
                    [BUFFERING...]
                  </span>
                )}
                {error && (
                  <span className="text-red-500 truncate">
                    {error}
                  </span>
                )}
                {!isLoading && !error && isPlaying && station?.bitrate && (
                  <span className="text-[var(--accent2)] opacity-70">
                    [{station.bitrate}]
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: Controls */}
        {radioEnabled && (
          <div className="flex items-center gap-4">
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent2)]">VOL</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={radioVolume}
                onChange={handleVolumeChange}
                className="w-24 accent-[var(--accent)]"
                title={`Volume: ${Math.round(radioVolume * 100)}%`}
              />
              <span className="text-[var(--accent2)] w-8 text-right">
                {Math.round(radioVolume * 100)}
              </span>
            </div>

            {/* Next Station */}
            <button
              onClick={handleNext}
              className="px-3 py-1 rounded border border-[var(--accent2)] text-[var(--accent2)] hover:bg-[var(--grid)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all font-bold"
              title="Next Station"
            >
              ↻ NEXT
            </button>

            {/* Theme Indicator */}
            <div className="px-2 py-1 rounded bg-[var(--panel)] text-[var(--accent)] border border-[var(--accent2)] font-bold">
              {theme.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
        className="hidden"
      />
    </div>
  );
}

