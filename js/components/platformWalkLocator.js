/**
 * RailPulse AI - Platform Walk Distance & Foot Overbridge (FOB) Coach Locator
 * Helps passengers locate exact coach stopping position relative to platform stairs & FOBs
 * Editorial Midnight Indigo (#282B4A) & Vanilla (#EEEBDA) Design System
 */

export class PlatformWalkLocatorComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedOrigin = "fob1"; // fob1, fob2, main_gate, escalator
    this.selectedCoach = "C4";
    this.trainType = "vande_bharat"; // 16 coaches or 8 coaches
  }

  setTrain(train) {
    if (!train) return;
    this.train = train;
    // Set default coach from formation
    if (train.coaches && train.coaches.length > 0) {
      this.selectedCoach = train.coaches[Math.floor(train.coaches.length / 2)]?.code || "C4";
    }
    this.render();
  }

  render() {
    if (!this.container) return;

    // Platform landmarks distance from platform 0m (rear/buffer end)
    const LANDMARKS = {
      main_gate: { name: "Main Station Entrance / Porch", pos: 80, icon: "🏛️" },
      fob1: { name: "Central Foot Overbridge (FOB 1 & Stairs)", pos: 250, icon: "🪜" },
      escalator: { name: "Platform Escalator & Lift Zone", pos: 310, icon: "🛗" },
      fob2: { name: "North Foot Overbridge (FOB 2)", pos: 460, icon: "🪜" }
    };

    // Calculate coach platform positions (each coach ~24m long + engine 22m)
    const coaches = this.train?.coaches || [
      { code: "ENG", type: "WAP-7 Locomotive" },
      { code: "C1", type: "Chair Car" },
      { code: "C2", type: "Chair Car" },
      { code: "C3", type: "Chair Car" },
      { code: "C4", type: "Chair Car" },
      { code: "E1", type: "Executive Class" },
      { code: "E2", type: "Executive Class" },
      { code: "C5", type: "Chair Car" },
      { code: "C6", type: "Chair Car" },
      { code: "C7", type: "Chair Car" },
      { code: "C8", type: "Chair Car" }
    ];

    // Find coach index & position in meters from platform buffer
    const coachIdx = coaches.findIndex(c => (c.code || c) === this.selectedCoach);
    const validIdx = coachIdx >= 0 ? coachIdx : 3;
    const coachPlatformPos = 40 + (validIdx * 24.5); // coach midpoint position on 500m platform

    // Distance calculation
    const originPos = LANDMARKS[this.selectedOrigin]?.pos || 250;
    const rawDistance = Math.round(coachPlatformPos - originPos);
    const absDistance = Math.abs(rawDistance);
    const direction = rawDistance >= 0 ? "Ahead (towards Engine/Train front)" : "Behind (towards Train rear/Guard)";
    const walkSeconds = Math.round((absDistance / 1.1)); // ~1.1 m/s walking speed
    const walkMins = Math.floor(walkSeconds / 60);
    const walkSecRemainder = walkSeconds % 60;
    const luggageMins = Math.ceil(walkSeconds * 1.45 / 60);

    this.container.innerHTML = `
      <div class="transit-card p-4 mb-4 bg-[#282B4A] border-[#EEEBDA]/15 text-[#EEEBDA]">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#EEEBDA]/15 pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🚶</span>
            <div>
              <h3 class="font-bold text-sm tracking-wide text-[#EEEBDA] uppercase">Platform Walk Distance & FOB Coach Finder</h3>
              <p class="text-[11px] text-[#C8C5B4]">Calculate exact walking distance from stairs, elevators, or gates to your coach door</p>
            </div>
          </div>
          <span class="badge-pill bg-[#F26419]/20 text-[#F26419] border border-[#F26419]/40 text-[10px] font-bold">
            STANDARD 600M PLATFORM
          </span>
        </div>

        <!-- Controls: Your Platform Landmark & Target Coach -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <!-- 1. Current Passenger Location -->
          <div class="p-3 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 space-y-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-[#C8C5B4] block">
              1. Where Are You Standing on the Platform?
            </label>
            <div class="grid grid-cols-2 gap-2 text-xs">
              ${Object.entries(LANDMARKS).map(([id, info]) => `
                <button 
                  data-origin="${id}"
                  class="origin-selector-btn p-2 rounded-lg border text-left flex items-center space-x-2 transition ${this.selectedOrigin === id ? 'bg-[#EEEBDA] text-[#282B4A] border-[#EEEBDA] font-bold shadow-md' : 'bg-[#282B4A] border-[#EEEBDA]/15 text-[#C8C5B4] hover:text-[#EEEBDA]'}">
                  <span>${info.icon}</span>
                  <span class="truncate">${info.name.split('(')[0].trim()}</span>
                </button>
              `).join("")}
            </div>
          </div>

          <!-- 2. Target Coach Selector -->
          <div class="p-3 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 space-y-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-[#C8C5B4] block">
              2. Select Your Boarding Coach:
            </label>
            <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
              ${coaches.map(c => {
                const code = c.code || c;
                const isSelected = code === this.selectedCoach;
                return `
                  <button 
                    data-coach="${code}"
                    class="coach-target-btn px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition ${isSelected ? 'bg-[#F26419] text-[#EEEBDA] border-[#F26419] shadow-md' : 'bg-[#282B4A] border-[#EEEBDA]/15 text-[#C8C5B4] hover:text-[#EEEBDA] hover:border-[#EEEBDA]/35'}">
                    ${code}
                  </button>
                `;
              }).join("")}
            </div>
          </div>
        </div>

        <!-- Walk Distance & Time Calculation Result Card -->
        <div class="p-4 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <!-- Distance -->
          <div class="space-y-0.5">
            <span class="text-[10px] uppercase font-bold text-[#C8C5B4]">Walking Distance to Coach ${this.selectedCoach}</span>
            <div class="text-2xl font-black font-mono text-[#EEEBDA]">
              ${absDistance} <span class="text-xs font-normal text-[#C8C5B4]">meters</span>
            </div>
            <div class="text-[11px] font-bold text-[#F26419]">
              ➡️ Walk: ${absDistance === 0 ? "You are at your coach position!" : direction}
            </div>
          </div>

          <!-- Walk Time -->
          <div class="space-y-0.5">
            <span class="text-[10px] uppercase font-bold text-[#C8C5B4]">Estimated Walk Duration</span>
            <div class="text-xl font-black font-mono text-[#2EC4B6]">
              ${walkMins > 0 ? `${walkMins}m ${walkSecRemainder}s` : `${walkSecRemainder} seconds`}
            </div>
            <div class="text-[10px] text-[#C8C5B4]">
              🧳 With heavy luggage: ~${luggageMins} mins
            </div>
          </div>

          <!-- Platform Amenities Near Coach -->
          <div class="space-y-1 text-xs">
            <div class="flex items-center space-x-1.5 text-[#EEEBDA]">
              <span>🚪</span>
              <span><strong>Coach Doors:</strong> Opens on Left Platform face</span>
            </div>
            <div class="flex items-center space-x-1.5 text-[#EEEBDA]">
              <span>🚰</span>
              <span><strong>Water Vending:</strong> 15m from coach pillar</span>
            </div>
            <div class="flex items-center space-x-1.5 text-[#2EC4B6]">
              <span>♿</span>
              <span><strong>Accessibility:</strong> Level boarding compatible</span>
            </div>
          </div>
        </div>

        <!-- 2D Platform Visual Schematic Strip -->
        <div class="p-3 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15">
          <div class="flex justify-between items-center text-[11px] text-[#C8C5B4] mb-2">
            <span>Platform Schematic (Buffer End ➔ Engine End)</span>
            <span class="font-mono text-xs text-[#EEEBDA]">Target: Coach ${this.selectedCoach} at ~${coachPlatformPos}m mark</span>
          </div>

          <!-- Platform Strip Visual -->
          <div class="relative h-14 bg-[#282B4A] rounded-lg border border-[#EEEBDA]/20 overflow-hidden flex items-center px-2">
            <!-- Platform Edge Yellow Safety Line -->
            <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-[#F6AE2D] opacity-80"></div>

            <!-- Landmark markers -->
            <div class="absolute top-1 text-[10px] font-bold" style="left: 14%;">🏛️ Gate</div>
            <div class="absolute top-1 text-[10px] font-bold" style="left: 48%;">🪜 FOB 1</div>
            <div class="absolute top-1 text-[10px] font-bold" style="left: 60%;">🛗 Lift</div>
            <div class="absolute top-1 text-[10px] font-bold" style="left: 88%;">🪜 FOB 2</div>

            <!-- Origin Marker Pin -->
            <div 
              class="absolute bottom-2.5 transform -translate-x-1/2 flex flex-col items-center z-10 transition-all duration-300"
              style="left: ${(originPos / 520) * 100}%;">
              <span class="text-xs bg-[#EEEBDA] text-[#282B4A] px-1.5 py-0.5 rounded font-black text-[9px] shadow">YOU</span>
              <span class="w-2 h-2 rounded-full bg-[#EEEBDA] ring-2 ring-[#282B4A]"></span>
            </div>

            <!-- Target Coach Marker Pin -->
            <div 
              class="absolute bottom-2.5 transform -translate-x-1/2 flex flex-col items-center z-20 transition-all duration-300"
              style="left: ${Math.min(96, Math.max(4, (coachPlatformPos / 520) * 100))}%;">
              <span class="text-xs bg-[#F26419] text-[#EEEBDA] px-1.5 py-0.5 rounded font-black text-[9px] shadow animate-pulse">${this.selectedCoach}</span>
              <span class="w-2.5 h-2.5 rounded-full bg-[#F26419] ring-2 ring-white"></span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    this.container.querySelectorAll(".origin-selector-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.selectedOrigin = e.currentTarget.getAttribute("data-origin");
        this.render();
      });
    });

    this.container.querySelectorAll(".coach-target-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.selectedCoach = e.currentTarget.getAttribute("data-coach");
        this.render();
      });
    });
  }
}
