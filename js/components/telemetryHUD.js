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

    // Signal aspect styling
    let sigGlow = "#00ff88";
    let sigText = "PROCEED (MAX SPEED)";
    if (telemetry.currentSignal === "RED") {
      sigGlow = "#ff334b";
      sigText = "DANGER / STOP (OCCUPIED)";
    } else if (telemetry.currentSignal === "YELLOW") {
      sigGlow = "#ffb300";
      sigText = "CAUTION (PREPARE TO STOP)";
    } else if (telemetry.currentSignal === "DOUBLE_YELLOW") {
      sigGlow = "#ffd000";
      sigText = "ATTENTION (RESTRICTED SPEED)";
    }

    this.container.innerHTML = `
      <div class="glass-panel p-4 mb-4">
        <!-- Top Telemetry Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          
          <!-- 1. Radial Speedometer Instrument -->
          <div class="flex items-center space-x-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
            <div class="relative w-24 h-24 flex items-center justify-center">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <!-- Background gauge arc -->
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" stroke-width="8" stroke-dasharray="${circumference * 0.75} ${circumference * 0.25}" stroke-linecap="round" />
                <!-- Dynamic active speed arc -->
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="${speedRatio > 0.8 ? '#ff334b' : '#00e5ff'}" 
                  stroke-width="8" 
                  stroke-dasharray="${circumference * 0.75} ${circumference * 0.25}" 
                  stroke-dashoffset="${strokeOffset}" 
                  stroke-linecap="round" 
                  class="speed-gauge-circle" 
                />
              </svg>
              <!-- Center Digital Speed -->
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-black font-mono text-cyan-300 leading-none">${telemetry.speedKmh}</span>
                <span class="text-[9px] text-slate-400 font-bold uppercase mt-0.5">KM/H</span>
              </div>
            </div>

            <div class="flex-1 space-y-1">
              <div class="text-[11px] text-slate-400">Section Limit: <strong class="text-white">${telemetry.maxSpeedKmh} km/h</strong></div>
              <div class="text-[11px] text-slate-400">Throttle: <strong class="text-cyan-400">${telemetry.throttlePct}%</strong></div>
              <div class="text-[10px]">
                Status: <span class="font-bold ${telemetry.isStationDwell ? 'text-amber-400' : 'text-emerald-400'}">
                  ${telemetry.isStationDwell ? '🚉 HALTED AT PLATFORM' : '⚡ CRUISING LINE'}
                </span>
              </div>
            </div>
          </div>

          <!-- 2. Kavach Signal Aspect HUD -->
          <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style="background-color: ${sigGlow}22; border: 2px solid ${sigGlow};">
              <span class="w-5 h-5 rounded-full animate-ping absolute" style="background-color: ${sigGlow}; opacity: 0.2;"></span>
              <span class="w-5 h-5 rounded-full" style="background-color: ${sigGlow}; box-shadow: 0 0 14px ${sigGlow};"></span>
            </div>
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Railway Signal Aspect</div>
              <div class="text-xs font-bold font-mono" style="color: ${sigGlow};">${telemetry.currentSignal}</div>
              <div class="text-[10px] text-slate-400 font-mono">Distance: ${telemetry.distanceToSignalM}m</div>
            </div>
          </div>

          <!-- 3. GPS Coordinates & Altitude AMSL -->
          <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-slate-400 uppercase font-semibold">Live GPS Telemetry</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300 font-mono">10Hz SAT</span>
            </div>
            <div class="text-xs font-mono text-cyan-300">
              ${telemetry.gps.lat}° N, ${telemetry.gps.lon}° E
            </div>
            <div class="flex justify-between text-[11px] text-slate-400">
              <span>Elevation: <strong class="text-slate-200">${telemetry.gps.elevation}m</strong></span>
              <span>Gradient: <strong class="text-slate-200">${telemetry.gps.gradient}%</strong></span>
            </div>
          </div>

          <!-- 4. Quick Simulator Flight Deck Controls -->
          <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-slate-400 uppercase font-semibold">Cockpit Controls</span>
              <span class="text-[9px] text-slate-500">Shortcuts: Space, W, S</span>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <button 
                id="btnHonkHorn" 
                class="px-2 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center justify-center space-x-1">
                <span>📢</span><span>HONK (Space)</span>
              </button>
              <button 
                id="btnEmergencyBrake" 
                class="px-2 py-1.5 rounded-lg ${telemetry.emergencyBrake ? 'bg-red-600 text-white animate-pulse' : 'bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300'} text-xs font-bold transition flex items-center justify-center space-x-1">
                <span>🛑</span><span>${telemetry.emergencyBrake ? 'RELEASE' : 'E-BRAKE'}</span>
              </button>
            </div>
            <!-- Throttle Slider -->
            <div class="flex items-center space-x-2 pt-1">
              <span class="text-[10px] text-slate-400 font-mono">PWR:</span>
              <input 
                id="throttleSlider" 
                type="range" min="0" max="100" 
                value="${telemetry.throttlePct}" 
                class="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>
          </div>

        </div>

        <!-- Station Route Progress Bar & Milestones -->
        <div class="mt-4 pt-3 border-t border-slate-800">
          <div class="flex items-center justify-between text-xs mb-2">
            <span class="text-slate-400">
              Traveled: <strong class="text-cyan-400 font-mono">${telemetry.traveledKm} km</strong> of ${telemetry.totalRouteKm} km
            </span>
            <span class="text-slate-300 font-medium">
              Next Stop: <strong class="text-emerald-400">${telemetry.nextStation} (P${telemetry.nextStationPlatform})</strong> in <strong class="text-white">${telemetry.remainingKmToNext} km</strong> (ETA: ${telemetry.etaMinutes}m)
            </span>
          </div>

          <!-- Visual Multi-Station Progress Bar -->
          <div class="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
            <div 
              class="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300"
              style="width: ${(telemetry.progress * 100).toFixed(1)}%;">
            </div>
          </div>

          <!-- Station Nodes along the route -->
          <div class="flex justify-between items-center mt-2 px-1 text-[11px]">
            ${train.stations.map((st) => {
              const stProgress = st.distanceKm / (telemetry.totalRouteKm || 1);
              const isPassed = telemetry.progress >= stProgress;
              const isCurrent = telemetry.nextStation === st.name;
              const color = isPassed ? "text-emerald-400" : isCurrent ? "text-cyan-300 font-bold" : "text-slate-500";
              return `
                <div class="flex flex-col items-center">
                  <span class="w-2.5 h-2.5 rounded-full mb-1 ${isPassed ? 'bg-emerald-400' : isCurrent ? 'bg-cyan-400 ring-2 ring-cyan-200 animate-ping' : 'bg-slate-700'}"></span>
                  <span class="${color} font-mono">${st.code}</span>
                  <span class="text-[9px] text-slate-500">${st.distanceKm} km</span>
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

