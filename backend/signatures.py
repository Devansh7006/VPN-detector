# backend/signatures.py
"""
VPN, Proxy, and Datacenter Signature Database.
Provides multi-signal fingerprinting to detect not only IF a VPN is connected,
but precisely WHICH provider or technology is active.
"""

import re
from typing import Dict, Any, List, Optional


KNOWN_PROVIDERS = [
    {
        "id": "cloudflare_warp",
        "name": "Cloudflare WARP (1.1.1.1 VPN)",
        "category": "Commercial / Privacy VPN",
        "protocol": "WireGuard / MASQUE (BoringTun)",
        "adapter_keywords": ["cloudflarewarp", "warp", "cloudflare warp interface tunnel"],
        "asn_list": [13335, 395747],
        "org_keywords": ["cloudflare warp", "cloudflare london", "cloudflare, inc."],
        "reverse_dns_patterns": [r"cloudflare\.com", r"13335\.cloudflare"],
        "dns_servers": ["127.0.2.2", "127.0.2.3", "1.1.1.1", "1.0.0.1"],
        "mtu_hint": 1280
    },
    {
        "id": "nordvpn",
        "name": "NordVPN",
        "category": "Commercial VPN",
        "protocol": "NordLynx (WireGuard) / OpenVPN",
        "adapter_keywords": ["nordlynx", "nordvpn", "nordvpn-tap"],
        "asn_list": [202425, 60068, 9009, 206238],
        "org_keywords": ["nordvpn", "nord security", "tefincom", "packethub", "datacamp limited"],
        "reverse_dns_patterns": [r"nordvpn\.com", r"nordsec\.com"],
        "dns_servers": ["103.86.96.100", "103.86.99.100"],
        "mtu_hint": 1420
    },
    {
        "id": "expressvpn",
        "name": "ExpressVPN",
        "category": "Commercial VPN",
        "protocol": "Lightway / OpenVPN / IKEv2",
        "adapter_keywords": ["expressvpn", "lightway"],
        "asn_list": [208587, 136787, 398324],
        "org_keywords": ["expressvpn", "kape technologies", "digital energy technologies", "teddysun"],
        "reverse_dns_patterns": [r"expressvpn\.com"],
        "dns_servers": [],
        "mtu_hint": 1350
    },
    {
        "id": "surfshark",
        "name": "Surfshark VPN",
        "category": "Commercial VPN",
        "protocol": "WireGuard / OpenVPN / IKEv2",
        "adapter_keywords": ["surfshark", "surfsharkwireguard", "surfsharktun"],
        "asn_list": [212238, 209854, 9009],
        "org_keywords": ["surfshark", "surfshark ltd", "surfshark b.v."],
        "reverse_dns_patterns": [r"surfshark\.com", r"surfsharkdns\.com"],
        "dns_servers": [],
        "mtu_hint": 1420
    },
    {
        "id": "protonvpn",
        "name": "Proton VPN",
        "category": "Privacy / Commercial VPN",
        "protocol": "WireGuard / OpenVPN / Stealth",
        "adapter_keywords": ["protonvpn", "proton", "protonvpn tap", "protonvpn tun"],
        "asn_list": [62371, 51852, 209242],
        "org_keywords": ["protonvpn", "proton ag", "proton technologies ag"],
        "reverse_dns_patterns": [r"protonvpn\.net", r"proton\.me"],
        "dns_servers": ["10.2.0.1"],
        "mtu_hint": 1420
    },
    {
        "id": "mullvad",
        "name": "Mullvad VPN",
        "category": "Privacy / Open Source VPN",
        "protocol": "WireGuard / OpenVPN",
        "adapter_keywords": ["mullvad", "mullvad wireguard"],
        "asn_list": [42237, 62136],
        "org_keywords": ["mullvad", "mullvad vpn ab", "amagicom ab"],
        "reverse_dns_patterns": [r"mullvad\.net"],
        "dns_servers": ["10.64.0.1"],
        "mtu_hint": 1420
    },
    {
        "id": "cyberghost",
        "name": "CyberGhost VPN",
        "category": "Commercial VPN",
        "protocol": "WireGuard / OpenVPN / IKEv2",
        "adapter_keywords": ["cyberghost", "cg-wireguard"],
        "asn_list": [202422, 205905],
        "org_keywords": ["cyberghost", "cyberghost s.a.", "kape technologies"],
        "reverse_dns_patterns": [r"cyberghostvpn\.com"],
        "dns_servers": [],
        "mtu_hint": 1420
    },
    {
        "id": "pia",
        "name": "Private Internet Access (PIA)",
        "category": "Commercial VPN",
        "protocol": "WireGuard / OpenVPN",
        "adapter_keywords": ["pia", "private internet access", "pia wireguard"],
        "asn_list": [39351, 202425],
        "org_keywords": ["private internet access", "pia technologies", "london trust media"],
        "reverse_dns_patterns": [r"privateinternetaccess\.com"],
        "dns_servers": ["10.0.0.241", "10.0.0.242"],
        "mtu_hint": 1420
    },
    {
        "id": "windscribe",
        "name": "Windscribe VPN",
        "category": "Commercial VPN",
        "protocol": "WireGuard / OpenVPN / IKEv2 / Stealth",
        "adapter_keywords": ["windscribe", "windscribe-wireguard"],
        "asn_list": [400262, 395954],
        "org_keywords": ["windscribe", "windscribe limited"],
        "reverse_dns_patterns": [r"windscribe\.com"],
        "dns_servers": ["10.255.255.1"],
        "mtu_hint": 1420
    },
    {
        "id": "tailscale",
        "name": "Tailscale Mesh VPN",
        "category": "Mesh / P2P VPN",
        "protocol": "WireGuard (Tailscale protocol)",
        "adapter_keywords": ["tailscale", "tailscale0", "tailscale tunnel"],
        "asn_list": [],
        "org_keywords": ["tailscale"],
        "reverse_dns_patterns": [r"tailscale\.com", r"ts\.net"],
        "dns_servers": ["100.100.100.100"],
        "mtu_hint": 1280
    },
    {
        "id": "zerotier",
        "name": "ZeroTier One",
        "category": "SDN / Virtual LAN",
        "protocol": "ZeroTier Cryptographic Ethernet",
        "adapter_keywords": ["zerotier", "zt"],
        "asn_list": [],
        "org_keywords": ["zerotier"],
        "reverse_dns_patterns": [r"zerotier\.com"],
        "dns_servers": [],
        "mtu_hint": 2800
    },
    {
        "id": "cisco_anyconnect",
        "name": "Cisco AnyConnect / Secure Client",
        "category": "Enterprise Corporate VPN",
        "protocol": "Cisco SSL VPN / DTLS / IPsec",
        "adapter_keywords": ["anyconnect", "cisco anyconnect", "cisco secure client"],
        "asn_list": [],
        "org_keywords": ["cisco"],
        "reverse_dns_patterns": [],
        "dns_servers": [],
        "mtu_hint": 1400
    },
    {
        "id": "globalprotect",
        "name": "Palo Alto GlobalProtect",
        "category": "Enterprise Corporate VPN",
        "protocol": "IPsec / SSL Tunnel",
        "adapter_keywords": ["globalprotect", "palo alto"],
        "asn_list": [],
        "org_keywords": ["palo alto"],
        "reverse_dns_patterns": [],
        "dns_servers": [],
        "mtu_hint": 1400
    },
    {
        "id": "fortinet",
        "name": "Fortinet FortiClient VPN",
        "category": "Enterprise Corporate VPN",
        "protocol": "Fortinet SSL-VPN / IPsec",
        "adapter_keywords": ["fortinet", "forticlient"],
        "asn_list": [],
        "org_keywords": ["fortinet"],
        "reverse_dns_patterns": [],
        "dns_servers": [],
        "mtu_hint": 1354
    },
    {
        "id": "generic_wireguard",
        "name": "WireGuard Tunnel (Custom / Self-Hosted)",
        "category": "Self-Hosted / Open Protocol",
        "protocol": "WireGuard UDP",
        "adapter_keywords": ["wireguard", "wintun", "wg0", "wireguard tunnel"],
        "asn_list": [],
        "org_keywords": ["wireguard"],
        "reverse_dns_patterns": [],
        "dns_servers": [],
        "mtu_hint": 1420
    },
    {
        "id": "generic_openvpn",
        "name": "OpenVPN (Custom / Self-Hosted)",
        "category": "Self-Hosted / Open Protocol",
        "protocol": "OpenVPN (TUN/TAP)",
        "adapter_keywords": ["tap-windows", "openvpn", "tap0", "tun0", "wintun"],
        "asn_list": [],
        "org_keywords": ["openvpn"],
        "reverse_dns_patterns": [],
        "dns_servers": [],
        "mtu_hint": 1500
    },
    # Cloud / Datacenter VPS Providers frequently used for self-hosted VPNs & Shadowsocks/V2Ray proxies:
    {
        "id": "aws_proxy",
        "name": "Amazon Web Services (AWS Datacenter Proxy/VPN)",
        "category": "Cloud VPS / Proxy Gateway",
        "protocol": "Cloud Proxy / VPS Gateway",
        "adapter_keywords": [],
        "asn_list": [16509, 14618],
        "org_keywords": ["amazon.com", "amazon data services", "aws"],
        "reverse_dns_patterns": [r"compute\.amazonaws\.com"],
        "dns_servers": [],
        "mtu_hint": 1500
    },
    {
        "id": "gcp_proxy",
        "name": "Google Cloud Platform (GCP Proxy/VPN)",
        "category": "Cloud VPS / Proxy Gateway",
        "protocol": "Cloud Proxy / VPS Gateway",
        "adapter_keywords": [],
        "asn_list": [15169, 396982],
        "org_keywords": ["google cloud", "google llc", "google datacenter"],
        "reverse_dns_patterns": [r"googleusercontent\.com", r"1e100\.net"],
        "dns_servers": [],
        "mtu_hint": 1500
    },
    {
        "id": "azure_proxy",
        "name": "Microsoft Azure (Cloud Proxy/VPN)",
        "category": "Cloud VPS / Proxy Gateway",
        "protocol": "Cloud Proxy / VPS Gateway",
        "adapter_keywords": [],
        "asn_list": [8075],
        "org_keywords": ["microsoft corporation", "microsoft azure", "azure"],
        "reverse_dns_patterns": [r"cloudapp\.azure\.com", r"azure\.com"],
        "dns_servers": [],
        "mtu_hint": 1500
    },
    {
        "id": "digitalocean_proxy",
        "name": "DigitalOcean (Droplet VPS Proxy/VPN)",
        "category": "Cloud VPS / Proxy Gateway",
        "protocol": "Cloud Proxy / VPS Gateway",
        "adapter_keywords": [],
        "asn_list": [14061],
        "org_keywords": ["digitalocean", "digital ocean, llc"],
        "reverse_dns_patterns": [r"digitalocean\.com"],
        "dns_servers": [],
        "mtu_hint": 1500
    },
    {
        "id": "hetzner_proxy",
        "name": "Hetzner Online (VPS Proxy/VPN)",
        "category": "Cloud VPS / Proxy Gateway",
        "protocol": "Cloud Proxy / VPS Gateway",
        "adapter_keywords": [],
        "asn_list": [24940],
        "org_keywords": ["hetzner", "hetzner online gmbh"],
        "reverse_dns_patterns": [r"your-server\.de", r"hetzner\.com"],
        "dns_servers": [],
        "mtu_hint": 1500
    },
    {
        "id": "ovh_proxy",
        "name": "OVHcloud (VPS Proxy/VPN)",
        "category": "Cloud VPS / Proxy Gateway",
        "protocol": "Cloud Proxy / VPS Gateway",
        "adapter_keywords": [],
        "asn_list": [16276],
        "org_keywords": ["ovh", "ovh sas", "ovh hosting"],
        "reverse_dns_patterns": [r"ovh\.net", r"ovhcloud\.com"],
        "dns_servers": [],
        "mtu_hint": 1500
    },
    {
        "id": "linode_proxy",
        "name": "Linode / Akamai Cloud (VPS Proxy/VPN)",
        "category": "Cloud VPS / Proxy Gateway",
        "protocol": "Cloud Proxy / VPS Gateway",
        "adapter_keywords": [],
        "asn_list": [63949],
        "org_keywords": ["linode", "linode, llc", "akamai connected cloud"],
        "reverse_dns_patterns": [r"linode\.com", r"members\.linode\.com"],
        "dns_servers": [],
        "mtu_hint": 1500
    },
    {
        "id": "vultr_proxy",
        "name": "Vultr / Choopa (VPS Proxy/VPN)",
        "category": "Cloud VPS / Proxy Gateway",
        "protocol": "Cloud Proxy / VPS Gateway",
        "adapter_keywords": [],
        "asn_list": [20473],
        "org_keywords": ["choopa", "vultr", "constant company"],
        "reverse_dns_patterns": [r"vultr\.com", r"choopa\.net"],
        "dns_servers": [],
        "mtu_hint": 1500
    },
    {
        "id": "tor_network",
        "name": "Tor Network (The Onion Router)",
        "category": "Anonymity Network / Onion Routing",
        "protocol": "Tor Relay / SOCKS5",
        "adapter_keywords": [],
        "asn_list": [],
        "org_keywords": ["tor exit", "tor project", "the onion router"],
        "reverse_dns_patterns": [r"tor-exit", r"torproject\.org"],
        "dns_servers": [],
        "mtu_hint": 1500
    },
    {
        "id": "apple_private_relay",
        "name": "Apple iCloud Private Relay",
        "category": "Dual-Hop Privacy Relay",
        "protocol": "MASQUE / HTTP/3 Egress Relay",
        "adapter_keywords": [],
        "asn_list": [],
        "org_keywords": ["apple icloud", "apple private relay", "icloud relay"],
        "reverse_dns_patterns": [r"apple-relay"],
        "dns_servers": [],
        "mtu_hint": 1500
    }
]

