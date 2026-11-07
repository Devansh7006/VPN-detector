# backend/api.py
"""
VPN Analyzer Web Application & Unified Intelligence API.
FastAPI Backend orchestrating System Network Inspection, Exit Node Geolocation,
VPN Provider Fingerprinting, and WebRTC Leak Analysis.
"""

import json
import os
import sys
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Add current directory to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.signatures import identify_vpn, KNOWN_PROVIDERS
from backend.system_inspector import inspect_system_network
from backend.network_detector import fetch_public_network_details
from backend.webrtc_analyzer import analyze_webrtc_report

app = FastAPI(
    title="VPN Detector — Enterprise Intelligence API",
    description="Full-stack VPN detection, provider attribution, leak analysis, and host network topology inspection.",
    version="2.5.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount frontend directories (prioritize modern React production build)
REACT_DIST_DIR = BASE_DIR / "frontend-react" / "dist"
FRONTEND_DIR = BASE_DIR / "frontend"

if REACT_DIST_DIR.exists() and (REACT_DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(REACT_DIST_DIR / "assets")), name="assets")

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

# Check for ML model (legacy compatibility)
MODEL_PATH = BASE_DIR / "vpn_model.pkl"
model = None
model_loaded = False
if MODEL_PATH.exists():
    try:
        import joblib
        model = joblib.load(str(MODEL_PATH))
        model_loaded = True
    except Exception:
        model = None
        model_loaded = False


class WebRTCReportRequest(BaseModel):
    candidates: List[str]
    public_ip: Optional[str] = None
    browser_timezone: Optional[str] = None
    browser_language: Optional[str] = None
    user_agent: Optional[str] = None


class PredictRequest(BaseModel):
    features: List[float]


# ---------- Web App Route ----------

@app.get("/", response_class=HTMLResponse)
async def serve_dashboard():
    """Serves the main interactive Web Application Dashboard (React Production Build)."""
    if REACT_DIST_DIR.exists() and (REACT_DIST_DIR / "index.html").exists():
        return FileResponse(str(REACT_DIST_DIR / "index.html"))
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return HTMLResponse("<h2>VPN Analyzer backend is running.</h2>")



# ---------- Core Advanced Intelligence API ----------

@app.get("/api/analyze")
async def analyze_full_network(request: Request, client_ip: Optional[str] = None):
    """
    Primary Unified Endpoint:
    Returns:
    1. Active Exit Node IP (VPN IP) & Geolocation / ASN / ISP
    2. Original System IP (Physical LAN Adapter)
    3. Network IP & Routing (Gateway, Subnet Mask, CIDR, DNS)
    4. VPN Tunnel Adapter Details (Virtual Adapter, IP, MTU)
    5. VPN Provider Attribution & Confidence Score (Which VPN is it?)
    6. Leak and Security Diagnostics
    """
    # 1. Inspect host system network topology
    system_net = inspect_system_network()

    # 2. Inspect external public exit node
    public_net = fetch_public_network_details(client_ip)

    # 3. Identify VPN provider and analyze technology
    provider_info = identify_vpn(
        asn=public_net.get("as_number"),
        isp=public_net.get("isp"),
        org=public_net.get("organization"),
        reverse_dns=public_net.get("reverse_dns"),
        active_vpn_adapters=system_net.get("vpn_adapters", []),
        dns_servers=system_net.get("dns_servers", []),
        proxy_flag=public_net.get("is_proxy", False),
        hosting_flag=public_net.get("is_hosting", False)
    )

    primary_phys = system_net.get("primary_physical_adapter") or {}
    primary_vpn = system_net.get("primary_vpn_adapter") or {}

    response_payload = {
        "status": "success",
        "vpn_detected": provider_info["is_vpn"],
        "provider": {
            "name": provider_info["provider_name"],
            "id": provider_info["provider_id"],
            "category": provider_info["category"],
            "confidence_score": provider_info["confidence_score"],
            "confidence_label": provider_info["confidence_label"],
            "protocol": provider_info["protocol"],
            "signals": provider_info["signals"]
        },
        "current_ip": {
            "provider_source": public_net.get("provider_source", "public-apis catalog"),
            "active_ip": public_net.get("active_ip"),
            "ipv4": public_net.get("ipv4"),
            "ipv6": public_net.get("ipv6"),
            "country": public_net.get("country"),
            "country_code": public_net.get("country_code"),
            "region": public_net.get("region"),
            "city": public_net.get("city"),
            "postal_code": public_net.get("postal_code"),
            "latitude": public_net.get("latitude"),
            "longitude": public_net.get("longitude"),
            "timezone": public_net.get("timezone"),
            "isp": public_net.get("isp"),
            "organization": public_net.get("organization"),
            "as_number": public_net.get("as_number"),
            "as_name": public_net.get("as_name"),
            "as_full": public_net.get("as_full"),
            "reverse_dns": public_net.get("reverse_dns"),
            "is_proxy": public_net.get("is_proxy"),
            "is_hosting": public_net.get("is_hosting"),
            "threat_tags": public_net.get("threat_tags", []),
            "abuse_intel": public_net.get("abuse_intel", {})
        },
        "original_system_ip": {
            "physical_lan_ip": system_net.get("physical_lan_ip"),
            "adapter_name": primary_phys.get("name"),
            "description": primary_phys.get("description"),
            "mac_address": primary_phys.get("mac_address"),
            "link_speed": primary_phys.get("speed"),
            "mtu": primary_phys.get("mtu"),
            "is_up": primary_phys.get("is_up", False)
        },
        "network_ip": {
            "gateway": system_net.get("network_gateway"),
            "network_ip": system_net.get("network_ip"),
            "subnet_mask": system_net.get("subnet_mask"),
            "cidr": system_net.get("network_cidr"),
            "dns_servers": system_net.get("dns_servers", []),
            "dns_leak_suspected": system_net.get("dns_leak_suspected", False)
        },
        "vpn_tunnel": {
            "active": system_net.get("vpn_tunnel_active", False),
            "adapter_name": primary_vpn.get("name"),
            "description": primary_vpn.get("description"),
            "tunnel_ipv4": system_net.get("vpn_tunnel_ip"),
            "tunnel_ipv6": system_net.get("vpn_tunnel_ipv6"),
            "mtu": primary_vpn.get("mtu")
        },
        "system_hardware": system_net.get("hardware_identity", {}),
        "network_recon": system_net.get("network_recon", {}),
        "diagnostics": {
            "default_outgoing_ip": system_net.get("default_outgoing_ip"),
            "total_adapters_detected": len(system_net.get("all_interfaces", [])),
            "vpn_adapters_count": len(system_net.get("vpn_adapters", [])),
            "virtual_machines_count": len(system_net.get("virtual_adapters", []))
        }
    }

    return response_payload


