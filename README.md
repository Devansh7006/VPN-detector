# 🛡️ VPN Detector — Enterprise Network & VPN Forensics Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208-646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

A modern, full-stack cybersecurity operations platform designed to detect **not only IF a VPN connection is active**, but **precisely WHICH provider, technology, or tunnel protocol is being used**.

Combines deep local operating system network telemetry (virtual adapters, MTU clamping, DNS overrides, Layer-2 ARP) with public Autonomous System (BGP ASN, rDNS, GeoIP) intelligence, in-browser WebRTC STUN leak hunting, and a calibrated tactical vector world map featuring official sovereign boundaries.

---

## 📸 Dashboard Preview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [🛡️] VPN DETECTOR PRO v2.5     [● STATUS: Cloudflare WARP (100%)]   [SCAN] [EXPORT]   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  VERDICT HERO: ENCRYPTED TUNNEL ACTIVE (WireGuard / MASQUE) - 100% Confidence          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [PUBLIC EXIT IP]         [ORIGINAL SYSTEM IP]      [ROUTER GATEWAY]    [TUNNEL NIC]   │
│   104.xx.xx.xx (Exit Node)  192.xx.xx.xx (LAN NIC)    192.xx.xx.1 (ARP)   CloudflareWARP │
│   AS13335 (Cloudflare)      Wi-Fi 6 Wireless Adapter  Router Gateway OUI  1280 B MTU   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  TACTICAL RADAR SCOPE (1000x500 Equirectangular Vector Projection)                    │
│  Targeting Reticle: XX.XXXX° N, XX.XXXX° E   [Regional Lock 4x Zoom] [Sweep Radar: ON] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  WEBRTC STUN LEAK AUDIT      │  HOST SYSTEM TELEMETRY  │  ROUTER RECON & SOCKETS       │
│  All Shields Verified (Pass) │  AMD Ryzen / Intel CPU  │  Router MAC: Resolved OUI     │
│  Reflexive ICE: Clean        │  RAM: 16 GB (64% Used)  │  TCP Established: 42 Sockets  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  NETWORK ADAPTERS EXPLORER (All / Physical / Virtual / Active Interfaces)              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Capabilities

### 1. 🔍 Advanced VPN Attribution & Technology Fingerprinting
- **Detects whether a VPN is active** using multiple corroborating host and transport signals.
- **Identifies 26+ specific VPN providers and network architectures**:
  - **Commercial VPNs:** Cloudflare WARP (1.1.1.1), NordVPN (NordLynx), ExpressVPN (Lightway), Surfshark, Proton VPN, Mullvad, CyberGhost, Private Internet Access (PIA), Windscribe.
  - **P2P & Mesh Overlays:** Tailscale, ZeroTier.
  - **Corporate VPNs:** Cisco AnyConnect / Secure Client, Palo Alto GlobalProtect, Fortinet FortiClient.
  - **Protocols & Self-Hosted:** WireGuard (`wintun`/`wg0`), OpenVPN (`TAP-Windows Adapter V9`).
  - **Cloud VPS / Datacenter Proxies:** AWS, Google Cloud (GCP), Microsoft Azure, DigitalOcean, Hetzner, OVH, Linode, Vultr.
  - **Anonymity Networks:** Tor Network exit relays, Apple iCloud Private Relay.
- Computes an **Attribution Confidence Score (0–100%)** based on ASN, ISP, Organization, Reverse DNS (PTR), Virtual Adapter names, and MTU overhead.

### 2. 🌐 4-Tier IP Breakdown (Bento Grid)
1. **Current Public IP (VPN Exit Node):**
   - Active exit node IPv4 & IPv6.
   - Geolocation (Country, State/Region, City, Postal Code, Lat/Long).
   - Autonomous System (ASN number, AS name, ISP, Organization).
   - Reverse DNS hostname & datacenter hosting indicators.
2. **Original System IP (Physical LAN Adapter):**
   - True physical network adapter IP (e.g. `192.xx.xx.xx`).
   - Hardware NIC controller name (e.g. `Wi-Fi 6 Wireless LAN Card`).
   - Physical MAC address (`XX:XX:XX:XX:XX:XX`) & hardware link speed.
3. **Local Network IP & Gateway Router:**
   - Default router gateway IP (e.g. `192.xx.xx.1`).
   - Subnet mask (e.g. `255.255.255.0`) & CIDR prefix (e.g. `192.xx.xx.0/24`).
   - Active DNS server addresses & DNS leak warning.
4. **VPN Virtual Tunnel Adapter:**
   - Virtual tunnel adapter name (e.g. `CloudflareWARP`, `NordLynx`, `wg0`).
   - Virtual tunnel IPv4 & IPv6 addresses.
   - MTU encapsulation overhead analysis (e.g. 1280B vs 1500B standard).

### 3. 🗺️ Calibrated Vector World Map & Geodetic Coordinate Locking
- **Zero Third-Party Map Keys / Zero Tracking:**
  - 100% offline, embedded 2:1 Equirectangular calibrated vector world map (`world_map.svg`).
  - Sub-pixel mathematical geodetic coordinate mapping:
    $$\text{X} = \frac{\text{Longitude} + 180^{\circ}}{360^{\circ}} \times 1000 \quad , \quad \text{Y} = \frac{90^{\circ} - \text{Latitude}}{180^{\circ}} \times 500$$
- **Accurate Global Cartography:**
  - High-precision vector contours with calibrated geographic boundaries.
  - Uniform professional dark tactical styling across all nations with dynamic reticle targeting.
- **Interactive 4x Regional Lock:**
  - One-click zoom toggle between global perspective (`World 1x`) and localized exit node inspection (`Regional Lock 4x`).

