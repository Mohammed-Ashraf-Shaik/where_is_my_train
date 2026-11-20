/**
 * RailPulse AI - Live Telemetry HUD, Speedometer Gauge & Route Timeline
 * Real-time instruments, station timeline progression and train flight deck controls
 */

export class TelemetryHUD {
  constructor(containerId, physics, sound) {
    this.container = document.getElementById(containerId);
    this.physics = physics;
    this.sound = sound;
  }

  render(telemetry, train) {
    if (!this.container || !telemetry) return;

    // Calculate speedometer needle angle (from -135deg at 0 km/h to +135deg at 180 km/h)
    const speedRatio = Math.min(1.0, telemetry.speedKmh / 160);
    const needleDeg = -135 + (speedRatio * 270);
    const circumference = 2 * Math.PI * 45;
    const strokeOffset = circumference - (speedRatio * circumference * 0.75);

    // Signal aspect styling (ISO Railway Aspects)
    let sigGlow = "#2EC4B6";
    let sigText = "PROCEED (LINE CLEAR)";
    if (telemetry.currentSignal === "RED") {
      sigGlow = "#E71D36";
      sigText = "DANGER / STOP (BLOCK OCCUPIED)";
    } else if (telemetry.currentSignal === "YELLOW") {
      sigGlow = "#F6AE2D";
      sigText = "CAUTION (PREPARE TO HALT)";
    } else if (telemetry.currentSignal === "DOUBLE_YELLOW") {
      sigGlow = "#F6AE2D";
      sigText = "ATTENTION (RESTRICTED SECTION)";
    }

    this.container.innerHTML = `
      <div class="transit-card p-4 mb-4 bg-[#282B4A] border-[#EEEBDA]/15 text-[#EEEBDA]">
        <!-- Top Telemetry Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          
          <!-- 1. Radial Speedometer Instrument -->
          <div class="flex items-center space-x-3 bg-[#1C1E34] p-3 rounded-xl border border-[#EEEBDA]/15">
            <div class="relative w-24 h-24 flex items-center justify-center">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <!-- Background gauge arc -->
                <circle cx="50" cy="50" r="45" fill="none" stroke="#32365C" stroke-width="8" stroke-dasharray="${circumference * 0.75} ${circumference * 0.25}" stroke-linecap="round" />
                <!-- Dynamic active speed arc -->
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="${speedRatio > 0.8 ? '#E71D36' : '#F26419'}" 
                  stroke-width="8" 
                  stroke-dasharray="${circumference * 0.75} ${circumference * 0.25}" 
                  stroke-dashoffset="${strokeOffset}" 
                  stroke-linecap="round" 
                  class="speed-gauge-circle" 
                />
              </svg>
              <!-- Center Digital Speed in Vanilla -->
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-black font-mono text-[#EEEBDA] leading-none">${telemetry.speedKmh}</span>
                <span class="text-[9px] text-[#C8C5B4] font-bold uppercase mt-0.5">KM/H</span>
              </div>
            </div>

            <div class="flex-1 space-y-1">
              <div class="text-[11px] text-[#C8C5B4]">Section Limit: <strong class="text-[#EEEBDA]">${telemetry.maxSpeedKmh} km/h</strong></div>
              <div class="text-[11px] text-[#C8C5B4]">Throttle: <strong class="text-[#F26419]">${telemetry.throttlePct}%</strong></div>
              <div class="text-[10px]">
                Status: <span class="font-bold ${telemetry.isStationDwell ? 'text-[#F6AE2D]' : 'text-[#2EC4B6]'}">
                  ${telemetry.isStationDwell ? '🚉 HALTED AT PLATFORM' : '⚡ LINE SPEED'}
                </span>
              </div>
            </div>
          </div>

          <!-- 2. Kavach Signal Aspect HUD -->
          <div class="bg-[#1C1E34] p-3 rounded-xl border border-[#EEEBDA]/15 flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style="background-color: ${sigGlow}22; border: 2px solid ${sigGlow};">
              <span class="w-5 h-5 rounded-full animate-ping absolute" style="background-color: ${sigGlow}; opacity: 0.2;"></span>
              <span class="w-5 h-5 rounded-full" style="background-color: ${sigGlow}; box-shadow: 0 0 14px ${sigGlow};"></span>
            </div>
            <div>
              <div class="text-[10px] uppercase font-bold text-[#C8C5B4]">Railway Signal Aspect</div>
              <div class="text-xs font-bold font-mono" style="color: ${sigGlow};">${telemetry.currentSignal}</div>
              <div class="text-[10px] text-[#C8C5B4] font-mono">Distance: ${telemetry.distanceToSignalM}m</div>
            </div>
          </div>

          <!-- 3. GPS Coordinates & Altitude AMSL -->
          <div class="bg-[#1C1E34] p-3 rounded-xl border border-[#EEEBDA]/15 space-y-1">
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-[#C8C5B4] uppercase font-semibold">Live GPS Telemetry</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded bg-[#32365C] text-[#EEEBDA] font-mono">10Hz SAT</span>
            </div>
            <div class="text-xs font-mono text-[#EEEBDA]">
              ${telemetry.gps.lat}° N, ${telemetry.gps.lon}° E
            </div>
            <div class="flex justify-between text-[11px] text-[#C8C5B4]">
              <span>Elevation: <strong class="text-[#EEEBDA]">${telemetry.gps.elevation}m</strong></span>
              <span>Gradient: <strong class="text-[#EEEBDA]">${telemetry.gps.gradient}%</strong></span>
            </div>
          </div>

          <!-- 4. Quick Simulator Flight Deck Controls -->
          <div class="bg-[#1C1E34] p-3 rounded-xl border border-[#EEEBDA]/15 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-[#C8C5B4] uppercase font-semibold">Cockpit Controls</span>
              <span class="text-[9px] text-[#C8C5B4]/70">Shortcuts: Space, W, S</span>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <button 
                id="btnHonkHorn" 
                class="px-2 py-1.5 rounded-lg bg-[#F26419]/25 hover:bg-[#F26419]/40 border border-[#F26419]/50 text-[#EEEBDA] text-xs font-bold transition flex items-center justify-center space-x-1">
                <span>📢</span><span>HONK (Space)</span>
              </button>
              <button 
                id="btnEmergencyBrake" 
                class="px-2 py-1.5 rounded-lg ${telemetry.emergencyBrake ? 'bg-[#E71D36] text-white animate-pulse' : 'bg-[#E71D36]/20 hover:bg-[#E71D36]/40 border border-[#E71D36]/50 text-[#EEEBDA]'} text-xs font-bold transition flex items-center justify-center space-x-1">
                <span>🛑</span><span>${telemetry.emergencyBrake ? 'RELEASE' : 'E-BRAKE'}</span>
              </button>
            </div>
            <!-- Throttle Slider -->
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
              Traveled: <strong class="text-[#EEEBDA] font-mono">${telemetry.traveledKm} km</strong> of ${telemetry.totalRouteKm} km
            </span>
            <span class="text-[#C8C5B4] font-medium">
              Next Stop: <strong class="text-[#2EC4B6]">${telemetry.nextStation} (P${telemetry.nextStationPlatform})</strong> in <strong class="text-[#EEEBDA]">${telemetry.remainingKmToNext} km</strong> (ETA: ${telemetry.etaMinutes}m)
            </span>
          </div>

          <!-- Visual Multi-Station Progress Bar -->
          <div class="relative w-full h-3 bg-[#1C1E34] rounded-full overflow-hidden border border-[#EEEBDA]/15">
            <div 
              class="h-full bg-gradient-to-r from-[#282B4A] via-[#F26419] to-[#2EC4B6] transition-all duration-300"
              style="width: ${(telemetry.progress * 100).toFixed(1)}%;">
            </div>
          </div>

          <!-- Station Nodes along the route -->
          <div class="flex justify-between items-center mt-2 px-1 text-[11px]">
            ${train.stations.map((st) => {
              const stProgress = st.distanceKm / (telemetry.totalRouteKm || 1);
              const isPassed = telemetry.progress >= stProgress;
              const isCurrent = telemetry.nextStation === st.name;
              const color = isPassed ? "text-[#2EC4B6]" : isCurrent ? "text-[#EEEBDA] font-bold" : "text-[#C8C5B4]/60";
              return `
                <div class="flex flex-col items-center">
                  <span class="w-2.5 h-2.5 rounded-full mb-1 ${isPassed ? 'bg-[#2EC4B6]' : isCurrent ? 'bg-[#F26419] ring-2 ring-[#EEEBDA] animate-ping' : 'bg-[#32365C]'}"></span>
                  <span class="${color} font-mono">${st.code}</span>
                  <span class="text-[9px] text-[#C8C5B4]/60">${st.distanceKm} km</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>

      </div>
    `;

    // Bind event handlers
    const honkBtn = this.container.querySelector("#btnHonkHorn");
    if (honkBtn) honkBtn.onclick = () => this.sound.playHorn();

    const brakeBtn = this.container.querySelector("#btnEmergencyBrake");
    if (brakeBtn) brakeBtn.onclick = () => this.physics.applyEmergencyBrake();

    const slider = this.container.querySelector("#throttleSlider");
    if (slider) {
      slider.oninput = (e) => this.physics.setThrottle(parseFloat(e.target.value) / 100);
    }
  }
}

