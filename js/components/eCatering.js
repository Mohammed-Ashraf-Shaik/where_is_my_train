/**
 * RailPulse AI - IRCTC E-Catering Station Food Explorer & Seat Delivery
 * Curates famous regional culinary specialties and simulates hot meal delivery to passenger seats
 * Editorial Midnight Indigo (#282B4A) & Vanilla (#EEEBDA) Design System
 */

export const STATION_FOOD_DIRECTORY = {
  NDLS: [
    { id: "f1", name: "Executive North Indian Thali", vendor: "Haldiram's IRCTC", price: 240, type: "veg", rating: 4.8, prepMins: 15 },
    { id: "f2", name: "Amritsari Kulcha with Chole", vendor: "Bikanervala", price: 160, type: "veg", rating: 4.9, prepMins: 12 },
    { id: "f3", name: "Kulhad Masala Chai & Samosa", vendor: "Chaayos Express", price: 80, type: "veg", rating: 4.7, prepMins: 8 }
  ],
  CNB: [
    { id: "f4", name: "Kanpuri Thaggu Ke Laddu", vendor: "Thaggu Special (Authentic)", price: 280, type: "veg", rating: 4.95, prepMins: 5 },
    { id: "f5", name: "Awadhi Dum Biryani Box", vendor: "Behrouz IRCTC Express", price: 320, type: "non-veg", rating: 4.8, prepMins: 20 },
    { id: "f6", name: "Badam Kulfi Falooda", vendor: "Kanpur Dairy Point", price: 90, type: "veg", rating: 4.6, prepMins: 5 }
  ],
  PRYJ: [
    { id: "f7", name: "Prayagraj Dam Aloo & Kachori", vendor: "Loknath Food Hub", price: 120, type: "veg", rating: 4.85, prepMins: 10 },
    { id: "f8", name: "Special Shahi Khoya Gujiya", vendor: "Chhappan Bhog", price: 220, type: "veg", rating: 4.9, prepMins: 5 }
  ],
  BSB: [
    { id: "f9", name: "Banarasi Malaiyyo & Rabdi", vendor: "Kashi Sweets", price: 110, type: "veg", rating: 4.98, prepMins: 6 },
    { id: "f10", name: "Kashi Puri Bhaji & Jalebi", vendor: "Ram Bhandar Express", price: 130, type: "veg", rating: 4.9, prepMins: 10 }
  ],
  KOTA: [
    { id: "f11", name: "Kota Famous Pyaz Ki Kachori", vendor: "Jodhpur Sweet Home", price: 70, type: "veg", rating: 4.9, prepMins: 5 },
    { id: "f12", name: "Dal Baati Churma Rajasthani Thali", vendor: "Ghoomar Express", price: 290, type: "veg", rating: 4.85, prepMins: 18 }
  ],
  RTM: [
    { id: "f13", name: "GI-Tagged Ratlami Laung Sev", vendor: "Ratan Sev Bhandar", price: 150, type: "veg", rating: 5.0, prepMins: 5 },
    { id: "f14", name: "Indori Poha with Sev & Jalebi", vendor: "Malwa Express Bites", price: 85, type: "veg", rating: 4.8, prepMins: 8 }
  ],
  LNL: [
    { id: "f15", name: "Maganlal Chikki Gift Assortment", vendor: "Maganlal Original", price: 210, type: "veg", rating: 4.9, prepMins: 5 },
    { id: "f16", name: "Ghat Corn Cheese Toast & Chai", vendor: "Khandala Express", price: 95, type: "veg", rating: 4.7, prepMins: 10 }
  ]
};

