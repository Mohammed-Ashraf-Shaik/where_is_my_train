/**
 * RailPulse AI - Advanced Locomotive Telemetry & Energy Dynamics
 * Real-time regenerative energy recovery (kWh), tractive effort (kN) & track elevation profile
 */

export class AdvancedTelemetryComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.totalEnergySavedKwh = 142.8;
  }

  render(telemetry, train) {
    if (!this.container || !telemetry) return;

    // Physics calculations
    const isRegen = telemetry.isBraking && telemetry.speedKmh > 20;
    if (isRegen) {
      this.totalEnergySavedKwh += (telemetry.speedKmh / 3600) * 0.45;
    }

    const tractiveEffortKn = telemetry.isBraking ? 0 : Math.round(telemetry.throttlePct * 3.2);
    const catenaryVoltageKv = 24.8 + (Math.random() * 0.4 - 0.2);
    const tractionCurrentAmps = Math.round(telemetry.throttlePct * 4.8);
    const gForce = (0.02 + (telemetry.speedKmh / 160) * 0.12).toFixed(2);

    this.container.innerHTML = `
      <div class="glass-panel p-4 mb-4">
        <!-- Header -->
        <div class="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-xl">⚡</span>
            <div>
              <h3 class="font-bold text-sm tracking-wide text-cyan-400 uppercase">Locomotive Energy Dynamics & Ride Comfort</h3>
              <p class="text-[11px] text-slate-400">25kV AC Traction Inverter & Regenerative Braking Telemetry</p>
            </div>
          </div>
          <span class="badge-pill bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
            GREEN RAIL EFFICIENCY
          </span>
        </div>

        <!-- 4 Instrument Dials -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
          <!-- 1. Regenerative Braking -->
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div class="flex justify-between items-center text-[10px] text-slate-400">
              <span>REGEN ENERGY RECOVERED</span>
              <span class="text-emerald-400">♻️</span>
            </div>
            <div class="text-lg font-black font-mono text-emerald-400">
              ${this.totalEnergySavedKwh.toFixed(1)} <span class="text-xs font-normal text-slate-400">kWh</span>
            </div>
            <div class="text-[10px] text-slate-500">Fed back to 25kV Catenary</div>
          </div>

          <!-- 2. Tractive Effort -->
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div class="flex justify-between items-center text-[10px] text-slate-400">
              <span>TRACTIVE EFFORT</span>
              <span class="text-cyan-400">⚙️</span>
            </div>
            <div class="text-lg font-black font-mono text-cyan-300">
              ${tractiveEffortKn} <span class="text-xs font-normal text-slate-400">kN</span>
            </div>
            <div class="text-[10px] text-slate-500">Drawbar Pull Force</div>
          </div>

          <!-- 3. Catenary Voltage & Amperage -->
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div class="flex justify-between items-center text-[10px] text-slate-400">
              <span>TRACTION POWER</span>
              <span class="text-amber-400">⚡</span>
            </div>
            <div class="text-lg font-black font-mono text-amber-300">
              ${catenaryVoltageKv.toFixed(1)} <span class="text-xs font-normal text-slate-400">kV</span>
            </div>
            <div class="text-[10px] text-slate-500 font-mono">Current: ${tractionCurrentAmps} A</div>
          </div>

          <!-- 4. G-Force Ride Quality -->
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div class="flex justify-between items-center text-[10px] text-slate-400">
              <span>RIDE VIBRATION INDEX</span>
              <span class="text-purple-400">📊</span>
            </div>
            <div class="text-lg font-black font-mono text-purple-300">
              ${gForce} <span class="text-xs font-normal text-slate-400">G</span>
            </div>
            <div class="text-[10px] text-emerald-400 font-bold">Ultra Smooth (Air Suspension)</div>
          </div>
        </div>

        <!-- Track Elevation & Gradient Cross-Section SVG -->
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div class="flex justify-between items-center text-[11px] text-slate-400 mb-2">
            <span>Route Elevation AMSL Profile</span>
            <span class="font-mono text-cyan-300 font-bold">Current: ${telemetry.gps.elevation}m AMSL (Gradient: ${telemetry.gps.gradient}%)</span>
          </div>

          <div class="h-16 w-full relative">
            <svg class="w-full h-full" viewBox="0 0 500 60" preserveAspectRatio="none">
              <!-- Hill elevation curve -->
              <path 
                d="M 0,55 Q 120,48 240,32 T 380,18 T 500,42 L 500,60 L 0,60 Z" 
                fill="url(#elevationGrad)" 
              />
              <!-- Track baseline line -->
              <path 
                d="M 0,55 Q 120,48 240,32 T 380,18 T 500,42" 
                fill="none" 
                stroke="#00e5ff" 
                stroke-width="2" 
              />
              <!-- Active Train Pin on profile -->
              <circle cx="${Math.min(490, Math.max(10, telemetry.progress * 500))}" cy="30" r="4.5" fill="#00ff88" stroke="#ffffff" stroke-width="1.5" />
              
              <defs>
                <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(0, 229, 255, 0.35)" />
                  <stop offset="100%" stop-color="rgba(0, 229, 255, 0.02)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    `;
  }
}
