/**
 * RailPulse AI - Coach Position Locator & Interactive Seat Matrix
 * Visualizes coach composition, distance from Foot Overbridge, and interactive seat berths
 */

export class CoachLayoutComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedCoachIndex = 0;
  }

  render(train) {
    if (!this.container) return;
    const coaches = train.rakeComposition;
    const selectedCoach = coaches[this.selectedCoachIndex] || coaches[0];

    this.container.innerHTML = `
      <div class="glass-panel p-4 mb-4">
        <div class="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🚃</span>
            <h3 class="font-bold text-sm tracking-wide text-cyan-400 uppercase">Live Coach Formation & Platform Position</h3>
          </div>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            Total Coaches: ${coaches.length}
          </span>
        </div>

        <!-- Scrollable Horizontal Rake Track -->
        <div class="relative py-3 overflow-x-auto select-none">
          <div class="flex items-center space-x-2 min-w-max px-2">
            <!-- Locomotive Icon -->
            <div class="flex flex-col items-center bg-blue-900/60 border border-blue-400/50 rounded-lg p-2.5 shadow-md">
              <span class="text-xs font-bold text-blue-200">LOCO</span>
              <span class="text-lg">🚅</span>
              <span class="text-[10px] text-blue-300 font-mono">Engine</span>
            </div>

            <!-- Coaches Loop -->
            ${coaches.map((c, idx) => {
              const isSelected = idx === this.selectedCoachIndex;
              const border = isSelected ? "border-cyan-400 bg-cyan-900/40 shadow-[0_0_12px_rgba(0,229,255,0.4)]" : "border-slate-700 bg-slate-800/60 hover:border-slate-500";
              const classColor = c.class === "EC" || c.class === "1A" ? "text-amber-400" : c.class === "2A" ? "text-purple-400" : "text-cyan-400";
              return `
                <button 
                  data-coach-idx="${idx}"
                  class="coach-btn flex flex-col items-center border rounded-lg px-3 py-2 min-w-[70px] transition-all cursor-pointer ${border}">
                  <span class="text-xs font-bold ${classColor}">${c.code}</span>
                  <span class="text-[10px] text-slate-300 font-mono">${c.class}</span>
                  <span class="text-[9px] text-slate-400 mt-1">${c.seats} Berths</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Selected Coach Detail & Seat Matrix Card -->
        <div class="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-sm">${selectedCoach.code}</span>
              <span class="text-sm font-semibold text-slate-200">${selectedCoach.type}</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">Class: <strong class="text-white">${selectedCoach.class}</strong> | Total Capacity: <strong class="text-white">${selectedCoach.seats} passengers</strong></p>
          </div>

          <div class="text-xs text-slate-300 space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-400">Position from Engine:</span>
              <span class="font-mono text-cyan-300">${(this.selectedCoachIndex + 1) * 26} meters</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Nearest Platform Access:</span>
              <span class="text-emerald-400">Foot Overbridge (FOB) #2</span>
            </div>
          </div>

          <!-- Coach Berths Mini Grid Preview -->
          <div class="flex items-center justify-end space-x-1.5">
            <div class="text-[10px] text-slate-400 text-right mr-2">
              <div>Seat Layout</div>
              <div class="text-cyan-400 font-mono">2x2 or 3x2 Grid</div>
            </div>
            <div class="grid grid-cols-4 gap-1 p-1.5 bg-slate-800 rounded border border-slate-700">
              <span class="w-4 h-4 rounded bg-cyan-600/60 text-[8px] flex items-center justify-center font-bold">W</span>
              <span class="w-4 h-4 rounded bg-slate-600/60 text-[8px] flex items-center justify-center">M</span>
              <span class="w-4 h-4 rounded bg-slate-600/60 text-[8px] flex items-center justify-center">A</span>
              <span class="w-4 h-4 rounded bg-amber-600/60 text-[8px] flex items-center justify-center font-bold">SL</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach click listeners
    this.container.querySelectorAll(".coach-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-coach-idx"), 10);
        this.selectedCoachIndex = idx;
        this.render(train);
      });
    });
  }
}
