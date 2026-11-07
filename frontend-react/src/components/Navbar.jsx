import React, { useState } from 'react';
import { 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  Activity,
  Layers
} from 'lucide-react';
import VpnDetectorLogo from './VpnDetectorLogo';

export default function Navbar({ 
  vpnDetected, 
  providerName, 
  confidenceScore, 
  isScanning, 
  onScan, 
  autoScan, 
  onToggleAutoScan, 
  onCopySummary, 
  onExport, 
  lastScanTime 
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopySummary();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Professional Logo */}
          <div className="flex items-center gap-3">
            <VpnDetectorLogo vpnActive={vpnDetected} className="w-10 h-10" />
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white font-mono">
                  VPN <span className="text-cyan-400">DETECTOR</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700/80 text-cyan-300 font-mono">
                  PRO v2.5
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Advanced VPN Attribution &amp; Network Forensics
              </p>
            </div>
          </div>

          {/* Center Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs shadow-inner">
            <span className={`inline-block w-2 h-2 rounded-full ${vpnDetected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-slate-400 font-mono">Status:</span>
            <span className={`font-semibold font-mono ${vpnDetected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {vpnDetected ? `${providerName || 'VPN Active'} (${confidenceScore || 100}%)` : 'Direct ISP Route'}
            </span>
            {lastScanTime && (
              <span className="text-slate-500 text-[11px] border-l border-slate-800 pl-2 ml-1">
                {lastScanTime}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Auto-Refresh Toggle */}
            <button
              onClick={onToggleAutoScan}
              title={autoScan ? "Disable Auto-Refresh" : "Enable Auto-Refresh (15s)"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                autoScan 
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${autoScan ? 'text-cyan-400 animate-spin-slow' : ''}`} />
              <span className="hidden sm:inline">Auto (15s)</span>
            </button>

            {/* Copy Diagnostics Summary */}
            <button
              onClick={handleCopy}
              title="Copy Forensic Summary to Clipboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            {/* Export JSON Report */}
            <button
              onClick={onExport}
              title="Download Full JSON Forensic Audit Report"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Run Deep Scan Button */}
            <button
              onClick={onScan}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
