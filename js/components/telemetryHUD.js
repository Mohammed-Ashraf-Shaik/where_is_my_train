/**
 * RailPulse AI - Live Telemetry HUD, Speedometer Gauge & Route Timeline
 * High-performance cached DOM architecture (Zero 60FPS DOM Thrashing)
 * Editorial Midnight Indigo (#282B4A) & Vanilla (#EEEBDA) Design System
 */

export class TelemetryHUD {
  constructor(containerId, physics, sound) {
    this.container = document.getElementById(containerId);
    this.physics = physics;
    this.sound = sound;
    this.isInitialized = false;
    this.currentTrainId = null;
    this.isDraggingSlider = false;
    this.circumference = 2 * Math.PI * 45; // 282.74
  }

  render(telemetry, train) {
    if (!this.container || !telemetry) return;

    // Build DOM structure if not yet initialized or if active train changed
    if (!this.isInitialized || this.currentTrainId !== train.id) {
      this.currentTrainId = train.id;
      this.buildSkeleton(telemetry, train);
      this.isInitialized = true;
    }

    // Fast targeted DOM update (Zero DOM destruction)
    this.updateValues(telemetry, train);
  }

  buildSkeleton(telemetry, train) {
    const c = this.circumference;

    this.container.innerHTML = `
      <div class="transit-card p-4 mb-4 bg-[#282B4A] border-[#EEEBDA]/15 text-[#EEEBDA]">
        <!-- Top Telemetry Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          
          <!-- 1. Radial Speedometer Instrument -->
          <div class="flex items-center space-x-3 bg-[#1C1E34] p-3 rounded-xl border border-[#EEEBDA]/15">
            <div class="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <!-- Background gauge arc -->
                <circle cx="50" cy="50" r="45" fill="none" stroke="#32365C" stroke-width="8" stroke-dasharray="${c * 0.75} ${c * 0.25}" stroke-linecap="round" />
                <!-- Dynamic active speed arc -->
                <circle 
                  id="hudSpeedArc"
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="#F26419" 
                  stroke-width="8" 
                  stroke-dasharray="${c * 0.75} ${c * 0.25}" 
                  stroke-dashoffset="${c * 0.75}" 
                  stroke-linecap="round" 
                  class="speed-gauge-circle" 
                />
              </svg>
              <!-- Center Digital Speed in Vanilla -->
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span id="hudSpeedNumber" class="text-2xl font-black font-mono text-[#EEEBDA] leading-none">120</span>
                <span class="text-[9px] text-[#C8C5B4] font-bold uppercase mt-0.5">KM/H</span>
              </div>
            </div>

            <div class="flex-1 space-y-1 min-w-0">
              <div class="text-[11px] text-[#C8C5B4]">Section Limit: <strong id="hudSpeedLimit" class="text-[#EEEBDA] font-mono">160 km/h</strong></div>
              <div class="text-[11px] text-[#C8C5B4]">Throttle: <strong id="hudThrottleText" class="text-[#F26419] font-mono">85%</strong></div>
              <div class="text-[10px]">
                Status: <span id="hudStatusBadge" class="font-bold text-[#2EC4B6]">⚡ LINE SPEED</span>
              </div>
            </div>
          </div>

          <!-- 2. Kavach Signal Aspect HUD -->
          <div class="bg-[#1C1E34] p-3 rounded-xl border border-[#EEEBDA]/15 flex items-center space-x-3">
            <div id="hudSignalGlowBox" class="w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative flex-shrink-0" style="background-color: rgba(46, 196, 182, 0.15); border: 2px solid #2EC4B6;">
              <span id="hudSignalPing" class="w-5 h-5 rounded-full animate-ping absolute" style="background-color: #2EC4B6; opacity: 0.2;"></span>
              <span id="hudSignalBulb" class="w-5 h-5 rounded-full" style="background-color: #2EC4B6; box-shadow: 0 0 14px #2EC4B6;"></span>
            </div>
            <div>
              <div class="text-[10px] uppercase font-bold text-[#C8C5B4]">Kavach Signal Aspect</div>
              <div id="hudSignalAspectText" class="text-xs font-bold font-mono text-[#2EC4B6]">GREEN</div>
              <div id="hudSignalDistText" class="text-[10px] text-[#C8C5B4] font-mono">Distance: 1450m</div>
            </div>
          </div>

          <!-- 3. GPS Coordinates & Altitude AMSL -->
          <div class="bg-[#1C1E34] p-3 rounded-xl border border-[#EEEBDA]/15 space-y-1">
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-[#C8C5B4] uppercase font-semibold">Live GPS Telemetry</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded bg-[#32365C] text-[#EEEBDA] font-mono">10Hz SAT</span>
            </div>
            <div id="hudGpsCoordinates" class="text-xs font-mono text-[#EEEBDA]">
              28.64270° N, 77.21980° E
            </div>
            <div class="flex justify-between text-[11px] text-[#C8C5B4]">
              <span>Elevation: <strong id="hudElevation" class="text-[#EEEBDA]">216m</strong></span>
              <span>Gradient: <strong id="hudGradient" class="text-[#EEEBDA]">0.2%</strong></span>
            </div>
          </div>

          <!-- 4. Quick Simulator Flight Deck Controls -->
          <div class="bg-[#1C1E34] p-3 rounded-xl border border-[#EEEBDA]/15 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-[#C8C5B4] uppercase font-semibold">Cockpit Controls</span>
              <span class="text-[9px] text-[#C8C5B4]/70">Space, W, S</span>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <button 
                id="btnHonkHorn" 
                class="px-2 py-1.5 rounded-lg bg-[#F26419]/25 hover:bg-[#F26419]/40 border border-[#F26419]/50 text-[#EEEBDA] text-xs font-bold transition flex items-center justify-center space-x-1">
                <span>📢</span><span>HONK</span>
              </button>
              <button 
                id="btnEmergencyBrake" 
                class="px-2 py-1.5 rounded-lg bg-[#E71D36]/20 hover:bg-[#E71D36]/40 border border-[#E71D36]/50 text-[#EEEBDA] text-xs font-bold transition flex items-center justify-center space-x-1">
                <span>🛑</span><span id="brakeBtnLabel">E-BRAKE</span>
              </button>
            </div>
            <!-- Throttle Slider with rock-solid touch and drag binding -->
            <div class="flex items-center space-x-2 pt-1">
              <span class="text-[10px] text-[#C8C5B4] font-mono">PWR:</span>
              <input 
                id="throttleSlider" 
                type="range" min="0" max="100" 
                value="${telemetry.throttlePct}" 
                class="w-full accent-[#F26419] cursor-pointer h-1.5 bg-[#32365C] rounded-lg"
              />
            </div>
          </div>

        </div>

        <!-- Station Route Progress Bar & Milestones -->
        <div class="mt-4 pt-3 border-t border-[#EEEBDA]/15">
          <div class="flex items-center justify-between text-xs mb-2">
            <span class="text-[#C8C5B4]">
              Traveled: <strong id="hudTraveledKm" class="text-[#EEEBDA] font-mono">${telemetry.traveledKm} km</strong> of ${telemetry.totalRouteKm} km
            </span>
            <span class="text-[#C8C5B4] font-medium">
              Next Stop: <strong id="hudNextStation" class="text-[#2EC4B6]">${telemetry.nextStation} (P${telemetry.nextStationPlatform})</strong> in <strong id="hudRemainingKm" class="text-[#EEEBDA]">${telemetry.remainingKmToNext} km</strong> (ETA: <span id="hudEta">${telemetry.etaMinutes}m</span>)
            </span>
          </div>

          <!-- Visual Multi-Station Progress Bar -->
          <div class="relative w-full h-3 bg-[#1C1E34] rounded-full overflow-hidden border border-[#EEEBDA]/15">
            <div 
              id="hudRouteProgressBar"
              class="h-full bg-gradient-to-r from-[#282B4A] via-[#F26419] to-[#2EC4B6] transition-all duration-150"
              style="width: ${(telemetry.progress * 100).toFixed(1)}%;">
            </div>
          </div>

          <!-- Station Nodes along the route -->
          <div id="hudStationNodesList" class="flex justify-between items-center mt-2 px-1 text-[11px]">
            ${train.stations.map((st) => {
              const stProgress = st.distanceKm / (telemetry.totalRouteKm || 1);
              const isPassed = telemetry.progress >= stProgress;
              const isCurrent = telemetry.nextStation === st.name;
              const color = isPassed ? "text-[#2EC4B6]" : isCurrent ? "text-[#EEEBDA] font-bold" : "text-[#C8C5B4]/60";
              return `
                <div class="flex flex-col items-center station-node-item" data-code="${st.code}">
                  <span class="station-node-dot w-2.5 h-2.5 rounded-full mb-1 ${isPassed ? 'bg-[#2EC4B6]' : isCurrent ? 'bg-[#F26419] ring-2 ring-[#EEEBDA]' : 'bg-[#32365C]'}"></span>
                  <span class="station-node-code ${color} font-mono">${st.code}</span>
                  <span class="text-[9px] text-[#C8C5B4]/60">${st.distanceKm} km</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>

      </div>
    `;

    // Cache DOM references
    this.elSpeedArc = this.container.querySelector("#hudSpeedArc");
    this.elSpeedNumber = this.container.querySelector("#hudSpeedNumber");
    this.elSpeedLimit = this.container.querySelector("#hudSpeedLimit");
    this.elThrottleText = this.container.querySelector("#hudThrottleText");
    this.elStatusBadge = this.container.querySelector("#hudStatusBadge");
    this.elSignalGlowBox = this.container.querySelector("#hudSignalGlowBox");
    this.elSignalPing = this.container.querySelector("#hudSignalPing");
    this.elSignalBulb = this.container.querySelector("#hudSignalBulb");
    this.elSignalAspectText = this.container.querySelector("#hudSignalAspectText");
    this.elSignalDistText = this.container.querySelector("#hudSignalDistText");
    this.elGpsCoordinates = this.container.querySelector("#hudGpsCoordinates");
    this.elElevation = this.container.querySelector("#hudElevation");
    this.elGradient = this.container.querySelector("#hudGradient");
    this.elTraveledKm = this.container.querySelector("#hudTraveledKm");
    this.elNextStation = this.container.querySelector("#hudNextStation");
    this.elRemainingKm = this.container.querySelector("#hudRemainingKm");
    this.elEta = this.container.querySelector("#hudEta");
    this.elRouteProgressBar = this.container.querySelector("#hudRouteProgressBar");
    this.elBrakeBtnLabel = this.container.querySelector("#brakeBtnLabel");
    this.elEmergencyBrakeBtn = this.container.querySelector("#btnEmergencyBrake");
    this.slider = this.container.querySelector("#throttleSlider");

    // Bind event handlers ONCE
    const honkBtn = this.container.querySelector("#btnHonkHorn");
    if (honkBtn) honkBtn.onclick = () => this.sound.playHorn();

    if (this.elEmergencyBrakeBtn) {
      this.elEmergencyBrakeBtn.onclick = () => this.physics.applyEmergencyBrake();
    }

    if (this.slider) {
      this.slider.onmousedown = () => { this.isDraggingSlider = true; };
      this.slider.ontouchstart = () => { this.isDraggingSlider = true; };
      window.addEventListener("mouseup", () => { this.isDraggingSlider = false; });
      window.addEventListener("touchend", () => { this.isDraggingSlider = false; });
      this.slider.oninput = (e) => {
        this.physics.setThrottle(parseFloat(e.target.value) / 100);
      };
    }
  }

  updateValues(telemetry, train) {
    // 1. Speedometer Needle & Arc
    const speedRatio = Math.min(1.0, telemetry.speedKmh / 160);
    const strokeOffset = this.circumference - (speedRatio * this.circumference * 0.75);

    if (this.elSpeedArc) {
      this.elSpeedArc.style.strokeDashoffset = strokeOffset;
      this.elSpeedArc.setAttribute("stroke", speedRatio > 0.85 ? "#E71D36" : "#F26419");
    }
    if (this.elSpeedNumber) this.elSpeedNumber.textContent = telemetry.speedKmh;
    if (this.elSpeedLimit) this.elSpeedLimit.textContent = `${telemetry.maxSpeedKmh} km/h`;
    if (this.elThrottleText) this.elThrottleText.textContent = `${telemetry.throttlePct}%`;

    // Only update slider value if user is not actively dragging it
    if (this.slider && !this.isDraggingSlider) {
      this.slider.value = telemetry.throttlePct;
    }

    // Status
    if (this.elStatusBadge) {
      if (telemetry.isStationDwell) {
        this.elStatusBadge.className = "font-bold text-[#F6AE2D]";
        this.elStatusBadge.textContent = "🚉 HALTED AT PLATFORM";
      } else if (telemetry.emergencyBrake) {
        this.elStatusBadge.className = "font-bold text-[#E71D36] animate-pulse";
        this.elStatusBadge.textContent = "🛑 BRAKE ACTIVE";
      } else {
        this.elStatusBadge.className = "font-bold text-[#2EC4B6]";
        this.elStatusBadge.textContent = "⚡ LINE SPEED";
      }
    }

    // 2. Signals
    let sigColor = "#2EC4B6";
    if (telemetry.currentSignal === "RED") sigColor = "#E71D36";
    else if (telemetry.currentSignal === "YELLOW" || telemetry.currentSignal === "DOUBLE_YELLOW") sigColor = "#F6AE2D";

    if (this.elSignalGlowBox) {
      this.elSignalGlowBox.style.backgroundColor = `${sigColor}22`;
      this.elSignalGlowBox.style.borderColor = sigColor;
    }
    if (this.elSignalPing) this.elSignalPing.style.backgroundColor = sigColor;
    if (this.elSignalBulb) {
      this.elSignalBulb.style.backgroundColor = sigColor;
      this.elSignalBulb.style.boxShadow = `0 0 14px ${sigColor}`;
    }
    if (this.elSignalAspectText) {
      this.elSignalAspectText.style.color = sigColor;
      this.elSignalAspectText.textContent = telemetry.currentSignal;
    }
    if (this.elSignalDistText) {
      this.elSignalDistText.textContent = `Distance: ${telemetry.distanceToSignalM}m`;
    }

    // 3. GPS & Altitude
    if (this.elGpsCoordinates && telemetry.gps) {
      this.elGpsCoordinates.textContent = `${telemetry.gps.lat}° N, ${telemetry.gps.lon}° E`;
    }
    if (this.elElevation && telemetry.gps) this.elElevation.textContent = `${telemetry.gps.elevation}m`;
    if (this.elGradient && telemetry.gps) this.elGradient.textContent = `${telemetry.gps.gradient}%`;

    // 4. Progress bar & Station ETA
    if (this.elTraveledKm) this.elTraveledKm.textContent = `${telemetry.traveledKm} km`;
    if (this.elNextStation) {
      this.elNextStation.textContent = `${telemetry.nextStation} (P${telemetry.nextStationPlatform})`;
    }
    if (this.elRemainingKm) this.elRemainingKm.textContent = `${telemetry.remainingKmToNext} km`;
    if (this.elEta) this.elEta.textContent = `${telemetry.etaMinutes}m`;
    if (this.elRouteProgressBar) {
      this.elRouteProgressBar.style.width = `${(telemetry.progress * 100).toFixed(1)}%`;
    }

    // 5. Emergency brake button state
    if (this.elBrakeBtnLabel) {
      this.elBrakeBtnLabel.textContent = telemetry.emergencyBrake ? "RELEASE" : "E-BRAKE";
    }
    if (this.elEmergencyBrakeBtn) {
      this.elEmergencyBrakeBtn.className = `px-2 py-1.5 rounded-lg ${telemetry.emergencyBrake ? 'bg-[#E71D36] text-white animate-pulse' : 'bg-[#E71D36]/20 hover:bg-[#E71D36]/40 border border-[#E71D36]/50 text-[#EEEBDA]'} text-xs font-bold transition flex items-center justify-center space-x-1`;
    }
  }
}
