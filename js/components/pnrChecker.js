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
      <div class="glass-panel p-4 mb-4">
        <div class="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🎫</span>
            <h3 class="font-bold text-sm tracking-wide text-cyan-400 uppercase">AI PNR Status & Confirmation Predictor</h3>
          </div>
          <span class="text-xs text-slate-400">10-Digit PNR Lookup</span>
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
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
          <button 
            id="pnrSearchBtn"
            class="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center justify-center space-x-1">
            <span>🔍 CHECK PNR</span>
          </button>
        </div>

        <div class="flex items-center space-x-2 mb-4 text-xs">
          <span class="text-slate-400">Quick Test PNRs:</span>
          ${COMMON_PNR_SAMPLES.map(s => `
            <button 
              data-sample-pnr="${s.pnr}"
              class="sample-pnr-btn px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-[11px] border border-slate-700">
              ${s.pnr}
            </button>
          `).join("")}
        </div>

        <!-- PNR Status Result Box -->
        <div class="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div>
              <span class="text-xs font-bold text-white">${pnr.trainName} (${pnr.trainNumber})</span>
              <div class="text-[11px] text-slate-400">Route: <strong class="text-cyan-400">${pnr.from} ➔ ${pnr.to}</strong> | Class: <strong class="text-amber-400">${pnr.class}</strong> | DOJ: <strong>${pnr.doj}</strong></div>
            </div>
            <div class="text-right">
              <span class="badge-pill bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ${pnr.chartStatus}
              </span>
            </div>
          </div>

          <!-- Passenger Rows -->
          <div class="space-y-1.5">
            ${pnr.passengers.map(p => `
              <div class="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span class="font-medium text-slate-300">Passenger #${p.number}</span>
                <span class="text-slate-400">Booking: <strong class="text-amber-400 font-mono">${p.bookingStatus}</strong></span>
                <span class="text-slate-400">Current: <strong class="text-emerald-400 font-mono">${p.currentStatus}</strong></span>
                <span class="text-cyan-300 font-mono font-bold">${p.coach ? `Coach ${p.coach} / Berth ${p.berth}` : "--"}</span>
              </div>
            `).join("")}
          </div>

          <!-- AI Prediction Banner -->
          <div class="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center space-x-2.5 text-xs text-cyan-200">
            <span class="text-base">🧠</span>
            <div>
              <strong class="text-cyan-400">AI Confirmation Forecast:</strong> ${pnr.aiPrediction}
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

