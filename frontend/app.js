/**
 * DEAR OS / CYBERSHIELD [CODE : SWEET]
 * Aesthetic Pastel Y2K Operating System Controller
 * Client Orchestrator, Draggable Windows, Vector Radar Map, WebRTC Harvester, & Chimes.
 */

let collectedIceCandidates = [];
let latestAnalysisData = null;
let highestZIndex = 50;
let audioCtx = null;

document.addEventListener("DOMContentLoaded", () => {
  initLiveClockAndDates();
  initDraggableWindows();
  runDeepAnalysis();
});

/* ==========================================================================
   1. LIVE CLOCKS & CALENDAR DATE
   ========================================================================== */

function initLiveClockAndDates() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  function tick() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    const topClock = document.getElementById("topClock");
    const bottomClock = document.getElementById("bottomClock");
    if (topClock) topClock.textContent = timeStr;
    if (bottomClock) bottomClock.textContent = timeStr;

    // LCD Big Date
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];

    const lcdFullDate = document.getElementById("lcdFullDate");
    const lcdMonthName = document.getElementById("lcdMonthName");
    if (lcdFullDate) lcdFullDate.textContent = `${yyyy}.${mm}.${dd} ${dayName}`;
    if (lcdMonthName) lcdMonthName.textContent = `${monthName} ${yyyy}`;
  }

  tick();
  setInterval(tick, 1000);
}

/* ==========================================================================
   2. WINDOW DRAGGING & FOCUS ENGINE
   ========================================================================== */

function focusWindow(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  highestZIndex += 1;
  win.style.zIndex = highestZIndex;

  document.querySelectorAll(".win-window").forEach((w) => {
    if (w.id === winId) {
      w.classList.add("active");
    } else {
      w.classList.remove("active");
    }
  });
}

function minimizeWindow(winId) {
  const win = document.getElementById(winId);
  if (win) win.style.display = "none";
}

function maximizeWindow(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  if (win.dataset.maximized === "true") {
    // Restore
    win.style.top = win.dataset.prevTop || "115px";
    win.style.left = win.dataset.prevLeft || "100px";
    win.style.width = win.dataset.prevWidth || "590px";
    win.style.height = win.dataset.prevHeight || "auto";
    win.dataset.maximized = "false";
  } else {
    // Maximize
    win.dataset.prevTop = win.style.top;
    win.dataset.prevLeft = win.style.left;
    win.dataset.prevWidth = win.style.width;
    win.dataset.prevHeight = win.style.height;

    win.style.top = "4px";
    win.style.left = "80px";
    win.style.width = "calc(100vw - 90px)";
    win.style.height = "calc(100vh - 75px)";
    win.dataset.maximized = "true";
  }
  focusWindow(winId);
}

function closeWindow(winId) {
  const win = document.getElementById(winId);
  if (win) win.style.display = "none";
}

function initDraggableWindows() {
  document.querySelectorAll(".win-window").forEach((win) => {
    win.addEventListener("mousedown", () => focusWindow(win.id));

    const header = win.querySelector(".win-header");
    if (!header) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;

    header.addEventListener("mousedown", (e) => {
      if (e.target.tagName.toLowerCase() === "button") return;
      if (win.dataset.maximized === "true") return;

      isDragging = true;
      focusWindow(win.id);
      startX = e.clientX;
      startY = e.clientY;
      origLeft = win.offsetLeft;
      origTop = win.offsetTop;

      function onMouseMove(moveEvent) {
        if (!isDragging) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        win.style.left = `${Math.max(0, origLeft + dx)}px`;
        win.style.top = `${Math.max(0, origTop + dy)}px`;
      }

      function onMouseUp() {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  });
}

/* ==========================================================================
   3. MODAL CONTROLS (RADAR WORLD MAP & ADAPTERS)
   ========================================================================== */

function openRadarModal() {
  const modal = document.getElementById("radarModal");
  if (modal) modal.classList.add("open");
}

function closeRadarModal() {
  const modal = document.getElementById("radarModal");
  if (modal) modal.classList.remove("open");
}

function openAdaptersModal() {
  const modal = document.getElementById("adaptersModal");
  if (modal) {
    modal.classList.add("open");
    loadSystemAdaptersTable();
  }
}

function closeAdaptersModal() {
  const modal = document.getElementById("adaptersModal");
  if (modal) modal.classList.remove("open");
}

function showAboutDialog() {
  alert(
    "DEAR OS - [CODE : SWEET]\n" +
    "Aesthetic Pastel Y2K Network Forensics & VPN Explorer\n\n" +
    "• Real-time VPN Provider Fingerprinting\n" +
    "• 4-Tier IP Hierarchy Inspection (VPN, Physical, Gateway, Virtual)\n" +
    "• WebRTC STUN Leak Hunter\n" +
    "• Calibrated Equirectangular Satellite Radar Scope\n" +
    "• Router Hardware Reconnaissance & Machine Specs"
  );
}

/* ==========================================================================
   4. PASTEL CHIMES SYNTHESIS (WEB AUDIO API)
   ========================================================================== */

function playAudioChime(freq = 520) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.45);
  } catch (err) {
    console.debug("Audio play:", err);
  }
}

