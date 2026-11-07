import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroCard from './components/HeroCard';
import IpBentoGrid from './components/IpBentoGrid';
import WorldMapSection from './components/WorldMapSection';
import SecurityAuditSection from './components/SecurityAuditSection';
import HostHardwareSection from './components/HostHardwareSection';
import AdaptersTable from './components/AdaptersTable';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(null);
  const [adaptersData, setAdaptersData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // WebRTC State
  const [iceCandidates, setIceCandidates] = useState([]);
  const [isProbingWebRTC, setIsProbingWebRTC] = useState(false);
  const [webrtcAnalysis, setWebrtcAnalysis] = useState(null);

  const autoScanTimerRef = useRef(null);

  // Initial Load
  useEffect(() => {
    runFullScan();
    loadAdapters();
  }, []);

  // Auto-Scan interval management
  useEffect(() => {
    if (autoScan) {
      autoScanTimerRef.current = setInterval(() => {
        runFullScan(true);
      }, 15000);
    } else {
      if (autoScanTimerRef.current) clearInterval(autoScanTimerRef.current);
    }
    return () => {
      if (autoScanTimerRef.current) clearInterval(autoScanTimerRef.current);
    };
  }, [autoScan]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Core API Scan
  const runFullScan = async (isAuto = false) => {
    if (!isAuto) setIsScanning(true);
    try {
      const res = await fetch('/api/analyze?t=' + Date.now());
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      const result = await res.json();
      setData(result);
      
      const now = new Date();
      setLastScanTime(now.toLocaleTimeString());

      // Trigger WebRTC probe
      const currentIp = result.current_ip?.ipv4 || result.current_ip?.active_ip;
      const timezone = result.current_ip?.timezone;
      probeWebRTC(currentIp, timezone);

      if (!isAuto) showToast('Network forensic scan completed successfully.');
    } catch (err) {
      console.error('Scan error:', err);
      showToast('Scan error: ' + err.message);
    } finally {
      if (!isAuto) setIsScanning(false);
    }
  };

  // 2. Adapters API Load
  const loadAdapters = async () => {
    try {
      const res = await fetch('/api/adapters');
      if (res.ok) {
        const result = await res.json();
        setAdaptersData(result);
      }
    } catch (e) {
      console.debug('Adapters fetch error:', e);
    }
  };

  // 3. Live WebRTC STUN Leak Hunter
  const probeWebRTC = (publicIp, exitTimezone) => {
    setIsProbingWebRTC(true);
    const gathered = [];

    const rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' }
      ]
    };

    let pc = null;
    try {
      pc = new RTCPeerConnection(rtcConfig);
    } catch (err) {
      console.warn('WebRTC not supported:', err);
      setIsProbingWebRTC(false);
      return;
    }

    pc.createDataChannel('vpnDetectorLeakHunter');

    pc.onicecandidate = (event) => {
      if (event.candidate && event.candidate.candidate) {
        gathered.push(event.candidate.candidate);
        setIceCandidates([...gathered]);
      } else {
        // Complete
        sendWebRtcVerification(gathered, publicIp, exitTimezone);
      }
    };

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch((err) => console.debug('WebRTC offer error:', err));

    setTimeout(() => {
      if (gathered.length > 0) {
        sendWebRtcVerification(gathered, publicIp, exitTimezone);
      } else {
        setIsProbingWebRTC(false);
      }
    }, 3500);
  };

  const sendWebRtcVerification = async (candidates, publicIp, exitTimezone) => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    try {
      const res = await fetch('/api/webrtc-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidates,
          public_ip: publicIp,
          browser_timezone: browserTimezone
        })
      });
      if (res.ok) {
        const resp = await res.json();
        setWebrtcAnalysis(resp.analysis);
      }
    } catch (err) {
      console.debug('Verification error:', err);
    } finally {
      setIsProbingWebRTC(false);
    }
  };

  // 4. Copy Summary
  const copyDiagnosticSummary = () => {
    if (!data) return;
    const d = data;
    const summary = `
=== VPN DETECTOR — ENTERPRISE NETWORK & FORENSIC INTELLIGENCE REPORT ===
Generated: ${new Date().toISOString()}
VPN Status: ${d.vpn_detected ? 'CONNECTED TO VPN' : 'DIRECT ISP ROUTE'}
Identified Provider: ${d.provider?.name || 'N/A'} (${d.provider?.confidence_score || 0}% Confidence)
Protocol: ${d.provider?.protocol || 'Standard TCP/IP'}

[01. CURRENT PUBLIC IP (VPN EXIT)]:
- IP Address: ${d.current_ip?.active_ip}
- Geolocation: ${d.current_ip?.city}, ${d.current_ip?.region}, ${d.current_ip?.country}
- ASN: ${d.current_ip?.as_full || d.current_ip?.as_number}
- ISP / Org: ${d.current_ip?.isp} / ${d.current_ip?.organization}
- Threat Classification: ${(d.current_ip?.threat_tags || []).join(', ') || 'Clean'}

[02. ORIGINAL PHYSICAL SYSTEM IP]:
- Physical LAN IP: ${d.original_system_ip?.physical_lan_ip}
- Hardware NIC: ${d.original_system_ip?.adapter_name} (${d.original_system_ip?.description})
- Physical MAC: ${d.original_system_ip?.mac_address}
- Link Speed: ${d.original_system_ip?.link_speed}

[03. LOCAL GATEWAY & ROUTER]:
- Gateway IP: ${d.network_ip?.gateway}
- Subnet / CIDR: ${d.network_ip?.cidr}
- Router MAC: ${d.network_recon?.gateway_mac || 'N/A'}
- Router Vendor: ${d.network_recon?.gateway_vendor || 'N/A'}
- DNS Resolvers: ${(d.network_ip?.dns_servers || []).join(', ')}

[04. VPN VIRTUAL TUNNEL ADAPTER]:
- Virtual Interface: ${d.vpn_tunnel?.adapter_name || 'None'}
- Tunnel IP: ${d.vpn_tunnel?.tunnel_ipv4 || 'None'}
- MTU Overhead: ${d.vpn_tunnel?.mtu || 'None'}

[05. HOST SYSTEM HARDWARE IDENTITY]:
- Hostname: ${d.system_hardware?.hostname}
- Machine: ${d.system_hardware?.manufacturer} ${d.system_hardware?.device_model}
- CPU: ${d.system_hardware?.processor}
- RAM: ${d.system_hardware?.total_ram_gb} GB (${d.system_hardware?.used_ram_percent}% used)
- OS: ${d.system_hardware?.os_name} ${d.system_hardware?.os_release} (${d.system_hardware?.os_build})
- Uptime: ${d.system_hardware?.uptime}
============================================================
`.trim();

    navigator.clipboard.writeText(summary);
    showToast('Forensic diagnostic summary copied to clipboard.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        vpnDetected={data?.vpn_detected}
        providerName={data?.provider?.name}
        confidenceScore={data?.provider?.confidence_score}
        isScanning={isScanning}
        onScan={() => runFullScan(false)}
        autoScan={autoScan}
        onToggleAutoScan={() => setAutoScan(!autoScan)}
        onCopySummary={copyDiagnosticSummary}
        onExport={() => window.open('/api/export', '_blank')}
        lastScanTime={lastScanTime}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 1. Hero Verdict & Confidence Card */}
        <HeroCard data={data} />

        {/* 2. 4-Tier IP Bento Grid (Public, Physical, Gateway, Tunnel) */}
        <IpBentoGrid data={data} onShowToast={showToast} />

        {/* 3. Tactical Vector World Map */}
        <WorldMapSection data={data} />

        {/* 4. Security & WebRTC STUN Leak Hunter Matrix */}
        <SecurityAuditSection 
          data={data}
          webrtcAnalysis={webrtcAnalysis}
          iceCandidates={iceCandidates}
          isProbingWebRTC={isProbingWebRTC}
        />

        {/* 5. Host Machine Specs & Router Recon */}
        <HostHardwareSection data={data} />

        {/* 6. Network Interfaces Explorer Table */}
        <AdaptersTable
          adaptersData={adaptersData}
          isLoading={isScanning}
          onRefresh={loadAdapters}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>VPN Detector • Advanced Network Security &amp; Forensic Intelligence</span>
          </div>
          <div>
            Built with React 19, Tailwind CSS v4, Lucide Icons &amp; FastAPI Backend
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/50 text-white text-xs font-mono shadow-2xl shadow-cyan-500/10 animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
