/**
 * RailPulse AI - Driver Cab Cockpit HUD Simulator
 * First-person perspective looking out the locomotive windshield with Kavach TCAS & telemetry dials
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
    this.offset = 0; // For track animation motion

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = rect.width;
    this.height = rect.height;
  }

  setPhysics(physics, sound) {
    this.physics = physics;
    this.sound = sound;
  }

  render() {
    if (!this.physics) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const speed = this.physics.speedKmh;

    // Advance motion offset proportional to speed
    this.offset = (this.offset + (speed * 0.15)) % 60;

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
    ctx.moveTo(vanishingX - 8, vanishingY);
    ctx.lineTo(vanishingX + 8, vanishingY);
    ctx.lineTo(w * 0.78, h);
    ctx.lineTo(w * 0.22, h);
    ctx.closePath();
    ctx.fill();

    // Perspective concrete sleepers rushing toward driver
    ctx.strokeStyle = "#383C66";
    ctx.lineWidth = 3;
    for (let z = 1; z < 25; z++) {
      const pz = (z * 18 + this.offset) % 450;
      const depth = pz / 450;
      const y = vanishingY + (h - vanishingY) * (depth ** 1.8);
      const halfWidth = 8 + (w * 0.28) * (depth ** 1.8);

      ctx.beginPath();
      ctx.moveTo(vanishingX - halfWidth, y);
      ctx.lineTo(vanishingX + halfWidth, y);
      ctx.stroke();
    }

    // Dual Steel Rails perspective (Polished Steel)
    ctx.strokeStyle = "#EEEBDA";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#F26419";
    ctx.shadowBlur = 4;

    // Left Rail
    ctx.beginPath();
    ctx.moveTo(vanishingX - 6, vanishingY);
    ctx.lineTo(w * 0.32, h);
    ctx.stroke();

    // Right Rail
    ctx.beginPath();
    ctx.moveTo(vanishingX + 6, vanishingY);
    ctx.lineTo(w * 0.68, h);
    ctx.stroke();

    // 4. Overhead Electrification Catenary Wire
    ctx.strokeStyle = "rgba(238, 235, 218, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(vanishingX, vanishingY - 12);
    ctx.lineTo(w * 0.5, 0);
    ctx.stroke();

    // Catenary poles rushing on the side
    const poleDepth = ((this.offset * 2) % 150) / 150;
    const poleY = vanishingY + (h - vanishingY) * (poleDepth ** 1.5);
    const poleX = vanishingX + (w * 0.38) * (poleDepth ** 1.5);
    ctx.strokeStyle = "#4D527E";
    ctx.lineWidth = 4 * poleDepth + 1;
    ctx.beginPath();
    ctx.moveTo(poleX, poleY);
    ctx.lineTo(poleX, poleY - (120 * poleDepth));
    ctx.stroke();

    // 5. Approaching Kavach Trackside Signal
    const signal = this.physics.currentSignal;
    const sigDepth = ((this.offset + 25) % 300) / 300;
    const sigY = vanishingY + (h - vanishingY) * (sigDepth ** 1.6);
    const sigX = vanishingX - (w * 0.28) * (sigDepth ** 1.6);
    let sigColor = "#2EC4B6";
    if (signal === "RED") sigColor = "#E71D36";
    else if (signal === "YELLOW" || signal === "DOUBLE_YELLOW") sigColor = "#F6AE2D";

    ctx.fillStyle = sigColor;
    ctx.shadowColor = sigColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(sigX, sigY - (40 * sigDepth), Math.max(2, 6 * sigDepth), 0, Math.PI * 2);
    ctx.fill();

    // 6. Cab Windshield Frame & Glass Reflections
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#181A2D";
    // Top roof visor
    ctx.fillRect(0, 0, w, 28);
    // Left & Right pillar struts
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w * 0.08, 0);
    ctx.lineTo(w * 0.04, h * 0.75);
    ctx.lineTo(0, h * 0.75);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w * 0.92, 0);
    ctx.lineTo(w * 0.96, h * 0.75);
    ctx.lineTo(w, h * 0.75);
    ctx.fill();

    // 7. Driver Console Dashboard
    const dashY = h * 0.75;
    ctx.fillStyle = "#282B4A";
    ctx.fillRect(0, dashY, w, h - dashY);
    ctx.strokeStyle = "rgba(238, 235, 218, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, dashY);
    ctx.lineTo(w, dashY);
    ctx.stroke();

    // Draw Dashboard Dials
    this.drawCabTelemetry(ctx, w, h, dashY);

    ctx.restore();
  }

  drawCabTelemetry(ctx, w, h, dashY) {
    const tele = this.physics.getTelemetry();

    // Kavach Protection Indicator Badge
    ctx.fillStyle = "rgba(46, 196, 182, 0.15)";
    ctx.strokeStyle = "#2EC4B6";
    ctx.lineWidth = 1;
    ctx.fillRect(20, dashY + 12, 140, 26);
    ctx.strokeRect(20, dashY + 12, 140, 26);
    ctx.fillStyle = "#2EC4B6";
    ctx.font = "bold 11px monospace";
    ctx.fillText("🛡️ KAVACH TCAS: ACTIVE", 26, dashY + 29);

    // Speed Limit Display
    ctx.fillStyle = "rgba(246, 174, 45, 0.15)";
    ctx.strokeStyle = "#F6AE2D";
    ctx.fillRect(170, dashY + 12, 120, 26);
    ctx.strokeRect(170, dashY + 12, 120, 26);
    ctx.fillStyle = "#F6AE2D";
    ctx.fillText(`LIMIT: ${tele.maxSpeedKmh} KM/H`, 182, dashY + 29);

    // Throttle Notch Level
    ctx.fillStyle = "rgba(238, 235, 218, 0.15)";
    ctx.strokeStyle = "#EEEBDA";
    ctx.fillRect(300, dashY + 12, 140, 26);
    ctx.strokeRect(300, dashY + 12, 140, 26);
    ctx.fillStyle = "#EEEBDA";
    ctx.fillText(`THROTTLE: ${tele.throttlePct}%`, 312, dashY + 29);

    // Big Digital Speedometer readout in Warm Vanilla (#EEEBDA)
    ctx.fillStyle = "#EEEBDA";
    ctx.font = "bold 34px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${tele.speedKmh}`, w - 75, dashY + 36);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#C8C5B4";
    ctx.fillText("KM/H", w - 40, dashY + 34);

    // Upcoming Station note
    ctx.textAlign = "left";
    ctx.fillStyle = "#EEEBDA";
    ctx.font = "12px sans-serif";
    ctx.fillText(`NEXT: ${tele.nextStation} (P${tele.nextStationPlatform}) in ${tele.remainingKmToNext} km`, 22, dashY + 54);
  }
}

