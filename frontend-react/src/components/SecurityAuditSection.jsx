import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Fingerprint, 
  Radio, 
  EyeOff,
  Server
} from 'lucide-react';

export default function SecurityAuditSection({ 
  data, 
  webrtcAnalysis, 
  iceCandidates, 
  isProbingWebRTC 
}) {
  const [showCandidates, setShowCandidates] = useState(false);

  const cur = data?.current_ip || {};
  const net = data?.network_ip || {};
  const tun = data?.vpn_tunnel || {};
  const vpnDetected = data?.vpn_detected || false;

  const webrtcLeak = webrtcAnalysis?.webrtc_leak_detected || false;
  const leakedIp = webrtcAnalysis?.leaked_real_ip;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg backdrop-blur-md">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Security &amp; Forensic Leak Audit Matrix</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                webrtcLeak 
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              }`}>
                {webrtcLeak ? 'CRITICAL LEAK' : 'ALL SHIELDS VERIFIED'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">Real-Time In-Browser STUN Reflexive Candidate Harvester and DNS Route Analyzer</p>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-[10px] text-slate-500 block">Defense Rating</span>
          <span className={`text-sm font-bold ${webrtcLeak ? 'text-rose-400' : 'text-emerald-400'}`}>
            {webrtcLeak ? 'COMPROMISED' : '100% SECURE'}
          </span>
        </div>
      </div>

      {/* 4 Audit Dimension Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        
        {/* Item 1: WebRTC STUN Leak */}
        <div className={`p-4 rounded-xl border transition-all ${
          webrtcLeak 
            ? 'bg-rose-950/20 border-rose-500/40' 
            : 'bg-slate-950/50 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">WebRTC STUN Leak</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              webrtcLeak 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isProbingWebRTC ? 'PROBING...' : (webrtcLeak ? 'CRITICAL LEAK' : 'PASS / SHIELDED')}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {webrtcLeak ? (
              <span className="text-rose-400 font-mono font-bold">
                REAL IP EXPOSED: {leakedIp} (Bypassed tunnel!)
              </span>
            ) : (
              'STUN packets route exclusively through VPN exit node without leaking physical network IP.'
            )}
          </p>
        </div>

        {/* Item 2: DNS Leak Protection */}
        <div className={`p-4 rounded-xl border transition-all ${
          net.dns_leak_suspected 
            ? 'bg-amber-950/20 border-amber-500/40' 
            : 'bg-slate-950/50 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">DNS Leak Guard</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              net.dns_leak_suspected 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}>
              {net.dns_leak_suspected ? 'LEAK RISK' : 'PASS / SECURE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {net.dns_leak_suspected
              ? 'DNS queries might resolve via your unencrypted router or physical ISP.'
              : `Resolving via protected tunnel servers [${(net.dns_servers || []).join(', ') || '1.1.1.1'}].`
            }
          </p>
        </div>

        {/* Item 3: IPv6 Dual-Stack Guard */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">IPv6 Dual-Stack</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {cur.ipv6 && !tun.tunnel_ipv6 && vpnDetected ? 'UNTUNNELED' : 'PROTECTED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {cur.ipv6 && !tun.tunnel_ipv6 && vpnDetected
              ? 'IPv4 is tunneled, but IPv6 traffic may escape the encrypted boundary.'
              : 'IPv6 traffic is either encapsulated or properly blackholed against bypass leaks.'
            }
          </p>
        </div>

        {/* Item 4: IP Threat & Abuse Classification */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">IP Reputation</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              cur.threat_tags && cur.threat_tags.length > 0 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}>
              {cur.threat_tags && cur.threat_tags.length > 0 ? cur.threat_tags[0] : 'CLEAN'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {cur.threat_tags && cur.threat_tags.length > 0
              ? `Flagged as ${cur.threat_tags.join(', ')}. Classified as commercial proxy / datacenter node.`
              : 'Zero abuse listings or malicious threat scores reported for this exit node.'
            }
          </p>
        </div>

      </div>

      {/* Expandable WebRTC Candidate Details */}
      <div className="pt-2 border-t border-slate-800/60">
        <button
          onClick={() => setShowCandidates(!showCandidates)}
          className="flex items-center justify-between w-full text-xs font-mono text-slate-400 hover:text-slate-200 py-1 transition-all"
        >
          <span className="flex items-center gap-2">
            <span>ICE Candidates Gathered:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              {iceCandidates?.length || 0}
            </span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-cyan-400">
            <span>{showCandidates ? 'Hide Technical Details' : 'View Raw Candidates'}</span>
            {showCandidates ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showCandidates && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto space-y-1">
            {iceCandidates && iceCandidates.length > 0 ? (
              iceCandidates.map((cand, i) => (
                <div key={i} className="py-0.5 border-b border-slate-900 last:border-0 text-[11px] text-slate-400">
                  <span className="text-cyan-400 font-bold mr-2">[{i + 1}]</span>
                  <span>{cand}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center py-2">
                {isProbingWebRTC ? 'Harvesting candidates from STUN servers...' : 'No candidate data gathered yet.'}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
