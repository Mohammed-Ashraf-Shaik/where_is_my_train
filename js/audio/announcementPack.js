/**
 * RailPulse AI - Multilingual Station Announcement & Soundboard FX
 * Synthesizes Hindi/English railway station announcer alerts, guard whistles & crossing bells
 * Authentic Indian Railways Public Address (PA) Acoustics
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

    // High pitched pea whistle (~2450Hz with fast modulation)
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

  speakAnnouncement(trainNumber, trainName, stationName, platform, language = "en", type = "arrival") {
    // 1. Play authentic three-note railway chime
    this.sound.playStationChime();

    // 2. Synthesize voice after chime finishes
    setTimeout(() => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();

      let text = "";
      let langCode = "en-IN";

      // Space out train numbers for authentic cadence: e.g. "2 2 4 3 6"
      const spacedNumber = String(trainNumber).split("").join(" ");

      if (language === "hi") {
        langCode = "hi-IN";
        if (type === "departure") {
          text = `यात्रीगण कृपया ध्यान दें। गाड़ी संख्या ${spacedNumber}, ${trainName}, प्लेटफार्म नंबर ${platform} से प्रस्थान करने के लिए तैयार है।`;
        } else {
          text = `यात्रीगण कृपया ध्यान दें। गाड़ी संख्या ${spacedNumber}, ${trainName}, प्लेटफार्म क्रमांक ${platform} पर आ रही है।`;
        }
      } else {
        langCode = "en-IN";
        if (type === "departure") {
          text = `May I have your attention please. Train number ${spacedNumber}, ${trainName}, is ready for departure from Platform Number ${platform}.`;
        } else {
          text = `May I have your attention please. Train number ${spacedNumber}, ${trainName}, arriving shortly on Platform Number ${platform}.`;
        }
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.pitch = 1.02;
      utterance.lang = langCode;

      // Select matching accent voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang.startsWith(langCode.slice(0, 2)) || v.name.includes("India"));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.speak(utterance);
    }, 1200);
  }
}
