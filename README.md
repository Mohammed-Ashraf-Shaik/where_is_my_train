# RailPulse AI - Where Is My Train: Live Reality Tracker 🚆⚡

> **Next-Generation Railway Tracking Engine with Real-Time Physics, 2.5D Realistic Track Dynamics, Multi-Perspective Cockpit/Platform Cameras, Procedural Rail Audio & Gemini AI Travel Suite.**

Inspired by the iconic *Where is my Train* app and supercharged with modern web capabilities, **RailPulse AI** brings train tracking to life. Experience trains moving dynamically on physical tracks with realistic acceleration, authentic railway signals, procedural wheel-on-rail acoustic simulation, cab cockpit simulator, and cutting-edge AI tools for delay forecasting, crowd prediction, and voice assistance.

---

## 🌟 Key Highlights

### 🚅 1. Realistic Track & Physics Simulation
- **Dynamic Track Geometry**: Dual-rail tracks with cross-ties (sleepers), ballast grading, switches/turnouts, and overhead electrification (OHE) catenaries.
- **Physical Acceleration & Braking**: Smooth speed interpolation up to 160 km/h (Vande Bharat & Rajdhani speeds), realistic station deceleration curves, and platform dwell times.
- **Live Signal System**: 4-aspect automated railway signaling (Green, Double Yellow, Yellow, Red) responding to block occupation and upcoming station stops.
- **Multi-Perspective Cameras**:
  - 🛰️ **Aerial Track Follow Cam**: Dynamic orbital view following the train through curves and stations.
  - 🚆 **Driver Cockpit HUD**: Full windshield view with analog & digital speedometer dials, throttle indicator, upcoming signal aspects, and gradient indicators.
  - 🚉 **Station Platform View**: 2.5D station perspective showing the train pulling in, coach alignment, and passenger zones.

### 🔊 2. Procedural Web Audio Engine (Zero Asset Loading)
- **Locomotive Engine Dynamics**: Electric AC traction inverter whine and diesel rumble shifting frequency with train velocity.
- **Wheel-Rail Clatter**: Realistic rhythmic `clack-clack` track acoustics dynamically synced to current km/h.
- **Pneumatic Dual-Tone Horn**: Authentic high/low railway horn with stereo reverb and Doppler effects.
- **Station Announcements**: Synthesized railway chime + AI vocal announcements ("Train 12431 arriving on Platform 1").

### 🤖 3. Modern AI Suite
- **RailGemini Voice & Chat Copilot**: Natural language query assistant for live status, platform side predictions, food recommendations, and PNR insights.
- **AI Delay & Punctuality Forecaster**: Neural simulation model evaluating weather (fog/monsoon), corridor congestion, and sectional speed limits to predict dynamic arrival times.
- **Platform Crowd & Coach Heatmap**: AI estimation of boarding crowd density across unreserved, sleeper, and AC coaches.
- **Smart Geofence Wake-Up Alarm**: GPS distance trigger that alerts sleeping passengers 15 minutes before their destination station.
- **Offline Cell-Tower Triangulation**: Emulates tracking without internet using cellular tower handovers and timetable progression.

---

## 🚀 Quick Start

### Option 1: Direct Browser Launch
Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local Python Server
```bash
python server.py
# Opens at http://localhost:8000
```

---

## 🛠️ Technology Stack
- **Frontend**: Vanilla ES6+ Modules, HTML5 Canvas 2D/2.5D, Modern CSS3 Glassmorphism
- **Styling**: Tailwind CSS & Custom Railway Cyber-Luminescent Design System
- **Audio**: Web Audio API (procedural oscillator networks & filters)
- **AI**: Web Speech Recognition, Web Speech Synthesis, Heuristic Predictive Models
- **Icons**: Lucide Modern Vector Icons

---

Designed with ❤️ for Indian Railways and commuters worldwide.
