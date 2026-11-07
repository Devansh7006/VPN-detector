# backend/webrtc_analyzer.py
"""
WebRTC STUN Leak & Browser Anomaly Analyzer.
Parses browser WebRTC ICE candidates to detect real IP leaks, local LAN exposure,
and timezone discrepancies.
"""

import re
from typing import Dict, Any, List, Optional


def parse_ice_candidate(candidate_line: str) -> Optional[Dict[str, Any]]:
    """
    Parses a standard SDP candidate line:
    e.g. candidate:842163049 1 udp 1686052607 104.xx.xx.xx 54321 typ srflx raddr 172.xx.xx.xx rport 54321
    """
    if not candidate_line:
        return None

    # Regex for SDP candidate attribute
    # Syntax: candidate:<foundation> <component-id> <transport> <priority> <connection-address> <port> typ <candidate-types> [raddr <rel-addr>] [rport <rel-port>]
    pattern = r"candidate:(\S+)\s+(\d+)\s+(\S+)\s+(\d+)\s+([0-9a-fA-F\.\:]+)\s+(\d+)\s+typ\s+(\S+)(?:\s+raddr\s+([0-9a-fA-F\.\:]+))?(?:\s+rport\s+(\d+))?"
    match = re.search(pattern, candidate_line)
    if not match:
        return None

    foundation, component_id, transport, priority, ip, port, typ, raddr, rport = match.groups()

    return {
        "raw": candidate_line.strip(),
        "ip": ip,
        "port": int(port),
        "protocol": transport.upper(),
        "type": typ,  # 'host', 'srflx', 'prflx', 'relay'
        "related_address": raddr,
        "related_port": int(rport) if rport else None,
        "is_private": is_private_ip(ip)
    }


def is_private_ip(ip_str: str) -> bool:
    """Checks if IP is RFC1918 / loopback / link-local / CGNAT."""
    if not ip_str:
        return False
    if ip_str.startswith("10.") or ip_str.startswith("192.168.") or ip_str.startswith("127."):
        return True
    if ip_str.startswith("172."):
        parts = ip_str.split(".")
        if len(parts) > 1 and parts[1].isdigit():
            sec = int(parts[1])
            if 16 <= sec <= 31:
                return True
    if ip_str.startswith("100."):  # CGNAT (Tailscale, etc.)
        parts = ip_str.split(".")
        if len(parts) > 1 and parts[1].isdigit():
            sec = int(parts[1])
            if 64 <= sec <= 127:
                return True
    if ip_str.startswith("169.254."):  # Link-local
        return True
    return False


def analyze_webrtc_report(
    raw_candidates: List[str],
    public_http_ip: Optional[str] = None,
    browser_timezone: Optional[str] = None,
    exit_node_timezone: Optional[str] = None
) -> Dict[str, Any]:
    """
    Evaluates client-side WebRTC candidates against the server's public IP.
    Returns:
    - WebRTC leak status (LEAKED vs SECURE)
    - Leaked IPs (if any)
    - Discovered local network IPs
    - Timezone mismatch analysis
    """
    parsed_candidates = []
    srflx_ips = set()
    host_ips = set()

    for cand_str in raw_candidates:
        parsed = parse_ice_candidate(cand_str)
        if parsed:
            parsed_candidates.append(parsed)
            if parsed["type"] == "srflx" and not parsed["is_private"]:
                srflx_ips.add(parsed["ip"])
            elif parsed["type"] == "host":
                host_ips.add(parsed["ip"])

    is_leaked = False
    leaked_real_ip = None
    webrtc_status = "SECURE"

    if srflx_ips:
        # Check if any srflx IP differs from the exit node public IP
        for s_ip in srflx_ips:
            if public_http_ip and s_ip != public_http_ip:
                is_leaked = True
                leaked_real_ip = s_ip
                webrtc_status = "CRITICAL_LEAK"
                break
        if not is_leaked:
            webrtc_status = "PROTECTED_TUNNELED"
    else:
        webrtc_status = "BLOCKED_OR_NO_CANDIDATES"

    # Timezone check
    tz_mismatch = False
    tz_notes = "Timezones match or not specified"
    if browser_timezone and exit_node_timezone:
        if browser_timezone.lower() != exit_node_timezone.lower():
            tz_mismatch = True
            tz_notes = f"Browser reports '{browser_timezone}', but Exit Node is in '{exit_node_timezone}'. Common VPN proxy indicator."

    return {
        "webrtc_leak_detected": is_leaked,
        "webrtc_status": webrtc_status,
        "leaked_real_ip": leaked_real_ip,
        "stun_public_ips": list(srflx_ips),
        "local_network_ips_exposed": list(host_ips),
        "total_candidates": len(parsed_candidates),
        "candidates": parsed_candidates,
        "timezone_anomaly": {
            "mismatch_detected": tz_mismatch,
            "browser_timezone": browser_timezone,
            "exit_node_timezone": exit_node_timezone,
            "description": tz_notes
        }
    }
