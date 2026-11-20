/**
 * RailPulse AI - Track Topology, Neutral Section & Caution Order Monitor
 * Simulates real-world Indian Railways civil engineering telemetry:
 * 25kV OHE Neutral Sections, Permanent Speed Restrictions (PSR), Bridges & Ghat Incline
 * Throttled rendering (300ms) for high performance & zero DOM churn
 * Editorial Midnight Indigo (#282B4A) & Vanilla (#EEEBDA) Design System
 */

export class TrackTopologyMonitorComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.lastRenderTime = 0;
  }

  render(telemetry, train) {
    if (!this.container || !telemetry) return;

    // Throttle rendering to ~3Hz (every 300ms) to prevent unnecessary DOM reflow
    const now = performance.now();
    if (now - this.lastRenderTime < 300) return;
    this.lastRenderTime = now;

    // Track progression calculations
    const progress = telemetry.progress || 0.45;
    const currentKm = Math.round(progress * (train?.totalKm || 750));
    
    // Decrement distance to upcoming neutral section
    const neutralCycle = (currentKm % 40);
    const distToNeutral = (40 - neutralCycle).toFixed(1);
    const isApproachingNeutral = distToNeutral < 1.5;
    const isInsideNeutral = distToNeutral < 0.2;

    const vcbState = isInsideNeutral ? "OPEN (COASTING)" : "CLOSED (POWERING)";
    const vcbColor = isInsideNeutral ? "#F6AE2D" : "#2EC4B6";

    // Dynamic Waypoints ahead
    const WAYPOINTS = [
      {
        name: "Yamuna / Ganga Major Bridge No. 128",
        type: "bridge",
        kmMarker: currentKm + 2.4,
        speedLimit: 100,
        warning: "Ballastless Track Steel Girder - Continuous Whistle Zone",
        icon: "🌉"
      },
      {
        name: "25kV AC Neutral Section (Phase Break)",
        type: "neutral",
        kmMarker: currentKm + parseFloat(distToNeutral),
        speedLimit: 130,
        warning: "Open VCB (Vacuum Circuit Breaker) - Coast for 41 Meters",
        icon: "⚡"
      },
      {
        name: "Manned Level Crossing Gate No. 64-A",
        type: "crossing",
        kmMarker: currentKm + 5.1,
        speedLimit: 130,
        warning: "W/L Whistle Board - Interlocked Signal Protected",
        icon: "🚸"
      },
      {
        name: "Curve Km 438-B (2.4° Cant Deficiency)",
        type: "curve",
        kmMarker: currentKm + 8.7,
        speedLimit: 110,
        warning: "Permanent Speed Restriction (PSR) - Transition Spiral",
        icon: "🔄"
      }
    ];

    this.container.innerHTML = `
      <div class="transit-card p-4 mb-4 bg-[#282B4A] border-[#EEEBDA]/15 text-[#EEEBDA]">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#EEEBDA]/15 pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🛤️</span>
            <div>
              <h3 class="font-bold text-sm tracking-wide text-[#EEEBDA] uppercase">Track Topology, Caution Orders & Neutral Zones</h3>
              <p class="text-[11px] text-[#C8C5B4]">Civil Engineering Track Geometry & 25kV Electrification Phase Breaks</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="badge-pill bg-[#1C1E34] text-[#EEEBDA] border border-[#EEEBDA]/20 text-[10px] font-mono">
              KM ${currentKm} / ${train?.totalKm || 750}
            </span>
          </div>
        </div>

        <!-- 3 High-Priority Real-Time Gauges -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
          <!-- 1. Neutral Section Warning -->
          <div class="p-3 rounded-xl bg-[#1C1E34] border ${isApproachingNeutral ? 'border-[#F6AE2D] animate-pulse' : 'border-[#EEEBDA]/15'} space-y-1">
            <div class="flex justify-between items-center text-[10px] text-[#C8C5B4]">
              <span>NEXT 25kV NEUTRAL SECTION</span>
              <span class="text-[#F6AE2D]">⚡</span>
            </div>
            <div class="text-lg font-black font-mono text-[#F6AE2D]">
              ${distToNeutral} <span class="text-xs font-normal text-[#C8C5B4]">km ahead</span>
            </div>
            <div class="text-[10px] flex items-center justify-between">
              <span class="text-[#C8C5B4]">VCB State:</span>
              <strong style="color: ${vcbColor}">${vcbState}</strong>
            </div>
          </div>

          <!-- 2. Section Speed Rule -->
          <div class="p-3 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 space-y-1">
            <div class="flex justify-between items-center text-[10px] text-[#C8C5B4]">
              <span>SECTION SPEED PERMISSIBILITY</span>
              <span>🚦</span>
            </div>
            <div class="text-lg font-black font-mono text-[#EEEBDA]">
              ${telemetry.maxSpeedKmh} <span class="text-xs font-normal text-[#C8C5B4]">km/h</span>
            </div>
            <div class="text-[10px] text-[#2EC4B6]">
              Section: Track Class A (160 km/h fit)
            </div>
          </div>

          <!-- 3. Track Gradient Profile -->
          <div class="p-3 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 space-y-1">
            <div class="flex justify-between items-center text-[10px] text-[#C8C5B4]">
              <span>TRACK RULING GRADIENT</span>
              <span>📐</span>
            </div>
            <div class="text-lg font-black font-mono text-[#F26419]">
              1 in 150 <span class="text-xs font-normal text-[#C8C5B4]">(${telemetry.gps?.gradient || '0.2'}%)</span>
            </div>
            <div class="text-[10px] text-[#C8C5B4]">
              Elevation: ${telemetry.gps?.elevation || '185'}m AMSL (Level Track)
            </div>
          </div>
        </div>

        <!-- Upcoming Waypoint Track Ahead Timeline -->
        <div class="space-y-2">
          <span class="text-[10px] uppercase font-bold tracking-wider text-[#C8C5B4] block">
            Upcoming Track Caution Orders & Engineering Waypoints
          </span>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            ${WAYPOINTS.map(w => `
              <div class="p-2.5 rounded-lg bg-[#1C1E34] border border-[#EEEBDA]/15 flex items-start space-x-2.5">
                <span class="text-xl p-1 bg-[#282B4A] rounded-lg border border-[#EEEBDA]/10">${w.icon}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <strong class="text-xs text-[#EEEBDA] truncate">${w.name}</strong>
                    <span class="font-mono text-[10px] text-[#F26419] font-bold">KM ${w.kmMarker.toFixed(1)}</span>
                  </div>
                  <p class="text-[10px] text-[#C8C5B4] mt-0.5">${w.warning}</p>
                  <div class="flex items-center space-x-2 mt-1 text-[9px] font-mono text-[#C8C5B4]/80">
                    <span>Permissible: <strong>${w.speedLimit} km/h</strong></span>
                    <span>•</span>
                    <span>Dist: <strong>${Math.max(0.1, (w.kmMarker - currentKm)).toFixed(1)} km</strong></span>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Driver Operating Rule Advisory Notice -->
        <div class="mt-3 p-2.5 rounded-lg bg-[#32365C] border border-[#EEEBDA]/15 flex items-center justify-between text-xs text-[#EEEBDA]">
          <div class="flex items-center space-x-2">
            <span>🛡️</span>
            <span><strong>IR General Rules 4.41:</strong> Locomotive pilot complies with W/L boards, neutral sections, and speed cautions via Kavach TCAS supervision.</span>
          </div>
        </div>
      </div>
    `;
  }
}
