/**
 * RailPulse AI - Main Application Coordinator & Simulation Loop
 * Integrates rendering, physics, audio, AI tools, camera views and user interaction
 */

import { TRAIN_DATABASE } from "./data/trainData.js";
import { soundEngine } from "./audio/soundEngine.js";
import { TrainPhysicsEngine } from "./engine/physicsEngine.js";
import { TrackRenderer } from "./engine/trackRenderer.js";
import { CabView } from "./views/cabView.js";
import { PlatformView } from "./views/platformView.js";
import { RailGeminiCopilot } from "./ai/aiCopilot.js";
import { AIDelayPredictor } from "./ai/aiDelayPredictor.js";
import { AICrowdPredictor } from "./ai/aiCrowdPredictor.js";
import { OfflineTriangulator } from "./ai/offlineTriangulator.js";
import { CoachLayoutComponent } from "./components/coachLayout.js";
import { PNRCheckerComponent } from "./components/pnrChecker.js";
import { TelemetryHUD } from "./components/telemetryHUD.js";
import { LiveStationBoardComponent } from "./components/liveStationBoard.js";
import { BerthInspectorComponent } from "./components/berthInspector.js";
import { ECateringComponent } from "./components/eCatering.js";
import { AdvancedTelemetryComponent } from "./components/advancedTelemetry.js";
import { EmergencyAidAI } from "./ai/emergencyAidAI.js";
import { StationAnnouncementPack } from "./audio/announcementPack.js";

class RailPulseApp {
  constructor() {
    this.currentTrain = TRAIN_DATABASE[0]; // Default: 22436 Vande Bharat
    this.activeCamera = "aerial"; // "aerial" | "cab" | "platform"
    this.isNightMode = true;
    this.simSpeed = 1;

    // Subsystems
    this.sound = soundEngine;
    this.physics = new TrainPhysicsEngine(this.currentTrain, this.sound);
    this.copilot = new RailGeminiCopilot(this.sound);
    this.delayPredictor = new AIDelayPredictor();
    this.crowdPredictor = new AICrowdPredictor();
    this.triangulator = new OfflineTriangulator(this.sound);
    this.emergencyAid = new EmergencyAidAI(this.sound);
    this.announcements = new StationAnnouncementPack(this.sound);

    // Renderers & Views
    this.trackCanvas = document.getElementById("trackCanvas");
    this.trackRenderer = new TrackRenderer(this.trackCanvas);
    this.cabView = new CabView(document.getElementById("cabContainer"));
    this.platformView = new PlatformView(document.getElementById("platformContainer"));

    // UI Components
    this.telemetryHUD = new TelemetryHUD("telemetryHUDContainer", this.physics, this.sound);
    this.coachLayout = new CoachLayoutComponent("coachLayoutContainer");
    this.pnrChecker = new PNRCheckerComponent("pnrCheckerContainer");
    this.stationBoard = new LiveStationBoardComponent("liveStationBoardContainer", (trainId) => {
      const found = TRAIN_DATABASE.find(t => t.id === trainId);
      if (found) {
        const select = document.getElementById("trainSelect");
        if (select) select.value = trainId;
        this.setupTrainContext(found);
      }
    });
    this.berthInspector = new BerthInspectorComponent("berthInspectorContainer");
    this.eCatering = new ECateringComponent("eCateringContainer");
    this.advancedTelemetry = new AdvancedTelemetryComponent("advancedTelemetryContainer");

    // Timing
    this.lastTime = performance.now();
  }

