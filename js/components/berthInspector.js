/**
 * RailPulse AI - Interactive Coach Berth Map & Seat Inspector
 * Visualizes authentic Indian Railway cabin bays (LB, MB, UB, SL, SU, Window Seats)
 */

export class BerthInspectorComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedClass = "CC"; // "CC" | "EC" | "3A" | "2A" | "1A"
    this.selectedSeat = 18;
  }

  generateSeats(coachClass) {
    const seats = [];
    if (coachClass === "CC") {
      // 78 seats, 3x2 layout
      for (let i = 1; i <= 78; i++) {
        const mod = i % 5;
        let type = "Aisle";
        if (mod === 1 || mod === 0) type = "Window";
        else if (mod === 2) type = "Middle";
        seats.push({
          number: i,
          type,
          amenities: ["Universal 230V Socket", "USB Fast Charge", "LED Reading Lamp", "Bottle Holder"]
        });
      }
    } else if (coachClass === "EC") {
      // 52 seats, 2x2 layout
      for (let i = 1; i <= 52; i++) {
        const mod = i % 4;
        const type = (mod === 1 || mod === 0) ? "Window" : "Aisle";
        seats.push({
          number: i,
          type,
          amenities: ["180° Rotating Seat", "Recline Angle 125°", "Retractable Meal Tray", "Footrest", "Individual Audio Jack"]
        });
      }
    } else if (coachClass === "3A") {
      // 72 berths, 8 per bay
      for (let i = 1; i <= 72; i++) {
        const mod = i % 8;
        let type = "Lower (LB)";
        if (mod === 2 || mod === 5) type = "Middle (MB)";
        else if (mod === 3 || mod === 6) type = "Upper (UB)";
        else if (mod === 7) type = "Side Lower (SL)";
        else if (mod === 0) type = "Side Upper (SU)";
        seats.push({
          number: i,
          type,
          amenities: ["Fresh Linen Set", "Blanket", "Individual Reading Light", "Curtain (Selected Trains)"]
        });
      }
    } else {
      // 2A (54 berths)
      for (let i = 1; i <= 54; i++) {
        const mod = i % 6;
        let type = "Lower (LB)";
        if (mod === 2 || mod === 4) type = "Upper (UB)";
        else if (mod === 5) type = "Side Lower (SL)";
        else if (mod === 0) type = "Side Upper (SU)";
        seats.push({
          number: i,
          type,
          amenities: ["Wide Berth (70cm)", "Full Privacy Curtains", "Personal Reading Lamp", "Pillow & Blanket"]
        });
      }
    }
    return seats;
  }

  render() {
    if (!this.container) return;
    const seats = this.generateSeats(this.selectedClass);
    const selectedSeatObj = seats.find(s => s.number === this.selectedSeat) || seats[0];

    this.container.innerHTML = `
      <div class="glass-panel p-4 mb-4">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-cyan-500/20 pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🪑</span>
            <div>
              <h3 class="font-bold text-sm tracking-wide text-cyan-400 uppercase">3D Coach Berth Map & Seat Inspector</h3>
              <p class="text-[11px] text-slate-400">Interactive Berth Allocation & Passenger Comfort Guide</p>
            </div>
          </div>

          <!-- Coach Class Switcher -->
          <div class="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            ${["CC", "EC", "3A", "2A"].map(cls => `
              <button 
                data-class="${cls}"
                class="class-pill px-3 py-1 rounded-lg font-bold transition ${cls === this.selectedClass ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
                ${cls}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Coach Visual Shell -->
        <div class="p-4 rounded-xl bg-slate-950/90 border border-slate-800 mb-4 select-none">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-3 px-2">
            <span>🚪 Toilet & Vestibule</span>
            <span class="font-bold text-cyan-400 uppercase">Coach Center Corridor</span>
            <span>Emergency Window 🚪</span>
          </div>

          <!-- Seat Matrix Grid -->
          <div class="max-h-56 overflow-y-auto pr-1">
            <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5 text-center">
              ${seats.map(s => {
                const isSelected = s.number === this.selectedSeat;
                const isWindow = s.type.includes("Window") || s.type.includes("SL");
                const bg = isSelected ? "bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_#00e5ff]" : isWindow ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300" : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600";
                return `
                  <button 
                    data-seat-num="${s.number}"
                    class="seat-btn p-2 rounded-lg border text-xs flex flex-col items-center justify-center transition cursor-pointer ${bg}">
                    <span class="font-bold font-mono">${s.number}</span>
                    <span class="text-[8px] opacity-75">${s.type.split(" ")[0]}</span>
                  </button>
                `;
              }).join("")}
            </div>
          </div>
        </div>

        <!-- Selected Berth Detail Inspector Card -->
        <div class="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
          <div>
            <div class="flex items-center space-x-2">
              <span class="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-bold font-mono">
                ${selectedSeatObj.number}
              </span>
              <div>
                <strong class="text-white">Seat #${selectedSeatObj.number}</strong>
                <span class="text-[11px] text-cyan-400 block">${selectedSeatObj.type}</span>
              </div>
            </div>
          </div>

          <div>
            <span class="text-slate-400 text-[10px] uppercase font-semibold block mb-0.5">Berth Amenities</span>
            <ul class="text-[11px] text-slate-300 space-y-0.5 list-disc list-inside">
              ${selectedSeatObj.amenities.slice(0, 3).map(a => `<li>${a}</li>`).join("")}
            </ul>
          </div>

          <div class="text-right">
            <span class="badge-pill bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              CONFIRMED BERTH
            </span>
            <div class="text-[10px] text-slate-400 mt-1 font-mono">Direct Window Facing View</div>
          </div>
        </div>

      </div>
    `;

    // Event handlers
    this.container.querySelectorAll(".class-pill").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.selectedClass = e.currentTarget.getAttribute("data-class");
        this.selectedSeat = 1;
        this.render();
      });
    });

    this.container.querySelectorAll(".seat-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.selectedSeat = parseInt(e.currentTarget.getAttribute("data-seat-num"), 10);
        this.render();
      });
    });
  }
}
