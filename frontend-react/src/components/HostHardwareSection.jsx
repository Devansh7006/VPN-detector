import React from 'react';
import { 
  Cpu, 
  HardDrive, 
  Activity, 
  Clock, 
  Terminal, 
  Laptop, 
  Router, 
  Share2,
  Server
} from 'lucide-react';

export default function HostHardwareSection({ data }) {
  const hw = data?.system_hardware || {};
  const recon = data?.network_recon || {};
  const net = data?.network_ip || {};
  const socks = recon?.sockets || {};

  const ramPercent = hw.used_ram_percent || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      
      {/* Box 1: Machine Architecture & OS Kernel */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Host Machine &amp; CPU Architecture</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                Local Hardware
              </span>
            </h2>
            <p className="text-xs text-slate-400">Deep System Information Extracted via Host Inspection API</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs font-mono">
          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Computer Hostname:</span>
            <span className="text-white font-bold">{hw.hostname || '--'}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Device Manufacturer:</span>
            <span className="text-slate-200">{hw.manufacturer || '--'}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Device Model:</span>
            <span className="text-indigo-400 font-bold">{hw.device_model || '--'}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Processor (CPU):</span>
            <span className="text-slate-200 text-right truncate max-w-[280px]" title={hw.processor}>
              {hw.processor || '--'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Core Topography:</span>
            <span className="text-slate-200">
              {hw.cpu_cores || '--'} Cores / {hw.cpu_threads || '--'} Threads ({hw.cpu_usage_percent || 0}% Load)
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Operating System:</span>
            <span className="text-slate-200">{hw.os_name || '--'} {hw.os_release || ''} ({hw.architecture || ''})</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
            <span className="text-slate-500">OS Kernel / Build:</span>
            <span className="text-slate-400">{hw.os_build || '--'}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">System Uptime:</span>
            <span className="text-emerald-400 font-bold">{hw.uptime || '--'} ({hw.uptime_hours || '--'} hrs)</span>
          </div>
        </div>

        {/* RAM Usage Bar */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-xs">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-slate-400">Physical RAM Allocation:</span>
            <span className="text-indigo-400 font-bold">
              {hw.total_ram_gb ? `${hw.total_ram_gb} GB Total (${ramPercent}% used)` : '--'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-700"
              style={{ width: `${ramPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Box 2: Router Gateway Reconnaissance & Sockets Telemetry */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Router className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Router Gateway Reconnaissance</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  ARP &amp; Sockets
                </span>
              </h2>
              <p className="text-xs text-slate-400">Layer-2 / Layer-3 Topology &amp; Active Network Sockets</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Router Gateway IP:</span>
              <span className="text-cyan-400 font-bold">{net.gateway || '--'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Router Hardware MAC:</span>
              <span className="text-slate-200 font-bold">{recon.gateway_mac || '--'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Router Hardware Vendor:</span>
              <span className="text-emerald-400 font-bold truncate max-w-[280px]" title={recon.gateway_vendor}>
                {recon.gateway_vendor || 'Resolved OUI'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Subnet Mask &amp; Range:</span>
              <span className="text-slate-200">{net.cidr || net.subnet_mask || '--'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-500">Active Subnet Neighbors:</span>
              <span className="text-cyan-400 font-bold">
                {recon.active_lan_devices_count || 1} Device(s) on ARP Table
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Default Route Adapter:</span>
              <span className="text-slate-300 truncate max-w-[260px]">
                {data?.diagnostics?.default_route_adapter || 'Physical Ethernet/Wi-Fi'}
              </span>
            </div>
          </div>
        </div>

        {/* Sockets Telemetry Badges */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 font-mono text-xs">
          <span className="text-slate-500 text-[10px] block mb-2">Active Transport Layer Sockets:</span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">TCP Established</span>
              <span className="text-cyan-400 font-bold text-sm">{socks.established_tcp || 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">TCP Listening</span>
              <span className="text-indigo-400 font-bold text-sm">{socks.listening_tcp_ports || 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">UDP Sockets</span>
              <span className="text-emerald-400 font-bold text-sm">{socks.udp_sockets || 0}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