export class ECateringComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentStationCode = "CNB";
    this.cart = [];
    this.activeFilter = "all";
  }

  setStation(code) {
    this.currentStationCode = code;
    this.render();
  }

  render() {
    if (!this.container) return;
    const items = STATION_FOOD_DIRECTORY[this.currentStationCode] || STATION_FOOD_DIRECTORY["NDLS"];
    const filtered = items.filter(item => {
      if (this.activeFilter === "veg") return item.type === "veg";
      if (this.activeFilter === "non-veg") return item.type === "non-veg";
      return true;
    });

    this.container.innerHTML = `
      <div class="transit-card p-4 mb-4 bg-[#282B4A] border-[#EEEBDA]/15 text-[#EEEBDA]">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#EEEBDA]/15 pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🍱</span>
            <div>
              <h3 class="font-bold text-sm tracking-wide text-[#EEEBDA] uppercase">IRCTC e-Catering & Famous Station Food</h3>
              <p class="text-[11px] text-[#C8C5B4]">Order Hot Regional Specialties Delivered Directly to Your Coach Seat</p>
            </div>
          </div>

          <!-- Station Pills -->
          <div class="flex items-center space-x-1.5 text-xs overflow-x-auto">
            <span class="text-[#C8C5B4] mr-1">Station:</span>
            ${Object.keys(STATION_FOOD_DIRECTORY).map(code => `
              <button 
                data-st-code="${code}"
                class="st-food-pill px-2.5 py-1 rounded-lg border font-mono font-bold transition ${code === this.currentStationCode ? 'bg-[#EEEBDA] text-[#282B4A] border-[#EEEBDA] shadow-md' : 'bg-[#1C1E34] border-[#EEEBDA]/15 text-[#C8C5B4] hover:border-[#EEEBDA]/35 hover:text-[#EEEBDA]'}">
                ${code}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Food Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          ${filtered.map(food => `
            <div class="p-3 rounded-xl bg-[#1C1E34] border border-[#EEEBDA]/15 flex flex-col justify-between space-y-2 hover:border-[#EEEBDA]/35 transition">
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="w-3.5 h-3.5 rounded-sm border ${food.type === 'veg' ? 'border-[#2EC4B6] flex items-center justify-center' : 'border-[#E71D36] flex items-center justify-center'}">
                    <span class="w-1.5 h-1.5 rounded-full ${food.type === 'veg' ? 'bg-[#2EC4B6]' : 'bg-[#E71D36]'}"></span>
                  </span>
                  <span class="text-[#F6AE2D] font-bold font-mono text-[11px]">⭐ ${food.rating}</span>
                </div>
                <h4 class="font-bold text-sm text-[#EEEBDA]">${food.name}</h4>
                <div class="text-[10px] text-[#C8C5B4]">By: <strong class="text-[#EEEBDA]">${food.vendor}</strong></div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-[#EEEBDA]/10">
                <span class="text-base font-black font-mono text-[#EEEBDA]">₹${food.price}</span>
                <button 
                  data-food-id="${food.id}"
                  data-food-name="${food.name}"
                  data-food-price="${food.price}"
                  class="order-food-btn px-3 py-1.5 bg-[#F26419] hover:bg-[#d85511] text-[#EEEBDA] text-xs font-bold rounded-lg shadow-md transition flex items-center space-x-1">
                  <span>🛒</span><span>ORDER SEAT</span>
                </button>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Delivery Guarantee Footer -->
        <div class="p-2.5 rounded-lg bg-[#32365C] border border-[#EEEBDA]/20 flex items-center justify-between text-xs text-[#EEEBDA]">
          <div class="flex items-center space-x-2">
            <span>🛡️</span>
            <span><strong>IRCTC Cleanliness & Quality Seal:</strong> Delivered hot & fresh in tamper-proof seal packaging to Coach & Seat Number at the platform stop.</span>
          </div>
        </div>
      </div>
    `;

    // Listeners
    this.container.querySelectorAll(".st-food-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        this.currentStationCode = e.currentTarget.getAttribute("data-st-code");
        this.render();
      });
    });

    this.container.querySelectorAll(".order-food-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const name = e.currentTarget.getAttribute("data-food-name");
        const price = e.currentTarget.getAttribute("data-food-price");
        alert(`🍽️ Order Placed Successfully!\nItem: ${name} (₹${price})\nDelivering to your seat at ${this.currentStationCode} Platform Arrival.`);
      });
    });
  }
}
