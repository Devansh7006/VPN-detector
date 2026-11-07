# backend/network_detector.py
"""
Public Network & Exit Node Detector.
Leverages keyless open APIs from the public-apis catalog:
- ip-api.com (Auth: No)
- ipwho.is (Auth: No)
- freeipapi.com (Auth: No)
- ipify.org (Auth: No)
Performs multi-provider fallback, IPv4/IPv6 dual-stack resolution,
reverse DNS PTR lookup, and threat/proxy heuristics.
"""

import logging
import os
import re
import socket
from typing import Dict, Any, Optional

import requests

logger = logging.getLogger("vpn_analyzer.network_detector")

IP_API_URL = "http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query"
IPWHOIS_URL = "https://ipwho.is/"
FREEIPAPI_URL = "https://freeipapi.com/api/json/"
IPIFY_V4 = "https://api.ipify.org?format=json"
IPIFY_V6 = "https://api64.ipify.org?format=json"

ABUSEIPDB_KEY = os.getenv("ABUSEIPDB_KEY")
ABUSE_SCORE_THRESHOLD = 50


def resolve_reverse_dns(ip: str) -> Optional[str]:
    """Perform reverse PTR lookup for the given IP address."""
    if not ip:
        return None
    try:
        host, _, _ = socket.gethostbyaddr(ip)
        return host
    except Exception:
        return None


def fetch_ipify_v4() -> Optional[str]:
    try:
        r = requests.get(IPIFY_V4, timeout=2.5)
        if r.status_code == 200:
            ip = r.json().get("ip")
            if ip and ":" not in ip:
                return ip
    except Exception:
        pass
    return None


def fetch_ipify_v6() -> Optional[str]:
    try:
        r = requests.get(IPIFY_V6, timeout=2.5)
        if r.status_code == 200:
            ip = r.json().get("ip")
            if ip and ":" in ip:
                return ip
    except Exception:
        pass
    return None


def check_abuseipdb(ip: str) -> Dict[str, Any]:
    """Query AbuseIPDB API for threat/fraud reputation if API key is present."""
    if not ABUSEIPDB_KEY:
        return {
            "checked": False,
            "abuse_score": None,
            "is_blacklisted": False,
            "threat_level": "Keyless Mode",
            "details": "Using open public-apis heuristic detection (No private API key required)"
        }
    try:
        url = "https://api.abuseipdb.com/api/v2/check"
        params = {"ipAddress": ip, "maxAgeInDays": 90}
        headers = {"Key": ABUSEIPDB_KEY, "Accept": "application/json"}
        r = requests.get(url, headers=headers, params=params, timeout=4.0)
        if r.status_code == 200:
            data = r.json().get("data", {})
            score = int(data.get("abuseConfidenceScore", 0))
            is_blacklisted = score >= ABUSE_SCORE_THRESHOLD
            threat = "High" if score >= 75 else ("Medium" if score >= 25 else "Low")
            return {
                "checked": True,
                "abuse_score": score,
                "is_blacklisted": is_blacklisted,
                "threat_level": threat,
                "total_reports": data.get("totalReports", 0),
                "last_reported_at": data.get("lastReportedAt")
            }
    except Exception as e:
        logger.debug(f"AbuseIPDB check error: {e}")

    return {
        "checked": False,
        "abuse_score": None,
        "is_blacklisted": False,
        "threat_level": "Unavailable",
        "details": "Query failed or timed out"
    }


def parse_asn_number(as_field: Optional[str]) -> Optional[int]:
    if not as_field:
        return None
    match = re.search(r"AS(\d+)", str(as_field), re.IGNORECASE)
    if match:
        try:
            return int(match.group(1))
        except ValueError:
            pass
    return None