  init() {
    // 1. Setup Train & Context across engines
    this.setupTrainContext(this.currentTrain);

    // 2. Populate Train Selector dropdown
    this.initTrainSelector();

    // 3. Setup Navigation & Camera Switcher
    this.initCameraControls();

    // 4. Setup AI Feature Tabs
    this.initAITabs();

    // 5. Setup RailGemini Chat & Voice
    this.initCopilotUI();

    // 6. Setup Offline Triangulation & Geofence Alarm
    this.initOfflineUI();

    // 7. Setup Header Controls (Theme, Speed, Audio)
    this.initHeaderControls();

    // 8. Bind Keyboard Shortcuts
    this.initKeyboardShortcuts();

    // 9. Weather & Soundboard Handlers
    this.initWeatherControls();
    this.initSoundboardControls();

    // 10. Initial UI Render
    this.coachLayout.render(this.currentTrain);
    this.pnrChecker.render();
    this.stationBoard.render();
    this.berthInspector.render();
    this.eCatering.render();
    this.renderDelayPredictor();
    this.renderCrowdPredictor();
    this.renderOfflineTriangulator();

    // 11. Start Animation & Simulation Loop
    requestAnimationFrame((t) => this.loop(t));
  }

  setupTrainContext(train) {
    this.currentTrain = train;
    this.physics.setTrain(train);
    this.trackRenderer.setTrain(train, this.physics);
    this.cabView.setPhysics(this.physics, this.sound);
    this.platformView.setPhysics(this.physics, train);
    this.copilot.setContext(this.physics, train);

    // Update Header Badges
    const metaTrain = document.getElementById("activeTrainMeta");
    const metaSector = document.getElementById("activeSectorMeta");
    const delayText = document.getElementById("headerDelayText");
    const delayBadge = document.getElementById("headerDelayBadge");

    if (metaTrain) metaTrain.textContent = `${train.number} ${train.name}`;
    if (metaSector) metaSector.textContent = `${train.origin} ➔ ${train.destination}`;
    if (delayText) delayText.textContent = train.delayStatus;

    if (delayBadge) {
      if (train.delayMinutes === 0) {
        delayBadge.className = "badge-pill bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/40 flex items-center space-x-1.5";
      } else if (train.delayMinutes <= 10) {
        delayBadge.className = "badge-pill bg-[#F6AE2D]/20 text-[#F6AE2D] border border-[#F6AE2D]/40 flex items-center space-x-1.5";
      } else {
        delayBadge.className = "badge-pill bg-[#E71D36]/20 text-[#E71D36] border border-[#E71D36]/40 flex items-center space-x-1.5";
      }
    }
  }

  initTrainSelector() {
    const select = document.getElementById("trainSelect");
    if (!select) return;

    select.innerHTML = TRAIN_DATABASE.map(t => `
      <option value="${t.id}" ${t.id === this.currentTrain.id ? 'selected' : ''}>
        🚆 ${t.number} - ${t.name} (${t.origin} to ${t.destination})
      </option>
    `).join("");

    select.addEventListener("change", (e) => {
      const train = TRAIN_DATABASE.find(t => t.id === e.target.value);
      if (train) {
        this.setupTrainContext(train);
        this.coachLayout.render(train);
        this.renderDelayPredictor();
        this.renderCrowdPredictor();
        this.renderOfflineTriangulator();
      }
    });
  }

  initCameraControls() {
    const btnAerial = document.getElementById("viewBtnAerial");
    const btnCab = document.getElementById("viewBtnCab");
    const btnPlatform = document.getElementById("viewBtnPlatform");

    const trackCanvas = document.getElementById("trackCanvas");
    const cabContainer = document.getElementById("cabContainer");
    const platformContainer = document.getElementById("platformContainer");

    const setCamera = (mode) => {
      this.activeCamera = mode;
      [btnAerial, btnCab, btnPlatform].forEach(b => b.classList.remove("active"));
      trackCanvas.classList.add("hidden");
      cabContainer.classList.add("hidden");
      platformContainer.classList.add("hidden");

      if (mode === "aerial") {
        btnAerial.classList.add("active");
        trackCanvas.classList.remove("hidden");
        this.trackRenderer.resize();
      } else if (mode === "cab") {
        btnCab.classList.add("active");
        cabContainer.classList.remove("hidden");
        this.cabView.resize();
      } else if (mode === "platform") {
        btnPlatform.classList.add("active");
        platformContainer.classList.remove("hidden");
        this.platformView.resize();
      }
    };

    btnAerial?.addEventListener("click", () => setCamera("aerial"));
    btnCab?.addEventListener("click", () => setCamera("cab"));
    btnPlatform?.addEventListener("click", () => setCamera("platform"));
  }

