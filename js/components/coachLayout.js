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
      <div class="transit-card p-4 mb-4 bg-[#282B4A] border-[#EEEBDA]/15 text-[#EEEBDA]">
        <div class="flex items-center justify-between mb-3 border-b border-[#EEEBDA]/15 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🚃</span>
            <h3 class="font-bold text-sm tracking-wide text-[#EEEBDA] uppercase">Live Coach Formation & Platform Position</h3>
          </div>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#1C1E34] text-[#EEEBDA] border border-[#EEEBDA]/20 font-bold font-mono">
            Total Coaches: ${coaches.length}
          </span>
        </div>

        <!-- Scrollable Horizontal Rake Track -->
        <div class="relative py-3 overflow-x-auto select-none">
          <div class="flex items-center space-x-2 min-w-max px-2">
            <!-- Locomotive Icon -->
            <div class="flex flex-col items-center bg-[#EEEBDA] text-[#282B4A] rounded-lg p-2.5 shadow-md border border-[#EEEBDA]">
              <span class="text-xs font-black">LOCO</span>
              <span class="text-lg">🚅</span>
              <span class="text-[10px] font-bold font-mono">Engine</span>
            </div>

            <!-- Coaches Loop -->
            ${coaches.map((c, idx) => {
              const isSelected = idx === this.selectedCoachIndex;
              const border = isSelected ? "border-[#EEEBDA] bg-[#EEEBDA] text-[#282B4A] font-bold shadow-md" : "border-[#EEEBDA]/15 bg-[#1C1E34] text-[#EEEBDA] hover:border-[#EEEBDA]/40";
              const classColor = isSelected ? "text-[#282B4A]" : (c.class === "EC" || c.class === "1A" ? "text-[#F6AE2D]" : c.class === "2A" ? "text-[#6AD5FF]" : "text-[#EEEBDA]");
              return `
                <button 
                  data-coach-idx="${idx}"
                  class="coach-btn flex flex-col items-center border rounded-lg px-3 py-2 min-w-[70px] transition-all cursor-pointer ${border}">
                  <span class="text-xs font-bold ${classColor}">${c.code}</span>
                  <span class="text-[10px] font-mono opacity-80">${c.class}</span>
                  <span class="text-[9px] opacity-60 mt-1">${c.seats} Berths</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Selected Coach Detail & Seat Matrix Card -->
        <div class="mt-4 p-3.5 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded bg-[#EEEBDA] text-[#282B4A] font-black text-sm">${selectedCoach.code}</span>
              <span class="text-sm font-semibold text-[#EEEBDA]">${selectedCoach.type}</span>
            </div>
            <p class="text-xs text-[#C8C5B4] mt-1">Class: <strong class="text-[#EEEBDA]">${selectedCoach.class}</strong> | Total Capacity: <strong class="text-[#EEEBDA]">${selectedCoach.seats} passengers</strong></p>
          </div>

          <div class="text-xs text-[#C8C5B4] space-y-1">
            <div class="flex justify-between">
              <span>Position from Engine:</span>
              <span class="font-mono text-[#EEEBDA] font-bold">${(this.selectedCoachIndex + 1) * 26} meters</span>
            </div>
            <div class="flex justify-between">
              <span>Nearest Platform Access:</span>
              <span class="text-[#2EC4B6] font-bold">Foot Overbridge (FOB) #2</span>
            </div>
          </div>

          <!-- Coach Berths Mini Grid Preview -->
          <div class="flex items-center justify-end space-x-1.5">
            <div class="text-[10px] text-[#C8C5B4] text-right mr-2">
              <div>Seat Layout</div>
              <div class="text-[#EEEBDA] font-mono">2x2 or 3x2 Grid</div>
            </div>
            <div class="grid grid-cols-4 gap-1 p-1.5 bg-[#282B4A] rounded border border-[#EEEBDA]/15">
              <span class="w-4 h-4 rounded bg-[#32365C] text-[8px] flex items-center justify-center font-bold text-[#EEEBDA]">W</span>
              <span class="w-4 h-4 rounded bg-[#32365C] text-[8px] flex items-center justify-center text-[#C8C5B4]">M</span>
              <span class="w-4 h-4 rounded bg-[#32365C] text-[8px] flex items-center justify-center text-[#C8C5B4]">A</span>
              <span class="w-4 h-4 rounded bg-[#F26419] text-[8px] flex items-center justify-center font-bold text-white">SL</span>
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

