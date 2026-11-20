/**
 * RailPulse AI - Offline Cell-Tower Triangulator & Smart Wake-Up Alarm
 * Emulates the iconic "Where Is My Train" offline tracking engine using cellular base stations & geofencing
 */

export class OfflineTriangulator {
  constructor(soundEngine) {
    this.sound = soundEngine;
    this.isOfflineMode = false;
    this.cellTowers = [];
    this.currentTower = null;
    this.signalDbm = -78;
    this.networkName = "Jio 5G / RailTel";
    
    // Geofenced Wake-up Alarm
    this.alarmActive = false;
    this.targetStation = null;
    this.alarmLeadMinutes = 15;
    this.alarmTriggered = false;

    this.initTowers();
  }

  initTowers() {
    this.cellTowers = [
      { id: "JIO-404-869-01", carrier: "Jio True 5G", km: 45, dBM: -68 },
      { id: "AIRTEL-404-10-82", carrier: "Airtel RailNet", km: 120, dBM: -74 },
      { id: "BSNL-404-53-11", carrier: "BSNL-RailTel BTS", km: 230, dBM: -82 },
      { id: "VI-404-20-49", carrier: "Vi SuperNet", km: 360, dBM: -76 },
      { id: "JIO-404-869-99", carrier: "Jio 5G RailCorridor", km: 490, dBM: -70 },
      { id: "RAILTEL-BTS-04", carrier: "IRCTC Optical RailTel", km: 620, dBM: -64 }
    ];
  }

  toggleOfflineMode() {
    this.isOfflineMode = !this.isOfflineMode;
    return this.isOfflineMode;
  }

  setAlarm(stationName, leadMinutes = 15) {
    this.targetStation = stationName;
    this.alarmLeadMinutes = leadMinutes;
    this.alarmActive = true;
    this.alarmTriggered = false;
  }

  cancelAlarm() {
    this.alarmActive = false;
    this.targetStation = null;
    this.alarmTriggered = false;
  }

  update(physics) {
    if (!physics) return;
    const tele = physics.getTelemetry();

    // 1. Identify closest active cell tower along the railway track
    let closest = this.cellTowers[0];
    let minDiff = 99999;
    this.cellTowers.forEach(t => {
      const diff = Math.abs(t.km - tele.traveledKm);
      if (diff < minDiff) {
        minDiff = diff;
        closest = t;
      }
    });

    this.currentTower = closest;
    // Signal fades with distance from tower
    this.signalDbm = Math.max(-115, Math.min(-58, Math.round(closest.dBM - (minDiff * 0.4))));
    this.networkName = closest.carrier;

    // 2. Check Smart Geofence Wake-Up Alarm
    if (this.alarmActive && !this.alarmTriggered && this.targetStation) {
      if (tele.nextStation.toLowerCase().includes(this.targetStation.toLowerCase())) {
        const eta = parseInt(tele.etaMinutes, 10);
        if (!isNaN(eta) && eta <= this.alarmLeadMinutes) {
          this.triggerWakeupAlarm(tele.nextStation, eta);
        }
      }
    }
  }

  triggerWakeupAlarm(stationName, etaMinutes) {
    this.alarmTriggered = true;
    this.sound?.playHorn();
    this.sound?.playStationChime();

    // Browser Notification or alert
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏰ RailPulse AI Station Wake-Up Alarm!", {
        body: `Wake up! Your train is arriving at ${stationName} in approximately ${etaMinutes} minutes!`,
        icon: "assets/train-icon.png"
      });
    }

    if (this.onAlarm) {
      this.onAlarm(stationName, etaMinutes);
    }
  }

  getStatus() {
    return {
      isOfflineMode: this.isOfflineMode,
      networkName: this.networkName,
      towerId: this.currentTower?.id || "BTS-INDIAN-RAIL-01",
      signalDbm: this.signalDbm,
      bars: this.signalDbm > -70 ? 4 : this.signalDbm > -85 ? 3 : this.signalDbm > -100 ? 2 : 1,
      alarmActive: this.alarmActive,
      targetStation: this.targetStation,
      alarmLeadMinutes: this.alarmLeadMinutes,
      alarmTriggered: this.alarmTriggered
    };
  }
}