### 4. 🧪 Live In-Browser WebRTC STUN Leak Hunter
- Uses browser `RTCPeerConnection` to harvest real-time reflexive (`srflx`) and local (`host`) ICE candidates directly from public STUN servers (`stun.l.google.com`, `stun.cloudflare.com`).
- Discovers if any UDP packet leaks your real physical ISP address outside the encrypted tunnel.
- Interactive candidate inspector with raw SDP candidate analysis.

### 5. 💻 Deep Host Hardware & Router Reconnaissance
- **Host System Telemetry:** Hostname, Manufacturer, Machine Model, CPU Processor, Core & Thread topography, CPU Load, Physical RAM gauge bar, Windows Kernel build, and System Uptime.
- **Router Layer-2 / Layer-3 Recon:** Router Gateway MAC address, resolved IEEE OUI hardware vendor, ARP table neighbors, and active socket statistics (TCP established, listening ports, UDP sockets).

### 6. 📋 Filterable Network Adapters Explorer
- Comprehensive real-time inspection table of all system interfaces.
- Filter by: **All Interfaces**, **Physical Only**, **VPN / Virtual Tunnels**, and **Active (UP)**.
- Search by adapter name, description, MAC, or IP address.

---

## 🛠️ Architecture & Tech Stack

```
                     ┌────────────────────────────────────────────────────────┐
                     │            REACT 19 + TAILWIND CSS v4 DASHBOARD        │
                     │  - Hero Attribution Banner & Confidence Gauge          │
                     │  - 4-Tier IP Bento Grid with One-Click Copy            │
                     │  - Tactical Vector Map with 4x Regional Zoom           │
                     │  - In-Browser WebRTC STUN Harvester & Socket Inspector │
                     │  - Network Interfaces Explorer Table                   │
                     └───────────────────────────┬────────────────────────────┘
                                                 │ REST API (JSON)
                                                 ▼
                     ┌────────────────────────────────────────────────────────┐
                     │                  FASTAPI ASYNC BACKEND                 │
                     │  - /api/analyze: Unified Intelligence Endpoint         │
                     │  - /api/adapters: Host Adapter Topology (psutil/CIM)   │
                     │  - /api/webrtc-check: WebRTC Candidate Forensic Check   │
                     │  - /api/export: Audit-Ready JSON Report Generator      │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
                      ┌──────────────────────────┴──────────────────────────┐
                      ▼                                                     ▼
    ┌───────────────────────────────────┐                 ┌───────────────────────────────────┐
    │       SYSTEM INSPECTOR (Host)     │                 │    NETWORK DETECTOR (Public IP)   │
    │  - Physical NIC & Virtual Tunnels │                 │  - public-apis GeoIP Waterfall    │
    │  - Router ARP MAC & OUI Vendor    │                 │  - ASN, BGP Routing & Reverse DNS │
    │  - CPU, RAM, OS Build, Sockets    │                 │  - Datacenter & Proxy Flags       │
    └───────────────────────────────────┘                 └───────────────────────────────────┘
```

- **Backend:** Python 3.10+, FastAPI, Uvicorn, psutil, requests.
- **Frontend:** React 19, Vite 8, Tailwind CSS v4, Lucide React, JetBrains Mono font.
- **Cartography:** WGS-84 / Plate Carrée 2:1 Equirectangular calibrated SVG vector map.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ (optional, only required if rebuilding the frontend from source)

### 1. Clone the Repository
```bash
git clone https://github.com/Devansh7006/VPN-detector.git
cd VPN-detector
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Application
```bash
python run.py
```
> The launcher will automatically start the FastAPI server at `http://127.0.0.1:8000` and open the dashboard in your default web browser.

---

## 📡 API Reference

Interactive Swagger documentation is available out-of-the-box at:
`http://127.0.0.1:8000/docs`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analyze` | Unified intelligence endpoint returning all 4 IP tiers, VPN verdict, hardware specs, and router recon. |
| `GET` | `/api/adapters` | Returns all physical and virtual host interfaces, link speeds, MACs, and MTUs. |
| `POST` | `/api/webrtc-check` | Accepts harvested WebRTC ICE candidates and verifies for public IP leak anomalies. |
| `GET` | `/api/signatures` | Returns the database of recognizable VPN providers and detection rules. |
| `GET` | `/api/export` | Generates a downloadable `vpn_detector_report.json` forensic audit file. |

---

## 🔬 How the Detection Engine Works

VPN Detector uses a **multi-signal weighted scoring matrix** across independent OSI layers:

```python
# Weighted Scoring Thresholds
VIRTUAL_ADAPTER_MATCH  = +70 pts  # Found provider keywords in OS adapter
ASN_MATCH              = +45 pts  # Exit IP routed via provider-owned ASN
ORG_ISP_MATCH          = +40 pts  # Organization matches provider company
REVERSE_DNS_MATCH      = +35 pts  # PTR hostname matches provider domain
DNS_RESOLVER_MATCH     = +30 pts  # Private DNS resolvers match provider
```

When multiple independent layers agree (e.g., Local Adapter `CloudflareWARP` + Public ASN `AS13335`), attribution confidence reaches **100% High Confidence**.

---

## 💻 Frontend Development (Optional Rebuild)

The pre-compiled production bundle is already included in `frontend/` and `frontend-react/dist/`. If you want to modify the React source code:

```bash
cd frontend-react
npm install
npm run dev      # Start Vite local development server
npm run build    # Compile production bundle
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.

Developed by **[Devansh Goyal](https://github.com/Devansh7006)**.
