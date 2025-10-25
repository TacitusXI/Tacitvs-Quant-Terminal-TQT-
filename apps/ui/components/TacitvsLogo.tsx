/**
 * 🧠 TACITVS QUANT TERMINAL - Dynamic Logo
 * SVG logo that adapts to current theme color
 */

'use client';

import React from 'react';

interface TacitvsLogoProps {
  size?: number;
  className?: string;
}

export const TacitvsLogo: React.FC<TacitvsLogoProps> = ({ 
  size = 100, 
  className = '' 
}) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size}
      className={className}
      style={{ color: 'var(--accent)' }}
      aria-label="Tacitvs Logo"
    >
      {/* Main helmet/terminal shape */}
      <path 
        fill="currentColor"
        d="M50 14c-16 0-26 11-26 26v10l7 9h38l7-9V40C76 25 66 14 50 14z"
        opacity="0.9"
      />
      
      {/* Visor line */}
      <rect 
        x="30" 
        y="45" 
        width="40" 
        height="2" 
        fill="var(--bg)"
      />
      
      {/* T accent */}
      <g opacity="0.8">
        {/* Horizontal bar */}
        <rect x="40" y="30" width="20" height="3" fill="var(--bg)" />
        {/* Vertical bar */}
        <rect x="48.5" y="30" width="3" height="15" fill="var(--bg)" />
      </g>
      
      {/* Lower structure */}
      <path 
        fill="currentColor"
        d="M35 60h30l5 20H30z"
        opacity="0.7"
      />
      
      {/* Accent lines */}
      <line 
        x1="35" 
        y1="65" 
        x2="65" 
        y2="65" 
        stroke="var(--accent2)" 
        strokeWidth="1"
        opacity="0.6"
      />
      <line 
        x1="38" 
        y1="72" 
        x2="62" 
        y2="72" 
        stroke="var(--accent2)" 
        strokeWidth="1"
        opacity="0.4"
      />
    </svg>
  );
};

export const TacitvsLogoMinimal: React.FC<TacitvsLogoProps> = ({ 
  size = 32, 
  className = '' 
}) => {
  return (
    <svg 
      viewBox="0 0 32 32" 
      width={size} 
      height={size}
      className={className}
      style={{ color: 'var(--accent)' }}
      aria-label="Tacitvs"
    >
      {/* Minimal T in terminal frame */}
      <rect 
        x="4" 
        y="4" 
        width="24" 
        height="24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      />
      <path 
        d="M10 12h12M16 12v12" 
        stroke="currentColor" 
        strokeWidth="2.5"
        strokeLinecap="square"
      />
    </svg>
  );
};

