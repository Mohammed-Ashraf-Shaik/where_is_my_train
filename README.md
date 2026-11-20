# RailPulse - Where Is My Train: Live Reality Tracker 🚆⚡

[![Live Website](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-282B4A?style=for-the-badge&logo=github)](https://mohammed-ashraf-shaik.github.io/where_is_my_train/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-F26419?style=for-the-badge&logo=github)](https://github.com/Mohammed-Ashraf-Shaik/where_is_my_train)
[![License](https://img.shields.io/badge/License-MIT-EEEBDA?style=for-the-badge)](LICENSE)

> 🌐 **Live Production Website**: [https://mohammed-ashraf-shaik.github.io/where_is_my_train/](https://mohammed-ashraf-shaik.github.io/where_is_my_train/)

**RailPulse** is a next-generation railway tracking engine designed with an editorial **Midnight Indigo (`#282B4A`)** and **Vanilla (`#EEEBDA`)** aesthetic. Built with real-time kinematic physics, high-fidelity 2.5D track dynamics, driver cab & platform cameras, procedural Web Audio acoustics, offline PWA caching, and an Indian Railways travel suite inspired by the legendary *Where is my Train* app.

---

## 🎨 Midnight Indigo & Vanilla Design System
- **Primary Background**: Midnight Indigo (`#282B4A`) with deep layers (`#1C1E34`) and elevated transit card surfaces (`#32365C`).
- **Primary Foreground**: Crisp Vanilla (`#EEEBDA`) with muted utility labels (`#C8C5B4`).
- **Transit Accents**: Warm Transit Orange (`#F26419`), Signal Green (`#2EC4B6`), Signal Amber (`#F6AE2D`), and Danger Red (`#E71D36`).
- **Clean Editorial Typography**: Human-crafted railway transit aesthetic free of generic robotic/neon cyber clichés.

---

## 🌟 Key Features & Systems

### 🚅 1. Realistic Track & Physics Simulation
- **Dynamic Track Geometry**: Dual broad-gauge rails with concrete sleepers, ballast shoulders, catenary electrification (OHE) poles, and 4-aspect automated block signaling.
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

### 📶 2. Progressive Web App (PWA) & Offline In-Train Mode
- **Offline Service Worker (`sw.js`)**: Cache-first strategy for static assets and timetables.
- **Zero-Signal Dead Reckoning**: Tracks movement inside steel passenger coaches using cached schedules, GSM cell towers, and kinematic dead reckoning without requiring active cellular internet.
- **Installable Web App**: Standard `manifest.json` enabling installation on Android, iOS, and Desktop.

### 🚶 3. Platform Walk Distance & FOB Coach Door Locator
- **Foot Overbridge (FOB) Distance Calculator**: Computes exact walking distance in meters from Main Entrance, Central FOB 1, North FOB 2, or Platform Escalators to your specific coach door.
- **Walking Time Estimation**: Predicts walking duration at normal pace and with heavy luggage.
- **Interactive 2D Platform Strip**: Visual schematic of a 600m platform showing FOB positions, platform edge safety lines, and active coach door positions.

### 🛤️ 4. Track Topology, 25kV Neutral Section & Caution Orders
- **Neutral Section (Phase Break) Alert**: Simulates 25kV OHE dead zones with countdown timer for Vacuum Circuit Breaker (VCB) operation.
- **Caution Orders & Speed Limits**: Permanent Speed Restrictions (PSR) for sharp curvature, bridge crossings, and manned level crossing gates.
- **Elevation & Gradient Incline**: Real-time track ruling gradient (1 in 150) and elevation AMSL.

### 🔊 5. Procedural Web Audio & Multilingual Station Announcer
- **Locomotive Engine Acoustics**: Electric AC traction inverter whine and diesel rumble shifting frequency with train velocity.
- **Wheel-Rail Clatter**: Realistic rhythmic `clack-clack` track acoustics dynamically synced to current km/h.
- **Pneumatic Dual-Tone Horn**: Authentic Indian Railway high/low horn with stereo reverb.
- **Conductor Soundboard**: Guard pea whistle (`哨`), level-crossing ding bell (`🔔`), air brake pressure release, and IRCTC station chimes.
- **Bilingual PA System**: Procedural station arrival & departure voice announcements in Hindi (*"यात्रीगण कृपया ध्यान दें..."*) and English (*"May I have your attention please..."*).

### 🤖 6. AI Travel Suite & Passenger Convenience
1. 🤖 **RailGemini Voice & Chat Assistant**: Natural language travel assistant with Web Speech Recognition (voice mic input) and Web Speech Synthesis (railway announcer vocal output).
2. ⏱️ **AI Delay & Punctuality Forecaster**: Multi-factor model accounting for weather conditions, section line congestion (30% to 140%), and embedded schedule slack buffers.
3. 👥 **AI Platform Crowd & Coach Heatmap**: Predicts platform foot-overbridge congestion, staircase rush, and per-coach rush percent.
4. 📡 **Offline Cell-Tower Triangulator & Smart Alarm**: Geofenced 15-minute wake-up alarm so you never sleep past your destination!
5. 🚃 **Interactive Coach Position & PNR Status**: Full train rake formation, seat berth grid, AI confirmation prediction, and 1-click **WhatsApp Live Trip Sharing**.
6. 🚉 **Live Station Board & Cross-Country Train Search**: Electronic arrival/departure signboards for major Indian junction stations.
7. 🪑 **3D Coach Berth Map & Seat Inspector**: Detailed seat matrix for Chair Car (CC), Executive (EC), 3-Tier AC (3A), and 2-Tier AC (2A).
8. 🍱 **IRCTC e-Catering & Famous Station Food**: Explores GI-tagged culinary specialties across stations with simulated seat delivery.
9. ⚡ **Traction Energy & Ride Vibration Index**: Real-time regenerative braking energy meter (kWh fed back to grid), tractive effort (kN), and G-force ride quality.
10. 🚨 **RailMadad Emergency SOS & Medical Unit**: Immediate dispatch alert with GPS coordinates, coach ID, and nearest railway hospital locator.

---

## 🚀 Live Deployment Guide

### GitHub Pages (Automated via GitHub Actions)
1. Repository: [https://github.com/Mohammed-Ashraf-Shaik/where_is_my_train](https://github.com/Mohammed-Ashraf-Shaik/where_is_my_train)
2. Go to **Settings** ➔ **Pages** (left sidebar).
3. Under **Build and deployment** ➔ **Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow publishes the site to:
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
