import React, { useState } from 'react';
import { 
  Globe, 
  Laptop, 
  Router, 
  Network, 
  Copy, 
  Check, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  ExternalLink,
  MapPin,
  Server
} from 'lucide-react';

export default function IpBentoGrid({ data, onShowToast }) {
  const [copiedId, setCopiedId] = useState(null);

  const cur = data?.current_ip || {};
  const orig = data?.original_system_ip || {};
  const net = data?.network_ip || {};
  const tun = data?.vpn_tunnel || {};
  const prov = data?.provider || {};
  const recon = data?.network_recon || {};
  const vpnDetected = data?.vpn_detected || false;

  const copyToClipboard = (text, id, label) => {
    if (!text || text === '--') return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onShowToast) onShowToast(`Copied ${label || 'IP'} to clipboard: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* ==================================================================
          CARD 1: CURRENT PUBLIC IP (VPN IP)
          ================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition-all group">
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Category 01</span>
                <h3 className="text-sm font-bold text-white tracking-tight">Public (VPN) IP</h3>
              </div>
            </div>
            
            <button
              onClick={() => copyToClipboard(cur.ipv4 || cur.active_ip, 'public', 'Public IP')}
              title="Copy IP Address"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              {copiedId === 'public' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Primary IP Display */}
          <div className="mb-4">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-cyan-300 tracking-tight flex items-center gap-2">
              <span>{cur.ipv4 || cur.active_ip || '--'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{cur.city || '--'}, {cur.region || ''} {cur.country || '--'}</span>
            </div>
          </div>

          {/* Telemetry Breakdown */}
          <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 font-mono">ASN:</span>
              <span className="text-slate-300 font-mono text-right font-medium truncate max-w-[170px]" title={cur.as_full || cur.as_number}>
                {cur.as_full || (cur.as_number ? `AS${cur.as_number} ${cur.as_name || ''}` : '--')}
              </span>
            </div>

            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 font-mono">ISP:</span>
              <span className="text-slate-300 font-mono text-right truncate max-w-[170px]" title={cur.isp}>
                {cur.isp || '--'}
              </span>
            </div>

            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 font-mono">PTR (rDNS):</span>
              <span className="text-slate-400 font-mono text-right truncate max-w-[170px] text-[11px]" title={cur.reverse_dns}>
                {cur.reverse_dns || 'No PTR record'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Badge */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">Threat Classification</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
            cur.threat_tags && cur.threat_tags.length > 0 
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {cur.threat_tags && cur.threat_tags.length > 0 ? cur.threat_tags.join(', ') : 'Residential / Clean'}
          </span>
        </div>
      </div>

      {/* ==================================================================
          CARD 2: ORIGINAL SYSTEM IP (PHYSICAL LAN ADAPTER)
          ================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition-all group">
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Category 02</span>
                <h3 className="text-sm font-bold text-white tracking-tight">Original Physical IP</h3>
              </div>
            </div>
            
            <button
              onClick={() => copyToClipboard(orig.physical_lan_ip, 'physical', 'Physical LAN IP')}
              title="Copy Physical IP"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              {copiedId === 'physical' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Primary IP Display */}
          <div className="mb-4">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400 tracking-tight flex items-center gap-2">
              <span>{orig.physical_lan_ip || '--'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <span className="truncate">{orig.adapter_name || 'Physical Controller'}</span>
            </div>
          </div>

          {/* Telemetry Breakdown */}
          <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 font-mono">Hardware MAC:</span>
              <span className="text-slate-300 font-mono text-right font-medium">
                {orig.mac_address || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 font-mono">Controller:</span>
              <span className="text-slate-400 font-mono text-right truncate max-w-[170px] text-[11px]" title={orig.description}>
                {orig.description || '--'}
              </span>
            </div>

            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 font-mono">Link Speed / MTU:</span>
              <span className="text-slate-300 font-mono text-right">
                {orig.link_speed || '--'} / {orig.mtu ? `${orig.mtu} B` : '1500 B'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Badge */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">Shielding Status</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
            vpnDetected 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {vpnDetected ? 'Shielded Behind VPN' : 'Exposed Directly'}
          </span>
        </div>
      </div>

      {/* ==================================================================
          CARD 3: LOCAL GATEWAY ROUTER & SUBNET
          ================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition-all group">
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Router className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Category 03</span>
                <h3 className="text-sm font-bold text-white tracking-tight">Gateway &amp; Topology</h3>
              </div>
            </div>
            
            <button
              onClick={() => copyToClipboard(net.gateway, 'gateway', 'Gateway Router IP')}
              title="Copy Gateway IP"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              {copiedId === 'gateway' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Primary IP Display */}
          <div className="mb-4">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-indigo-300 tracking-tight flex items-center gap-2">
              <span>{net.gateway || '--'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <span>Subnet: {net.cidr || net.subnet_mask || '--'}</span>
            </div>
          </div>

          {/* Telemetry Breakdown */}
          <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 font-mono">Router MAC:</span>
              <span className="text-slate-300 font-mono text-right font-medium">
                {recon.gateway_mac || '--'}
              </span>
            </div>

            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 font-mono">Router Vendor:</span>
              <span className="text-indigo-400 font-mono text-right truncate max-w-[170px]" title={recon.gateway_vendor}>
                {recon.gateway_vendor || 'Resolved OUI'}
              </span>
            </div>

            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 font-mono">DNS Resolvers:</span>
              <span className="text-slate-300 font-mono text-right truncate max-w-[170px]" title={(net.dns_servers || []).join(', ')}>
                {(net.dns_servers && net.dns_servers.length > 0) ? net.dns_servers.join(', ') : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Badge */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">Active LAN Recon</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {recon.active_lan_devices_count || 1} Subnet Device(s)
          </span>
        </div>
      </div>

      {/* ==================================================================
          CARD 4: VPN VIRTUAL TUNNEL ADAPTER
          ================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition-all group">
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Category 04</span>
                <h3 className="text-sm font-bold text-white tracking-tight">VPN Tunnel Adapter</h3>
              </div>
            </div>
            
            <button
              onClick={() => copyToClipboard(tun.tunnel_ipv4, 'tunnel', 'Tunnel IPv4')}
              title="Copy Tunnel IP"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              {copiedId === 'tunnel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Primary IP Display */}
          <div className="mb-4">
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-blue-400 tracking-tight flex items-center gap-2">
              <span>{tun.tunnel_ipv4 || (tun.active ? 'Encapsulated' : 'None Active')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <span>Interface: {tun.adapter_name || (vpnDetected ? prov.name : 'None')}</span>
            </div>
          </div>

          {/* Telemetry Breakdown */}
          <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 font-mono">Driver/TAP:</span>
              <span className="text-slate-300 font-mono text-right truncate max-w-[170px]" title={tun.description}>
                {tun.description || (tun.active ? 'Virtual Driver' : 'None')}
              </span>
            </div>

            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 font-mono">Tunnel MTU:</span>
              <span className="text-slate-300 font-mono text-right">
                {tun.mtu ? `${tun.mtu} bytes` : (vpnDetected ? '1420 bytes' : '--')}
              </span>
            </div>

            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-500 font-mono">Tunnel Route:</span>
              <span className="text-blue-400 font-mono text-right">
                {tun.active || vpnDetected ? 'Default Route Handled' : 'Physical Route Only'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Badge */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500">Encapsulation</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
            tun.active || vpnDetected
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            {tun.active || vpnDetected ? 'Virtual TAP Engaged' : 'No TAP Active'}
          </span>
        </div>
      </div>

    </div>
  );
}
