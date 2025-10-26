'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TacitvsLogo from '@/components/TacitvsLogo';
import ThemeSwitch from '@/components/ThemeSwitch';
import TacitvsRadio from '@/components/TacitvsRadio';
import TelemetryStrip from '@/components/TelemetryStrip';
import '@/styles/globals.css';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'DASHBOARD' },
  { path: '/backtest', label: 'BACKTEST' },
  { path: '/research', label: 'RESEARCH' },
  { path: '/execution', label: 'EXECUTION' },
  { path: '/settings', label: 'SETTINGS' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [telemetry, setTelemetry] = useState({
    STATUS: 'ONLINE',
    LATENCY: '12ms',
    CPU: '34%',
    MEM: '2.1GB',
  });

  useEffect(() => {
    // Update telemetry periodically
    const interval = setInterval(() => {
      setTelemetry({
        STATUS: 'ONLINE',
        LATENCY: `${Math.floor(Math.random() * 20) + 5}ms`,
        CPU: `${Math.floor(Math.random() * 50) + 20}%`,
        MEM: `${(Math.random() * 2 + 1.5).toFixed(1)}GB`,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <html lang="en" data-theme="matrix">
      <head>
        <title>Tacitvs Quant Terminal</title>
        <meta name="description" content="Professional Quant Trading Terminal" />
      </head>
      <body className="scanline">
        <TacitvsRadio />
        
        <div className="flex h-screen flex-col">
          {/* Header */}
          <header className="border-b border-grid bg-panel">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center space-x-6">
                <Link href="/dashboard" className="flex items-center space-x-3">
                  <TacitvsLogo />
                  <span className="text-xl font-bold uppercase tracking-wider text-accent glow">
                    TACITVS
                  </span>
                </Link>
                
                <nav className="flex items-center space-x-1">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        'px-4 py-2 text-xs uppercase tracking-wider transition-all',
                        pathname === item.path
                          ? 'border-b-2 border-accent text-accent'
                          : 'text-fg/60 hover:text-accent2'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <ThemeSwitch />
            </div>
          </header>

          {/* Telemetry Strip */}
          <TelemetryStrip metrics={telemetry} />

          {/* Main Content */}
          <main className="flex-1 overflow-auto grid-overlay">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-grid bg-panel px-6 py-2 text-xs text-fg/60">
            <div className="flex items-center justify-between">
              <div>© 2025 Tacitvs Quant Terminal</div>
              <div className="flex items-center space-x-4">
                <span>v0.1.0</span>
                <span className="h-1 w-1 rounded-full bg-accent pulse-glow"></span>
                <span className="text-accent">OPERATIONAL</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

