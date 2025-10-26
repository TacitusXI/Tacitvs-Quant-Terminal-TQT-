'use client';

import { useEffect, useState } from 'react';
import DataPanel from '@/components/DataPanel';
import { useTheme } from '@/hooks/useTheme';
import { useAudio } from '@/hooks/useAudio';
import { THEMES } from '@/lib/theme';
import { getRadio } from '@/lib/radio';

export default function SettingsPage() {
  const { theme, setTheme: changeTheme } = useTheme();
  const {
    enabled: audioEnabled,
    volume: audioVolume,
    radioEnabled,
    radioVolume,
    setEnabled: setAudioEnabled,
    setVolume: setAudioVolume,
    setRadioEnabled,
    setRadioVolume,
    playPing,
  } = useAudio();

  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [wsUrl, setWsUrl] = useState('ws://localhost:8000');

  useEffect(() => {
    // Load saved settings
    const savedApiUrl = localStorage.getItem('tacitvs-api-url');
    const savedWsUrl = localStorage.getItem('tacitvs-ws-url');
    
    if (savedApiUrl) setApiUrl(savedApiUrl);
    if (savedWsUrl) setWsUrl(savedWsUrl);
  }, []);

  const handleSaveApiSettings = () => {
    localStorage.setItem('tacitvs-api-url', apiUrl);
    localStorage.setItem('tacitvs-ws-url', wsUrl);
    playPing();
    alert('API settings saved');
  };

  const handleThemeChange = (newTheme: typeof theme) => {
    playPing();
    changeTheme(newTheme);
  };

  const handleAudioToggle = () => {
    const newValue = !audioEnabled;
    setAudioEnabled(newValue);
    if (newValue) playPing();
  };

  const handleRadioToggle = () => {
    const newValue = !radioEnabled;
    setRadioEnabled(newValue);
    
    const radio = getRadio();
    radio.setEnabled(newValue);
    
    if (newValue) {
      radio.switchTheme(theme);
      playPing();
    } else {
      radio.stop();
    }
  };

  return (
    <div className="h-full p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Theme Settings */}
        <div className="col-span-12 lg:col-span-6">
          <DataPanel title="Theme Settings" glow>
            <div className="space-y-6">
              <div>
                <label className="block text-sm uppercase text-fg/60 mb-3">Color Scheme</label>
                <div className="space-y-3">
                  {Object.entries(THEMES).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleThemeChange(key as typeof theme)}
                      className={`w-full p-4 border-2 transition-all flex items-center justify-between ${
                        theme === key
                          ? 'border-accent bg-accent/10'
                          : 'border-grid hover:border-accent2'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          <div
                            className="w-6 h-6 border border-grid"
                            style={{ backgroundColor: config.primary }}
                          />
                          <div
                            className="w-6 h-6 border border-grid"
                            style={{ backgroundColor: config.secondary }}
                          />
                        </div>
                        <div className="text-left">
                          <div className="font-bold uppercase">{config.name}</div>
                          <div className="text-xs text-fg/60">{config.description}</div>
                        </div>
                      </div>
                      {theme === key && (
                        <div className="text-accent text-2xl">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-grid">
                <p className="text-xs text-fg/60">
                  Themes control the primary accent color and ambient atmosphere of the terminal.
                  Each theme is optimized for different operational modes.
                </p>
              </div>
            </div>
          </DataPanel>
        </div>

        {/* Audio Settings */}
        <div className="col-span-12 lg:col-span-6">
          <DataPanel title="Audio Settings">
            <div className="space-y-6">
              {/* System Audio */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm uppercase text-fg/60">System Audio</label>
                  <button
                    onClick={handleAudioToggle}
                    className={`px-4 py-1 text-xs font-bold transition-all ${
                      audioEnabled
                        ? 'bg-accent text-bg'
                        : 'border border-grid text-fg/60'
                    }`}
                  >
                    {audioEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Volume</span>
                    <span className="text-accent">{Math.round(audioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    disabled={!audioEnabled}
                    className="w-full"
                  />
                  <button
                    onClick={playPing}
                    disabled={!audioEnabled}
                    className="w-full py-2 border border-grid text-xs hover:border-accent2 disabled:opacity-30"
                  >
                    TEST SOUND
                  </button>
                </div>
              </div>

              {/* Tacitvs Radio */}
              <div className="pt-4 border-t border-grid">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm uppercase text-fg/60">Tacitvs Radio</label>
                  <button
                    onClick={handleRadioToggle}
                    className={`px-4 py-1 text-xs font-bold transition-all ${
                      radioEnabled
                        ? 'bg-accent text-bg'
                        : 'border border-grid text-fg/60'
                    }`}
                  >
                    {radioEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Volume</span>
                    <span className="text-accent">{Math.round(radioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={radioVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setRadioVolume(val);
                      getRadio().setVolume(val);
                    }}
                    disabled={!radioEnabled}
                    className="w-full"
                  />
                </div>
                <div className="mt-4 text-xs text-fg/60">
                  <p className="mb-2">
                    Ambient audio stream changes based on active theme. Provides subtle
                    atmospheric background for extended trading sessions.
                  </p>
                  {radioEnabled && (
                    <div className="card">
                      <div className="text-accent font-semibold mb-1">
                        Currently Playing: {THEMES[theme].atmosphere}
                      </div>
                      <div className="text-fg/60 text-xs">
                        Stream: {THEMES[theme].radioStream?.split('/').pop()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DataPanel>
        </div>

        {/* API Settings */}
        <div className="col-span-12">
          <DataPanel title="API Configuration">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm uppercase text-fg/60 mb-2">API Base URL</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full"
                  placeholder="http://localhost:8000"
                />
              </div>
              <div>
                <label className="block text-sm uppercase text-fg/60 mb-2">WebSocket URL</label>
                <input
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  className="w-full"
                  placeholder="ws://localhost:8000"
                />
              </div>
              <div className="lg:col-span-2">
                <button
                  onClick={handleSaveApiSettings}
                  className="px-6 py-2 bg-accent text-bg font-bold uppercase tracking-wider hover:bg-accent2 transition-all"
                >
                  Save API Settings
                </button>
              </div>
            </div>
          </DataPanel>
        </div>

        {/* System Info */}
        <div className="col-span-12">
          <DataPanel title="System Information">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-xs uppercase text-fg/60 mb-1">Version</div>
                <div className="text-accent font-semibold">0.1.0</div>
              </div>
              <div>
                <div className="text-xs uppercase text-fg/60 mb-1">Build</div>
                <div className="text-accent font-semibold">2025.01.15</div>
              </div>
              <div>
                <div className="text-xs uppercase text-fg/60 mb-1">Environment</div>
                <div className="text-accent font-semibold">DEVELOPMENT</div>
              </div>
              <div>
                <div className="text-xs uppercase text-fg/60 mb-1">Status</div>
                <div className="status-active font-semibold">OPERATIONAL</div>
              </div>
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}

