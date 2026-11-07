# api.py
"""
Unified entry point for the VPN Analyzer Web Application & Intelligence API.
Runs the high-performance FastAPI server serving both the Web Dashboard and REST API.
"""

import uvicorn
from backend.api import app

if __name__ == "__main__":
    print("=" * 68)
    print("      VPN DETECTOR — ADVANCED NETWORK & FORENSIC ANALYZER      ")
    print("=" * 68)
    print("  • Web Dashboard:        http://127.0.0.1:8000")
    print("  • Interactive API Docs: http://127.0.0.1:8000/docs")
    print("  • Legacy Analyze API:   http://127.0.0.1:8000/analyze")
    print("=" * 68)
    uvicorn.run("backend.api:app", host="0.0.0.0", port=8000, reload=False)
