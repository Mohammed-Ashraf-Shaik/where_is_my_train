/**
 * RailPulse AI - PNR Status Visualizer & Confirmation Forecaster
 * Live PNR lookup simulator with AI booking confirmation probability
 */

import { COMMON_PNR_SAMPLES } from "../data/trainData.js";

export class PNRCheckerComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentPNR = COMMON_PNR_SAMPLES[0];
  }

  render() {
    if (!this.container) return;
    const pnr = this.currentPNR;

    this.container.innerHTML = `
      <div class="transit-card p-4 mb-4 bg-[#282B4A] border-[#EEEBDA]/15 text-[#EEEBDA]">
        <div class="flex items-center justify-between mb-3 border-b border-[#EEEBDA]/15 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🎫</span>
            <h3 class="font-bold text-sm tracking-wide text-[#EEEBDA] uppercase">PNR Status & Confirmation Forecaster</h3>
          </div>
          <span class="text-xs text-[#C8C5B4]">10-Digit PNR Lookup</span>
        </div>

        <!-- Search Bar with Quick Sample Buttons -->
        <div class="flex flex-col sm:flex-row gap-2 mb-3">
          <div class="relative flex-1">
            <input 
              id="pnrInput" 
              type="text" 
              maxlength="10"
              value="${pnr.pnr}" 
              placeholder="Enter 10-Digit PNR..."
              class="w-full bg-[#1C1E34] border border-[#EEEBDA]/20 rounded-lg px-3.5 py-2 text-sm text-[#EEEBDA] font-mono focus:outline-none focus:border-[#EEEBDA] transition"
            />
          </div>
          <button 
            id="pnrSearchBtn"
            class="px-4 py-2 bg-[#F26419] hover:bg-[#E65100] text-white text-xs font-bold rounded-lg shadow-md transition flex items-center justify-center space-x-1">
            <span>🔍 CHECK PNR</span>
          </button>
        </div>

        <div class="flex items-center space-x-2 mb-4 text-xs">
          <span class="text-[#C8C5B4]">Quick Test PNRs:</span>
          ${COMMON_PNR_SAMPLES.map(s => `
            <button 
              data-sample-pnr="${s.pnr}"
              class="sample-pnr-btn px-2 py-0.5 rounded bg-[#32365C] hover:bg-[#EEEBDA] hover:text-[#282B4A] text-[#EEEBDA] font-mono text-[11px] border border-[#EEEBDA]/15 transition">
              ${s.pnr}
            </button>
          `).join("")}
        </div>

        <!-- PNR Status Result Box -->
        <div class="p-3.5 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEEBDA]/15 pb-2.5">
            <div>
              <span class="text-xs font-bold text-[#EEEBDA]">${pnr.trainName} (${pnr.trainNumber})</span>
              <div class="text-[11px] text-[#C8C5B4]">Route: <strong class="text-[#EEEBDA]">${pnr.from} ➔ ${pnr.to}</strong> | Class: <strong class="text-[#F6AE2D]">${pnr.class}</strong> | DOJ: <strong>${pnr.doj}</strong></div>
            </div>
            <div class="text-right">
              <span class="badge-pill bg-[#2EC4B6]/20 text-[#2EC4B6] border border-[#2EC4B6]/40">
                ${pnr.chartStatus}
              </span>
            </div>
          </div>

          <!-- Passenger Rows -->
          <div class="space-y-1.5">
            ${pnr.passengers.map(p => `
              <div class="flex items-center justify-between text-xs p-2 rounded-lg bg-[#282B4A] border border-[#EEEBDA]/10">
                <span class="font-medium text-[#EEEBDA]">Passenger #${p.number}</span>
                <span class="text-[#C8C5B4]">Booking: <strong class="text-[#F6AE2D] font-mono">${p.bookingStatus}</strong></span>
                <span class="text-[#C8C5B4]">Current: <strong class="text-[#2EC4B6] font-mono">${p.currentStatus}</strong></span>
                <span class="text-[#EEEBDA] font-mono font-bold">${p.coach ? `Coach ${p.coach} / Berth ${p.berth}` : "--"}</span>
              </div>
            `).join("")}
          </div>

          <!-- AI Prediction Banner -->
          <div class="p-2.5 rounded-lg bg-[#282B4A] border border-[#EEEBDA]/15 flex items-center space-x-2.5 text-xs text-[#EEEBDA]">
            <span class="text-base">🧠</span>
            <div>
              <strong class="text-[#F26419]">Confirmation Forecast:</strong> ${pnr.aiPrediction}
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    this.container.querySelectorAll(".sample-pnr-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const val = e.currentTarget.getAttribute("data-sample-pnr");
        const found = COMMON_PNR_SAMPLES.find(s => s.pnr === val);
        if (found) {
          this.currentPNR = found;
          this.render();
        }
      });
    });

    const searchBtn = this.container.querySelector("#pnrSearchBtn");
    const input = this.container.querySelector("#pnrInput");
    if (searchBtn && input) {
      searchBtn.addEventListener("click", () => {
        const query = input.value.trim();
        const found = COMMON_PNR_SAMPLES.find(s => s.pnr === query);
        if (found) {
          this.currentPNR = found;
          this.render();
        } else {
          // Dynamic simulated PNR
          this.currentPNR = {
            pnr: query || "1234567890",
            trainNumber: "22436",
            trainName: "Vande Bharat Express",
            doj: "Confirmed Today",
            from: "NDLS",
            to: "BSB",
            class: "CC",
            passengers: [
              { number: 1, bookingStatus: "WL 3", currentStatus: "CNF", coach: "C1", berth: "18 (Window)" }
            ],
            chartStatus: "Chart Prepared",
            aiPrediction: "100% Confirmed Berth Allocated"
          };
          this.render();
        }
      });
    }
  }
}

