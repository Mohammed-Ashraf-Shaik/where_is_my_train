/**
 * RailPulse AI - Train Database & Geographical Route Matrix
 * Comprehensive Indian Railways Roster, Station Geolocations & Timetables
 */

export const TRAIN_DATABASE = [
  {
    id: "22436",
    number: "22436",
    name: "Vande Bharat Express",
    type: "Superfast / Semi-High Speed EMU",
    origin: "New Delhi (NDLS)",
    destination: "Varanasi Jn (BSB)",
    maxSpeed: 160,
    cruisingSpeed: 130,
    currentSpeed: 124,
    locomotive: "Vande Bharat Trainset 2.0 (Electric EMU 3kV/25kV)",
    rakeComposition: [
      { code: "DTC-1", type: "Driver Motor Coach", seats: 44, class: "CC" },
      { code: "ND-1", type: "Non-Driving Trailer Coach", seats: 78, class: "CC" },
      { code: "ND-2", type: "Non-Driving Trailer Coach", seats: 78, class: "CC" },
      { code: "EC-1", type: "Executive Class Trailer", seats: 52, class: "EC" },
      { code: "EC-2", type: "Executive Class Trailer", seats: 52, class: "EC" },
      { code: "ND-3", type: "Non-Driving Trailer Coach", seats: 78, class: "CC" },
      { code: "ND-4", type: "Non-Driving Trailer Coach", seats: 78, class: "CC" },
      { code: "ND-5", type: "Non-Driving Trailer Coach", seats: 78, class: "CC" },
      { code: "DTC-2", type: "Driver Motor Coach", seats: 44, class: "CC" }
    ],
    delayMinutes: 4,
    delayStatus: "On Time (4m drift)",
    pantryAvailable: true,
    cleanlinessRating: 4.9,
    stations: [
      {
        code: "NDLS",
        name: "New Delhi",
        platform: 16,
        distanceKm: 0,
        schArr: "Source",
        schDep: "06:00",
        actArr: "Source",
        actDep: "06:00",
        lat: 28.6427,
        lon: 77.2198,
        elevationM: 216,
        dwellMin: 0,
        crowdIndex: "High",
        amenities: ["Executive Lounge", "Food Plaza", "Wi-Fi", "Battery Cars", "Escalator"]
      },
      {
        code: "CNB",
        name: "Kanpur Central",
        platform: 1,
        distanceKm: 440,
        schArr: "10:08",
        schDep: "10:10",
        actArr: "10:11",
        actDep: "10:13",
        lat: 26.4539,
        lon: 80.3512,
        elevationM: 127,
        dwellMin: 2,
        crowdIndex: "Moderate",
        amenities: ["IRCTC Food Court", "Water Vending", "Elevators", "Medical Post"]
      },
      {
        code: "PRYJ",
        name: "Prayagraj Jn",
        platform: 6,
        distanceKm: 635,
        schArr: "12:08",
        schDep: "12:10",
        actArr: "12:12",
        actDep: "12:14",
        lat: 25.4526,
        lon: 81.8349,
        elevationM: 104,
        dwellMin: 2,
        crowdIndex: "Moderate",
        amenities: ["VIP Lounge", "Cloak Room", "Wheelchairs", "Tea Stalls"]
      },
      {
        code: "BSB",
        name: "Varanasi Jn",
        platform: 1,
        distanceKm: 759,
        schArr: "14:00",
        schDep: "Destination",
        actArr: "14:04",
        actDep: "Destination",
        lat: 25.3284,
        lon: 82.9868,
        elevationM: 83,
        dwellMin: 0,
        crowdIndex: "High",
        amenities: ["Pilgrim Centre", "Retiring Rooms", "Prepaid Taxi", "Wi-Fi"]
      }
    ],
    // High-resolution realistic track polyline points with intermediate curve waypoints
    trackPath: [
      { x: 50, y: 380, label: "NDLS", isStation: true, code: "NDLS" },
      { x: 180, y: 340, label: "Ghaziabad Outer", isStation: false },
      { x: 320, y: 310, label: "Aligarh Bypass", isStation: false },
      { x: 460, y: 330, label: "Tundla Jn", isStation: false },
      { x: 620, y: 390, label: "Etawah Curves", isStation: false },
      { x: 780, y: 360, label: "CNB", isStation: true, code: "CNB" },
      { x: 920, y: 310, label: "Fatehpur Straight", isStation: false },
      { x: 1080, y: 280, label: "PRYJ", isStation: true, code: "PRYJ" },
      { x: 1220, y: 320, label: "Mirzapur Riverview", isStation: false },
      { x: 1360, y: 360, label: "BSB", isStation: true, code: "BSB" }
    ]
  },
  {
    id: "12952",
    number: "12952",
    name: "Mumbai Rajdhani Express",
    type: "Superfast Premier AC",
    origin: "New Delhi (NDLS)",
    destination: "Mumbai Central (MMCT)",
    maxSpeed: 140,
    cruisingSpeed: 125,
    currentSpeed: 118,
    locomotive: "WAP-7 Twin High-Horsepower 6000HP",
    rakeComposition: [
      { code: "EOG-1", type: "End On Generator Car", seats: 0, class: "GEN" },
      { code: "H1", type: "First AC (1A)", seats: 24, class: "1A" },
      { code: "A1", type: "AC Two-Tier (2A)", seats: 54, class: "2A" },
      { code: "A2", type: "AC Two-Tier (2A)", seats: 54, class: "2A" },
      { code: "A3", type: "AC Two-Tier (2A)", seats: 54, class: "2A" },
      { code: "PC", type: "Pantry Car", seats: 0, class: "PANTRY" },
      { code: "B1", type: "AC Three-Tier (3A)", seats: 72, class: "3A" },
      { code: "B2", type: "AC Three-Tier (3A)", seats: 72, class: "3A" },
      { code: "B3", type: "AC Three-Tier (3A)", seats: 72, class: "3A" },
      { code: "B4", type: "AC Three-Tier (3A)", seats: 72, class: "3A" },
      { code: "B5", type: "AC Three-Tier (3A)", seats: 72, class: "3A" },
      { code: "EOG-2", type: "End On Generator Car", seats: 0, class: "GEN" }
    ],
    delayMinutes: 8,
    delayStatus: "Slight Delay (8m)",
    pantryAvailable: true,
    cleanlinessRating: 4.8,
    stations: [
      { code: "NDLS", name: "New Delhi", platform: 3, distanceKm: 0, schArr: "Source", schDep: "16:55", actArr: "Source", actDep: "16:55", lat: 28.6427, lon: 77.2198, elevationM: 216, dwellMin: 0, crowdIndex: "High" },
      { code: "MTJ", name: "Mathura Jn", platform: 2, distanceKm: 141, schArr: "18:28", schDep: "18:30", actArr: "18:32", actDep: "18:34", lat: 27.4924, lon: 77.6737, elevationM: 177, dwellMin: 2, crowdIndex: "Low" },
      { code: "KOTA", name: "Kota Jn", platform: 1, distanceKm: 466, schArr: "21:30", schDep: "21:40", actArr: "21:38", actDep: "21:48", lat: 25.2138, lon: 75.8648, elevationM: 253, dwellMin: 10, crowdIndex: "High" },
      { code: "RTM", name: "Ratlam Jn", platform: 4, distanceKm: 732, schArr: "00:35", schDep: "00:38", actArr: "00:44", actDep: "00:47", lat: 23.3315, lon: 75.0367, elevationM: 493, dwellMin: 3, crowdIndex: "Moderate" },
      { code: "BRC", name: "Vadodara Jn", platform: 2, distanceKm: 993, schArr: "03:57", schDep: "04:07", actArr: "04:04", actDep: "04:14", lat: 22.3107, lon: 73.1812, elevationM: 36, dwellMin: 10, crowdIndex: "High" },
      { code: "ST", name: "Surat", platform: 1, distanceKm: 1123, schArr: "05:23", schDep: "05:28", actArr: "05:30", actDep: "05:35", lat: 21.2052, lon: 72.8407, elevationM: 21, dwellMin: 5, crowdIndex: "High" },
      { code: "MMCT", name: "Mumbai Central", platform: 1, distanceKm: 1384, schArr: "08:35", schDep: "Destination", actArr: "08:43", actDep: "Destination", lat: 18.9696, lon: 72.8193, elevationM: 9, dwellMin: 0, crowdIndex: "Extreme" }
    ],
    trackPath: [
      { x: 50, y: 150, label: "NDLS", isStation: true, code: "NDLS" },
      { x: 190, y: 220, label: "Mathura", isStation: true, code: "MTJ" },
      { x: 350, y: 310, label: "Sawai Madhopur", isStation: false },
      { x: 520, y: 360, label: "Kota Jn", isStation: true, code: "KOTA" },
      { x: 690, y: 290, label: "Chambal Bridge", isStation: false },
      { x: 860, y: 340, label: "Ratlam Jn", isStation: true, code: "RTM" },
      { x: 1030, y: 390, label: "Vadodara Jn", isStation: true, code: "BRC" },
      { x: 1180, y: 320, label: "Surat", isStation: true, code: "ST" },
      { x: 1380, y: 270, label: "MMCT", isStation: true, code: "MMCT" }
    ]
  },
  {
    id: "12002",
    number: "12002",
    name: "Bhopal Shatabdi Express",
    type: "Superfast Intercity Shatabdi",
    origin: "New Delhi (NDLS)",
    destination: "Rani Kamlapati (RKMP)",
    maxSpeed: 150,
    cruisingSpeed: 130,
    currentSpeed: 132,
    locomotive: "WAP-5 High Speed Streamlined (5450HP)",
    rakeComposition: [
      { code: "EOG-1", type: "Generator Car", seats: 0, class: "GEN" },
      { code: "E1", type: "Executive Class", seats: 46, class: "EC" },
      { code: "E2", type: "Executive Class", seats: 46, class: "EC" },
      { code: "C1", type: "AC Chair Car", seats: 78, class: "CC" },
      { code: "C2", type: "AC Chair Car", seats: 78, class: "CC" },
      { code: "C3", type: "AC Chair Car", seats: 78, class: "CC" },
      { code: "C4", type: "AC Chair Car", seats: 78, class: "CC" },
      { code: "EOG-2", type: "Generator Car", seats: 0, class: "GEN" }
    ],
    delayMinutes: 0,
    delayStatus: "Right Time (0m)",
    pantryAvailable: true,
    cleanlinessRating: 4.9,
    stations: [
      { code: "NDLS", name: "New Delhi", platform: 1, distanceKm: 0, schArr: "Source", schDep: "06:00", actArr: "Source", actDep: "06:00", lat: 28.6427, lon: 77.2198, elevationM: 216, dwellMin: 0, crowdIndex: "High" },
      { code: "AGC", name: "Agra Cantt", platform: 1, distanceKm: 195, schArr: "07:50", schDep: "07:55", actArr: "07:50", actDep: "07:55", lat: 27.1591, lon: 77.9943, elevationM: 167, dwellMin: 5, crowdIndex: "High" },
      { code: "GWL", name: "Gwalior Jn", platform: 1, distanceKm: 313, schArr: "09:23", schDep: "09:28", actArr: "09:24", actDep: "09:28", lat: 26.2183, lon: 78.1828, elevationM: 212, dwellMin: 5, crowdIndex: "Moderate" },
      { code: "VGLB", name: "V Lakshmibai (Jhansi)", platform: 2, distanceKm: 411, schArr: "10:45", schDep: "10:53", actArr: "10:45", actDep: "10:53", lat: 25.4484, lon: 78.5685, elevationM: 258, dwellMin: 8, crowdIndex: "High" },
      { code: "BPL", name: "Bhopal Jn", platform: 1, distanceKm: 703, schArr: "14:07", schDep: "14:12", actArr: "14:07", actDep: "14:12", lat: 23.2667, lon: 77.4093, elevationM: 499, dwellMin: 5, crowdIndex: "High" },
      { code: "RKMP", name: "Rani Kamlapati", platform: 1, distanceKm: 709, schArr: "14:40", schDep: "Destination", actArr: "14:40", actDep: "Destination", lat: 23.2081, lon: 77.4363, elevationM: 505, dwellMin: 0, crowdIndex: "Moderate" }
    ],
    trackPath: [
      { x: 60, y: 180, label: "NDLS", isStation: true, code: "NDLS" },
      { x: 260, y: 220, label: "Agra Cantt", isStation: true, code: "AGC" },
      { x: 480, y: 310, label: "Gwalior Jn", isStation: true, code: "GWL" },
      { x: 700, y: 370, label: "Jhansi Jn", isStation: true, code: "VGLB" },
      { x: 940, y: 280, label: "Bina Outer", isStation: false },
      { x: 1160, y: 330, label: "Bhopal Jn", isStation: true, code: "BPL" },
      { x: 1360, y: 360, label: "Rani Kamlapati", isStation: true, code: "RKMP" }
    ]
  },
  {
    id: "12123",
    number: "12123",
    name: "Deccan Queen Superfast",
    type: "Historic Intercity Express",
    origin: "Mumbai CSMT (CSMT)",
    destination: "Pune Jn (PUNE)",
    maxSpeed: 120,
    cruisingSpeed: 105,
    currentSpeed: 96,
    locomotive: "WAP-7 Push-Pull Configuration",
    rakeComposition: [
      { code: "DL1", type: "General Second", seats: 90, class: "2S" },
      { code: "D1", type: "Second Sitting", seats: 108, class: "2S" },
      { code: "D2", type: "Second Sitting", seats: 108, class: "2S" },
      { code: "DC", type: "Dining Car (Iconic)", seats: 32, class: "DINING" },
      { code: "C1", type: "AC Chair Car", seats: 78, class: "CC" },
      { code: "C2", type: "AC Chair Car", seats: 78, class: "CC" }
    ],
    delayMinutes: 2,
    delayStatus: "On Time (+2m)",
    pantryAvailable: true,
    cleanlinessRating: 4.95,
    stations: [
      { code: "CSMT", name: "Mumbai CSMT", platform: 8, distanceKm: 0, schArr: "Source", schDep: "17:10", actArr: "Source", actDep: "17:10", lat: 18.9402, lon: 72.8356, elevationM: 8, dwellMin: 0, crowdIndex: "Extreme" },
      { code: "KYN", name: "Kalyan Jn", platform: 4, distanceKm: 54, schArr: "18:08", schDep: "18:10", actArr: "18:10", actDep: "18:12", lat: 19.2437, lon: 73.1355, elevationM: 16, dwellMin: 2, crowdIndex: "Extreme" },
      { code: "KJT", name: "Karjat (Ghat Base)", platform: 1, distanceKm: 100, schArr: "18:50", schDep: "18:52", actArr: "18:52", actDep: "18:54", lat: 18.9103, lon: 73.3275, elevationM: 52, dwellMin: 2, crowdIndex: "Moderate" },
      { code: "LNL", name: "Lonavala (Ghat Top)", platform: 1, distanceKm: 128, schArr: "19:42", schDep: "19:45", actArr: "19:44", actDep: "19:47", lat: 18.7557, lon: 73.4091, elevationM: 624, dwellMin: 3, crowdIndex: "High" },
      { code: "SVJR", name: "Shivaji Nagar", platform: 1, distanceKm: 190, schArr: "20:23", schDep: "20:25", actArr: "20:25", actDep: "20:27", lat: 18.5314, lon: 73.8446, elevationM: 550, dwellMin: 2, crowdIndex: "Moderate" },
      { code: "PUNE", name: "Pune Jn", platform: 5, distanceKm: 192, schArr: "20:35", schDep: "Destination", actArr: "20:37", actDep: "Destination", lat: 18.5289, lon: 73.8744, elevationM: 560, dwellMin: 0, crowdIndex: "High" }
    ],
    trackPath: [
      { x: 50, y: 350, label: "Mumbai CSMT", isStation: true, code: "CSMT" },
      { x: 250, y: 320, label: "Thane Viaduct", isStation: false },
      { x: 450, y: 290, label: "Kalyan Jn", isStation: true, code: "KYN" },
      { x: 650, y: 330, label: "Karjat Ghat Base", isStation: true, code: "KJT" },
      { x: 880, y: 200, label: "Bhor Ghat Viaduct", isStation: false },
      { x: 1050, y: 240, label: "Lonavala Peak", isStation: true, code: "LNL" },
      { x: 1250, y: 300, label: "Shivaji Nagar", isStation: true, code: "SVJR" },
      { x: 1380, y: 340, label: "Pune Jn", isStation: true, code: "PUNE" }
    ]
  }
];

export const COMMON_PNR_SAMPLES = [
  {
    pnr: "4215896321",
    trainNumber: "22436",
    trainName: "Vande Bharat Express",
    doj: "Tomorrow",
    from: "NDLS",
    to: "PRYJ",
    class: "CC",
    passengers: [
      { number: 1, bookingStatus: "WL 14", currentStatus: "CNF", coach: "C3", berth: "45 (Window)" },
      { number: 2, bookingStatus: "WL 15", currentStatus: "CNF", coach: "C3", berth: "46 (Middle)" }
    ],
    chartStatus: "Chart Not Prepared",
    aiPrediction: "99.8% Confirmation Probability (Confirmed!)"
  },
  {
    pnr: "8632415902",
    trainNumber: "12952",
    trainName: "Mumbai Rajdhani",
    doj: "Today",
    from: "NDLS",
    to: "MMCT",
    class: "3A",
    passengers: [
      { number: 1, bookingStatus: "RAC 8", currentStatus: "RAC 2", coach: "--", berth: "--" }
    ],
    chartStatus: "Chart Prepared",
    aiPrediction: "94.2% Chance of Full Berth Allocation at Charting"
  }
];

