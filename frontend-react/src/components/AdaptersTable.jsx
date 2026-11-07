import React, { useState } from 'react';
import { 
  Network, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Filter,
  Shield,
  Layers,
  Laptop
} from 'lucide-react';

export default function AdaptersTable({ 
  adaptersData, 
  isLoading, 
  onRefresh 
}) {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const interfaces = adaptersData?.all_interfaces || [];
  const physicalCount = adaptersData?.physical_adapters?.length || 0;
  const vpnCount = adaptersData?.vpn_adapters?.length || 0;
  const vmCount = adaptersData?.virtual_adapters?.length || 0;

  const filteredInterfaces = interfaces.filter((iface) => {
    // Type filter
    if (filterType === 'physical' && !iface.is_physical) return false;
    if (filterType === 'vpn' && !iface.is_vpn) return false;
    if (filterType === 'virtual' && !iface.is_virtual_machine) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (iface.name || '').toLowerCase().includes(q);
      const matchDesc = (iface.description || '').toLowerCase().includes(q);
      const matchIp = (iface.ipv4 || '').toLowerCase().includes(q);
      const matchMac = (iface.mac_address || '').toLowerCase().includes(q);
      return matchName || matchDesc || matchIp || matchMac;
    }

    return true;
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800 p-5 shadow-lg backdrop-blur-md">
      
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>System Network Interfaces Explorer</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
                {interfaces.length} Interfaces Enumerated
              </span>
            </h2>
            <p className="text-xs text-slate-400">Granular Hardware Controller &amp; Virtual TAP Drivers Analysis</p>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search NIC, IP, MAC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-44"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterType === 'all' 
                  ? 'bg-slate-800 text-white font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({interfaces.length})
            </button>
            <button
              onClick={() => setFilterType('physical')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterType === 'physical' 
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Physical ({physicalCount})
            </button>
            <button
              onClick={() => setFilterType('vpn')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterType === 'vpn' 
                  ? 'bg-blue-500/20 text-blue-300 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VPN ({vpnCount})
            </button>
            <button
              onClick={() => setFilterType('virtual')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterType === 'virtual' 
                  ? 'bg-indigo-500/20 text-indigo-300 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VMs ({vmCount})
            </button>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            title="Refresh Interfaces Table"
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-800/80 overflow-hidden bg-slate-950/60">
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 sticky top-0 z-10 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Interface Name</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Description</th>
                <th className="py-2.5 px-3 font-semibold">IPv4 Address</th>
                <th className="py-2.5 px-3 font-semibold">Gateway</th>
                <th className="py-2.5 px-3 font-semibold">MAC Address</th>
                <th className="py-2.5 px-3 font-semibold">MTU</th>
                <th className="py-2.5 px-3 font-semibold text-right">Link Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredInterfaces.length > 0 ? (
                filteredInterfaces.map((iface, idx) => {
                  let badge = (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Standard
                    </span>
                  );
                  if (iface.is_physical) {
                    badge = (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <Laptop className="w-3 h-3" />
                        Physical LAN
                      </span>
                    );
                  } else if (iface.is_vpn) {
                    badge = (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        <Shield className="w-3 h-3" />
                        VPN Tunnel
                      </span>
                    );
                  } else if (iface.is_virtual_machine) {
                    badge = (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                        <Layers className="w-3 h-3" />
                        Virtual / VM
                      </span>
                    );
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                        {iface.name}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {badge}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-[200px] truncate" title={iface.description}>
                        {iface.description || '--'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300 whitespace-nowrap">
                        {iface.ipv4 || '--'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {iface.gateway || '--'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {iface.mac_address || '--'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {iface.mtu ? `${iface.mtu} B` : '--'}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          iface.is_up 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {iface.is_up ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {iface.is_up ? 'UP' : 'DOWN'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    {searchQuery ? `No interfaces match query "${searchQuery}"` : 'No network interfaces found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
