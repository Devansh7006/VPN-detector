# backend/system_inspector.py
"""
Deep System Network & Hardware Inspector.
Extracts:
1. Physical network adapters, Virtual VPN tunnels, and VM interfaces.
2. Host System Hardware & Architecture (CPU, Cores, Threads, RAM, Model, Manufacturer, Hostname, OS, Uptime).
3. Network Reconnaissance (Gateway Router MAC, Vendor OUI, Active LAN Neighbors, Sockets, Topologies).
"""

import datetime
import ipaddress
import json
import logging
import platform
import socket
import subprocess
from typing import Dict, Any, List, Optional

import psutil

logger = logging.getLogger("vpn_analyzer.system_inspector")

VPN_INTERFACE_KEYWORDS = [
    "warp", "cloudflare", "wireguard", "wintun", "tap", "tun",
    "nordlynx", "nordvpn", "surfshark", "proton", "mullvad",
    "tailscale", "zerotier", "anyconnect", "cisco", "globalprotect",
    "palo alto", "fortinet", "forticlient", "openvpn", "ppp",
    "sstp", "l2tp", "ipsec", "expressvpn", "lightway", "windscribe"
]

VIRTUAL_MACHINE_KEYWORDS = [
    "virtualbox", "vmware", "veth", "hyper-v", "wsl", "docker", "loopback", "host-only"
]

# Common MAC OUI prefixes for instant offline vendor detection
KNOWN_MAC_OUIS = {
    "F8-54-F6": "MediaTek Inc.",
    "0A-00-27": "Oracle VirtualBox",
    "08-00-27": "Oracle VirtualBox",
    "00-50-56": "VMware, Inc.",
    "00-0C-29": "VMware, Inc.",
    "E8-9C-25": "Realtek Semiconductor",
    "00-E0-4C": "Realtek Semiconductor",
    "50-EB-71": "Intel Corporate",
    "00-1B-21": "Intel Corporate",
    "B4-A7-C6": "Reliance Jio Infocomm (Gateway Router)",
    "60-45-CB": "Reliance Jio Infocomm",
    "B8-27-EB": "Raspberry Pi Foundation",
    "DC-A6-32": "Raspberry Pi Trading",
    "AC-DE-48": "Private/Randomized MAC",
    "00-1A-2B": "Ayecom Technology",
    "00-04-4B": "NVIDIA Corporation",
    "3C-52-82": "Apple, Inc.",
    "F0-18-98": "Apple, Inc.",
    "94-E6-F7": "TP-Link Corporation",
    "50-D4-F7": "TP-Link Corporation",
    "00-24-D7": "ASUSTeK Computer Inc."
}


def resolve_mac_vendor(mac_str: Optional[str]) -> str:
    if not mac_str:
        return "Unknown"
    norm = mac_str.upper().replace(":", "-")
    parts = norm.split("-")
    if len(parts) >= 3:
        oui = f"{parts[0]}-{parts[1]}-{parts[2]}"
        if oui in KNOWN_MAC_OUIS:
            return KNOWN_MAC_OUIS[oui]
        # Check if locally administered / randomized
        try:
            first_byte = int(parts[0], 16)
            if (first_byte & 0x02) != 0:
                return "Locally Administered / Randomized MAC"
        except Exception:
            pass
    return "Network Controller"


def netmask_to_cidr(netmask_str: Optional[str]) -> Optional[int]:
    if not netmask_str:
        return None
    try:
        return ipaddress.IPv4Network(f"0.0.0.0/{netmask_str}").prefixlen
    except Exception:
        return None


def calculate_network_range(ip_str: Optional[str], netmask_str: Optional[str]) -> Dict[str, Any]:
    if not ip_str or not netmask_str:
        return {}
    try:
        interface = ipaddress.IPv4Interface(f"{ip_str}/{netmask_str}")
        network = interface.network
        return {
            "cidr": str(network),
            "network_address": str(network.network_address),
            "broadcast_address": str(network.broadcast_address),
            "netmask": str(network.netmask),
            "total_hosts": network.num_addresses,
            "usable_range": f"{network.network_address + 1} - {network.broadcast_address - 1}" if network.num_addresses > 2 else str(network)
        }
    except Exception:
        return {}


