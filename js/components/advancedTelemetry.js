/**
 * RailPulse AI - Advanced Locomotive Telemetry & Energy Dynamics
 * Real-time regenerative energy recovery (kWh), tractive effort (kN) & track elevation profile
 * Editorial Midnight Indigo (#282B4A) & Vanilla (#EEEBDA) Design System
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
      <div class="transit-card p-4 mb-4 bg-[#282B4A] border-[#EEEBDA]/15 text-[#EEEBDA]">
        <!-- Header -->
        <div class="flex items-center justify-between mb-3 border-b border-[#EEEBDA]/15 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-xl">⚡</span>
            <div>
              <h3 class="font-bold text-sm tracking-wide text-[#EEEBDA] uppercase">Locomotive Energy Dynamics & Ride Comfort</h3>
              <p class="text-[11px] text-[#C8C5B4]">25kV AC Traction Inverter & Regenerative Braking Telemetry</p>
            </div>
          </div>
          <span class="badge-pill bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/30 text-[10px]">
            GREEN RAIL EFFICIENCY
          </span>
        </div>

        <!-- 4 Instrument Dials -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
          <!-- 1. Regenerative Braking -->
          <div class="p-3 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 space-y-1">
            <div class="flex justify-between items-center text-[10px] text-[#C8C5B4]">
              <span>REGEN ENERGY RECOVERED</span>
              <span class="text-[#2EC4B6]">♻️</span>
            </div>
            <div class="text-lg font-black font-mono text-[#2EC4B6]">
              ${this.totalEnergySavedKwh.toFixed(1)} <span class="text-xs font-normal text-[#C8C5B4]">kWh</span>
            </div>
            <div class="text-[10px] text-[#C8C5B4]/70">Fed back to 25kV Catenary</div>
          </div>

          <!-- 2. Tractive Effort -->
          <div class="p-3 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 space-y-1">
            <div class="flex justify-between items-center text-[10px] text-[#C8C5B4]">
              <span>TRACTIVE EFFORT</span>
              <span class="text-[#F26419]">⚙️</span>
            </div>
            <div class="text-lg font-black font-mono text-[#EEEBDA]">
              ${tractiveEffortKn} <span class="text-xs font-normal text-[#C8C5B4]">kN</span>
            </div>
            <div class="text-[10px] text-[#C8C5B4]/70">Drawbar Pull Force</div>
          </div>

          <!-- 3. Catenary Voltage & Amperage -->
          <div class="p-3 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 space-y-1">
            <div class="flex justify-between items-center text-[10px] text-[#C8C5B4]">
              <span>TRACTION POWER</span>
              <span class="text-[#F6AE2D]">⚡</span>
            </div>
            <div class="text-lg font-black font-mono text-[#F6AE2D]">
              ${catenaryVoltageKv.toFixed(1)} <span class="text-xs font-normal text-[#C8C5B4]">kV</span>
            </div>
            <div class="text-[10px] text-[#C8C5B4]/70 font-mono">Current: ${tractionCurrentAmps} A</div>
          </div>

          <!-- 4. G-Force Ride Quality -->
          <div class="p-3 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 space-y-1">
            <div class="flex justify-between items-center text-[10px] text-[#C8C5B4]">
              <span>RIDE VIBRATION INDEX</span>
              <span>📊</span>
            </div>
            <div class="text-lg font-black font-mono text-[#EEEBDA]">
              ${gForce} <span class="text-xs font-normal text-[#C8C5B4]">G</span>
            </div>
            <div class="text-[10px] text-[#2EC4B6] font-bold">Ultra Smooth (Air Suspension)</div>
          </div>
        </div>

        <!-- Track Elevation & Gradient Cross-Section SVG -->
        <div class="p-3 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15">
          <div class="flex justify-between items-center text-[11px] text-[#C8C5B4] mb-2">
            <span>Route Elevation AMSL Profile</span>
            <span class="font-mono text-[#F26419] font-bold">Current: ${telemetry.gps.elevation}m AMSL (Gradient: ${telemetry.gps.gradient}%)</span>
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
                stroke="#F26419" 
                stroke-width="2" 
              />
              <!-- Active Train Pin on profile -->
              <circle cx="${Math.min(490, Math.max(10, telemetry.progress * 500))}" cy="30" r="4.5" fill="#2EC4B6" stroke="#EEEBDA" stroke-width="1.5" />
              
              <defs>
                <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(242, 100, 25, 0.35)" />
                  <stop offset="100%" stop-color="rgba(242, 100, 25, 0.02)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    `;
  }
}
