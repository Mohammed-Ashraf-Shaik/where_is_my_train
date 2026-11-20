/**
 * RailPulse AI - Multilingual Station Announcement & Soundboard FX
 * Synthesizes Hindi/English railway station announcer alerts, guard whistles & crossing bells
 */

export class StationAnnouncementPack {
  constructor(soundEngine) {
    this.sound = soundEngine;
  }

  playGuardWhistle() {
    this.sound.ensureContext();
    if (!this.sound.ctx || this.sound.isMuted) return;

    const ctx = this.sound.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // High pitched pea whistle (~2400Hz with fast modulation)
    osc.type = "triangle";
    osc.frequency.setValueAtTime(2450, now);
    osc.frequency.linearRampToValueAtTime(2550, now + 0.4);
    osc.frequency.linearRampToValueAtTime(2350, now + 0.8);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(gain);
    gain.connect(this.sound.masterGain);

    osc.start(now);
    osc.stop(now + 0.9);
  }

  playLevelCrossingBell() {
    this.sound.ensureContext();
    if (!this.sound.ctx || this.sound.isMuted) return;

    const ctx = this.sound.ctx;
    const now = ctx.currentTime;
    const bellCount = 6;

    for (let i = 0; i < bellCount; i++) {
      const strikeTime = now + (i * 0.28);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1050, strikeTime);

      gain.gain.setValueAtTime(0, strikeTime);
      gain.gain.linearRampToValueAtTime(0.2, strikeTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.26);

      osc.connect(gain);
      gain.connect(this.sound.masterGain);

      osc.start(strikeTime);
      osc.stop(strikeTime + 0.28);
    }
  }

  speakAnnouncement(trainNumber, trainName, stationName, platform, language = "en") {
    this.sound.playStationChime();

    setTimeout(() => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();

      let text = "";
      let langCode = "en-IN";

      if (language === "hi") {
        text = `यात्रीगण कृपया ध्यान दें। गाड़ी संख्या ${trainNumber}, ${trainName}, प्लेटफॉर्म नंबर ${platform} पर आ रही है।`;
        langCode = "hi-IN";
      } else {
        text = `May I have your attention please. Train number ${trainNumber}, ${trainName}, arriving on platform number ${platform}.`;
        langCode = "en-IN";
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.lang = langCode;

      window.speechSynthesis.speak(utterance);
    }, 1200);
  }
}

