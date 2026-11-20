/**
 * RailPulse AI - Station Platform 2.5D View
 * Station-level perspective showing platform markings, coach indicator boards, and arriving/through-running rake
 * Editorial Midnight Indigo (#282B4A) & Vanilla (#EEEBDA) Design System
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
    this.throughRunX = -600;

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

  setPhysics(physics, train) {
    this.physics = physics;
    this.train = train;
  }

  render() {
    if (!this.physics || !this.train) return;
    if (this.width === 0 || this.height === 0) this.resize();

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const tele = this.physics.getTelemetry();

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Station Roof & Sky (Midnight Indigo)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
    skyGrad.addColorStop(0, "#181A2D");
    skyGrad.addColorStop(1, "#282B4A");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.4);

    // Platform Overhead Steel Canopy Structure
    ctx.fillStyle = "#22253E";
    ctx.fillRect(0, 0, w, 28);
    for (let x = 40; x < w; x += 120) {
      ctx.strokeStyle = "#383C66";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, 28);
      ctx.lineTo(x + 30, h * 0.45);
      ctx.stroke();
    }

    // 2. Track bed (Below Platform)
    const platY = h * 0.58;
    ctx.fillStyle = "#161828"; // Ballast
    ctx.fillRect(0, platY + 10, w, h - (platY + 10));

    // Platform Concrete Face & Edge
    ctx.fillStyle = "#282B4A";
    ctx.fillRect(0, platY - 55, w, 65);
    ctx.fillStyle = "#1E2036";
    ctx.fillRect(0, platY + 10, w, 22);

    // Yellow Caution Tactile Boarding Strip on Platform Edge
    ctx.fillStyle = "#FFDD00";
    ctx.fillRect(0, platY + 6, w, 5);

    // Track Sleepers on lower bed
    ctx.strokeStyle = "#32365C";
    ctx.lineWidth = 5;
    for (let x = 10; x < w; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, platY + 34);
      ctx.lineTo(x, h - 10);
      ctx.stroke();
    }

    // Double Running Steel Rails
    ctx.strokeStyle = "#EEEBDA";
    ctx.lineWidth = 3.5;
    ctx.shadowColor = "#F26419";
    ctx.shadowBlur = 6;
    // Rail 1
    ctx.beginPath();
    ctx.moveTo(0, platY + 44);
    ctx.lineTo(w, platY + 44);
    ctx.stroke();
    // Rail 2
    ctx.beginPath();
    ctx.moveTo(0, platY + 74);
    ctx.lineTo(w, platY + 74);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Train Positioning Logic (Guaranteed Visible Action!)
    let trainX = 0;
    const isDocked = tele.isStationDwell;
    const isApproaching = parseFloat(tele.remainingKmToNext) < 3.5;

    if (isDocked) {
      // Train is gracefully docked at platform center
      trainX = w * 0.55;
      this.throughRunX = trainX;
    } else if (isApproaching) {
      // Pulling in smoothly
      const approachFactor = 1.0 - (parseFloat(tele.remainingKmToNext) / 3.5);
      trainX = (w * 0.55) * approachFactor;
      this.throughRunX = trainX;
    } else {
      // Express Through-Run or En Route: Continuously animate train passing along platform!
      const passSpeed = Math.max(12, (tele.speedKmh / 160) * 28);
      this.throughRunX += passSpeed;
      if (this.throughRunX > w + 450) {
        this.throughRunX = -650;
      }
      trainX = this.throughRunX;
    }

    // 4. Draw Locomotive Rake alongside platform
    this.drawPlatformTrainRake(ctx, trainX, platY + 54, tele);

    // 5. Authentic Overhead Indian Railways Platform Board
    this.drawStationBoard(ctx, w, platY, tele, isDocked, isApproaching);

    ctx.restore();
  }

  drawPlatformTrainRake(ctx, noseX, trackY, tele) {
    const isVandeBharat = this.train.name.includes("Vande Bharat");
    const rakeLen = 650; // Long realistic multi-coach train rake

    ctx.save();
    ctx.translate(noseX, trackY);

    // Ground Shadow under train
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(-rakeLen, -8, rakeLen + 40, 36);

    // Coach Bogie Wheels
    ctx.fillStyle = "#181A2D";
    for (let bx = -rakeLen + 20; bx < 30; bx += 85) {
      ctx.fillRect(bx, 10, 22, 14);
      ctx.fillStyle = "#C8C5B4";
      ctx.beginPath();
      ctx.arc(bx + 4, 20, 6, 0, Math.PI * 2);
      ctx.arc(bx + 18, 20, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#181A2D";
    }

    // Full Train Coach Body
    ctx.fillStyle = isVandeBharat ? "#EEEBDA" : "#8A1C1C";
    ctx.fillRect(-rakeLen, -42, rakeLen, 52);
    ctx.strokeStyle = isVandeBharat ? "#282B4A" : "#4A1111";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-rakeLen, -42, rakeLen, 52);

    // Livery Center Band (Midnight Indigo for Vande Bharat; Gold for Rajdhani)
    ctx.fillStyle = isVandeBharat ? "#282B4A" : "#F6AE2D";
    ctx.fillRect(-rakeLen, -15, rakeLen, 12);

    // Glowing Warm Passenger Windows & Coach Doors
    ctx.fillStyle = "#FFF5C0";
    ctx.shadowColor = "#F6AE2D";
    ctx.shadowBlur = 10;
    for (let wx = -rakeLen + 25; wx < -15; wx += 36) {
      ctx.fillRect(wx, -35, 22, 16);
    }
    ctx.shadowBlur = 0;

    // Aerodynamic Vande Bharat Bullet Nose
    ctx.fillStyle = isVandeBharat ? "#EEEBDA" : "#8A1C1C";
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.lineTo(55, -12);
    ctx.lineTo(50, 10);
    ctx.lineTo(0, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Nose livery curve
    ctx.fillStyle = isVandeBharat ? "#282B4A" : "#F6AE2D";
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(45, -3);
    ctx.lineTo(40, 5);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();

    // Twin High-beam Headlights
    ctx.fillStyle = "#FFF9E6";
    ctx.shadowColor = "#F26419";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(48, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  drawStationBoard(ctx, w, platY, tele, isDocked, isApproaching) {
    const boardW = 380;
    const boardH = 58;
    const bx = (w - boardW) / 2;
    const by = platY - 105;

    // Midnight Indigo casing with Vanilla Border
    ctx.fillStyle = "#181A2D";
    ctx.fillRect(bx, by, boardW, boardH);
    ctx.strokeStyle = "#EEEBDA";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, boardW, boardH);

    // Platform Yellow Destination Board Text
    ctx.fillStyle = "#FFDD00";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${tele.nextStation.toUpperCase()} — PLATFORM ${tele.nextStationPlatform}`, w / 2, by + 22);

    let statusText = "";
    if (isDocked) {
      ctx.fillStyle = "#2EC4B6";
      statusText = `HALTED AT DOCK: DEPARTS IN ${tele.dwellSecondsLeft}s`;
    } else if (isApproaching) {
      ctx.fillStyle = "#F6AE2D";
      statusText = `APPROACHING PLATFORM: ${tele.speedKmh} KM/H (ETA: ${tele.etaMinutes}m)`;
    } else {
      ctx.fillStyle = "#6AD5FF";
      statusText = `⚡ EXPRESS TRACK: 22436 PASSING AT ${tele.speedKmh} KM/H`;
    }

    ctx.font = "bold 11px monospace";
    ctx.fillText(statusText, w / 2, by + 42);
  }
}
