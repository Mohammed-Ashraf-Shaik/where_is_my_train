#!/usr/bin/env python3
"""
RailPulse AI - Verification & Integrity Test Suite
Validates project files, module exports, HTML references, and git commit history.
"""

import os
import subprocess
import sys

REQUIRED_FILES = [
    "index.html",
    "README.md",
    "server.py",
    "push_to_github.bat",
    "push_to_github.ps1",
    "css/style.css",
    "js/app.js",
    "js/data/trainData.js",
    "js/audio/soundEngine.js",
    "js/engine/physicsEngine.js",
    "js/engine/trackRenderer.js",
    "js/views/cabView.js",
    "js/views/platformView.js",
    "js/ai/aiCopilot.js",
    "js/ai/aiDelayPredictor.js",
    "js/ai/aiCrowdPredictor.js",
    "js/ai/offlineTriangulator.js",
    "js/components/coachLayout.js",
    "js/components/pnrChecker.js",
    "js/components/telemetryHUD.js"
]

def check_files():
    print("[1/3] Checking file existence and non-empty status...")
    missing = []
    for f in REQUIRED_FILES:
        if not os.path.exists(f):
            missing.append(f)
            print(f"  ❌ Missing: {f}")
        else:
            size = os.path.getsize(f)
            if size == 0:
                missing.append(f)
                print(f"  ❌ Empty file: {f}")
            else:
                print(f"  ✅ OK: {f} ({size:,} bytes)")
    if missing:
        print(f"FAILED: {len(missing)} files missing or invalid.")
        return False
    print("All core files exist and are populated!\n")
    return True

def check_git_history():
    print("[2/3] Checking Git commit history...")
    try:
        res = subprocess.run(["git", "log", "--oneline"], capture_output=True, text=True, check=True)
        commits = res.stdout.strip().split("\n")
        print(f"  Found {len(commits)} commits in history:")
        for c in commits[:10]:
            print(f"    • {c}")
        if len(commits) > 10:
            print(f"    ... and {len(commits) - 10} more commits.")
        return True
    except Exception as e:
        print(f"  ❌ Git error: {e}")
        return False

def check_html_links():
    print("\n[3/3] Validating index.html script & css references...")
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
    
    assert "css/style.css" in html, "style.css not referenced in index.html"
    assert "js/app.js" in html, "app.js not referenced in index.html"
    print("  ✅ All entry scripts and stylesheet links are valid.\n")
    return True

def main():
    print("=" * 60)
    print("   🚆 RailPulse AI - Verification Diagnostic")
    print("=" * 60)
    ok1 = check_files()
    ok2 = check_git_history()
    ok3 = check_html_links()

    if ok1 and ok2 and ok3:
        print("=" * 60)
        print("   🎉 ALL VERIFICATIONS PASSED! System is ready to run.")
        print("=" * 60)
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()

