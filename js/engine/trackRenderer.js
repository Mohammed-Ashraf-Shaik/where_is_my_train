/**
 * RailPulse AI - High-Fidelity 2.5D Canvas Track & Train Renderer
 * Renders ballast, sleepers, dual rails, catenary poles, signals & animated aerodynamic train
 */

import { WeatherFXEngine } from "./weatherFX.js";

export class TrackRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.train = null;
    this.physics = null;
    this.weatherFX = new WeatherFXEngine(canvas);

    // Camera viewport
    this.cameraX = 0;
    this.cameraY = 0;
    this.zoom = 1.0;
    this.isNightMode = true;

    // Sparks & particle effects
    this.sparks = [];

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
  }

  setTrain(trainData, physicsEngine) {
    this.train = trainData;
    this.physics = physicsEngine;
  }

  setTheme(isNight) {
    this.isNightMode = isNight;
  }

  // Sample track position and tangent angle given progress t (0 to 1)
  getTrackPoint(t) {
    const pts = this.train.trackPath;
    const totalSegments = pts.length - 1;
    const scaledT = Math.max(0, Math.min(0.9999, t)) * totalSegments;
    const index = Math.floor(scaledT);
    const segT = scaledT - index;

    const p0 = pts[Math.max(0, index - 1)];
    const p1 = pts[index];
    const p2 = pts[index + 1];
    const p3 = pts[Math.min(pts.length - 1, index + 2)];

    // Catmull-Rom spline interpolation for silky smooth railway curves
    const x = 0.5 * (
      (2 * p1.x) +
      (-p0.x + p2.x) * segT +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * (segT ** 2) +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * (segT ** 3)
    );

    const y = 0.5 * (
      (2 * p1.y) +
      (-p0.y + p2.y) * segT +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * (segT ** 2) +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * (segT ** 3)
    );

    // Tangent derivative for train heading angle
    const dx = 0.5 * (
      (-p0.x + p2.x) +
      2 * (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * segT +
      3 * (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * (segT ** 2)
    );

    const dy = 0.5 * (
      (-p0.y + p2.y) +
      2 * (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * segT +
      3 * (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * (segT ** 2)
    );

    const angle = Math.atan2(dy, dx);
    return { x, y, angle };
  }

  render() {
    if (!this.train || !this.physics) return;

    const ctx = this.ctx;
    const width = this.displayWidth;
    const height = this.displayHeight;

    // Train current position & angle
    const trainPos = this.getTrackPoint(this.physics.progress);

    // Smooth camera follow
    const targetCamX = trainPos.x - width / (2 * this.zoom);
    const targetCamY = trainPos.y - height / (2 * this.zoom);
    this.cameraX += (targetCamX - this.cameraX) * 0.08;
    this.cameraY += (targetCamY - this.cameraY) * 0.08;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Background terrain
    this.drawTerrain(width, height);

    // Apply Camera Transform
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.cameraX, -this.cameraY);

    // 1. Draw Ballast Bed (Gravel shoulder)
    this.drawBallast();

    // 2. Draw Concrete Sleepers / Ties
    this.drawSleepers();

    // 3. Draw Steel Double Rails
    this.drawSteelRails();

    // 4. Draw Stations & Platforms
    this.drawStations();

    // 5. Draw Signals & Mileposts
    this.drawSignals();

    // 6. Draw Overhead Catenary Poles (OHE)
    this.drawCatenaryPoles();

    // 7. Draw Moving Train Rake (Locomotive + Passenger Coaches)
    this.drawTrainRake(trainPos);

    // 8. Draw Sparks & Pantograph effects
    this.drawSparks(trainPos);

    ctx.restore();

    // 9. Dynamic Weather Atmospheric FX Layer
    this.weatherFX.render(width, height);
  }

  drawTerrain(width, height) {
    const ctx = this.ctx;
    // Ground gradient with Midnight Indigo (#282B4A) and Vanilla (#EEEBDA)
    const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
    if (this.isNightMode) {
      grad.addColorStop(0, "#282B4A"); // Midnight Indigo
      grad.addColorStop(1, "#181A2D"); // Deepest Indigo
    } else {
      grad.addColorStop(0, "#FAF8F2"); // Cream Vanilla
      grad.addColorStop(1, "#EEEBDA"); // Warm Vanilla
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle transit topography grid
    ctx.strokeStyle = this.isNightMode ? "rgba(238, 235, 218, 0.035)" : "rgba(40, 43, 74, 0.04)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    const startX = -(this.cameraX % gridSize);
    const startY = -(this.cameraY % gridSize);
    ctx.beginPath();
    for (let x = startX; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = startY; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  drawBallast() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = this.isNightMode ? "#1E2036" : "#DDD7C3";
    ctx.lineWidth = 32;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      const pt = this.getTrackPoint(i / steps);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawSleepers() {
    const ctx = this.ctx;
    ctx.save();
    const sleeperCount = 280;
    ctx.strokeStyle = this.isNightMode ? "#393D66" : "#AFA895";
    ctx.lineWidth = 4;

    for (let i = 0; i <= sleeperCount; i++) {
      const pt = this.getTrackPoint(i / sleeperCount);
      const perpAngle = pt.angle + Math.PI / 2;
      const sleeperLen = 14;

      const sx1 = pt.x + Math.cos(perpAngle) * sleeperLen;
      const sy1 = pt.y + Math.sin(perpAngle) * sleeperLen;
      const sx2 = pt.x - Math.cos(perpAngle) * sleeperLen;
      const sy2 = pt.y - Math.sin(perpAngle) * sleeperLen;

      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawSteelRails() {
    const ctx = this.ctx;
    ctx.save();
    const trackGauge = 6; // Gauge half-width

    const steps = 350;
    for (let side = -1; side <= 1; side += 2) {
      ctx.strokeStyle = this.isNightMode ? "#D4D0BE" : "#32365C";
      ctx.lineWidth = 2.2;
      ctx.beginPath();

      for (let i = 0; i <= steps; i++) {
        const pt = this.getTrackPoint(i / steps);
        const perpAngle = pt.angle + Math.PI / 2;
        const rx = pt.x + Math.cos(perpAngle) * (trackGauge * side);
        const ry = pt.y + Math.sin(perpAngle) * (trackGauge * side);

        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawStations() {
    const ctx = this.ctx;
    const stations = this.train.stations;
    const totalDist = stations[stations.length - 1].distanceKm || 1;

    stations.forEach((st) => {
      const t = st.distanceKm / totalDist;
      const pt = this.getTrackPoint(t);
      const perp = pt.angle + Math.PI / 2;

      // Platform concrete slab alongside track
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.angle);

      // Platform Bay
      ctx.fillStyle = this.isNightMode ? "#111f38" : "#cbd5e1";
      ctx.strokeStyle = this.isNightMode ? "#00e5ff" : "#0284c7";
      ctx.lineWidth = 1.5;
      ctx.fillRect(-60, 16, 120, 24);
      ctx.strokeRect(-60, 16, 120, 24);

      // Platform yellow safety line
      ctx.fillStyle = "#ffb703";
      ctx.fillRect(-58, 17, 116, 2.5);

      // Station Yellow-Black IR Nameboard
      ctx.fillStyle = "#ffdd00";
      ctx.fillRect(-45, 44, 90, 18);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${st.code} - ${st.name}`, 0, 53);

      // Platform Number Indicator Badge
      ctx.fillStyle = "#00e5ff";
      ctx.beginPath();
      ctx.arc(48, 28, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = "bold 7px sans-serif";
      ctx.fillText(`P${st.platform}`, 48, 29);

      ctx.restore();
    });
  }

  drawSignals() {
    const ctx = this.ctx;
    const signalAspect = this.physics.currentSignal;

    // Place signals every 20% along route
    for (let t = 0.15; t < 0.95; t += 0.25) {
      const pt = this.getTrackPoint(t);
      const perp = pt.angle - Math.PI / 2;
      const sx = pt.x + Math.cos(perp) * 22;
      const sy = pt.y + Math.sin(perp) * 22;

      ctx.save();
      // Signal post
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx, sy - 16);
      ctx.stroke();

      // Signal head housing
      ctx.fillStyle = "#0b111e";
      ctx.fillRect(sx - 4, sy - 28, 8, 16);
      ctx.strokeStyle = "#334155";
      ctx.strokeRect(sx - 4, sy - 28, 8, 16);

      // Signal Lamp (ISO Railway Aspect)
      let color = "#2EC4B6"; // Clear
      if (signalAspect === "RED") color = "#E71D36"; // Danger
      else if (signalAspect === "YELLOW") color = "#F6AE2D"; // Caution
      else if (signalAspect === "DOUBLE_YELLOW") color = "#F6AE2D"; // Attention

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(sx, sy - 20, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  drawCatenaryPoles() {
    const ctx = this.ctx;
    const poleCount = 45;
    for (let i = 0; i < poleCount; i++) {
      const pt = this.getTrackPoint(i / poleCount);
      const perp = pt.angle + Math.PI / 2;
      const px = pt.x + Math.cos(perp) * 24;
      const py = pt.y + Math.sin(perp) * 24;

      ctx.save();
      ctx.fillStyle = this.isNightMode ? "#334155" : "#64748b";
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Cantilever arm extending toward track
      ctx.strokeStyle = this.isNightMode ? "#1e293b" : "#94a3b8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawTrainRake(trainPos) {
    const ctx = this.ctx;
    const coaches = this.train.rakeComposition;
    const coachLength = 28;
    const coachGap = 3;
    const totalCoaches = Math.min(8, coaches.length);

    // Draw from rear coach to locomotive engine
    for (let c = totalCoaches - 1; c >= 0; c--) {
      // Calculate progress offset for this coach behind engine
      const coachProgressOffset = (c * (coachLength + coachGap)) / 1400;
      const coachT = (this.physics.progress - coachProgressOffset + 1) % 1;
      const cPos = this.getTrackPoint(coachT);

      ctx.save();
      ctx.translate(cPos.x, cPos.y);
      ctx.rotate(cPos.angle);

      const isLoco = c === 0;

      if (isLoco) {
        // High-Speed Aerodynamic Nose Cone
        this.drawLocomotive(ctx, coachLength);
      } else {
        // Passenger Coach
        this.drawPassengerCoach(ctx, coachLength, coaches[c]);
      }

      ctx.restore();
    }
  }

  drawLocomotive(ctx, len) {
    // Warm incandescent locomotive headlamp beams casting onto the track ahead
    if (this.isNightMode) {
      const coneGrad = ctx.createRadialGradient(len / 2 + 10, 0, 2, len / 2 + 150, 0, 65);
      coneGrad.addColorStop(0, "rgba(255, 248, 220, 0.95)"); // Warm golden beam
      coneGrad.addColorStop(0.35, "rgba(242, 100, 25, 0.35)"); // Warm transit amber
      coneGrad.addColorStop(1, "rgba(40, 43, 74, 0)");

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(len / 2 + 12, -4);
      ctx.lineTo(len / 2 + 150, -55);
      ctx.lineTo(len / 2 + 150, 55);
      ctx.lineTo(len / 2 + 12, 4);
      ctx.closePath();
      ctx.fill();
    }

    // Aerodynamic Body
    const isVandeBharat = this.train.number.includes("22436") || this.train.name.includes("Vande Bharat");
    ctx.fillStyle = isVandeBharat ? "#EEEBDA" : "#991B1B"; // Vanilla white for Vande Bharat, Heritage Maroon for Rajdhani
    ctx.strokeStyle = isVandeBharat ? "#282B4A" : "#5F1414";
    ctx.lineWidth = 1.5;

    // Bullet nose curve
    ctx.beginPath();
    ctx.moveTo(-len / 2, -7);
    ctx.lineTo(len / 2 - 4, -7);
    ctx.quadraticCurveTo(len / 2 + 14, 0, len / 2 - 4, 7);
    ctx.lineTo(-len / 2, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Livery Racing Stripe
    ctx.fillStyle = isVandeBharat ? "#282B4A" : "#F6AE2D";
    ctx.fillRect(-len / 2, -2, len - 2, 4);

    // Dark Windshield Glass
    ctx.fillStyle = "#161828";
    ctx.beginPath();
    ctx.moveTo(len / 2 - 4, -5);
    ctx.lineTo(len / 2 + 5, -2);
    ctx.lineTo(len / 2 + 5, 2);
    ctx.lineTo(len / 2 - 4, 5);
    ctx.closePath();
    ctx.fill();

    // Warm Headlight Dual Bulbs
    ctx.fillStyle = "#FFF9E6";
    ctx.shadowColor = "#F26419";
    ctx.shadowBlur = 10;
    ctx.fillRect(len / 2 + 8, -4, 3, 2.5);
    ctx.fillRect(len / 2 + 8, 1.5, 3, 2.5);
    ctx.shadowBlur = 0;
  }

  drawPassengerCoach(ctx, len, coachInfo) {
    // Coach Body
    const isVandeBharat = this.train.name.includes("Vande Bharat");
    ctx.fillStyle = isVandeBharat ? "#EEEBDA" : "#8A1C1C";
    ctx.strokeStyle = isVandeBharat ? "#282B4A" : "#521212";
    ctx.lineWidth = 1.2;

    ctx.fillRect(-len / 2, -6.5, len, 13);
    ctx.strokeRect(-len / 2, -6.5, len, 13);

    // Coach Accent Livery Line
    ctx.fillStyle = isVandeBharat ? "#282B4A" : "#F6AE2D";
    ctx.fillRect(-len / 2, -1, len, 2);

    // Illuminated Passenger Windows with Warm Vanilla Glow
    ctx.fillStyle = this.isNightMode ? "#FFF5C0" : "#282B4A";
    const winWidth = 3;
    const winGap = 2;
    for (let w = -len / 2 + 4; w < len / 2 - 4; w += winWidth + winGap) {
      ctx.fillRect(w, -5.5, winWidth, 2);
      ctx.fillRect(w, 3.5, winWidth, 2);
    }
  }

  drawSparks(trainPos) {
    const ctx = this.ctx;
    // Occasional pantograph spark when running above 70 km/h
    if (this.physics.speedKmh > 70 && Math.random() < 0.15) {
      this.sparks.push({
        x: trainPos.x + (Math.random() - 0.5) * 6,
        y: trainPos.y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0
      });
    }

    // Render & update active sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.08;

      if (s.life <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = `rgba(0, 229, 255, ${s.life})`;
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

