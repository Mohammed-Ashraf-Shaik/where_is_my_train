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
      <div class="transit-card p-4 mb-4 bg-[#282B4A] border-[#EEEBDA]/15 text-[#EEEBDA]">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#EEEBDA]/15 pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🚉</span>
            <div>
              <h3 class="font-bold text-sm tracking-wide text-[#EEEBDA] uppercase">Live Station Board & Train Search</h3>
              <p class="text-[11px] text-[#C8C5B4]">Electronic Arrival & Departure Display Boards</p>
            </div>
          </div>

          <!-- Station Selector Dropdown -->
          <div class="flex items-center space-x-2">
            <span class="text-xs text-[#C8C5B4]">Station:</span>
            <select 
              id="stationSelectDropdown" 
              class="bg-[#32365C] border border-[#EEEBDA]/20 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#EEEBDA] focus:outline-none focus:border-[#EEEBDA] cursor-pointer">
              ${stations.map(s => `
                <option value="${s.code}" ${s.code === this.selectedStationCode ? 'selected' : ''}>
                  ${s.code} - ${s.name}
                </option>
              `).join("")}
            </select>
          </div>
        </div>

        <!-- Station-to-Station Quick Finder Bar -->
        <div class="p-3 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
          <div>
            <label class="text-[10px] text-[#C8C5B4] block mb-0.5">From Station</label>
            <select id="routeFromSelect" class="w-full bg-[#282B4A] border border-[#EEEBDA]/20 rounded-lg p-2 text-xs text-[#EEEBDA]">
              ${stations.map(s => `<option value="${s.code}">${s.name} (${s.code})</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="text-[10px] text-[#C8C5B4] block mb-0.5">To Station</label>
            <select id="routeToSelect" class="w-full bg-[#282B4A] border border-[#EEEBDA]/20 rounded-lg p-2 text-xs text-[#EEEBDA]">
              ${stations.map((s, i) => `<option value="${s.code}" ${i === 3 ? 'selected' : ''}>${s.name} (${s.code})</option>`).join("")}
            </select>
          </div>
          <div class="sm:self-end">
            <button 
              id="btnFindRouteTrains" 
              class="w-full py-2 bg-[#F26419] hover:bg-[#E65100] text-white text-xs font-bold rounded-lg shadow-md transition flex items-center justify-center space-x-1.5">
              <span>🔍</span><span>FIND TRAINS</span>
            </button>
          </div>
        </div>

        <!-- Electronic Railway Signboard Table -->
        <div class="overflow-x-auto select-none rounded-xl border border-[#EEEBDA]/15 bg-[#1C1E34]">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-[#282B4A] border-b border-[#EEEBDA]/15 text-[#C8C5B4] text-[10px] uppercase font-bold tracking-wider">
                <th class="p-3">Train # & Name</th>
                <th class="p-3">Route</th>
                <th class="p-3">Platform</th>
                <th class="p-3">Arr / Dep</th>
                <th class="p-3">Live Status</th>
                <th class="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EEEBDA]/10 font-mono">
              ${timetable.length === 0 ? `
                <tr>
                  <td colspan="6" class="p-4 text-center text-[#C8C5B4]">No scheduled trains found for this station.</td>
                </tr>
              ` : timetable.map(item => {
                const delayColor = item.delayMinutes === 0 ? "text-[#2EC4B6]" : item.delayMinutes <= 10 ? "text-[#F6AE2D]" : "text-[#E71D36]";
                return `
                  <tr class="hover:bg-[#282B4A]/60 transition">
                    <td class="p-3 font-sans">
                      <div class="font-bold text-[#EEEBDA] flex items-center space-x-1.5">
                        <span class="text-[#F26419] font-mono font-bold">${item.trainNumber}</span>
                        <span>${item.trainName}</span>
                      </div>
                      <span class="text-[10px] text-[#C8C5B4] font-sans">${item.type}</span>
                    </td>
                    <td class="p-3 text-[#EEEBDA] font-sans">
                      <div class="text-[11px]">${item.origin} ➔ ${item.destination}</div>
                    </td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded-full bg-[#EEEBDA] text-[#282B4A] text-[11px] font-black font-sans">
                        P${item.platform}
                      </span>
                    </td>
                    <td class="p-3 text-[#C8C5B4]">
                      <div><span class="text-[#C8C5B4]/60 text-[10px]">STA:</span> ${item.schArr} | <span class="text-[#C8C5B4]/60 text-[10px]">STD:</span> ${item.schDep}</div>
                      <div class="text-[10px] text-[#F26419]"><span class="text-[#C8C5B4]/60">EXP:</span> ${item.actDep}</div>
                    </td>
                    <td class="p-3">
                      <span class="font-bold ${delayColor}">${item.delayStatus}</span>
                    </td>
                    <td class="p-3 text-right">
                      <button 
                        data-track-train-id="${item.trainId}"
                        class="track-train-btn px-2.5 py-1 rounded-lg bg-[#32365C] hover:bg-[#EEEBDA] hover:text-[#282B4A] border border-[#EEEBDA]/20 text-[#EEEBDA] text-[11px] font-bold font-sans transition">
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

