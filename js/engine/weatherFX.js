/**
 * RailPulse AI - Dynamic Weather FX Engine
 * Renders rain streaks, ballast water splashes, volumetric fog & lightning flashes
 */

export class WeatherFXEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.currentWeather = "CLEAR"; // "CLEAR" | "RAIN" | "FOG" | "STORM"
    
    // Rain Particles
    this.rainDrops = [];
    this.splashes = [];
    this.fogOffset = 0;
    this.lightningAlpha = 0;

    this.initParticles();
  }

  setWeather(type) {
    this.currentWeather = type;
    if (type === "RAIN" || type === "STORM") {
      this.initParticles();
    }
  }

  initParticles() {
    this.rainDrops = [];
    const count = 180;
    for (let i = 0; i < count; i++) {
      this.rainDrops.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        len: 12 + Math.random() * 14,
        speed: 16 + Math.random() * 10,
        opacity: 0.3 + Math.random() * 0.4
      });
    }
  }

  render(width, height) {
    const ctx = this.ctx;
    if (this.currentWeather === "CLEAR") return;

    ctx.save();

    // 1. Fog Effect
    if (this.currentWeather === "FOG" || this.currentWeather === "STORM") {
      this.fogOffset = (this.fogOffset + 0.3) % 400;
      const fogGrad = ctx.createLinearGradient(0, 0, width, height);
      fogGrad.addColorStop(0, "rgba(220, 235, 255, 0.28)");
      fogGrad.addColorStop(0.5, "rgba(180, 205, 230, 0.45)");
      fogGrad.addColorStop(1, "rgba(220, 235, 255, 0.28)");

      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Monsoon Rain Particles
    if (this.currentWeather === "RAIN" || this.currentWeather === "STORM") {
      ctx.strokeStyle = "rgba(174, 214, 241, 0.6)";
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";

      ctx.beginPath();
      for (let i = 0; i < this.rainDrops.length; i++) {
        const d = this.rainDrops[i];
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 3, d.y + d.len); // Angled rainfall

        d.y += d.speed;
        d.x -= 2;

        // Splashes when hitting ground
        if (d.y > height) {
          d.y = -10;
          d.x = Math.random() * (width + 100);

          if (Math.random() < 0.2) {
            this.splashes.push({
              x: d.x,
              y: height - (Math.random() * 40),
              radius: 1,
              life: 1.0
            });
          }
        }
      }
      ctx.stroke();

      // Draw ground ripple splashes
      for (let s = this.splashes.length - 1; s >= 0; s--) {
        const sp = this.splashes[s];
        sp.radius += 0.8;
        sp.life -= 0.1;

        if (sp.life <= 0) {
          this.splashes.splice(s, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(174, 214, 241, ${sp.life * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y, sp.radius * 2, sp.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 3. Lightning Flash (Storm)
    if (this.currentWeather === "STORM") {
      if (Math.random() < 0.008 && this.lightningAlpha <= 0) {
        this.lightningAlpha = 0.8;
      }
      if (this.lightningAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningAlpha})`;
        ctx.fillRect(0, 0, width, height);
        this.lightningAlpha -= 0.08;
      }
    }

    ctx.restore();
  }
}