/* ==========================================================================
   5. CALIBRATED VECTOR RADAR MAP LOCATOR
   ========================================================================== */

function updateMapLocation(lat, lon, label, source) {
  if (lat == null || lon == null) return;

  // Calibrated Equirectangular (Plate Carrée 2:1) Mathematical Projection:
  const leftPercent = ((lon + 180.0) / 360.0) * 100.0;
  const topPercent = ((90.0 - lat) / 180.0) * 100.0;

  const precisionPin = document.getElementById("precisionPin");
  const targetPinLabel = document.getElementById("targetPinLabel");
  const hudCoords = document.getElementById("hudCoords");
  const hudSource = document.getElementById("hudSource");

  if (precisionPin) {
    precisionPin.style.left = `${leftPercent.toFixed(2)}%`;
    precisionPin.style.top = `${topPercent.toFixed(2)}%`;
    precisionPin.style.display = "flex";
  }

  if (targetPinLabel) targetPinLabel.textContent = label;
  if (hudCoords) {
    const latDir = lat >= 0 ? "N" : "S";
    const lonDir = lon >= 0 ? "E" : "W";
    hudCoords.textContent = `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
  }
  if (hudSource) hudSource.textContent = source || "public-apis catalog";

  // Also update Card 2 in main explorer
  const cardCoords = document.getElementById("cardCoords");
  if (cardCoords) {
    const latDir = lat >= 0 ? "N" : "S";
    const lonDir = lon >= 0 ? "E" : "W";
    cardCoords.textContent = `${Math.abs(lat).toFixed(2)}° ${latDir}, ${Math.abs(lon).toFixed(2)}° ${lonDir}`;
  }
}

/* ==========================================================================
   6. WEBRTC STUN LEAK HUNTER
   ========================================================================== */

function probeWebRTCLeak(currentPublicIp, exitTimezone) {
  collectedIceCandidates = [];
  const cardLeakStatus = document.getElementById("cardLeakStatus");
  if (cardLeakStatus) cardLeakStatus.textContent = "Probing...";

  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun.cloudflare.com:3478" }
    ]
  };

  let pc = null;
  try {
    pc = new RTCPeerConnection(rtcConfig);
  } catch (err) {
    if (cardLeakStatus) cardLeakStatus.textContent = "Blocked by Browser";
    return;
  }

  pc.createDataChannel("dearLeakChannel");

  pc.onicecandidate = (event) => {
    if (event.candidate && event.candidate.candidate) {
      collectedIceCandidates.push(event.candidate.candidate);
    } else {
      sendCandidatesForVerification(currentPublicIp, exitTimezone);
    }
  };

  pc.createOffer()
    .then((offer) => pc.setLocalDescription(offer))
    .catch((err) => console.debug("Offer err:", err));

  setTimeout(() => {
    if (collectedIceCandidates.length > 0) {
      sendCandidatesForVerification(currentPublicIp, exitTimezone);
    }
  }, 3500);
}

async function sendCandidatesForVerification(publicIp, exitTimezone) {
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  try {
    const res = await fetch("/api/webrtc-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidates: collectedIceCandidates,
        public_ip: publicIp,
        browser_timezone: browserTimezone
      })
    });
    if (res.ok) {
      const data = await res.json();
      const analysis = data.analysis || {};
      const cardLeakStatus = document.getElementById("cardLeakStatus");
      if (cardLeakStatus) {
        if (analysis.webrtc_leak_detected) {
          cardLeakStatus.style.color = "#cc3333";
          cardLeakStatus.textContent = "LEAK EXPOSED!";
        } else {
          cardLeakStatus.style.color = "var(--pastel-green)";
          cardLeakStatus.textContent = "0 Leaks Detected";
        }
      }
    }
  } catch (err) {
    console.debug("WebRTC check error:", err);
  }
}

/* ==========================================================================
   7. CORE DEEP TELEMETRY SCAN & CARD BINDING
   ========================================================================== */

async function runDeepAnalysis() {
  const statusCheck = document.getElementById("statusCheck");
  if (statusCheck) statusCheck.textContent = "SCANNING...";

  try {
    const res = await fetch("/api/analyze?t=" + Date.now());
    if (!res.ok) throw new Error("API HTTP status " + res.status);
    const data = await res.json();
    latestAnalysisData = data;

    renderDashboard(data);

    // Trigger WebRTC test
    probeWebRTCLeak(data.current_ip?.ipv4 || data.current_ip?.active_ip, data.current_ip?.timezone);

  } catch (err) {
    console.error("Deep scan error:", err);
    if (statusCheck) statusCheck.textContent = "ERROR: " + err.message;
  }
}

function renderDashboard(data) {
  const prov = data.provider || {};
  const cur = data.current_ip || {};
  const orig = data.original_system_ip || {};
  const net = data.network_ip || {};
  const tun = data.vpn_tunnel || {};
  const hw = data.system_hardware || {};
  const recon = data.network_recon || {};

  // 1. System Status Window (Top Left)
  const statusVpnCode = document.getElementById("statusVpnCode");
  const statusCheck = document.getElementById("statusCheck");
  const statusProtocol = document.getElementById("statusProtocol");

  if (data.vpn_detected) {
    if (statusVpnCode) statusVpnCode.textContent = `SWEET [${prov.name.toUpperCase()}]`;
    if (statusCheck) statusCheck.textContent = "CONNECTED (0 LEAKS)";
    if (statusProtocol) statusProtocol.textContent = `ON [${(prov.protocol || 'WIREGUARD').toUpperCase()}]`;
  } else {
    if (statusVpnCode) statusVpnCode.textContent = "DIRECT [ISP ROUTE]";
    if (statusCheck) statusCheck.textContent = "UNENCRYPTED";
    if (statusProtocol) statusProtocol.textContent = "STANDARD TCP/IP";
  }

  // 2. Card 00: Public IP
  setText("cardPublicIp", cur.ipv4 || cur.active_ip || "--");
  setText("cardPublicSub", `${cur.city || "--"}, ${cur.country || "--"} (${cur.as_full || (cur.as_number ? 'AS' + cur.as_number : '')})`);

  // 3. Card 01: Coordinates
  if (cur.latitude && cur.longitude) {
    updateMapLocation(cur.latitude, cur.longitude, `${prov.name} (${cur.city}, ${cur.country})`, cur.provider_source);
  }

  // 4. Card 02: Physical LAN IP
  setText("cardPhysicalIp", orig.physical_lan_ip || "--");
  setText("cardPhysicalSub", `${orig.adapter_name || "Physical NIC"} (Shielded)`);

  // 5. Card 03: Gateway Router
  setText("cardGatewayIp", net.gateway || "--");
  setText("cardGatewaySub", recon.gateway_vendor ? `${recon.gateway_vendor}` : "Default Gateway");

  // 6. Card 05: Host Specs
  setText("cardHostCpu", hw.processor ? hw.processor.split("@")[0].trim() : "Host CPU");
  setText("cardHostModel", `${hw.manufacturer || ''} ${hw.device_model || 'PC'} (${hw.total_ram_gb || '--'}GB)`);

  // Load adapters table
  loadSystemAdaptersTable();
}

/* ==========================================================================
   8. ADAPTERS TABLE LOADER
   ========================================================================== */

async function loadSystemAdaptersTable() {
  const tbody = document.getElementById("adaptersTableBody");
  const summaryEl = document.getElementById("adaptersSummaryText");
  if (!tbody) return;

  try {
    const res = await fetch("/api/adapters");
    if (!res.ok) return;
    const data = await res.json();

    const interfaces = data.all_interfaces || [];
    if (summaryEl) {
      summaryEl.textContent = `Found ${interfaces.length} interface(s): ${data.physical_adapters?.length || 0} Physical LAN, ${data.vpn_adapters?.length || 0} VPN Tunnel, ${data.virtual_adapters?.length || 0} Virtual VM`;
    }

    if (interfaces.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:10px;">No active interfaces found</td></tr>`;
      return;
    }

    tbody.innerHTML = interfaces.map((iface) => {
      let typeTag = '<span style="background:var(--pastel-green);color:#fff;padding:1px 5px;font-size:9px;font-weight:700;">Physical</span>';
      if (iface.is_vpn) {
        typeTag = '<span style="background:var(--titlebar-navy);color:#fff;padding:1px 5px;font-size:9px;font-weight:700;">VPN Tunnel</span>';
      } else if (iface.is_virtual_machine) {
        typeTag = '<span style="background:#888;color:#fff;padding:1px 5px;font-size:9px;">Virtual VM</span>';
      }

      return `
        <tr style="border-bottom: 1px solid #e8e3da;">
          <td style="padding: 3px 6px;"><b>${escapeHtml(iface.name)}</b></td>
          <td style="padding: 3px 6px;">${typeTag}</td>
          <td style="padding: 3px 6px;">${iface.ipv4 || "--"}</td>
          <td style="padding: 3px 6px;">${iface.cidr || iface.netmask || "--"}</td>
          <td style="padding: 3px 6px;">${iface.mac_address || "--"}</td>
          <td style="padding: 3px 6px;"><b>${iface.is_up ? 'UP' : 'DOWN'}</b></td>
        </tr>
      `;
    }).join("");

  } catch (e) {
    console.debug("Adapters table error:", e);
  }
}

