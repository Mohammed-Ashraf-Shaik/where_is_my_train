/**
 * RailPulse AI - Driver Cab Cockpit HUD Simulator
 * First-person perspective looking out the locomotive windshield with Kavach TCAS & telemetry dials
 * Seamless mathematical perspective projection with zero sleeper popping or stutter
 * Editorial Midnight Indigo (#282B4A) & Vanilla (#EEEBDA) Design System
 */

export class CabView {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.className = "w-full h-full block";
    this.container.appendChild(this.canvas);

    this.physics = null;
    this.sound = null;
    this.phase = 0; // Seamless continuous phase [0.0 to 1.0]

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const w = rect.width || this.container.parentElement?.clientWidth || 800;
    const h = rect.height || this.container.parentElement?.clientHeight || 480;

    this.canvas.width = w * window.devicePixelRatio;
    this.canvas.height = h * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = w;
    this.height = h;
  }

  setPhysics(physics, sound) {
    this.physics = physics;
    this.sound = sound;
  }

  render() {
    if (!this.physics) return;
    if (this.width === 0 || this.height === 0) this.resize();

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const speed = this.physics.speedKmh;

    // Advance continuous phase: smoothly wrap at exactly 1.0
    const speedFactor = (speed / 160) * 0.035 + 0.005;
    this.phase = (this.phase + speedFactor) % 1.0;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Sky & Horizon (Midnight Indigo Gradient)
    const horizonY = h * 0.42;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, "#181A2D");
    skyGrad.addColorStop(1, "#282B4A");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // Subtle stars in night sky
    ctx.fillStyle = "rgba(238, 235, 218, 0.4)";
    for (let i = 0; i < 20; i++) {
      const sx = (i * 97) % w;
      const sy = (i * 43) % horizonY;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // 2. Ground / Terrain
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    groundGrad.addColorStop(0, "#22253E");
    groundGrad.addColorStop(1, "#181A2D");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // 3. Vanishing Point 3D Railway Track
    const vanishingX = w * 0.5;
    const vanishingY = horizonY;

    // Ballast bed perspective
    ctx.fillStyle = "#1E2036";
    ctx.beginPath();
    ctx.moveTo(vanishingX - 10, vanishingY);
    ctx.lineTo(vanishingX + 10, vanishingY);
    ctx.lineTo(w * 0.82, h);
    ctx.lineTo(w * 0.18, h);
    ctx.closePath();
    ctx.fill();

    // Perspective concrete sleepers rushing toward driver (Seamless Zero-Pop Flow)
    const totalSleepers = 24;
    ctx.strokeStyle = "#383C66";
    ctx.lineWidth = 3.5;

    for (let i = 0; i < totalSleepers; i++) {
      const normZ = (i / totalSleepers + this.phase) % 1.0;
      if (normZ < 0.04) continue; // Skip vanishing point cluster

      const depth = normZ ** 2.2; // Perspective curve
      const y = vanishingY + (h - vanishingY) * depth;
      const halfWidth = 6 + (w * 0.32) * depth;

      // Alpha fade-in from distance and under dashboard
      const alpha = Math.sin(normZ * Math.PI);
      ctx.strokeStyle = `rgba(56, 60, 102, ${alpha})`;

      ctx.beginPath();
      ctx.moveTo(vanishingX - halfWidth, y);
      ctx.lineTo(vanishingX + halfWidth, y);
      ctx.stroke();
    }

    // Dual Steel Rails perspective (Polished Steel in Vanilla #EEEBDA)
    ctx.strokeStyle = "#EEEBDA";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#F26419";
    ctx.shadowBlur = 4;

    // Left Rail
    ctx.beginPath();
    ctx.moveTo(vanishingX - 6, vanishingY);
    ctx.lineTo(w * 0.30, h);
    ctx.stroke();

    // Right Rail
    ctx.beginPath();
    ctx.moveTo(vanishingX + 6, vanishingY);
    ctx.lineTo(w * 0.70, h);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Overhead Electrification Catenary Wire
    ctx.strokeStyle = "rgba(238, 235, 218, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(vanishingX, vanishingY - 8);
    ctx.lineTo(vanishingX, 0);
    ctx.stroke();

    // Approaching Catenary Portals
    for (let p = 0; p < 4; p++) {
      const pNorm = (p / 4 + this.phase * 0.5) % 1.0;
      if (pNorm < 0.05) continue;
      const pDepth = pNorm ** 2.0;
      const py = vanishingY - 8 - (horizonY * 0.8) * pDepth;
      const pw = (w * 0.38) * pDepth;

      ctx.strokeStyle = `rgba(106, 213, 255, ${pNorm * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(vanishingX - pw, py);
      ctx.lineTo(vanishingX + pw, py);
      ctx.stroke();
    }

    // 5. Driver Windshield Cockpit Frame Overlay (Midnight Indigo)
    const dashY = h * 0.72;
    ctx.fillStyle = "#1C1E34";
    ctx.fillRect(0, dashY, w, h - dashY);

    // Windshield Pillars (A-Pillars)
    ctx.fillStyle = "#181A2D";
    // Left Pillar
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w * 0.12, 0);
    ctx.lineTo(w * 0.08, dashY);
    ctx.lineTo(0, dashY);
    ctx.closePath();
    ctx.fill();

    // Right Pillar
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w * 0.88, 0);
    ctx.lineTo(w * 0.92, dashY);
    ctx.lineTo(w, dashY);
    ctx.closePath();
    ctx.fill();

    // Top Roof Visor
    ctx.fillStyle = "#141624";
    ctx.fillRect(0, 0, w, 22);

    // Instrument Dashboard Top Border Line (Warm Transit Orange accent)
    ctx.strokeStyle = "#F26419";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, dashY);
    ctx.lineTo(w, dashY);
    ctx.stroke();

    // 6. Draw Dashboard Telemetry Dials
    this.drawCabTelemetry(ctx, w, h, dashY);

    ctx.restore();
  }

  drawCabTelemetry(ctx, w, h, dashY) {
    const tele = this.physics.getTelemetry();

    // Kavach Protection Indicator Badge
    ctx.fillStyle = "rgba(46, 196, 182, 0.15)";
    ctx.strokeStyle = "#2EC4B6";
    ctx.lineWidth = 1;
    ctx.fillRect(18, dashY + 12, 145, 26);
    ctx.strokeRect(18, dashY + 12, 145, 26);
    ctx.fillStyle = "#2EC4B6";
    ctx.font = "bold 11px monospace";
    ctx.fillText("🛡️ KAVACH TCAS: ACTIVE", 24, dashY + 29);

    // Speed Limit Display
    ctx.fillStyle = "rgba(246, 174, 45, 0.15)";
    ctx.strokeStyle = "#F6AE2D";
    ctx.fillRect(172, dashY + 12, 120, 26);
    ctx.strokeRect(172, dashY + 12, 120, 26);
    ctx.fillStyle = "#F6AE2D";
    ctx.fillText(`LIMIT: ${tele.maxSpeedKmh} KM/H`, 182, dashY + 29);

    // Throttle Notch Level
    ctx.fillStyle = "rgba(238, 235, 218, 0.15)";
    ctx.strokeStyle = "#EEEBDA";
    ctx.fillRect(302, dashY + 12, 130, 26);
    ctx.strokeRect(302, dashY + 12, 130, 26);
    ctx.fillStyle = "#EEEBDA";
    ctx.fillText(`THROTTLE: ${tele.throttlePct}%`, 312, dashY + 29);

    // Big Digital Speedometer readout in Warm Vanilla (#EEEBDA)
    ctx.fillStyle = "#EEEBDA";
    ctx.font = "bold 32px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${tele.speedKmh}`, w - 75, dashY + 36);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#C8C5B4";
    ctx.fillText("KM/H", w - 40, dashY + 34);

    // Upcoming Station note
    ctx.textAlign = "left";
    ctx.fillStyle = "#EEEBDA";
    ctx.font = "12px sans-serif";
    ctx.fillText(`NEXT: ${tele.nextStation} (P${tele.nextStationPlatform}) in ${tele.remainingKmToNext} km`, 20, dashY + 54);
  }
}
