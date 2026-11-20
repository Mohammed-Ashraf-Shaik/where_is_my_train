/**
 * RailPulse AI - Live Station Board & Station-to-Station Train Finder
 * Displays real-time station arrivals/departures and cross-country train routing
 */

import { TRAIN_DATABASE } from "../data/trainData.js";

export class LiveStationBoardComponent {
  constructor(containerId, onSelectTrain) {
    this.container = document.getElementById(containerId);
    this.onSelectTrain = onSelectTrain;
    this.selectedStationCode = "NDLS";
    this.activeBoardTab = "departures"; // "departures" | "arrivals"
    this.searchQuery = "";
  }

  getAllStations() {
    const stationMap = new Map();
    TRAIN_DATABASE.forEach(train => {
      train.stations.forEach(st => {
        if (!stationMap.has(st.code)) {
          stationMap.set(st.code, { code: st.code, name: st.name, lat: st.lat, lon: st.lon });
        }
      });
    });
    return Array.from(stationMap.values());
  }

  getStationTimetable(stationCode) {
    const items = [];
    TRAIN_DATABASE.forEach(train => {
      const idx = train.stations.findIndex(s => s.code === stationCode);
      if (idx !== -1) {
        const st = train.stations[idx];
        const isOrigin = idx === 0;
        const isDestination = idx === train.stations.length - 1;

        items.push({
          trainId: train.id,
          trainNumber: train.number,
          trainName: train.name,
          origin: train.origin,
          destination: train.destination,
          platform: st.platform,
          schArr: st.schArr,
          schDep: st.schDep,
          actArr: st.actArr,
          actDep: st.actDep,
          delayMinutes: train.delayMinutes,
          delayStatus: train.delayStatus,
          isOrigin,
          isDestination,
          type: train.type
        });
      }
    });
    return items;
  }

  render() {
    if (!this.container) return;
    const stations = this.getAllStations();
    const currentStation = stations.find(s => s.code === this.selectedStationCode) || stations[0];
    const timetable = this.getStationTimetable(this.selectedStationCode);

    this.container.innerHTML = `
      <div class="glass-panel p-4 mb-4">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-cyan-500/20 pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🚉</span>
            <div>
              <h3 class="font-bold text-sm tracking-wide text-cyan-400 uppercase">Live Station Board & Train Search</h3>
              <p class="text-[11px] text-slate-400">Electronic Arrival & Departure Display Boards</p>
            </div>
          </div>

          <!-- Station Selector Dropdown -->
          <div class="flex items-center space-x-2">
            <span class="text-xs text-slate-400">Station:</span>
            <select 
              id="stationSelectDropdown" 
              class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer">
              ${stations.map(s => `
                <option value="${s.code}" ${s.code === this.selectedStationCode ? 'selected' : ''}>
                  ${s.code} - ${s.name}
                </option>
              `).join("")}
            </select>
          </div>
        </div>

        <!-- Station-to-Station Quick Finder Bar -->
        <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
          <div>
            <label class="text-[10px] text-slate-400 block mb-0.5">From Station</label>
            <select id="routeFromSelect" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
              ${stations.map(s => `<option value="${s.code}">${s.name} (${s.code})</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="text-[10px] text-slate-400 block mb-0.5">To Station</label>
            <select id="routeToSelect" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
              ${stations.map((s, i) => `<option value="${s.code}" ${i === 3 ? 'selected' : ''}>${s.name} (${s.code})</option>`).join("")}
            </select>
          </div>
          <div class="sm:self-end">
            <button 
              id="btnFindRouteTrains" 
              class="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center justify-center space-x-1.5">
              <span>🔍</span><span>FIND TRAINS</span>
            </button>
          </div>
        </div>

        <!-- Electronic Railway Signboard Table -->
        <div class="overflow-x-auto select-none rounded-xl border border-slate-800 bg-slate-950/70">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th class="p-3">Train # & Name</th>
                <th class="p-3">Route</th>
                <th class="p-3">Platform</th>
                <th class="p-3">Arr / Dep</th>
                <th class="p-3">Live Status</th>
                <th class="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              ${timetable.length === 0 ? `
                <tr>
                  <td colspan="6" class="p-4 text-center text-slate-500">No scheduled trains found for this station.</td>
                </tr>
              ` : timetable.map(item => {
                const delayColor = item.delayMinutes === 0 ? "text-emerald-400" : item.delayMinutes <= 10 ? "text-amber-400" : "text-red-400";
                return `
                  <tr class="hover:bg-slate-800/40 transition">
                    <td class="p-3 font-sans">
                      <div class="font-bold text-white flex items-center space-x-1.5">
                        <span class="text-cyan-400 font-mono">${item.trainNumber}</span>
                        <span>${item.trainName}</span>
                      </div>
                      <span class="text-[10px] text-slate-400 font-sans">${item.type}</span>
                    </td>
                    <td class="p-3 text-slate-300 font-sans">
                      <div class="text-[11px]">${item.origin} ➔ ${item.destination}</div>
                    </td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold font-sans">
                        P${item.platform}
                      </span>
                    </td>
                    <td class="p-3 text-slate-300">
                      <div><span class="text-slate-500 text-[10px]">STA:</span> ${item.schArr} | <span class="text-slate-500 text-[10px]">STD:</span> ${item.schDep}</div>
                      <div class="text-[10px] text-cyan-400"><span class="text-slate-500">EXP:</span> ${item.actDep}</div>
                    </td>
                    <td class="p-3">
                      <span class="font-bold ${delayColor}">${item.delayStatus}</span>
                    </td>
                    <td class="p-3 text-right">
                      <button 
                        data-track-train-id="${item.trainId}"
                        class="track-train-btn px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/60 border border-cyan-400/40 text-cyan-200 text-[11px] font-bold font-sans transition">
                        🎯 Track Live
                      </button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Attach listeners
    this.container.querySelector("#stationSelectDropdown")?.addEventListener("change", (e) => {
      this.selectedStationCode = e.target.value;
      this.render();
    });

    this.container.querySelectorAll(".track-train-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-track-train-id");
        if (this.onSelectTrain) {
          this.onSelectTrain(id);
        }
      });
    });

    this.container.querySelector("#btnFindRouteTrains")?.addEventListener("click", () => {
      const from = this.container.querySelector("#routeFromSelect")?.value;
      const to = this.container.querySelector("#routeToSelect")?.value;
      const matches = TRAIN_DATABASE.filter(t => {
        const i1 = t.stations.findIndex(s => s.code === from);
        const i2 = t.stations.findIndex(s => s.code === to);
        return i1 !== -1 && i2 !== -1 && i1 < i2;
      });

      if (matches.length > 0) {
        alert(`Found ${matches.length} direct train(s) running between ${from} and ${to}:\n` + matches.map(m => `• ${m.number} ${m.name}`).join("\n"));
        if (this.onSelectTrain) {
          this.onSelectTrain(matches[0].id);
        }
      } else {
        alert(`No direct schedule found between ${from} and ${to} in current fast corridor timetable. Showing all trains passing through ${from}.`);
        this.selectedStationCode = from;
        this.render();
      }
    });
  }
}