def get_default_outgoing_ip() -> Optional[str]:
    """Determine the local IP being used for active outgoing internet traffic."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(1.5)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return None


def get_powershell_metadata() -> Dict[str, Dict[str, Any]]:
    """Query Windows Get-NetAdapter for hardware descriptions, MACs, and link speeds."""
    if platform.system() != "Windows":
        return {}
    try:
        ps_cmd = "Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, MacAddress, LinkSpeed | ConvertTo-Json"
        out = subprocess.check_output(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", ps_cmd],
            timeout=3.5,
            stderr=subprocess.DEVNULL
        ).decode("utf-8", errors="ignore")
        data = json.loads(out)
        if isinstance(data, dict):
            data = [data]
        return {item.get("Name"): item for item in data if "Name" in item}
    except Exception as e:
        logger.debug(f"PowerShell NetAdapter inspection failed: {e}")
        return {}


def get_powershell_routes() -> Dict[str, Dict[str, Any]]:
    """Query Windows Get-NetRoute for default gateway and metrics."""
    if platform.system() != "Windows":
        return {}
    try:
        ps_cmd = "Get-NetRoute -DestinationPrefix 0.0.0.0/0 | Select-Object NextHop, InterfaceAlias, RouteMetric | ConvertTo-Json"
        out = subprocess.check_output(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", ps_cmd],
            timeout=3.5,
            stderr=subprocess.DEVNULL
        ).decode("utf-8", errors="ignore")
        data = json.loads(out)
        if isinstance(data, dict):
            data = [data]
        return {item.get("InterfaceAlias"): item for item in data if "InterfaceAlias" in item}
    except Exception as e:
        logger.debug(f"PowerShell NetRoute inspection failed: {e}")
        return {}


def get_powershell_dns() -> Dict[str, List[str]]:
    """Query Windows Get-DnsClientServerAddress for DNS resolvers per interface."""
    if platform.system() != "Windows":
        return {}
    try:
        ps_cmd = "Get-DnsClientServerAddress -AddressFamily IPv4 | Where-Object { $_.ServerAddresses.Count -gt 0 } | Select-Object InterfaceAlias, ServerAddresses | ConvertTo-Json"
        out = subprocess.check_output(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", ps_cmd],
            timeout=3.5,
            stderr=subprocess.DEVNULL
        ).decode("utf-8", errors="ignore")
        data = json.loads(out)
        if isinstance(data, dict):
            data = [data]
        res = {}
        for item in data:
            alias = item.get("InterfaceAlias")
            addrs = item.get("ServerAddresses", [])
            if isinstance(addrs, str):
                addrs = [addrs]
            res[alias] = addrs
        return res
    except Exception as e:
        logger.debug(f"PowerShell DNS inspection failed: {e}")
        return {}


def get_system_hardware_identity() -> Dict[str, Any]:
    """Extract host hardware details: CPU, RAM, computer model, manufacturer, uptime."""
    hostname = socket.gethostname()
    fqdn = socket.getfqdn()

    manufacturer = "PC / System"
    device_model = "Standard Machine"
    cpu_name = platform.processor()

    # Query WMI / CIM on Windows
    if platform.system() == "Windows":
        try:
            cmd = 'powershell -NoProfile -Command "Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer, Model | ConvertTo-Json"'
            out = subprocess.check_output(cmd, shell=True, timeout=3.0, stderr=subprocess.DEVNULL).decode("utf-8", errors="ignore")
            cs = json.loads(out)
            if isinstance(cs, dict):
                manufacturer = cs.get("Manufacturer") or manufacturer
                device_model = cs.get("Model") or device_model
        except Exception:
            pass

        try:
            cmd = 'powershell -NoProfile -Command "Get-CimInstance Win32_Processor | Select-Object Name | ConvertTo-Json"'
            out = subprocess.check_output(cmd, shell=True, timeout=3.0, stderr=subprocess.DEVNULL).decode("utf-8", errors="ignore")
            proc = json.loads(out)
            if isinstance(proc, dict) and proc.get("Name"):
                cpu_name = proc.get("Name")
            elif isinstance(proc, list) and len(proc) > 0 and proc[0].get("Name"):
                cpu_name = proc[0].get("Name")
        except Exception:
            pass

    # RAM and CPU cores via psutil
    try:
        vm = psutil.virtual_memory()
        total_ram = round(vm.total / (1024**3), 2)
        avail_ram = round(vm.available / (1024**3), 2)
        ram_percent = vm.percent
        phys_cores = psutil.cpu_count(logical=False) or 1
        logical_threads = psutil.cpu_count(logical=True) or 1
        cpu_usage = psutil.cpu_percent(interval=None)
        boot_timestamp = psutil.boot_time()
        boot_dt = datetime.datetime.fromtimestamp(boot_timestamp)
        uptime_sec = (datetime.datetime.now() - boot_dt).total_seconds()
        uptime_hours = round(uptime_sec / 3600, 1)
        uptime_str = f"{int(uptime_sec // 86400)}d {int((uptime_sec % 86400) // 3600)}h {int((uptime_sec % 3600) // 60)}m"
    except Exception as e:
        total_ram, avail_ram, ram_percent = 0, 0, 0
        phys_cores, logical_threads, cpu_usage = 1, 1, 0
        uptime_hours, uptime_str = 0, "Unknown"
        boot_dt = datetime.datetime.now()

    # Distinguish Windows 11 vs 10 by build number
    os_name = platform.system()
    os_release = platform.release()
    os_version = platform.version()
    if os_name == "Windows":
        try:
            build = int(os_version.split(".")[2])
            if build >= 22000:
                os_release = "11"
        except Exception:
            pass

    return {
        "hostname": hostname,
        "fqdn": fqdn,
        "manufacturer": manufacturer.strip(),
        "device_model": device_model.strip(),
        "processor": cpu_name.strip() if cpu_name else "Unknown",
        "cpu_cores": phys_cores,
        "cpu_threads": logical_threads,
        "cpu_usage_percent": cpu_usage,
        "total_ram_gb": total_ram,
        "available_ram_gb": avail_ram,
        "used_ram_percent": ram_percent,
        "os_name": os_name,
        "os_release": os_release,
        "os_build": os_version,
        "architecture": f"{platform.architecture()[0]} ({platform.machine()})",
        "boot_time": boot_dt.strftime("%Y-%m-%d %H:%M:%S"),
        "uptime": uptime_str,
        "uptime_hours": uptime_hours
    }


def get_network_recon_info(gateway_ip: Optional[str] = None) -> Dict[str, Any]:
    """
    Network Reconnaissance:
    - Gateway Router MAC address & Vendor OUI
    - Discovered local network neighbors from ARP cache
    - Active network sockets statistics
    """
    gateway_mac = None
    gateway_vendor = "Router Gateway"
    neighbors = []

    if platform.system() == "Windows":
        try:
            cmd = 'powershell -NoProfile -Command "Get-NetNeighbor -AddressFamily IPv4 | Select-Object IPAddress, LinkLayerAddress, State, InterfaceAlias | ConvertTo-Json"'
            out = subprocess.check_output(cmd, shell=True, timeout=3.0, stderr=subprocess.DEVNULL).decode("utf-8", errors="ignore")
            raw = json.loads(out)
            if isinstance(raw, dict):
                raw = [raw]
            for item in raw:
                ip = item.get("IPAddress", "")
                mac = item.get("LinkLayerAddress", "")
                if ip and mac and not ip.startswith("224.") and not ip.startswith("239.") and ip != "255.255.255.255":
                    vendor = resolve_mac_vendor(mac)
                    neighbors.append({
                        "ip": ip,
                        "mac": mac,
                        "vendor": vendor,
                        "interface": item.get("InterfaceAlias")
                    })
                    if gateway_ip and ip == gateway_ip:
                        gateway_mac = mac
                        gateway_vendor = vendor
        except Exception as e:
            logger.debug(f"ARP neighbor lookup error: {e}")

    # Socket statistics
    try:
        conns = psutil.net_connections(kind="inet")
        tcp_est = len([c for c in conns if c.status == "ESTABLISHED"])
        tcp_listen = len([c for c in conns if c.status == "LISTEN"])
        udp_count = len([c for c in conns if c.type == 2])
        total_sockets = len(conns)
    except Exception:
        tcp_est, tcp_listen, udp_count, total_sockets = 0, 0, 0, 0

    return {
        "gateway_mac": gateway_mac or "N/A",
        "gateway_vendor": gateway_vendor,
        "active_lan_devices_count": len(neighbors),
        "lan_devices": neighbors[:8],
        "sockets": {
            "established_tcp": tcp_est,
            "listening_tcp_ports": tcp_listen,
            "udp_sockets": udp_count,
            "total_open_sockets": total_sockets
        }
    }


def inspect_system_network() -> Dict[str, Any]:
    """
    Comprehensive host network and system topology scan.
    """
    ps_meta = get_powershell_metadata()
    ps_routes = get_powershell_routes()
    ps_dns = get_powershell_dns()
    default_outgoing_ip = get_default_outgoing_ip()

    physical_adapters = []
    vpn_adapters = []
    virtual_adapters = []

    try:
        net_addrs = psutil.net_if_addrs()
        net_stats = psutil.net_if_stats()
    except Exception as e:
        logger.error(f"Error accessing psutil net interfaces: {e}")
        net_addrs, net_stats = {}, {}

    all_interfaces = []

    for name, addr_list in net_addrs.items():
        if name.startswith("Loopback") or name == "lo":
            continue

        stat = net_stats.get(name)
        is_up = stat.isup if stat else True

        meta = ps_meta.get(name, {})
        desc = meta.get("InterfaceDescription", name)
        mac = meta.get("MacAddress", "")
        speed = meta.get("LinkSpeed", "") or (f"{stat.speed} Mbps" if (stat and stat.speed) else "Unknown")
        mtu = stat.mtu if stat else None

        ipv4_addrs = [a.address for a in addr_list if a.family == socket.AF_INET and not a.address.startswith("127.")]
        ipv6_addrs = [a.address for a in addr_list if a.family == socket.AF_INET6 and not a.address.startswith("fe80::") and a.address != "::1"]
        netmasks = [a.netmask for a in addr_list if a.family == socket.AF_INET and not a.address.startswith("127.")]

        if not ipv4_addrs and not ipv6_addrs:
            continue

        primary_ipv4 = ipv4_addrs[0] if ipv4_addrs else None
        primary_ipv6 = ipv6_addrs[0] if ipv6_addrs else None
        primary_netmask = netmasks[0] if netmasks else None

        if primary_ipv4 and primary_ipv4.startswith("169.254.") and not is_up:
            continue

        route_info = ps_routes.get(name, {})
        gateway = route_info.get("NextHop")
        route_metric = route_info.get("RouteMetric")
        dns_servers = ps_dns.get(name, [])

        name_lower = name.lower()
        desc_lower = desc.lower()

        is_vpn = any(k in name_lower or k in desc_lower for k in VPN_INTERFACE_KEYWORDS)
        is_vm = any(k in name_lower or k in desc_lower for k in VIRTUAL_MACHINE_KEYWORDS)

        net_calc = calculate_network_range(primary_ipv4, primary_netmask)
        vendor = resolve_mac_vendor(mac)

        adapter_dict = {
            "name": name,
            "description": desc,
            "mac_address": mac,
            "vendor": vendor,
            "is_up": is_up,
            "speed": speed,
            "mtu": mtu,
            "ipv4": primary_ipv4,
            "ipv6": primary_ipv6,
            "netmask": primary_netmask,
            "cidr": net_calc.get("cidr"),
            "network_ip": net_calc.get("network_address"),
            "broadcast_ip": net_calc.get("broadcast_address"),
            "gateway": gateway,
            "route_metric": route_metric,
            "dns_servers": dns_servers,
            "is_default_outgoing": (primary_ipv4 == default_outgoing_ip) if primary_ipv4 else False,
            "is_vpn": is_vpn,
            "is_virtual_machine": is_vm
        }

        all_interfaces.append(adapter_dict)

        if is_vpn:
            vpn_adapters.append(adapter_dict)
        elif is_vm:
            virtual_adapters.append(adapter_dict)
        elif is_up and primary_ipv4 and not primary_ipv4.startswith("169.254."):
            physical_adapters.append(adapter_dict)

    primary_physical = None
    for ad in physical_adapters:
        if ad.get("gateway"):
            primary_physical = ad
            break
    if not primary_physical and physical_adapters:
        primary_physical = physical_adapters[0]

    primary_vpn = None
    for ad in vpn_adapters:
        if ad.get("is_up") and (ad.get("ipv4") or ad.get("ipv6")):
            primary_vpn = ad
            break

    dns_leak_suspected = False
    active_dns = []
    if primary_vpn:
        vpn_dns = primary_vpn.get("dns_servers", [])
        phys_dns = primary_physical.get("dns_servers", []) if primary_physical else []
        active_dns = vpn_dns or phys_dns
        if not vpn_dns and primary_physical and primary_physical.get("gateway") in phys_dns:
            dns_leak_suspected = True
    elif primary_physical:
        active_dns = primary_physical.get("dns_servers", [])

    # Extract System Hardware and Network Recon
    hardware_identity = get_system_hardware_identity()
    network_recon = get_network_recon_info(primary_physical.get("gateway") if primary_physical else None)

    return {
        "primary_physical_adapter": primary_physical,
        "primary_vpn_adapter": primary_vpn,
        "physical_lan_ip": primary_physical.get("ipv4") if primary_physical else None,
        "network_gateway": primary_physical.get("gateway") if primary_physical else None,
        "network_cidr": primary_physical.get("cidr") if primary_physical else None,
        "network_ip": primary_physical.get("network_ip") if primary_physical else None,
        "subnet_mask": primary_physical.get("netmask") if primary_physical else None,
        "dns_servers": active_dns,
        "dns_leak_suspected": dns_leak_suspected,
        "default_outgoing_ip": default_outgoing_ip,
        "vpn_tunnel_active": bool(primary_vpn is not None),
        "vpn_tunnel_ip": primary_vpn.get("ipv4") if primary_vpn else None,
        "vpn_tunnel_ipv6": primary_vpn.get("ipv6") if primary_vpn else None,
        "all_interfaces": all_interfaces,
        "vpn_adapters": vpn_adapters,
        "physical_adapters": physical_adapters,
        "virtual_adapters": virtual_adapters,
        "hardware_identity": hardware_identity,
        "network_recon": network_recon
    }
