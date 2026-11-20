/**
 * RailPulse AI - High-Fidelity 2.5D Canvas Track & Train Renderer
 * Overhauled for grand realism: Aerodynamic Vande Bharat/Rajdhani rakes,
 * dual bogies, metallic wheels, rubber vestibule gangways, rooftop AC units,
 * and warm 3200K incandescent headlights in Midnight Indigo (#282B4A) & Vanilla (#EEEBDA).
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
    this.zoom = 1.35; // Enhanced scale for realistic visual impact
    this.isNightMode = true;

    // Sparks & particle effects
    this.sparks = [];

    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Optional mouse-wheel zoom for users who want closer or wider view
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * -0.001;
      this.zoom = Math.min(2.2, Math.max(0.7, this.zoom + zoomDelta));
    }, { passive: false });
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

    // 1. Draw Ballast Bed (Multi-layered gravel shoulder)
    this.drawBallast();

    // 2. Draw Concrete Sleepers / Ties
    this.drawSleepers();

    // 3. Draw Steel Double Rails with Specular Sheen
    this.drawSteelRails();

    // 4. Draw Stations & Platforms
    this.drawStations();

    // 5. Draw Signals & Mileposts
    this.drawSignals();

    // 6. Draw Overhead Catenary Poles (OHE)
    this.drawCatenaryPoles();

    // 7. Draw Moving Train Rake (Grand realistic scale with bogies & coaches)
    this.drawTrainRake(trainPos);

    // 8. Draw Sparks & Pantograph effects
    this.drawSparks(trainPos);

    ctx.restore();

    // 9. Dynamic Weather Atmospheric FX Layer
    this.weatherFX.render(width, height);
  }

  drawTerrain(width, height) {
    const ctx = this.ctx;
    const grad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width);
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
    const gridSize = 48;
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

    // Bottom shoulder layer
    ctx.strokeStyle = this.isNightMode ? "#161828" : "#D1CBBA";
    ctx.lineWidth = 42;
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

    // Top ballast crown layer
    ctx.strokeStyle = this.isNightMode ? "#20233B" : "#DDD7C3";
    ctx.lineWidth = 32;
    ctx.beginPath();
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
    const sleeperCount = 360;
    ctx.strokeStyle = this.isNightMode ? "#3B3F68" : "#AFA895";
    ctx.lineWidth = 5;

    for (let i = 0; i <= sleeperCount; i++) {
      const pt = this.getTrackPoint(i / sleeperCount);
      const perpAngle = pt.angle + Math.PI / 2;
      const sleeperLen = 17;

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
    const trackGauge = 8.5; // Gauge half-width

    const steps = 350;
    for (let side = -1; side <= 1; side += 2) {
      // Dark base rail shadow
      ctx.strokeStyle = this.isNightMode ? "#10121F" : "#7A7566";
      ctx.lineWidth = 3.8;
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

      // Shiny polished steel rail crown
      ctx.strokeStyle = this.isNightMode ? "#EEEBDA" : "#282B4A";
      ctx.lineWidth = 2.0;
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

      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.angle);

      // Station Concrete Platform Bay
      ctx.fillStyle = this.isNightMode ? "#1E2138" : "#D6D1BF";
      ctx.strokeStyle = this.isNightMode ? "#EEEBDA" : "#282B4A";
      ctx.lineWidth = 1.5;
      ctx.fillRect(-80, 20, 160, 32);
      ctx.strokeRect(-80, 20, 160, 32);

      // Platform Yellow Safety Line
      ctx.fillStyle = "#F6AE2D";
      ctx.fillRect(-78, 21.5, 156, 3);

      // Authentic Yellow-Black IR Station Board
      ctx.fillStyle = "#FFDD00";
      ctx.fillRect(-55, 56, 110, 22);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-55, 56, 110, 22);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${st.code} - ${st.name.toUpperCase()}`, 0, 68);

      // Platform Number Indicator Badge
      ctx.fillStyle = "#F26419";
      ctx.beginPath();
      ctx.arc(65, 36, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 8px sans-serif";
      ctx.fillText(`P${st.platform}`, 65, 37);

      ctx.restore();
    });
  }

  drawSignals() {
    const ctx = this.ctx;
    const signalAspect = this.physics.currentSignal;

    // Place signals along route
    for (let t = 0.15; t < 0.95; t += 0.25) {
      const pt = this.getTrackPoint(t);
      const perp = pt.angle - Math.PI / 2;
      const sx = pt.x + Math.cos(perp) * 26;
      const sy = pt.y + Math.sin(perp) * 26;

      ctx.save();
      // Signal post
      ctx.strokeStyle = "#4E537A";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx, sy - 20);
      ctx.stroke();

      // Signal head housing
      ctx.fillStyle = "#10121F";
      ctx.fillRect(sx - 5, sy - 34, 10, 20);
      ctx.strokeStyle = "#EEEBDA";
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - 5, sy - 34, 10, 20);

      // Signal Lamp (ISO Railway Aspect)
      let color = "#2EC4B6"; // Clear
      if (signalAspect === "RED") color = "#E71D36"; // Danger
      else if (signalAspect === "YELLOW" || signalAspect === "DOUBLE_YELLOW") color = "#F6AE2D";

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(sx, sy - 24, 4, 0, Math.PI * 2);
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
      const px = pt.x + Math.cos(perp) * 28;
      const py = pt.y + Math.sin(perp) * 28;

      ctx.save();
      ctx.fillStyle = this.isNightMode ? "#3E4370" : "#8A8472";
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();

      // Cantilever arm extending toward track
      ctx.strokeStyle = this.isNightMode ? "#282B4A" : "#B5AFA0";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawTrainRake(trainPos) {
    const ctx = this.ctx;
    const coaches = this.train.rakeComposition || [];
    const coachLength = 48; // Significantly increased for grand visual scale
    const coachGap = 6;
    const totalCoaches = Math.min(8, coaches.length);

    // Draw from rear coach forward to locomotive engine
    for (let c = totalCoaches - 1; c >= 0; c--) {
      // Calculate progress offset for this coach behind engine
      const coachProgressOffset = (c * (coachLength + coachGap)) / 1400;
      const coachT = (this.physics.progress - coachProgressOffset + 1) % 1;
      const cPos = this.getTrackPoint(coachT);

      ctx.save();
      ctx.translate(cPos.x, cPos.y);
      ctx.rotate(cPos.angle);

      // Draw flexible accordion rubber vestibule connecting to prior coach
      if (c > 0) {
        ctx.fillStyle = "#121422";
        ctx.fillRect(-coachLength / 2 - coachGap, -6, coachGap, 12);
        ctx.strokeStyle = "#32365C";
        ctx.lineWidth = 1;
        ctx.strokeRect(-coachLength / 2 - coachGap, -6, coachGap, 12);
      }

      // Draw Wheel Bogies underneath coach body
      this.drawBogieTruck(ctx, -coachLength / 2 + 10);
      this.drawBogieTruck(ctx, coachLength / 2 - 10);

      const isLoco = c === 0;
      if (isLoco) {
        this.drawLocomotive(ctx, coachLength);
      } else {
        this.drawPassengerCoach(ctx, coachLength, coaches[c] || { code: `C${c}` });
      }

      ctx.restore();
    }
  }

  drawBogieTruck(ctx, offsetX) {
    ctx.save();
    ctx.fillStyle = "#181A2D";
    ctx.fillRect(offsetX - 6, -8, 12, 16);

    // Dual steel wheels on rails
    ctx.fillStyle = "#C8C5B4";
    ctx.fillRect(offsetX - 5, -9, 4, 2);
    ctx.fillRect(offsetX + 1, -9, 4, 2);
    ctx.fillRect(offsetX - 5, 7, 4, 2);
    ctx.fillRect(offsetX + 1, 7, 4, 2);
    ctx.restore();
  }

  drawLocomotive(ctx, len) {
    const isVandeBharat = this.train.number.includes("22436") || this.train.name.includes("Vande Bharat");

    // 1. Warm Incandescent Headlamp Beam casting onto track
    if (this.isNightMode) {
      const coneGrad = ctx.createRadialGradient(len / 2 + 14, 0, 4, len / 2 + 180, 0, 75);
      coneGrad.addColorStop(0, "rgba(255, 248, 220, 0.95)"); // Golden warm 3200K beam
      coneGrad.addColorStop(0.3, "rgba(242, 100, 25, 0.35)"); // Warm transit amber
      coneGrad.addColorStop(1, "rgba(40, 43, 74, 0)");

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(len / 2 + 14, -6);
      ctx.lineTo(len / 2 + 180, -70);
      ctx.lineTo(len / 2 + 180, 70);
      ctx.lineTo(len / 2 + 14, 6);
      ctx.closePath();
      ctx.fill();
    }

    // 2. Locomotive Body Shell
    ctx.fillStyle = isVandeBharat ? "#EEEBDA" : "#8A1C1C"; // Vanilla for Vande Bharat; Heritage Maroon for Rajdhani
    ctx.strokeStyle = isVandeBharat ? "#282B4A" : "#4A1111";
    ctx.lineWidth = 1.8;

    // Aerodynamic Streamlined Nose Cone
    ctx.beginPath();
    ctx.moveTo(-len / 2, -9);
    ctx.lineTo(len / 2 - 8, -9);
    ctx.quadraticCurveTo(len / 2 + 18, 0, len / 2 - 8, 9);
    ctx.lineTo(-len / 2, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Iconic Livery Racing Band
    ctx.fillStyle = isVandeBharat ? "#282B4A" : "#F6AE2D";
    ctx.fillRect(-len / 2, -3.5, len - 6, 7);

    // 4. Dark Glazed Panoramic Windshield Glass
    ctx.fillStyle = "#121422";
    ctx.beginPath();
    ctx.moveTo(len / 2 - 8, -6.5);
    ctx.lineTo(len / 2 + 6, -3);
    ctx.lineTo(len / 2 + 6, 3);
    ctx.lineTo(len / 2 - 8, 6.5);
    ctx.closePath();
    ctx.fill();

    // Windshield frame highlight
    ctx.strokeStyle = "#EEEBDA";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 5. Dual Warm Headlights
    ctx.fillStyle = "#FFF9E6";
    ctx.shadowColor = "#F26419";
    ctx.shadowBlur = 12;
    ctx.fillRect(len / 2 + 9, -5.5, 4, 3.5);
    ctx.fillRect(len / 2 + 9, 2, 4, 3.5);
    ctx.shadowBlur = 0;

    // 6. High-speed Pantograph on rear of loco
    ctx.strokeStyle = "#F26419";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-len / 2 + 8, -2);
    ctx.lineTo(-len / 2 + 14, -6);
    ctx.lineTo(-len / 2 + 20, 0);
    ctx.stroke();

    // Locomotive Roster Code Text
    ctx.fillStyle = isVandeBharat ? "#EEEBDA" : "#F6AE2D";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("LOCO", -len / 2 + 18, 2.5);
  }

  drawPassengerCoach(ctx, len, coachInfo) {
    const isVandeBharat = this.train.name.includes("Vande Bharat");

    // Coach Main Shell
    ctx.fillStyle = isVandeBharat ? "#EEEBDA" : "#8A1C1C";
    ctx.strokeStyle = isVandeBharat ? "#282B4A" : "#4A1111";
    ctx.lineWidth = 1.5;

    ctx.fillRect(-len / 2, -8.5, len, 17);
    ctx.strokeRect(-len / 2, -8.5, len, 17);

    // Livery Center Band
    ctx.fillStyle = isVandeBharat ? "#282B4A" : "#F6AE2D";
    ctx.fillRect(-len / 2, -2.5, len, 5);

    // Illuminated Passenger Windows with Warm Vanilla Interior Glow
    ctx.fillStyle = this.isNightMode ? "#FFF5C0" : "#282B4A";
    const winWidth = 4.5;
    const winGap = 3;
    for (let w = -len / 2 + 6; w < len / 2 - 6; w += winWidth + winGap) {
      ctx.fillRect(w, -7.5, winWidth, 3);
      ctx.fillRect(w, 4.5, winWidth, 3);
    }

    // Coach Number Badge (e.g. C1, C2, EC1, B1)
    ctx.fillStyle = isVandeBharat ? "#EEEBDA" : "#FFFFFF";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const code = coachInfo?.code || "C1";
    ctx.fillText(code, 0, 0);

    // Rooftop AC unit
    ctx.fillStyle = "#32365C";
    ctx.fillRect(-len / 2 + 12, -2, 10, 4);
  }

  drawSparks(trainPos) {
    const ctx = this.ctx;
    // Occasional pantograph spark when running above 70 km/h
    if (this.physics.speedKmh > 70 && Math.random() < 0.15) {
      this.sparks.push({
        x: trainPos.x + (Math.random() - 0.5) * 8,
        y: trainPos.y + (Math.random() - 0.5) * 8,
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
      ctx.fillStyle = `rgba(106, 213, 255, ${s.life})`;
      ctx.shadowColor = "#6AD5FF";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