GENERIC_DATACENTER_KEYWORDS = [
    "hosting", "datacenter", "data center", "cloud", "vps", "server", "telecom datacenter",
    "dedicated", "colocation", "transit", "proxy", "vpn", "anonymizer", "exit node"
]


def identify_vpn(
    asn: Optional[int] = None,
    isp: Optional[str] = "",
    org: Optional[str] = "",
    reverse_dns: Optional[str] = "",
    active_vpn_adapters: Optional[List[Dict[str, Any]]] = None,
    dns_servers: Optional[List[str]] = None,
    proxy_flag: bool = False,
    hosting_flag: bool = False
) -> Dict[str, Any]:
    """
    Evaluates multi-source network signals to identify:
    1. If a VPN/Proxy is in use.
    2. Which specific provider or architecture it is.
    3. Confidence level and all supporting forensic signals.
    """
    isp_clean = (isp or "").lower()
    org_clean = (org or "").lower()
    rdns_clean = (reverse_dns or "").lower()
    adapters = active_vpn_adapters or []
    configured_dns = [d.lower() for d in (dns_servers or [])]

    matched_provider = None
    best_score = 0
    signals = []
    protocol_detected = None

    # Step 1: Check adapter names on local host
    for adapter in adapters:
        ad_name = (adapter.get("name") or "").lower()
        ad_desc = (adapter.get("description") or "").lower()
        for prov in KNOWN_PROVIDERS:
            for kw in prov["adapter_keywords"]:
                if kw in ad_name or kw in ad_desc:
                    score = 70
                    matched_provider = prov
                    best_score = max(best_score, score)
                    protocol_detected = prov["protocol"]
                    signals.append(f"Virtual Adapter match: '{adapter.get('name')}' ({adapter.get('description', '')}) -> {prov['name']}")
                    break

    # Step 2: Check ASN and Org / ISP in public GeoIP data
    for prov in KNOWN_PROVIDERS:
        prov_score = 0
        prov_signals = []

        # ASN match
        if asn and asn in prov["asn_list"]:
            prov_score += 45
            prov_signals.append(f"ASN match: AS{asn} belongs to {prov['name']}")

        # Org / ISP keyword match
        for kw in prov["org_keywords"]:
            if kw in org_clean or kw in isp_clean:
                prov_score += 40
                prov_signals.append(f"ISP/Org match: '{kw}' detected in [{isp} / {org}]")
                break

        # Reverse DNS match
        for pat in prov["reverse_dns_patterns"]:
            if re.search(pat, rdns_clean):
                prov_score += 35
                prov_signals.append(f"Reverse DNS match: '{pat}' in '{reverse_dns}'")
                break

        # DNS resolver match
        for known_dns in prov["dns_servers"]:
            if any(known_dns in d for d in configured_dns):
                prov_score += 30
                prov_signals.append(f"DNS Resolver match: {known_dns} used by {prov['name']}")
                break

        # If this provider has stronger or additional match
        if prov_score > 0:
            if matched_provider and matched_provider["id"] == prov["id"]:
                best_score = min(100, best_score + prov_score)
                signals.extend(prov_signals)
            elif prov_score > best_score:
                matched_provider = prov
                best_score = min(100, prov_score)
                signals = prov_signals
                protocol_detected = prov["protocol"]

    # Step 3: Heuristic Datacenter / Proxy check if no named provider matched
    is_vpn_detected = bool(best_score >= 35 or len(adapters) > 0 or proxy_flag or hosting_flag)

    if not matched_provider and is_vpn_detected:
        if len(adapters) > 0:
            ad_names = ", ".join([a.get("name", "") for a in adapters])
            matched_provider = {
                "id": "unknown_vpn_adapter",
                "name": f"VPN Tunnel Interface ({ad_names})",
                "category": "Virtual Tunnel / VPN",
                "protocol": "TUN/TAP or WireGuard Tunnel",
            }
            signals.append(f"Virtual network adapter active: {ad_names}")
            best_score = 75
        elif proxy_flag or hosting_flag:
            matched_provider = {
                "id": "datacenter_proxy",
                "name": "Datacenter Proxy / Hosting VPN Gateway",
                "category": "Cloud Datacenter / Proxy",
                "protocol": "HTTP/SOCKS5 / VPN Gateway",
            }
            signals.append(f"Datacenter/Hosting flag active on exit IP ({isp or org})")
            best_score = 65

    # If generic datacenter keywords exist
    if not matched_provider:
        for kw in GENERIC_DATACENTER_KEYWORDS:
            if kw in org_clean or kw in isp_clean:
                is_vpn_detected = True
                best_score = 60
                matched_provider = {
                    "id": "generic_hosting",
                    "name": f"Hosting / Datacenter IP ({org or isp})",
                    "category": "Datacenter / VPS",
                    "protocol": "Hosting Exit Gateway",
                }
                signals.append(f"Matched datacenter indicator: '{kw}' in '{isp or org}'")
                break

    if not is_vpn_detected or not matched_provider:
        return {
            "is_vpn": False,
            "provider_name": "Direct ISP Connection (No VPN)",
            "provider_id": "direct_isp",
            "category": "Residential / Commercial ISP",
            "confidence_score": 0,
            "confidence_label": "No VPN Detected",
            "protocol": "Standard TCP/IP",
            "signals": ["No VPN tunnel adapters, datacenter ASNs, or proxy fingerprints detected"]
        }

    # Confidence label
    confidence = min(100, max(best_score, 50))
    if confidence >= 85:
        conf_label = "High Confidence"
    elif confidence >= 60:
        conf_label = "Moderate Confidence"
    else:
        conf_label = "Heuristic Detection"

    return {
        "is_vpn": True,
        "provider_name": matched_provider["name"],
        "provider_id": matched_provider["id"],
        "category": matched_provider.get("category", "Virtual Private Network"),
        "confidence_score": confidence,
        "confidence_label": conf_label,
        "protocol": protocol_detected or matched_provider.get("protocol", "Encrypted Tunnel"),
        "signals": signals
    }
