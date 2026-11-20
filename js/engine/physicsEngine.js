/**
 * RailPulse AI - Physics & Signal Simulation Engine
 * Handles real-world train kinematics, block signaling, station deceleration & GPS interpolation
 */

export class TrainPhysicsEngine {
  constructor(trainData, soundEngine) {
    this.train = trainData;
    this.sound = soundEngine;

    // Simulation state
    this.progress = 0.12; // Initial track progress 0.0 to 1.0
    this.speedKmh = trainData.currentSpeed || 120;
    this.targetSpeedKmh = trainData.cruisingSpeed || 130;
    this.maxSpeedKmh = trainData.maxSpeed || 160;
    this.throttle = 0.85; // 0.0 to 1.0
    this.isBraking = false;
    this.emergencyBrake = false;
    
    // Station interaction
    this.currentStationIndex = 0;
    this.isStationDwell = false;
    this.dwellTimerSec = 0;
    this.dwellTotalSec = 12; // Simulated dwell duration

    // Signaling
    this.currentSignal = "GREEN"; // GREEN, DOUBLE_YELLOW, YELLOW, RED
    this.distanceToSignalM = 1450;

    // Distance metrics
    this.totalRouteKm = this.train.stations[this.train.stations.length - 1].distanceKm || 750;
    this.traveledKm = this.progress * this.totalRouteKm;

    // Time scaling (1x to 10x)
    this.timeScale = 1;

    // Listeners for UI updates
    this.listeners = [];
  }

  setTrain(trainData) {
    this.train = trainData;
    this.progress = 0.05;
    this.speedKmh = 95;
    this.targetSpeedKmh = trainData.cruisingSpeed;
    this.maxSpeedKmh = trainData.maxSpeed;
    this.totalRouteKm = trainData.stations[trainData.stations.length - 1].distanceKm || 800;
    this.currentStationIndex = 0;
    this.isStationDwell = false;
  }

