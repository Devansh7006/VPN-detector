// popup.js — CyberShield Extension v2.0

const API_URL = "http://127.0.0.1:8000/api/analyze";
const WEB_APP_URL = "http://127.0.0.1:8000";
const FETCH_TIMEOUT_MS = 6000;

document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  if (analyzeBtn) analyzeBtn.addEventListener("click", analyzeConnection);

  const openWebBtn = document.getElementById("openWebBtn");
  if (openWebBtn) {
    openWebBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: WEB_APP_URL });
    });
  }

  // Auto run scan on popup open
  analyzeConnection();
});

async function analyzeConnection() {
  const analyzeBtn = document.getElementById("analyzeBtn");
  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
  }

  setBanner("Scanning Network...", "banner neutral");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store"
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    renderData(data);

  } catch (err) {
    console.warn("Analysis query error:", err);
    setBanner("Offline / Server Down", "banner neutral");
    showErrorState();
  } finally {
    if (analyzeBtn) {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = "Scan Network Now";
    }
    clearTimeout(timeout);
  }
}

function renderData(data) {
  const cur = data.current_ip || {};
  const orig = data.original_system_ip || {};
  const net = data.network_ip || {};
  const tun = data.vpn_tunnel || {};
  const prov = data.provider || {};

  // Banner & Provider box
  const providerBox = document.getElementById("providerBox");
  if (data.vpn_detected) {
    setBanner("VPN CONNECTED", "banner detected");
    if (providerBox) providerBox.style.display = "block";
    setText("providerName", prov.name || "Virtual Private Network");
    setText("providerProtocol", `${prov.protocol || "Encrypted Tunnel"} • ${prov.confidence_score || 100}% Confidence`);
  } else {
    setBanner("NO VPN (DIRECT ISP)", "banner safe");
    if (providerBox) providerBox.style.display = "none";
  }

  // Populate Fields
  setText("currentIp", cur.ipv4 || cur.active_ip || "-");
  setText("currentIpv6", cur.ipv6 || "None");
  setText("location", `${cur.city || "-"}, ${cur.country || "-"}`);
  setText("isp", `${cur.isp || "-"} (${cur.organization || "-"})`);

  setText("origIp", orig.physical_lan_ip || "-");
  setText("origNic", `${orig.adapter_name || "-"} (${orig.description || "-"})`);
  setText("gateway", net.gateway || "-");
  setText("tunnelIp", tun.tunnel_ipv4 || (tun.active ? "Encapsulated" : "Inactive"));

  const hw = data.system_hardware || {};
  const recon = data.network_recon || {};
  setText("popupHost", `${hw.hostname || "-"} (${hw.device_model || hw.os_name || "-"})`);
  setText("popupRouter", `${recon.gateway_vendor || "Router"} [${recon.gateway_mac || "-"}]`);
}

function showErrorState() {
  setText("currentIp", "Start api.py first");
  setText("currentIpv6", "-");
  setText("location", "-");
  setText("isp", "-");
  setText("origIp", "-");
  setText("origNic", "-");
  setText("gateway", "-");
  setText("tunnelIp", "-");
  const providerBox = document.getElementById("providerBox");
  if (providerBox) providerBox.style.display = "none";
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || "-";
}

function setBanner(text, className) {
  const banner = document.getElementById("banner");
  if (banner) {
    banner.textContent = text;
    banner.className = className;
  }
}