  initAITabs() {
    const tabs = [
      { btn: "tabBtnCopilot", panel: "tabContentCopilot" },
      { btn: "tabBtnDelay", panel: "tabContentDelay" },
      { btn: "tabBtnCrowd", panel: "tabContentCrowd" },
      { btn: "tabBtnOffline", panel: "tabContentOffline" },
      { btn: "tabBtnCoaches", panel: "tabContentCoaches" },
      { btn: "tabBtnStationBoard", panel: "tabContentStationBoard" },
      { btn: "tabBtnBerths", panel: "tabContentBerths" },
      { btn: "tabBtnCatering", panel: "tabContentCatering" },
      { btn: "tabBtnDynamics", panel: "tabContentDynamics" }
    ];

    tabs.forEach(t => {
      const btn = document.getElementById(t.btn);
      btn?.addEventListener("click", () => {
        tabs.forEach(o => {
          document.getElementById(o.btn)?.classList.remove("active", "bg-[#EEEBDA]", "text-[#282B4A]");
          document.getElementById(o.btn)?.classList.add("bg-[#32365C]", "text-[#C8C5B4]");
          document.getElementById(o.panel)?.classList.add("hidden");
        });

        btn.classList.add("active", "bg-[#EEEBDA]", "text-[#282B4A]");
        btn.classList.remove("bg-[#32365C]", "text-[#C8C5B4]");
        document.getElementById(t.panel)?.classList.remove("hidden");
      });
    });
  }

  initWeatherControls() {
    const setWeather = (type, activeBtn) => {
      this.trackRenderer.weatherFX.setWeather(type);
      document.querySelectorAll(".weather-btn").forEach(b => {
        b.className = "weather-btn px-2 py-1 rounded-lg text-[#C8C5B4] hover:text-[#EEEBDA]";
      });
      activeBtn.className = "weather-btn px-2 py-1 rounded-lg text-[#282B4A] font-bold bg-[#EEEBDA] border border-[#EEEBDA]";
    };

    const btnClear = document.getElementById("weatherBtnClear");
    const btnRain = document.getElementById("weatherBtnRain");
    const btnFog = document.getElementById("weatherBtnFog");
    const btnStorm = document.getElementById("weatherBtnStorm");

    btnClear?.addEventListener("click", () => setWeather("CLEAR", btnClear));
    btnRain?.addEventListener("click", () => setWeather("RAIN", btnRain));
    btnFog?.addEventListener("click", () => setWeather("FOG", btnFog));
    btnStorm?.addEventListener("click", () => setWeather("STORM", btnStorm));
  }

  initSoundboardControls() {
    document.getElementById("btnWhistle")?.addEventListener("click", () => {
      this.announcements.playGuardWhistle();
    });

    document.getElementById("btnBell")?.addEventListener("click", () => {
      this.announcements.playLevelCrossingBell();
    });

    document.getElementById("btnAnnounceHi")?.addEventListener("click", () => {
      const tele = this.physics.getTelemetry();
      this.announcements.speakAnnouncement(
        this.currentTrain.number,
        this.currentTrain.name,
        tele.nextStation,
        tele.nextStationPlatform,
        "hi"
      );
    });

    document.getElementById("btnEmergencySOS")?.addEventListener("click", () => {
      const incident = this.emergencyAid.triggerEmergencySOS(this.physics);
      alert(
        `🚨 EMERGENCY SOS BROADCASTED!\n` +
        `Incident Ref: ${incident.incidentId}\n` +
        `Train: ${incident.trainNumber} ${incident.trainName} (Coach ${incident.coach})\n` +
        `Location: ${incident.lat}°N, ${incident.lon}°E (Speed: ${incident.speedKmh} km/h)\n` +
        `Nearest Station: ${incident.nearestStation}\n` +
        `Dispatched Units: ${incident.dispatchedUnits.join(", ")}\n` +
        `RPF Control Room & Medical Unit Notified!`
      );
    });
  }