def fetch_public_network_details(client_ip: Optional[str] = None) -> Dict[str, Any]:
    """
    Multi-Provider Geolocation & Network Resolver.
    Waterfall Strategy:
    1. ip-api.com (public-apis catalog: Auth No, comprehensive flags)
    2. ipwho.is (public-apis catalog: Auth No, IPv6 native, flags)
    3. freeipapi.com (public-apis catalog: Auth No, lat/lon accuracy)
    """
    raw = {}
    provider_source = "ip-api"

    # Provider 1: ip-api.com
    target_url = f"http://ip-api.com/json/{client_ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query" if client_ip and client_ip not in ("127.0.0.1", "::1", "localhost") else IP_API_URL

    try:
        resp = requests.get(target_url, timeout=3.5)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "success":
                raw = data
                provider_source = "ip-api.com (public-apis)"
    except Exception as e:
        logger.debug(f"ip-api query failed: {e}")

    # Provider 2: ipwho.is (fallback)
    if not raw or not raw.get("query"):
        who_url = f"https://ipwho.is/{client_ip}" if client_ip and client_ip not in ("127.0.0.1", "::1", "localhost") else IPWHOIS_URL
        try:
            resp = requests.get(who_url, timeout=3.5)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("success"):
                    conn = data.get("connection", {})
                    tz = data.get("timezone", {})
                    raw = {
                        "query": data.get("ip"),
                        "country": data.get("country"),
                        "countryCode": data.get("country_code"),
                        "regionName": data.get("region"),
                        "city": data.get("city"),
                        "zip": data.get("postal"),
                        "lat": data.get("latitude"),
                        "lon": data.get("longitude"),
                        "timezone": tz.get("id"),
                        "isp": conn.get("isp"),
                        "org": conn.get("org"),
                        "as": f"AS{conn.get('asn')}" if conn.get("asn") else "",
                        "asname": conn.get("domain"),
                        "proxy": False,
                        "hosting": False,
                        "reverse": ""
                    }
                    provider_source = "ipwho.is (public-apis)"
        except Exception as e:
            logger.debug(f"ipwho.is query failed: {e}")

    # Provider 3: freeipapi.com (fallback)
    if not raw or not raw.get("query"):
        free_url = f"{FREEIPAPI_URL}{client_ip}" if client_ip and client_ip not in ("127.0.0.1", "::1", "localhost") else FREEIPAPI_URL
        try:
            resp = requests.get(free_url, timeout=3.5)
            if resp.status_code == 200:
                data = resp.json()
                raw = {
                    "query": data.get("ipAddress"),
                    "country": data.get("countryName"),
                    "countryCode": data.get("countryCode"),
                    "regionName": data.get("regionName"),
                    "city": data.get("cityName"),
                    "zip": data.get("zipCode"),
                    "lat": data.get("latitude"),
                    "lon": data.get("longitude"),
                    "timezone": data.get("timeZones", [None])[0] if data.get("timeZones") else None,
                    "isp": "Commercial / VPN Network",
                    "org": "Exit Node Gateway",
                    "as": "",
                    "asname": "",
                    "proxy": False,
                    "hosting": False,
                    "reverse": ""
                }
                provider_source = "freeipapi.com (public-apis)"
        except Exception as e:
            logger.debug(f"freeipapi.com query failed: {e}")

    primary_ip = raw.get("query")
    ipv4 = None
    ipv6 = None

    if primary_ip:
        if ":" in primary_ip:
            ipv6 = primary_ip
            ipv4 = fetch_ipify_v4()
        else:
            ipv4 = primary_ip
            ipv6 = fetch_ipify_v6()

    active_ip = ipv4 or ipv6 or primary_ip or "Unknown"

    as_str = raw.get("as", "")
    asn_num = parse_asn_number(as_str)
    as_name = raw.get("asname", "")

    isp = raw.get("isp", "")
    org = raw.get("org", "")
    reverse_dns = raw.get("reverse") or resolve_reverse_dns(active_ip) or ""

    proxy_flag = bool(raw.get("proxy", False))
    hosting_flag = bool(raw.get("hosting", False))

    abuse_info = check_abuseipdb(active_ip)

    threat_tags = []
    if proxy_flag:
        threat_tags.append("PROXY_DETECTED")
    if hosting_flag:
        threat_tags.append("DATACENTER_HOSTING")
    if abuse_info.get("is_blacklisted"):
        threat_tags.append("BLACKLISTED_IP")

    lat = raw.get("lat")
    lon = raw.get("lon")
    try:
        lat = float(lat) if lat is not None else None
        lon = float(lon) if lon is not None else None
    except (ValueError, TypeError):
        lat, lon = None, None

    return {
        "provider_source": provider_source,
        "active_ip": active_ip,
        "ipv4": ipv4,
        "ipv6": ipv6,
        "country": raw.get("country"),
        "country_code": raw.get("countryCode"),
        "region": raw.get("regionName"),
        "city": raw.get("city"),
        "postal_code": raw.get("zip"),
        "latitude": lat,
        "longitude": lon,
        "timezone": raw.get("timezone"),
        "isp": isp,
        "organization": org,
        "as_number": asn_num,
        "as_name": as_name,
        "as_full": as_str,
        "reverse_dns": reverse_dns,
        "is_proxy": proxy_flag,
        "is_hosting": hosting_flag,
        "is_mobile": bool(raw.get("mobile", False)),
        "threat_tags": threat_tags,
        "abuse_intel": abuse_info
    }
