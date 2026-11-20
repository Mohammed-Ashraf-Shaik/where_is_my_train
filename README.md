# RailPulse AI - Where Is My Train: Live Reality Tracker 🚆⚡

[![Live Website](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-00e5ff?style=for-the-badge&logo=github)](https://mohammed-ashraf-shaik.github.io/where_is_my_train/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-10b981?style=for-the-badge&logo=github)](https://github.com/Mohammed-Ashraf-Shaik/where_is_my_train)
[![License](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

> **Live Production Website**: [https://mohammed-ashraf-shaik.github.io/where_is_my_train/](https://mohammed-ashraf-shaik.github.io/where_is_my_train/)

**RailPulse AI** is a next-generation railway tracking engine with real-time physics, high-fidelity 2.5D track dynamics, multi-perspective cockpit/platform cameras, procedural Web Audio acoustics, dynamic weather FX, and a Gemini AI travel suite. Inspired by the legendary *Where is my Train* app and re-imagined for the modern web.

---

## 🌟 Key Highlights & Extra Features

### 🚅 1. Realistic Track & Physics Simulation
- **Dynamic Track Geometry**: Dual broad-gauge rails with concrete sleepers (ties), textured ballast shoulders, catenary electrification (OHE) poles, and 4-aspect automated block signaling.
- **Physical Acceleration & Braking**: Smooth speed interpolation up to 160 km/h (Vande Bharat & Rajdhani line speeds), station deceleration curves, and platform dwell countdowns.
- **Dynamic Weather FX**: Real-time atmospheric effects rendered onto the tracks:
  - ☀️ **Clear**: Crisp sunny tracks with specular sheen.
  - 🌧️ **Monsoon Rain**: Realistic angled rain particles with ballast water splashes.
  - 🌫️ **Dense Fog**: Volumetric fog mist with reduced headlight visibility.
  - ⚡ **Thunderstorm**: Lightning flashes illuminating the railway corridor.
- **Multi-Perspective Cameras**:
  - 🛰️ **Aerial Track Follow**: Dynamic camera tracking the train along geographical curves and stations.
  - 🚆 **Cab Windshield HUD**: First-person locomotive driver cockpit with Kavach TCAS, ammeters, signal repeaters, and throttle notch.
  - 🚉 **Station Platform 2.5D**: Platform view showing the train pulling in, passenger boarding zones, and digital LED arrival boards.

### 🔊 2. Procedural Web Audio Engine (Zero External Audio Assets)
- **Locomotive Engine Dynamics**: Electric AC traction inverter whine and diesel rumble shifting frequency with train velocity.
- **Wheel-Rail Clatter**: Realistic rhythmic `clack-clack` track acoustics dynamically synced to current km/h.
- **Pneumatic Dual-Tone Horn**: Authentic Indian Railway high/low horn with stereo reverb.
- **Conductor Soundboard**: Guard pea whistle (`哨`), level-crossing ding bell (`🔔`), air brake pressure release, and authentic IRCTC station chimes.
- **Multilingual Announcements**: Procedural vocal station arrival announcements in both Hindi & English.

### 🤖 3. Comprehensive 9-Module AI & Travel Suite
1. 🤖 **RailGemini Voice & Chat Assistant**: Natural language travel assistant with Web Speech Recognition (voice mic input), Web Speech Synthesis (railway announcer vocal output), context-aware responses on train location, speed, arrival platform sides, amenities, food/pantry, and safety.
2. ⏱️ **AI Delay & Punctuality Neural Forecaster**: Multi-factor model taking into account weather conditions (fog, monsoon, heat), section line congestion (30% to 140%), and embedded schedule slack buffers to compute dynamic arrival probability and risk rating.
3. 👥 **AI Platform Crowd & Coach Heatmap**: Predicts platform foot-overbridge congestion, staircase rush, recommended boarding times, and per-coach rush percent (General vs 3AC vs 2AC vs 1A).
4. 📡 **Offline Cell-Tower Triangulator & Smart Alarm**: Emulates the hallmark feature of the real Where Is My Train app (tracking inside steel coaches using GSM cell towers & schedule extrapolation without internet) + GPS geofenced 15-minute wake-up alarm!
5. 🚃 **Interactive Coach Position Locator & PNR Status**: Visualizes full train rake formation, distance from Foot Overbridge, seat berth grid, and AI booking confirmation prediction.
6. 🚉 **Live Station Board & Cross-Country Train Search**: Electronic arrival/departure signboards for major Indian junction stations with instant "Track Live" routing.
7. 🪑 **3D Coach Berth Map & Seat Inspector**: Detailed seat matrix for Chair Car (CC), Executive (EC), 3-Tier AC (3A), and 2-Tier AC (2A) with Lower/Middle/Upper/Window berth classification.
8. 🍱 **IRCTC e-Catering & Famous Station Food**: Explores GI-tagged culinary specialties across stations (Agra Petha, Ratlami Sev, Banarasi Malaiyyo, Kanpuri Thaggu Laddu) with simulated seat delivery.
9. ⚡ **Traction Energy & Ride Vibration Index**: Real-time regenerative braking energy meter (kWh fed back to grid), tractive effort (kN), G-force ride quality, and route elevation AMSL profile.
10. 🚨 **RailMadad Emergency SOS & Medical Unit**: Immediate dispatch alert with GPS coordinates, coach ID, and nearest railway hospital locator.

---

## 🚀 Live Deployment Guide

### GitHub Pages (Automated via GitHub Actions)
1. In your GitHub repository: [https://github.com/Mohammed-Ashraf-Shaik/where_is_my_train](https://github.com/Mohammed-Ashraf-Shaik/where_is_my_train)
2. Go to **Settings** ➔ **Pages** (left sidebar).
3. Under **Build and deployment** ➔ **Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow will automatically publish the site to:
   👉 **[https://mohammed-ashraf-shaik.github.io/where_is_my_train/](https://mohammed-ashraf-shaik.github.io/where_is_my_train/)**

### Local Development Preview
Run the local preview server:
```powershell
python server.py
# Opens automatically at http://localhost:8000
```
Or simply open `index.html` in any modern web browser.

---

## 🎮 Keyboard Controls & Shortcuts
- `Space` — Sound Locomotive Horn
- `W` — Accelerate Throttle
- `S` — Emergency Brake / Decelerate
- `C` — Cycle Camera Views (Aerial ➔ Cab Windshield ➔ Station Platform)
- `M` — Mute/Unmute Audio Engine

---

Designed with ❤️ for Indian Railways travelers and commuters worldwide.
