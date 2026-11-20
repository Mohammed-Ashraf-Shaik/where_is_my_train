/**
 * RailPulse AI - RailMadad Safety, Emergency SOS & Nearest Medical Aid Locator
 * Rapid response dispatcher for RPF 182, onboard doctor assistance & automated incident reporting
 */

export class EmergencyAidAI {
  constructor(soundEngine) {
    this.sound = soundEngine;
    this.activeSOS = false;
    this.reportedTickets = [];
  }

  triggerEmergencySOS(physics, coachCode = "C3") {
    const tele = physics ? physics.getTelemetry() : null;
    this.activeSOS = true;
    this.sound?.playHorn();

    const incidentId = "SOS-" + Math.floor(100000 + Math.random() * 900000);
    const incidentData = {
      incidentId,
      timestamp: new Date().toLocaleTimeString(),
      trainNumber: tele?.trainNumber || "22436",
      trainName: tele?.trainName || "Vande Bharat Express",
      coach: coachCode,
      lat: tele?.gps?.lat || "26.4539",
      lon: tele?.gps?.lon || "80.3512",
      speedKmh: tele?.speedKmh || 120,
      nearestStation: tele?.nextStation || "Kanpur Central",
      dispatchedUnits: ["RPF Flying Squad", "Station Ambulance Unit", "Onboard TTE Supervisor"]
    };

    return incidentData;
  }

  getNearestMedicalHub(stationName) {
    return {
      hospitalName: `Divisional Railway Hospital (${stationName})`,
      icuBedsAvailable: 14,
      onboardFirstAidKit: "Available in Guard / Locomotive Cab",
      emergencyHelpline: "139 (RailMadad Integrated)",
      rpfHelpline: "182",
      ambulanceETA: "3 mins upon platform docking"
    };
  }

  submitGrievance(category, description, coach) {
    const ticket = {
      id: "RM-" + Math.floor(10000 + Math.random() * 90000),
      category,
      description,
      coach,
      status: "ASSIGNED TO ONBOARD STAFF",
      timestamp: new Date().toLocaleTimeString()
    };
    this.reportedTickets.unshift(ticket);
    return ticket;
  }
}
