/**
 * RailPulse AI - Station Platform 2.5D View
 * Station-level perspective showing platform markings, coach indicator boards, and arriving rake
 */

export class PlatformView {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.className = "w-full h-full block";
    this.container.appendChild(this.canvas);

    this.physics = null;
    this.train = null;
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

  setPhysics(physics, train) {
    this.physics = physics;
    this.train = train;
  }

  render() {
    if (!this.physics || !this.train) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const tele = this.physics.getTelemetry();

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Station Roof & Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
    skyGrad.addColorStop(0, "#0a1120");
    skyGrad.addColorStop(1, "#162035");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.4);

    // Platform Overhead Steel Canopy Structure
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, w, 24);
    for (let x = 40; x < w; x += 120) {
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x, 24);
      ctx.lineTo(x, h * 0.5);
      ctx.stroke();

      // Suspended Platform Lamp
      ctx.fillStyle = "rgba(255, 255, 200, 0.8)";
      ctx.shadowColor = "#fef08a";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, 34, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 2. Platform Concrete Slab & Paving
    const platY = h * 0.52;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, platY, w, h - platY);

    // Yellow Safety Paving Line
    ctx.fillStyle = "#ffb703";
    ctx.fillRect(0, platY + 4, w, 6);

    // Platform edge shadow
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, platY + 10, w, 16);

    // 3. Track Bed below Platform
    const trackY = platY + 26;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, trackY, w, h - trackY);

    // Rails in front of platform
    ctx.strokeStyle = "#8fe5ff";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, trackY + 20);
    ctx.lineTo(w, trackY + 20);
    ctx.moveTo(0, trackY + 38);
    ctx.lineTo(w, trackY + 38);
    ctx.stroke();

    // 4. Arriving / Present Train
    // Calculate lateral train position based on approach to next station
    const isAtStation = tele.isStationDwell;
    const remainingKm = parseFloat(tele.remainingKmToNext);
    let trainScreenX = w + 100; // Off-screen right when far away

    if (isAtStation) {
      trainScreenX = w * 0.45; // Centered at platform
    } else if (remainingKm < 3.0) {
      // Pulling into station
      const approachT = 1.0 - (remainingKm / 3.0);
      trainScreenX = w - (approachT * (w * 0.55));
    }

    // Draw Train at Platform
    if (trainScreenX < w + 80) {
      this.drawTrainAtPlatform(ctx, trainScreenX, trackY + 12);
    }

    // 5. Digital Station Display Board
    this.drawStationBoard(ctx, w, platY, tele);

    ctx.restore();
  }

  drawTrainAtPlatform(ctx, x, y) {
    const isVandeBharat = this.train.name.includes("Vande Bharat");
    const rakeLen = 480;

    ctx.save();
    ctx.translate(x, y);

    // Train Body
    ctx.fillStyle = isVandeBharat ? "#f8fafc" : "#b91c1c";
    ctx.fillRect(-rakeLen, -36, rakeLen, 44);

    // Roof arc
    ctx.fillStyle = isVandeBharat ? "#e2e8f0" : "#991b1b";
    ctx.fillRect(-rakeLen, -42, rakeLen, 8);

    // Livery stripe
    ctx.fillStyle = isVandeBharat ? "#0077b6" : "#fef08a";
    ctx.fillRect(-rakeLen, -16, rakeLen, 6);

    // Glowing passenger windows
    ctx.fillStyle = "#fef08a";
    ctx.shadowColor = "#fef08a";
    ctx.shadowBlur = 8;
    for (let wx = -rakeLen + 20; wx < -10; wx += 26) {
      ctx.fillRect(wx, -32, 16, 12);
    }
    ctx.shadowBlur = 0;

    // Aerodynamic Nose
    ctx.fillStyle = isVandeBharat ? "#f8fafc" : "#b91c1c";
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.lineTo(40, -10);
    ctx.lineTo(35, 6);
    ctx.lineTo(0, 8);
    ctx.closePath();
    ctx.fill();

    // Twin High-beam headlights
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(36, -4, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawStationBoard(ctx, w, platY, tele) {
    // Large Digital Overhead Arrival Signboard
    const boardW = 320;
    const boardH = 50;
    const bx = (w - boardW) / 2;
    const by = platY - 90;

    ctx.fillStyle = "#050b14";
    ctx.fillRect(bx, by, boardW, boardH);
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, boardW, boardH);

    // Digital LED text
    ctx.fillStyle = "#ffb703";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${tele.nextStation.toUpperCase()} - PLATFORM ${tele.nextStationPlatform}`, w / 2, by + 20);

    ctx.fillStyle = tele.isStationDwell ? "#00ff88" : "#00e5ff";
    ctx.font = "11px monospace";
    const statusText = tele.isStationDwell 
      ? `HALTED: DEPARTS IN ${tele.dwellSecondsLeft}s` 
      : `APPROACHING: ${tele.speedKmh} KM/H (ETA: ${tele.etaMinutes}m)`;
    ctx.fillText(statusText, w / 2, by + 38);
  }
}
