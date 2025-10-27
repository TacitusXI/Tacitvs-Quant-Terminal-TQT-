/**
 * 🧠 TACITVS QUANT TERMINAL - Command Palette
 * ⌘K system command interface
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { setTheme } from '@/lib/theme';
import { playBeep, playDoubleBeep } from '@/lib/audio';
import { useRouter } from 'next/navigation';
import type { ThemeName } from '@/lib/store';

interface Command {
  id: string;
  label: string;
  action: () => void;
  category: 'nav' | 'theme' | 'system' | 'radio';
}

export const CommandPalette: React.FC = () => {
  const router = useRouter();
  const { 
    commandPaletteOpen, 
    setCommandPaletteOpen, 
    theme,
    setTheme: updateTheme,
    audioEnabled,
    toggleAudio,
    radioEnabled,
    toggleRadio,
    nextRadioStation,
    radioVolume,
    setRadioVolume,
  } = useAppStore();
  
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const commands: Command[] = [
    // Navigation
    { id: 'nav-dash', label: 'Go to Dashboard', action: () => router.push('/'), category: 'nav' },
    { id: 'nav-lab', label: 'Go to LAB', action: () => router.push('/LAB'), category: 'nav' },
    { id: 'nav-ops', label: 'Go to OPS', action: () => router.push('/OPS'), category: 'nav' },
    
    // Themes
    { id: 'theme-matrix', label: 'Switch to Matrix theme', action: () => { updateTheme('matrix'); setTheme('matrix'); }, category: 'theme' },
    { id: 'theme-blackops', label: 'Switch to BlackOps theme', action: () => { updateTheme('blackops'); setTheme('blackops'); }, category: 'theme' },
    { id: 'theme-neon', label: 'Switch to Neon theme', action: () => { updateTheme('neon'); setTheme('neon'); }, category: 'theme' },
    
    // Radio
    { id: 'radio-toggle', label: radioEnabled ? 'Stop Radio' : 'Start Radio', action: toggleRadio, category: 'radio' },
    { id: 'radio-next', label: 'Next Radio Station', action: nextRadioStation, category: 'radio' },
    { id: 'radio-vol-up', label: 'Radio Volume +10%', action: () => setRadioVolume(Math.min(1, radioVolume + 0.1)), category: 'radio' },
    { id: 'radio-vol-down', label: 'Radio Volume -10%', action: () => setRadioVolume(Math.max(0, radioVolume - 0.1)), category: 'radio' },
    
    // System
    { id: 'sys-audio', label: audioEnabled ? 'Disable audio' : 'Enable audio', action: toggleAudio, category: 'system' },
  ];
  
  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );
  
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open/close with ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        playBeep('command', audioEnabled);
        return;
      }
      
      if (!commandPaletteOpen) return;
      
      // Navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredCommands.length);
        playBeep('focus', audioEnabled);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
        playBeep('focus', audioEnabled);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) {
          cmd.action();
          playDoubleBeep(audioEnabled);
          setCommandPaletteOpen(false);
          setSearch('');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
        setSearch('');
        playBeep('focus', audioEnabled);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredCommands, selectedIndex, audioEnabled, setCommandPaletteOpen, router]);
  
  if (!commandPaletteOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/80 backdrop-blur-sm"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div 
        className="w-full max-w-2xl panel border-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-[var(--border)]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command..."
            autoFocus
            className="w-full bg-transparent text-[var(--fg)] font-mono text-sm outline-none placeholder:text-[var(--fg)] placeholder:opacity-40"
          />
        </div>
        
        {/* Commands List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-[var(--fg)] opacity-40 text-sm font-mono">
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  playDoubleBeep(audioEnabled);
                  setCommandPaletteOpen(false);
                  setSearch('');
                }}
                className={`
                  w-full p-3 text-left font-mono text-sm transition-all
                  flex items-center justify-between
                  ${i === selectedIndex 
                    ? 'bg-[var(--accent)] text-black' 
                    : 'text-[var(--fg)] hover:bg-[var(--grid)]'
                  }
                `}
              >
                <span>{cmd.label}</span>
                <span className="text-xs opacity-60 uppercase">
                  {cmd.category}
                </span>
              </button>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-mono text-[var(--fg)] opacity-40">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Execute</span>
            <span>ESC Close</span>
          </div>
          <span>⌘K</span>
        </div>
      </div>
    </div>
  );
};

