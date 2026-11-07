# build_map.py
"""
Calibrated Vector World Map Generator (Equirectangular 1000x500)
Features:
- Accurate country boundaries across all continents
- Standard 2:1 Plate Carrée projection with sub-pixel mathematical precision
- Sleek, uniform tactical styling across all nations (dynamic highlights handled via React layer)
- Coordinate axes, equator, and prime meridian
"""

import json
from pathlib import Path

geo_file = Path(r"C:\E\Project\vpn analyzer\frontend\world.geo.json")
out_svgs = [
    Path(r"C:\E\Project\vpn analyzer\frontend\world_map.svg"),
    Path(r"C:\E\Project\vpn analyzer\frontend-react\public\world_map.svg"),
    Path(r"C:\E\Project\vpn analyzer\frontend-react\dist\world_map.svg"),
]

with open(geo_file, "r", encoding="utf-8") as f:
    geo = json.load(f)

width = 1000
height = 500

world_paths = []

for feat in geo.get("features", []):
    geom = feat.get("geometry", {})
    gtype = geom.get("type")
    coords = geom.get("coordinates", [])

    def ring_to_path(ring):
        d_parts = []
        for i, pt in enumerate(ring):
            lon, lat = pt[0], pt[1]
            x = (lon + 180.0) / 360.0 * width
            y = (90.0 - lat) / 180.0 * height
            cmd = "M" if i == 0 else "L"
            d_parts.append(f"{cmd}{x:.2f},{y:.2f}")
        d_parts.append("Z")
        return "".join(d_parts)

    if gtype == "Polygon":
        for ring in coords:
            world_paths.append(ring_to_path(ring))
    elif gtype == "MultiPolygon":
        for poly in coords:
            for ring in poly:
                world_paths.append(ring_to_path(ring))

# Grid lines every 30 degrees
grid_lines = []
for lat_deg in range(-60, 90, 30):
    y = (90.0 - lat_deg) / 180.0 * height
    stroke_opacity = 0.2 if lat_deg == 0 else 0.07
    stroke_dash = "4 4" if lat_deg == 0 else "2 4"
    grid_lines.append(f'<line x1="0" y1="{y:.1f}" x2="{width}" y2="{y:.1f}" stroke="#38bdf8" stroke-opacity="{stroke_opacity}" stroke-dasharray="{stroke_dash}" stroke-width="0.75"/>')

for lon_deg in range(-150, 180, 30):
    x = (lon_deg + 180.0) / 360.0 * width
    stroke_opacity = 0.25 if lon_deg == 0 else 0.07
    stroke_dash = "4 4" if lon_deg == 0 else "2 4"
    grid_lines.append(f'<line x1="{x:.1f}" y1="0" x2="{x:.1f}" y2="{height}" stroke="#38bdf8" stroke-opacity="{stroke_opacity}" stroke-dasharray="{stroke_dash}" stroke-width="0.75"/>')

svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%" preserveAspectRatio="none">
  <defs>
    <!-- Deep Obsidian / Navy Tactical Ocean Canvas -->
    <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0a1020"/>
      <stop offset="100%" stop-color="#030712"/>
    </radialGradient>
    
    <!-- Subtle Grid Dot Pattern -->
    <pattern id="gridDots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.6" fill="rgba(56, 189, 248, 0.08)"/>
    </pattern>
  </defs>

  <!-- Ocean Base -->
  <rect width="{width}" height="{height}" fill="url(#oceanGrad)"/>
  
  <!-- Dot Grid -->
  <rect width="{width}" height="{height}" fill="url(#gridDots)"/>

  <!-- Lat / Lon Equirectangular Grid Lines -->
  {' '.join(grid_lines)}

  <!-- World Continents & Landmasses (Uniform Professional Tactical Styling) -->
  <path d="{' '.join(world_paths)}" fill="#141e33" stroke="#253554" stroke-width="0.6" stroke-linejoin="round"/>
</svg>"""

for p in out_svgs:
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated {p} ({len(svg_content)} bytes)")