  initCopilotUI() {
    const input = document.getElementById("chatInput");
    const sendBtn = document.getElementById("btnSendChat");
    const micBtn = document.getElementById("btnMicInput");
    const speechToggleBtn = document.getElementById("btnSpeechOutputToggle");
    const messages = document.getElementById("chatMessages");

    const appendMessage = (sender, text) => {
      const msgDiv = document.createElement("div");
      msgDiv.className = `flex items-start space-x-2.5 ${sender === 'user' ? 'justify-end' : ''}`;
      
      const avatar = sender === 'user' ? '👤' : '🚆';
      const bg = sender === 'user' ? 'bg-[#3E4370] border-[#EEEBDA]/20 text-[#EEEBDA] rounded-tr-none' : 'bg-[#282B4A] border-[#EEEBDA]/15 text-[#EEEBDA] rounded-tl-none';

      // Parse markdown-like bold text
      const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

      msgDiv.innerHTML = `
        ${sender !== 'user' ? `<span class="w-7 h-7 rounded-lg bg-[#EEEBDA] text-[#282B4A] font-bold flex items-center justify-center text-xs">${avatar}</span>` : ''}
        <div class="border rounded-2xl p-3 text-xs max-w-[85%] ${bg}">
          <p class="font-bold ${sender === 'user' ? 'text-[#F26419]' : 'text-[#EEEBDA]'} mb-1">${sender === 'user' ? 'You' : 'RailPulse Conductor'}:</p>
          ${formatted}
        </div>
        ${sender === 'user' ? `<span class="w-7 h-7 rounded-lg bg-[#32365C] text-[#EEEBDA] flex items-center justify-center text-xs">${avatar}</span>` : ''}
      `;
      messages.appendChild(msgDiv);
      messages.scrollTop = messages.scrollHeight;
    };

    const handleSend = () => {
      const q = input.value.trim();
      if (!q) return;
      input.value = "";
      appendMessage("user", q);

      // Typing animation
      setTimeout(() => {
        const reply = this.copilot.ask(q);
        appendMessage("ai", reply);
        this.copilot.speak(reply);
      }, 350);
    };

    sendBtn?.addEventListener("click", handleSend);
    input?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSend();
    });

    // Voice recognition listener
    micBtn?.addEventListener("click", () => {
      this.copilot.toggleVoiceRecognition();
    });

    this.copilot.onListeningChange = (listening) => {
      if (listening) {
        micBtn.classList.add("bg-red-600", "animate-pulse", "text-white");
      } else {
        micBtn.classList.remove("bg-red-600", "animate-pulse", "text-white");
      }
    };

    this.copilot.onVoiceInput = (text) => {
      input.value = text;
      handleSend();
    };

    // Voice output speech toggle
    speechToggleBtn?.addEventListener("click", () => {
      const enabled = this.copilot.toggleSpeechOutput();
      speechToggleBtn.style.opacity = enabled ? "1.0" : "0.4";
    });

    // Suggested quick prompt chips
    document.querySelectorAll(".ai-prompt-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const prompt = chip.textContent.replace(/^[^\w]+/, "").trim();
        input.value = prompt;
        handleSend();
      });
    });
  }

  renderDelayPredictor() {
    const container = document.getElementById("delayPredictorContainer");
    if (!container) return;

    const prediction = this.delayPredictor.predict(this.currentTrain, this.physics);

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Input Parameters Card -->
        <div class="bg-[#1C1E34] p-4 rounded-xl border border-[#EEEBDA]/15 space-y-3">
          <h4 class="text-xs font-bold text-[#EEEBDA] uppercase tracking-wide">Weather & Track Factors</h4>
          
          <div>
            <label class="text-[11px] text-[#C8C5B4] block mb-1">Atmospheric Condition:</label>
            <select id="weatherSelect" class="w-full bg-[#282B4A] border border-[#EEEBDA]/20 rounded-lg p-2 text-xs text-[#EEEBDA]">
              ${this.delayPredictor.weatherConditions.map((w, idx) => `
                <option value="${idx}" ${idx === this.delayPredictor.selectedWeatherIndex ? 'selected' : ''}>${w.name}</option>
              `).join("")}
            </select>
          </div>

          <div>
            <div class="flex justify-between text-[11px] text-[#C8C5B4] mb-1">
              <span>Section Congestion:</span>
              <span id="congestionLabel" class="text-[#EEEBDA] font-mono font-bold">${this.delayPredictor.corridorCongestionPct}%</span>
            </div>
            <input id="congestionSlider" type="range" min="30" max="140" value="${this.delayPredictor.corridorCongestionPct}" class="w-full accent-[#F26419] cursor-pointer h-1.5 bg-[#32365C] rounded-lg" />
          </div>
        </div>

        <!-- Output Prediction Gauges -->
        <div class="md:col-span-2 bg-[#1C1E34] p-4 rounded-xl border border-[#EEEBDA]/15 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEEBDA]/15 pb-3">
            <div>
              <span class="text-xs font-bold text-[#EEEBDA]">Projected Terminal Delay</span>
              <div class="text-2xl font-black font-mono text-[#F26419] mt-0.5">
                ${prediction.etaDriftString}
              </div>
            </div>
            <span class="badge-pill" style="background-color: ${prediction.badgeColor}22; color: ${prediction.badgeColor}; border: 1px solid ${prediction.badgeColor}44;">
              ${prediction.riskLevel}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-3 text-center text-xs">
            <div class="p-2.5 rounded-lg bg-[#282B4A] border border-[#EEEBDA]/15">
              <span class="text-[#C8C5B4] block text-[10px]">Recovery Confidence</span>
              <span class="font-bold font-mono text-[#2EC4B6] text-base">${prediction.recoveryProbabilityPct}%</span>
            </div>
            <div class="p-2.5 rounded-lg bg-[#282B4A] border border-[#EEEBDA]/15">
              <span class="text-[#C8C5B4] block text-[10px]">Timetable Slack</span>
              <span class="font-bold font-mono text-[#EEEBDA] text-base">${prediction.scheduleSlackMins} mins</span>
            </div>
            <div class="p-2.5 rounded-lg bg-[#282B4A] border border-[#EEEBDA]/15">
              <span class="text-[#C8C5B4] block text-[10px]">Active Delay</span>
              <span class="font-bold font-mono text-[#F6AE2D] text-base">${prediction.currentDelayMinutes} mins</span>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-[#282B4A] border border-[#EEEBDA]/15 text-xs text-[#EEEBDA]">
            ${prediction.aiAnalysisSummary}
          </div>
        </div>
      </div>
    `;

    // Listeners for sliders
    container.querySelector("#weatherSelect")?.addEventListener("change", (e) => {
      this.delayPredictor.setWeather(parseInt(e.target.value, 10));
      this.renderDelayPredictor();
    });

    container.querySelector("#congestionSlider")?.addEventListener("input", (e) => {
      this.delayPredictor.setCongestion(parseInt(e.target.value, 10));
      this.renderDelayPredictor();
    });
  }

  renderCrowdPredictor() {
    const container = document.getElementById("crowdPredictorContainer");
    if (!container) return;

    const tele = this.physics.getTelemetry();
    const nextStation = tele.gps.nextStation;
    const crowd = this.crowdPredictor.predictPlatformCrowd(nextStation, this.currentTrain);
    const coaches = this.crowdPredictor.generateCoachHeatmap(this.currentTrain.rakeComposition);

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Platform Summary Card -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-[#1C1E34] p-4 rounded-xl border border-[#EEEBDA]/15 space-y-2">
            <span class="text-xs text-[#C8C5B4] uppercase font-semibold">Upcoming Station</span>
            <h4 class="text-base font-bold text-[#EEEBDA]">${crowd.stationName} (Platform ${crowd.platform})</h4>
            <div class="flex items-center space-x-2 pt-1">
              <span class="badge-pill" style="background-color: ${crowd.badgeColor}22; color: ${crowd.badgeColor}; border: 1px solid ${crowd.badgeColor}44;">
                ${crowd.crowdLabel} (${crowd.crowdScore}%)
              </span>
            </div>
          </div>

          <div class="bg-[#1C1E34] p-4 rounded-xl border border-[#EEEBDA]/15 space-y-1 text-xs">
            <span class="text-[#C8C5B4] uppercase font-semibold block text-[10px]">Staircase & Escalator Status</span>
            <div class="text-[#2EC4B6] font-semibold">${crowd.fobCongestion}</div>
            <div class="text-[#EEEBDA] pt-1">${crowd.recommendedBoardingTime}</div>
          </div>

          <div class="bg-[#1C1E34] p-4 rounded-xl border border-[#EEEBDA]/15 space-y-2 text-xs">
            <span class="text-[#C8C5B4] uppercase font-semibold block text-[10px]">Zone Density</span>
            ${crowd.zones.map(z => `
              <div class="flex justify-between items-center text-[11px]">
                <span class="text-[#C8C5B4]">${z.zone}</span>
                <span class="font-mono text-[#EEEBDA] font-bold">${z.density}% (${z.label})</span>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Coach Boarding Rush Heatmap -->
        <div class="bg-[#1C1E34] p-4 rounded-xl border border-[#EEEBDA]/15">
          <h4 class="text-xs font-bold text-[#EEEBDA] uppercase tracking-wide mb-3">Coach Boarding Rush Heatmap</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            ${coaches.map(c => `
              <div class="p-2.5 rounded-lg bg-[#282B4A] border border-[#EEEBDA]/15 space-y-1.5">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-bold text-[#EEEBDA]">${c.code}</span>
                  <span class="font-mono text-[10px]" style="color: ${c.color};">${c.rushPercent}%</span>
                </div>
                <div class="w-full h-1.5 bg-[#32365C] rounded-full overflow-hidden">
                  <div class="h-full" style="width: ${c.rushPercent}%; background-color: ${c.color};"></div>
                </div>
                <div class="text-[9px] text-[#C8C5B4] truncate">${c.advice}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }

  renderOfflineTriangulator() {
    const container = document.getElementById("offlineTriangulatorContainer");
    if (!container) return;

    this.triangulator.update(this.physics);
    const status = this.triangulator.getStatus();
    const tele = this.physics.getTelemetry();

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Cell Tower Triangulation Status Card -->
        <div class="bg-[#1C1E34] p-4 rounded-xl border border-[#EEEBDA]/15 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-[#EEEBDA] uppercase tracking-wide">Cell-Tower Signal (Offline Mode)</h4>
            <button 
              id="btnToggleOffline" 
              class="px-2.5 py-1 rounded-lg text-xs font-bold transition ${status.isOfflineMode ? 'bg-[#F6AE2D]/20 text-[#F6AE2D] border border-[#F6AE2D]/40' : 'bg-[#282B4A] text-[#C8C5B4] border border-[#EEEBDA]/20'}">
              ${status.isOfflineMode ? '📡 OFFLINE: ON' : '🌐 GPS: ONLINE'}
            </button>
          </div>

          <div class="p-3 rounded-lg bg-[#282B4A] border border-[#EEEBDA]/15 space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-[#C8C5B4]">Carrier / BTS:</span>
              <span class="font-mono text-[#EEEBDA] font-bold">${status.networkName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#C8C5B4]">Tower ID:</span>
              <span class="font-mono text-[#C8C5B4]">${status.towerId}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[#C8C5B4]">Signal Strength:</span>
              <span class="font-mono text-[#2EC4B6] font-bold">${status.signalDbm} dBm (${'📶'.repeat(status.bars)})</span>
            </div>
          </div>
          <p class="text-[10px] text-[#C8C5B4]">Emulates tracking inside steel coaches using GSM Cell ID & schedule extrapolation.</p>
        </div>

        <!-- Smart Geofence Wake-Up Alarm Card -->
        <div class="md:col-span-2 bg-[#1C1E34] p-4 rounded-xl border border-[#EEEBDA]/15 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-[#EEEBDA] uppercase tracking-wide">⏰ Smart Geofence Wake-Up Alarm</h4>
            <span class="badge-pill ${status.alarmActive ? 'bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/40' : 'bg-[#282B4A] text-[#C8C5B4] border border-[#EEEBDA]/15'}">
              ${status.alarmActive ? 'ACTIVE ALARM' : 'OFF'}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="text-[11px] text-[#C8C5B4] block mb-1">Target Station:</label>
              <select id="alarmStationSelect" class="w-full bg-[#282B4A] border border-[#EEEBDA]/20 rounded-lg p-2 text-xs text-[#EEEBDA]">
                ${this.currentTrain.stations.map(st => `
                  <option value="${st.name}">${st.name} (${st.code})</option>
                `).join("")}
              </select>
            </div>
            <div>
              <label class="text-[11px] text-[#C8C5B4] block mb-1">Lead Alert Time:</label>
              <select id="alarmTimeSelect" class="w-full bg-[#282B4A] border border-[#EEEBDA]/20 rounded-lg p-2 text-xs text-[#EEEBDA]">
                <option value="10">10 Minutes Before Station</option>
                <option value="15" selected>15 Minutes Before Station</option>
                <option value="25">25 Minutes Before Station</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1">
            <div class="text-xs text-[#C8C5B4]">
              ${status.alarmActive ? `Alarm set for <strong class="text-[#EEEBDA]">${status.targetStation}</strong> (${status.alarmLeadMinutes}m ahead)` : 'Set a geofence alarm to ensure you never miss your destination stop.'}
            </div>
            <button 
              id="btnSetAlarm" 
              class="px-4 py-2 rounded-xl bg-[#F26419] hover:bg-[#E65100] text-white text-xs font-bold shadow-md transition">
              ${status.alarmActive ? 'CANCEL ALARM' : '🔔 SET WAKE-UP ALARM'}
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelector("#btnToggleOffline")?.addEventListener("click", () => {
      this.triangulator.toggleOfflineMode();
      this.renderOfflineTriangulator();
    });

    container.querySelector("#btnSetAlarm")?.addEventListener("click", () => {
      if (status.alarmActive) {
        this.triangulator.cancelAlarm();
      } else {
        const st = container.querySelector("#alarmStationSelect")?.value;
        const mins = parseInt(container.querySelector("#alarmTimeSelect")?.value || "15", 10);
        this.triangulator.setAlarm(st, mins);
      }
      this.renderOfflineTriangulator();
    });
  }

  initHeaderControls() {
    // Theme toggle
    const themeBtn = document.getElementById("btnThemeToggle");
    themeBtn?.addEventListener("click", () => {
      this.isNightMode = !this.isNightMode;
      document.documentElement.setAttribute("data-theme", this.isNightMode ? "dark" : "light");
      this.trackRenderer.setTheme(this.isNightMode);
      themeBtn.textContent = this.isNightMode ? "🌙" : "☀️";
    });

    // Speed multiplier toggle (1x -> 2x -> 5x -> 10x -> 1x)
    const speedBtn = document.getElementById("btnSimSpeed");
    speedBtn?.addEventListener("click", () => {
      if (this.simSpeed === 1) this.simSpeed = 2;
      else if (this.simSpeed === 2) this.simSpeed = 5;
      else if (this.simSpeed === 5) this.simSpeed = 10;
      else this.simSpeed = 1;

      this.physics.setTimeScale(this.simSpeed);
      speedBtn.textContent = `${this.simSpeed}x`;
    });

    // Audio mute toggle
    const audioBtn = document.getElementById("btnAudioToggle");
    audioBtn?.addEventListener("click", () => {
      this.sound.ensureContext();
      const muted = this.sound.toggleMute();
      audioBtn.textContent = muted ? "🔇" : "🔊";
      audioBtn.style.opacity = muted ? "0.4" : "1.0";
    });
  }

  initKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      // Space for Horn
      if (e.code === "Space" && e.target.tagName !== "INPUT") {
        e.preventDefault();
        this.sound.playHorn();
      }
      // 'W' to Accelerate Throttle
      if ((e.key === "w" || e.key === "W") && e.target.tagName !== "INPUT") {
        this.physics.setThrottle(Math.min(1.0, this.physics.throttle + 0.1));
      }
      // 'S' for Emergency Brake / Decelerate
      if ((e.key === "s" || e.key === "S") && e.target.tagName !== "INPUT") {
        this.physics.applyEmergencyBrake();
      }
      // 'C' to switch camera
      if ((e.key === "c" || e.key === "C") && e.target.tagName !== "INPUT") {
        if (this.activeCamera === "aerial") document.getElementById("viewBtnCab")?.click();
        else if (this.activeCamera === "cab") document.getElementById("viewBtnPlatform")?.click();
        else document.getElementById("viewBtnAerial")?.click();
      }
      // 'M' to mute
      if ((e.key === "m" || e.key === "M") && e.target.tagName !== "INPUT") {
        document.getElementById("btnAudioToggle")?.click();
      }
    });
  }

  loop(currentTime) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // 1. Advance Physics Engine
    this.physics.update(dt);

    // 2. Telemetry & watermark update
    const tele = this.physics.getTelemetry();
    const watermark = document.getElementById("watermarkSpeed");
    if (watermark) watermark.textContent = tele.speedKmh;

    // 3. Render active camera viewport
    if (this.activeCamera === "aerial") {
      this.trackRenderer.render();
    } else if (this.activeCamera === "cab") {
      this.cabView.render();
    } else if (this.activeCamera === "platform") {
      this.platformView.render();
    }

    // 4. Update Telemetry HUD & Energy Dynamics
    this.telemetryHUD.render(tele, this.currentTrain);
    this.advancedTelemetry.render(tele, this.currentTrain);

    // 5. Update offline triangulator periodically
    if (Math.random() < 0.05) {
      this.triangulator.update(this.physics);
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Register ServiceWorker for 100% Offline Transit Operation
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then((reg) => console.log("[RailPulse] PWA ServiceWorker active with scope:", reg.scope))
        .catch((err) => console.warn("[RailPulse] ServiceWorker registration fallback:", err));
    });
  }

  // Network connectivity listener for offline in-train mode
  window.addEventListener("offline", () => {
    const banner = document.getElementById("offlineIndicatorBanner");
    if (banner) banner.classList.remove("hidden");
  });
  window.addEventListener("online", () => {
    const banner = document.getElementById("offlineIndicatorBanner");
    if (banner) banner.classList.add("hidden");
  });
}

// Bootstrap application on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  registerServiceWorker();
  const app = new RailPulseApp();
  app.init();
  window.railPulseApp = app;
});

