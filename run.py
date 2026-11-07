# run.py
"""
Convenience launcher: Starts the VPN Analyzer server and automatically
opens the interactive Web Dashboard in your default web browser.
"""

import sys
import threading
import time
import webbrowser
import uvicorn

def open_browser():
    time.sleep(1.2)
    url = "http://127.0.0.1:8000"
    print(f"\n[+] Opening Web Dashboard in default browser: {url} ...\n")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"[!] Could not launch browser automatically: {e}")

if __name__ == "__main__":
    print("=" * 68)
    print("        LAUNCHING VPN DETECTOR ENTERPRISE WEB DASHBOARD        ")
    print("=" * 68)
    print("  • Starting server at:  http://127.0.0.1:8000")
    print("  • Swagger OpenAPI Doc: http://127.0.0.1:8000/docs")
    print("  • Press Ctrl+C to terminate.")
    print("=" * 68)

    # Launch browser in a background thread after server start
    threading.Thread(target=open_browser, daemon=True).start()

    try:
        uvicorn.run("backend.api:app", host="127.0.0.1", port=8000, reload=False, log_level="info")
    except KeyboardInterrupt:
        print("\n[*] Server shutdown cleanly.")