@app.get("/api/adapters")
async def get_system_adapters():
    """Inspect all system network adapters, metrics, and routing tables."""
    return inspect_system_network()


@app.post("/api/webrtc-check")
async def check_webrtc(report: WebRTCReportRequest):
    """Analyze client-side WebRTC ICE candidates for real IP leaks."""
    analysis = analyze_webrtc_report(
        raw_candidates=report.candidates,
        public_http_ip=report.public_ip,
        browser_timezone=report.browser_timezone
    )
    return {
        "status": "success",
        "analysis": analysis
    }


@app.get("/api/signatures")
async def get_signatures():
    """Returns database of recognizable VPN providers and detection rules."""
    return {
        "count": len(KNOWN_PROVIDERS),
        "providers": [
            {
                "id": p["id"],
                "name": p["name"],
                "category": p["category"],
                "protocol": p["protocol"],
                "mtu_hint": p.get("mtu_hint")
            }
            for p in KNOWN_PROVIDERS
        ]
    }


@app.get("/api/export")
async def export_report(client_ip: Optional[str] = None):
    """Generates an audit-ready Forensic Cybersecurity JSON Report."""
    analysis = await analyze_full_network(None, client_ip)
    return JSONResponse(
        content=analysis,
        headers={"Content-Disposition": "attachment; filename=vpn_detector_report.json"}
    )


# ---------- Backward Compatibility Routes (for existing extension) ----------

@app.get("/analyze")
async def legacy_analyze(request: Request):
    """
    Backward-compatible route maintaining the exact schema of v1,
    while also including the new advanced fields!
    """
    data = await analyze_full_network(request)
    cur = data["current_ip"]
    prov = data["provider"]
    orig = data["original_system_ip"]
    net = data["network_ip"]
    tun = data["vpn_tunnel"]

    return {
        # Original v1 fields
        "ipv4": cur.get("ipv4"),
        "ipv6": cur.get("ipv6"),
        "country": cur.get("country"),
        "city": cur.get("city"),
        "isp": cur.get("isp"),
        "vpn": data["vpn_detected"],
        "blacklisted": cur.get("abuse_intel", {}).get("is_blacklisted", False),

        # Enhanced v2 fields
        "provider_name": prov["name"],
        "confidence": prov["confidence_score"],
        "physical_lan_ip": orig.get("physical_lan_ip"),
        "gateway": net.get("gateway"),
        "vpn_tunnel_ip": tun.get("tunnel_ipv4"),
        "reverse_dns": cur.get("reverse_dns"),
        "hostname": data.get("system_hardware", {}).get("hostname"),
        "device_model": data.get("system_hardware", {}).get("device_model"),
        "processor": data.get("system_hardware", {}).get("processor"),
        "gateway_mac": data.get("network_recon", {}).get("gateway_mac"),
        "gateway_vendor": data.get("network_recon", {}).get("gateway_vendor")
    }


@app.post("/predict")
def predict_legacy(payload: PredictRequest):
    """Legacy ML model predict endpoint."""
    if not model_loaded or model is None:
        raise HTTPException(status_code=503, detail="Model not loaded on server")

    features = payload.features
    try:
        pred = model.predict([features])[0]
        proba = None
        try:
            proba = max(model.predict_proba([features])[0]).item()
        except Exception:
            proba = None
        return {
            "vpn": int(pred),
            "confidence": float(proba) if proba is not None else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/{file_path:path}")
async def serve_static_root(file_path: str):
    """Fallback static files handler for root assets (world_map.svg, icons, etc.)."""
    if REACT_DIST_DIR.exists():
        react_target = REACT_DIST_DIR / file_path
        if react_target.exists() and react_target.is_file():
            return FileResponse(str(react_target))
    if FRONTEND_DIR.exists():
        target = FRONTEND_DIR / file_path
        if target.exists() and target.is_file():
            return FileResponse(str(target))
    raise HTTPException(status_code=404, detail="File not found")




if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print(" VPN ANALYZER ADVANCED WEB APPLICATION & INTELLIGENCE API ")
    print(" Web Dashboard: http://127.0.0.1:8000")
    print(" API Docs:      http://127.0.0.1:8000/docs")
    print("=" * 60)
    uvicorn.run("backend.api:app", host="0.0.0.0", port=8000, reload=False)
