/**
 * RailPulse AI - Platform Crowd Forecaster & Coach Boarding Heatmap
 * Predicts station platform rush, escalator bottlenecks and coach-level boarding pressure
 */

export class AICrowdPredictor {
  constructor() {}

  predictPlatformCrowd(station, train) {
    const baseCrowd = station.crowdIndex || "Moderate";
    let score = 50;

    if (baseCrowd === "Extreme") score = 92;
    else if (baseCrowd === "High") score = 76;
    else if (baseCrowd === "Moderate") score = 52;
    else score = 28;

    // Time of day rush factor (peak morning 07:00-10:00 & evening 17:00-21:00)
    const currentHour = new Date().getHours();
    const isPeakHour = (currentHour >= 7 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 21);
    if (isPeakHour) score = Math.min(98, score + 14);

    return {
      stationName: station.name,
      platform: station.platform,
      crowdScore: score,
      crowdLabel: score > 80 ? "CRITICAL CONGESTION" : score > 55 ? "MODERATE RUSH" : "CALM / SMOOTH",
      badgeColor: score > 80 ? "#ff334b" : score > 55 ? "#ffb300" : "#00ff88",
      fobCongestion: score > 75 ? "High Queue at Staircases" : "Normal Flow",
      recommendedBoardingTime: score > 75 ? "Arrive on platform 25 mins early" : "Arrive 12 mins early",
      escalatorStatus: "Active & Monitored by CCTV",
      zones: [
        { zone: "Engine End (Coaches 1-3)", density: Math.round(score * 0.75), label: "Moderate" },
        { zone: "Middle / FOB Overbridge (Coaches 4-7)", density: Math.round(score * 1.15), label: "Heavy Rush" },
        { zone: "Rear End (Coaches 8-12)", density: Math.round(score * 0.65), label: "Light / Quiet" }
      ]
    };
  }

  generateCoachHeatmap(rakeComposition) {
    return rakeComposition.map((coach, index) => {
      let rush = 45;
      let advice = "Standard Boarding";

      if (coach.class === "GEN" || coach.class === "2S") {
        rush = 88;
        advice = "Heavy rush at doors; queue on platform early";
      } else if (coach.class === "3A" || coach.class === "CC") {
        rush = 62;
        advice = "Steady boarding; keep ticket & ID ready";
      } else if (coach.class === "2A" || coach.class === "EC") {
        rush = 35;
        advice = "Smooth, unhurried entry";
      } else if (coach.class === "1A") {
        rush = 18;
        advice = "Priority concierge assistance available";
      } else {
        rush = 10;
        advice = "Service / Non-passenger coach";
      }

      return {
        ...coach,
        positionIndex: index + 1,
        rushPercent: Math.min(100, rush),
        color: rush > 75 ? "#ff334b" : rush > 50 ? "#ffb300" : "#00ff88",
        advice
      };
    });
  }
}