/* ==========================================================================
   9. UTILITIES & CLIPBOARD SUMMARY
   ========================================================================== */

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || "--";
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function copySummaryToClipboard() {
  if (!latestAnalysisData) {
    alert("Please wait for telemetry scan to finish.");
    return;
  }

  const d = latestAnalysisData;
  const summary = `
=== DEAR OS [CODE : SWEET] - CYBERSHIELD VPN REPORT ===
[VPN Status]: ${d.vpn_detected ? "CONNECTED TO VPN" : "NO VPN DETECTED"}
[Identified VPN]: ${d.provider.name} (${d.provider.confidence_score}% Confidence)
[Protocol]: ${d.provider.protocol}

[CURRENT PUBLIC IP (VPN IP)]: ${d.current_ip.active_ip}
- Location: ${d.current_ip.city}, ${d.current_ip.region}, ${d.current_ip.country}
- ASN: ${d.current_ip.as_full || d.current_ip.as_number}
- ISP: ${d.current_ip.isp}

[ORIGINAL SYSTEM IP]: ${d.original_system_ip.physical_lan_ip}
- Physical Adapter: ${d.original_system_ip.adapter_name}
- MAC Address: ${d.original_system_ip.mac_address}

[LOCAL NETWORK & ROUTER]:
- Gateway IP: ${d.network_ip.gateway}
- Subnet Mask: ${d.network_ip.cidr}
- Router Hardware Vendor: ${d.network_recon?.gateway_vendor || "N/A"}

[VPN TUNNEL ADAPTER]:
- Virtual Adapter: ${d.vpn_tunnel.adapter_name || "None"}
- Tunnel IP: ${d.vpn_tunnel.tunnel_ipv4 || "None"}

[HOST HARDWARE SPECS]:
- Hostname: ${d.system_hardware?.hostname || "N/A"}
- Model: ${d.system_hardware?.manufacturer || ""} ${d.system_hardware?.device_model || "N/A"}
- CPU: ${d.system_hardware?.processor || "N/A"}
- RAM: ${d.system_hardware?.total_ram_gb} GB (${d.system_hardware?.used_ram_percent}% used)
- OS: ${d.system_hardware?.os_name} ${d.system_hardware?.os_release}
======================================================
`.trim();

  navigator.clipboard.writeText(summary).then(() => {
    alert("Diagnostic summary copied to clipboard with love! 💗");
  }).catch(() => {
    prompt("Copy summary manually:", summary);
  });
}