  onUpdate(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.getTelemetry()));
  }

  setThrottle(val) {
    this.throttle = Math.max(0, Math.min(1, val));
    if (!this.isStationDwell && !this.emergencyBrake) {
      this.targetSpeedKmh = this.throttle * this.maxSpeedKmh;
    }
  }

  applyEmergencyBrake() {
    this.emergencyBrake = !this.emergencyBrake;
    if (this.emergencyBrake) {
      this.targetSpeedKmh = 0;
      this.sound?.playBrakeHiss();
    } else {
      this.targetSpeedKmh = this.throttle * this.maxSpeedKmh;
    }
  }

  setTimeScale(scale) {
    this.timeScale = scale;
  }

  update(dtSec) {
    const effectiveDt = dtSec * this.timeScale;

    // If currently stopped at a station
    if (this.isStationDwell) {
      this.speedKmh = 0;
      this.dwellTimerSec -= effectiveDt;

      if (this.dwellTimerSec <= 0) {
        // Depart station!
        this.isStationDwell = false;
        this.currentStationIndex = Math.min(this.train.stations.length - 1, this.currentStationIndex + 1);
        this.targetSpeedKmh = this.throttle * this.maxSpeedKmh;
        this.currentSignal = "GREEN";
        this.sound?.playHorn();
      }
      this.notify();
      return;
    }

    // Kinematics: Acceleration / Deceleration
    const accelRate = 18 * effectiveDt; // km/h per second acceleration
    const decelRate = 28 * effectiveDt; // braking rate

    if (this.emergencyBrake) {
      this.speedKmh = Math.max(0, this.speedKmh - (decelRate * 2.2));
    } else if (this.speedKmh < this.targetSpeedKmh) {
      this.speedKmh = Math.min(this.targetSpeedKmh, this.speedKmh + accelRate);
    } else if (this.speedKmh > this.targetSpeedKmh) {
      this.speedKmh = Math.max(this.targetSpeedKmh, this.speedKmh - decelRate);
    }

    // Calculate distance traveled in this tick
    // speedKmh * (effectiveDt / 3600) = km traveled
    const distanceDeltaKm = (this.speedKmh / 3600) * effectiveDt * 12; // enhanced simulation rate for engaging visualization
    this.traveledKm = (this.traveledKm + distanceDeltaKm) % this.totalRouteKm;
    this.progress = this.traveledKm / this.totalRouteKm;

    // Check proximity to next station
    this.checkStationApproach();

    // Update signal states based on track block
    this.updateSignaling();

    // Feed speed back to procedural sound engine
    if (this.sound) {
      this.sound.updateSpeed(this.speedKmh);
    }

    this.notify();
  }

  checkStationApproach() {
    const stations = this.train.stations;
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      const stationProgress = station.distanceKm / this.totalRouteKm;
      const distKm = (stationProgress - this.progress) * this.totalRouteKm;

      // Approaching within 3.5 km of a station stop (excluding initial source station)
      if (distKm > 0 && distKm < 4.0 && i > this.currentStationIndex) {
        // Slow down smoothly for platform stop
        this.targetSpeedKmh = Math.max(15, (distKm / 4.0) * 80);
        this.currentSignal = distKm < 1.5 ? "YELLOW" : "DOUBLE_YELLOW";
      }

      // Arrived at platform
      if (Math.abs(distKm) < 0.25 && i > this.currentStationIndex) {
        this.isStationDwell = true;
        this.dwellTimerSec = this.dwellTotalSec;
        this.currentStationIndex = i;
        this.currentSignal = "RED";
        this.sound?.playStationChime();
        this.sound?.playBrakeHiss();
        break;
      }
    }
  }

  updateSignaling() {
    if (this.isStationDwell) {
      this.currentSignal = "RED";
      this.distanceToSignalM = 0;
      return;
    }

    // Simulated 2km automatic signaling blocks
    const blockLengthM = 2000;
    const currentMeter = (this.traveledKm * 1000) % blockLengthM;
    this.distanceToSignalM = Math.floor(blockLengthM - currentMeter);

    if (this.distanceToSignalM < 300) {
      this.currentSignal = "DOUBLE_YELLOW";
    } else if (this.distanceToSignalM < 700) {
      this.currentSignal = "YELLOW";
    } else {
      this.currentSignal = "GREEN";
    }
  }

  // Interpolate current GPS latitude, longitude, and elevation
  getCurrentGPS() {
    const stations = this.train.stations;
    let prev = stations[0];
    let next = stations[stations.length - 1];

    for (let i = 0; i < stations.length - 1; i++) {
      if (this.traveledKm >= stations[i].distanceKm && this.traveledKm <= stations[i + 1].distanceKm) {
        prev = stations[i];
        next = stations[i + 1];
        break;
      }
    }

    const segLength = next.distanceKm - prev.distanceKm || 1;
    const segT = Math.max(0, Math.min(1, (this.traveledKm - prev.distanceKm) / segLength));

    const lat = prev.lat + (next.lat - prev.lat) * segT;
    const lon = prev.lon + (next.lon - prev.lon) * segT;
    const elevation = Math.round(prev.elevationM + (next.elevationM - prev.elevationM) * segT);
    const gradient = ((next.elevationM - prev.elevationM) / (segLength * 1000) * 100).toFixed(1);

    return {
      lat: lat.toFixed(5),
      lon: lon.toFixed(5),
      elevation,
      gradient,
      prevStation: prev,
      nextStation: next
    };
  }

  getTelemetry() {
    const gps = this.getCurrentGPS();
    const nextStation = gps.nextStation;
    const remainingKm = Math.max(0, nextStation.distanceKm - this.traveledKm);
    const etaMinutes = this.speedKmh > 5 ? Math.round((remainingKm / this.speedKmh) * 60) : "--";

    return {
      trainName: this.train.name,
      trainNumber: this.train.number,
      speedKmh: Math.round(this.speedKmh),
      maxSpeedKmh: this.maxSpeedKmh,
      throttlePct: Math.round(this.throttle * 100),
      isBraking: this.emergencyBrake || this.speedKmh < this.targetSpeedKmh,
      emergencyBrake: this.emergencyBrake,
      progress: this.progress,
      traveledKm: Math.round(this.traveledKm),
      totalRouteKm: Math.round(this.totalRouteKm),
      remainingKmToNext: remainingKm.toFixed(1),
      currentStation: gps.prevStation.name,
      nextStation: nextStation.name,
      nextStationPlatform: nextStation.platform,
      etaMinutes,
      currentSignal: this.currentSignal,
      distanceToSignalM: this.distanceToSignalM,
      isStationDwell: this.isStationDwell,
      dwellSecondsLeft: Math.ceil(this.dwellTimerSec),
      gps
    };
  }
}
