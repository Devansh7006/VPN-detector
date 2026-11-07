import React, { useState } from 'react';
import { 
  Crosshair, 
  MapPin, 
  Radio, 
  Compass, 
  Globe2, 
  Maximize2,
  Minimize2,
  Navigation
} from 'lucide-react';

export default function WorldMapSection({ data }) {
  const [radarActive, setRadarActive] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  const cur = data?.current_ip || {};
  const prov = data?.provider || {};

  const lat = cur.latitude;
  const lon = cur.longitude;

  // Calibrated Equirectangular (Plate Carrée 2:1) Mathematical Projection:
  // Coordinates are mapped with sub-pixel precision into a 1000 x 500 SVG coordinate grid.
  // X = ((lon + 180.0) / 360.0) * 1000.0
  // Y = ((90.0 - lat) / 180.0) * 500.0
  let svgX = 500.0;
  let svgY = 250.0;
  let hasCoords = false;

  if (typeof lat === 'number' && typeof lon === 'number') {
    svgX = ((lon + 180.0) / 360.0) * 1000.0;
    svgY = ((90.0 - lat) / 180.0) * 500.0;
    hasCoords = true;
  }

  const leftPercent = (svgX / 1000.0) * 100.0;
  const topPercent = (svgY / 500.0) * 100.0;

  const latFormatted = typeof lat === 'number' 
    ? `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}` 
    : '--';
  const lonFormatted = typeof lon === 'number' 
    ? `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}` 
    : '--';

  // Dynamic ViewBox for Regional Zoom (locks onto the exit node coordinates)
  // Clamp zoom box within 0..1000 and 0..500
  const zoomW = 160;
  const zoomH = 80;
  const zoomX = Math.max(0, Math.min(1000 - zoomW, svgX - zoomW / 2));
  const zoomY = Math.max(0, Math.min(500 - zoomH, svgY - zoomH / 2));

  const activeViewBox = isZoomed 
    ? `${zoomX.toFixed(1)} ${zoomY.toFixed(1)} ${zoomW} ${zoomH}` 
    : "0 0 1000 500";

  // Check if position is near right edge to flip tooltip
  const flipTooltip = leftPercent > 72;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg backdrop-blur-md">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Tactical Geolocation Radar Scope</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                Calibrated Vector Projection (2:1)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              High-Precision Vector Scope with Mathematical Coordinate Geodetic Locking
            </p>
          </div>
        </div>

        {/* Live Coordinate Badges & Zoom Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-1.5 shadow-inner">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300 font-bold">{latFormatted}, {lonFormatted}</span>
          </div>

          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all flex items-center gap-1 ${
              isZoomed 
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle between full world view and regional zoom"
          >
            {isZoomed ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span>{isZoomed ? 'World 1x' : 'Regional Lock 4x'}</span>
          </button>

          <button
            onClick={() => setRadarActive(!radarActive)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
              radarActive 
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            Sweep {radarActive ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* World Map Radar Viewport */}
      <div className="relative w-full aspect-[2/1] min-h-[280px] sm:min-h-[360px] max-h-[520px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner group">
        
        {/* Calibrated Vector Map */}
        <img 
          src="/world_map.svg" 
          alt="Calibrated Equirectangular World Map"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none filter brightness-110 contrast-125"
        />

        {/* Rotating Radar Sweep Beam */}
        {radarActive && !isZoomed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[120%] h-[120%] rounded-full radar-sweep-beam opacity-60"></div>
          </div>
        )}

        {/* Sub-Pixel Mathematical Vector Overlay (Locked 1:1 to SVG coordinate space) */}
        {hasCoords && (
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-700"
            viewBox={activeViewBox}
            preserveAspectRatio="none"
          >
            {/* Target Reticle at Exact (svgX, svgY) Coordinates */}
            <g transform={`translate(${svgX.toFixed(2)}, ${svgY.toFixed(2)})`}>
              {/* Animated Expanding Pulse Ring */}
              <circle r="14" fill="none" stroke="#06b6d4" strokeWidth="1.2">
                <animate attributeName="r" values="4;22" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.9;0" dur="2.2s" repeatCount="indefinite" />
              </circle>

              {/* Concentric Calibration Reticle */}
              <circle r="8" fill="rgba(6, 182, 212, 0.18)" stroke="#38bdf8" strokeWidth="1" />
              <circle r="3.5" fill="#06b6d4" />
              <circle r="1.2" fill="#ffffff" />

              {/* Crosshair Axes */}
              <line x1="-14" y1="0" x2="-4" y2="0" stroke="#38bdf8" strokeWidth="0.8" />
              <line x1="4" y1="0" x2="14" y2="0" stroke="#38bdf8" strokeWidth="0.8" />
              <line x1="0" y1="-14" x2="0" y2="-4" stroke="#38bdf8" strokeWidth="0.8" />
              <line x1="0" y1="4" x2="0" y2="14" stroke="#38bdf8" strokeWidth="0.8" />
            </g>
          </svg>
        )}

        {/* High-Precision Targeting Pin & HUD Info Callout */}
        {hasCoords && (
          <div 
            className="absolute z-20 pointer-events-none transition-all duration-500"
            style={{ 
              left: `${leftPercent.toFixed(2)}%`, 
              top: `${topPercent.toFixed(2)}%`,
              transform: flipTooltip 
                ? 'translate(-108%, -50%)' 
                : 'translate(12%, -50%)'
            }}
          >
            {/* Target Label HUD Card */}
            <div className="bg-slate-900/95 border border-cyan-500/60 rounded-xl p-2 px-3 shadow-2xl backdrop-blur-md text-[11px] font-mono leading-tight whitespace-nowrap min-w-[170px] shadow-cyan-500/10">
              <div className="text-cyan-300 font-bold flex items-center gap-1.5 pb-0.5 border-b border-slate-800">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                <span>{prov.name || 'Exit Node Gateway'}</span>
              </div>
              
              <div className="text-white font-semibold pt-1">
                {cur.city ? `${cur.city}, ` : ''}{cur.country || '--'}
              </div>

              <div className="text-slate-400 text-[10px] flex items-center justify-between pt-0.5">
                <span>GEO:</span>
                <span className="text-cyan-400 font-mono font-medium">{latFormatted}, {lonFormatted}</span>
              </div>

              {cur.region && (
                <div className="text-slate-400 text-[10px] flex items-center justify-between">
                  <span>REGION:</span>
                  <span className="text-slate-200">{cur.region}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tactical HUD Overlay Panels */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 text-[11px] font-mono bg-slate-950/85 border border-slate-800/90 p-2.5 rounded-lg backdrop-blur-md shadow-lg">
          <div className="text-slate-300 flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>NODE: {cur.city ? `${cur.city.toUpperCase()}_POP` : 'EDGE_POP'}</span>
          </div>
          <div className="text-cyan-300 text-[10px]">
            LAT/LON: {latFormatted} / {lonFormatted}
          </div>
          <div className="text-slate-400 text-[10px]">
            LOCATION: {cur.city ? `${cur.city}, ` : ''}{cur.country || '--'}{cur.region ? ` (${cur.region})` : ''}
          </div>
        </div>

        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 text-[10px] font-mono bg-slate-950/85 border border-slate-800/90 px-2.5 py-1 rounded-lg backdrop-blur-md text-slate-400">
          <span>CATALOG:</span>
          <span className="text-cyan-400 font-medium">{cur.provider_source || 'public-apis waterfall'}</span>
        </div>

        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 text-[10px] font-mono bg-slate-950/85 border border-slate-800/90 px-2.5 py-1 rounded-lg backdrop-blur-md text-slate-300">
          <span className="text-slate-500">PROJECTION:</span>
          <span className="text-cyan-400 font-bold">Plate Carrée (1000x500 Calibrated)</span>
        </div>

      </div>

      {/* Geolocation Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <span className="text-slate-500 text-[10px] block">Location</span>
          <span className="text-slate-200 font-bold truncate block" title={`${cur.city || ''}, ${cur.region || ''}, ${cur.country || ''}`}>
            {cur.city ? `${cur.city}, ` : ''}{cur.country || '--'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <span className="text-slate-500 text-[10px] block">Timezone</span>
          <span className="text-slate-200 font-bold truncate block">
            {cur.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || '--'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <span className="text-slate-500 text-[10px] block">Autonomous System</span>
          <span className="text-cyan-400 font-bold truncate block" title={cur.as_full || cur.as_number}>
            {cur.as_full || (cur.as_number ? `AS${cur.as_number}` : '--')}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <span className="text-slate-500 text-[10px] block">Postal / State Code</span>
          <span className="text-slate-200 font-bold truncate block">
            {cur.postal_code || cur.region || '--'}
          </span>
        </div>
      </div>

    </div>
  );
}
