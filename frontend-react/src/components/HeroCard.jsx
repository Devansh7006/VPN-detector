import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Radio, 
  Lock, 
  Cpu, 
  Wifi, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Zap
} from 'lucide-react';

export default function HeroCard({ data }) {
  const vpnDetected = data?.vpn_detected || false;
  const prov = data?.provider || {};
  const cur = data?.current_ip || {};
  const orig = data?.original_system_ip || {};
  const net = data?.network_ip || {};
  const hw = data?.system_hardware || {};
  const recon = data?.network_recon || {};
  const tun = data?.vpn_tunnel || {};

  const confidenceScore = prov.confidence_score || 0;
  const confidenceLabel = prov.confidence_label || (vpnDetected ? 'HIGH CONFIDENCE' : 'DIRECT ROUTE');

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl">
      {/* Decorative ambient background glows */}
      <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 ${
        vpnDetected ? 'bg-emerald-500' : 'bg-cyan-500'
      }`}></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-15 bg-blue-600"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Main Verdict Header */}
        <div className="flex items-start gap-4 flex-1">
          <div className={`flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 border shadow-inner ${
            vpnDetected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/10'
          }`}>
            {vpnDetected ? (
              <ShieldCheck className="w-8 h-8" />
            ) : (
              <AlertTriangle className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono tracking-wider uppercase ${
                vpnDetected 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${vpnDetected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                {vpnDetected ? 'Encrypted Tunnel Active' : 'Unencrypted Direct Route'}
              </span>

              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                {prov.protocol || (vpnDetected ? 'WireGuard / Tun' : 'Standard TCP/IP')}
              </span>

              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-400 font-mono">
                Type: {prov.category || 'Commercial VPN'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{vpnDetected ? prov.name : 'Direct ISP Gateway'}</span>
              {vpnDetected && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-medium">
                  Verified
                </span>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {vpnDetected 
                ? `Traffic is fully encapsulated through ${prov.name}. Your physical IP (${orig.physical_lan_ip || 'Hidden'}) and network MAC address are shielded behind public exit node ${cur.active_ip || '--'}.` 
                : `Your connection routes directly through your local ISP gateway (${net.gateway || '--'}). Outgoing internet packets expose your real physical network identity.`
              }
            </p>

            {/* Signal Badges */}
            {prov.signals && prov.signals.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {prov.signals.map((sig, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/80"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{sig}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Key Performance Indicators & Confidence Gauge */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-6">
          
          {/* Confidence Gauge */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
              <span className="text-slate-400">Attribution Confidence</span>
              <span className={`font-bold ${vpnDetected ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {confidenceScore}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  vpnDetected 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
                style={{ width: `${confidenceScore}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">
              Confidence Rating: {confidenceLabel}
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <span className="text-slate-500 text-[10px] block">Privacy Score</span>
              <span className="text-emerald-400 font-bold text-sm">
                {vpnDetected ? '100 / 100' : '45 / 100'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <span className="text-slate-500 text-[10px] block">Tunnel MTU</span>
              <span className="text-cyan-400 font-bold text-sm">
                {tun.mtu ? `${tun.mtu} B` : (vpnDetected ? '1420 B' : '1500 B')}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
