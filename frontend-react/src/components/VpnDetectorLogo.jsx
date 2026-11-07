import React from 'react';

/**
 * Professional SVG Vector Logo for "VPN Detector"
 * Features an interlocking cryptographic shield, dual concentric radar sweep arcs,
 * and a secure tunnel node core with dynamic status beacon.
 */
export default function VpnDetectorLogo({ 
  className = "w-10 h-10", 
  vpnActive = false,
  showPulse = true 
}) {
  const primaryGlow = vpnActive ? '#10b981' : '#06b6d4';
  const secondaryColor = vpnActive ? '#059669' : '#3b82f6';

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Outer Cyber Shield Gradient */}
          <linearGradient id="shieldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Border Glow Gradient */}
          <linearGradient id="borderGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={primaryGlow} stopOpacity="0.8" />
            <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6" />
          </linearGradient>

          {/* Core Radar Beam Gradient */}
          <linearGradient id="coreGrad" x1="14" y1="14" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={primaryGlow} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          {/* Subtle Ambient Glow Filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shield Outer Path */}
        <path 
          d="M24 4L7 11V22C7 32.5 14.3 42.2 24 44.5C33.7 42.2 41 32.5 41 22V11L24 4Z" 
          fill="url(#shieldGrad)" 
          stroke="url(#borderGrad)" 
          strokeWidth="1.75" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* Inner Radar Arcs (Signal Detection) */}
        <path 
          d="M16 20C16 15.58 19.58 12 24 12C28.42 12 32 15.58 32 20" 
          stroke={primaryGlow} 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeDasharray="2 3"
          opacity="0.75"
        />
        <path 
          d="M12 22C12 15.37 17.37 10 24 10C30.63 10 36 15.37 36 22" 
          stroke="url(#borderGrad)" 
          strokeWidth="1.25" 
          strokeLinecap="round" 
          opacity="0.5"
        />

        {/* Central Secure Lock / Tunnel Core */}
        <rect 
          x="18" 
          y="23" 
          width="12" 
          height="10" 
          rx="2.5" 
          fill="url(#coreGrad)" 
          filter="url(#softGlow)"
        />
        <path 
          d="M20 23V19C20 16.79 21.79 15 24 15C26.21 15 28 16.79 28 19V23" 
          stroke="#ffffff" 
          strokeWidth="1.75" 
          strokeLinecap="round"
        />

        {/* Central Keyway / Data Signal Dot */}
        <circle cx="24" cy="27.5" r="1.5" fill="#0f172a" />
        <path d="M24 29V31" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
      </svg>

      {/* Pulsing Status Ping Beacon */}
      {showPulse && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            vpnActive ? 'bg-emerald-400' : 'bg-cyan-400'
          }`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            vpnActive ? 'bg-emerald-500' : 'bg-cyan-500'
          }`}></span>
        </span>
      )}
    </div>
  );
}
