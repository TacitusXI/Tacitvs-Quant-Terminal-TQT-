/**
 * 🧠 TACITVS QUANT TERMINAL - Telemetry Strip
 * Bottom status bar with system telemetry
 */

'use client';

import React from 'react';

export const TelemetryStrip: React.FC = () => {
  const [time, setTime] = React.useState<string>('');
  
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().slice(11, 19) + 'Z');
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--panel)] z-50">
      <div className="max-w-[1800px] mx-auto px-6 py-2 flex items-center justify-between text-[10px] font-mono">
        {/* Left: System status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] pulse-slow" />
            <span className="text-[var(--accent)]">ONLINE</span>
          </div>
          
          <div className="text-[var(--fg)]">
            LATENCY: <span className="text-[var(--accent)]">12ms</span>
          </div>
          
          <div className="text-[var(--fg)]">
            FEED: <span className="text-[var(--accent)]">LIVE</span>
          </div>
        </div>
        
        {/* Center: Build info */}
        <div className="text-[var(--fg)] opacity-40">
          TQT v0.1.0 | BUILD 2025.10.25
        </div>
        
        {/* Right: Time */}
        <div className="text-[var(--accent)]">
          {time}
        </div>
      </div>
    </div>
  );
};

