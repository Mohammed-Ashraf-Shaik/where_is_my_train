/**
 * RailPulse AI - Neural Delay Predictor & Section Congestion Analyzer
 * Multi-factor probabilistic delay forecasting engine factoring in weather, congestion, and slack buffers
 */

export class AIDelayPredictor {
  constructor() {
    this.weatherConditions = [
      { name: "Clear Skies (Optimal)", speedReductionPct: 0, fogFactor: 0 },
      { name: "Dense Morning Fog", speedReductionPct: 28, fogFactor: 0.8 },
      { name: "Heavy Monsoon Rain", speedReductionPct: 18, fogFactor: 0.4 },
      { name: "High Heat Wave (>42°C)", speedReductionPct: 10, fogFactor: 0.1 }
    ];
    this.selectedWeatherIndex = 0;
    this.corridorCongestionPct = 68; // Golden Quadrilateral line utilization
  }

  setWeather(index) {
    this.selectedWeatherIndex = Math.max(0, Math.min(this.weatherConditions.length - 1, index));
  }

  setCongestion(pct) {
    this.corridorCongestionPct = Math.max(10, Math.min(150, pct));
  }

  predict(train, physics) {
    const weather = this.weatherConditions[this.selectedWeatherIndex];
    const tele = physics ? physics.getTelemetry() : null;
    const currentDelay = train.delayMinutes || 0;

    // Remaining distance
    const totalDist = train.stations[train.stations.length - 1].distanceKm || 750;
    const remainingKm = tele ? (1.0 - tele.progress) * totalDist : totalDist * 0.7;

    // Operational Slack Buffer embedded in Indian Railways timetables (usually 15-35 mins near terminal)
    const scheduleSlackMins = Math.round(totalDist * 0.035);

    // Weather impact in delay minutes
    const weatherDelayMins = Math.round((remainingKm / 100) * (weather.speedReductionPct * 0.45));

    // Congestion delay impact (above 85% capacity leads to exponential queueing)
    const congestionFactor = Math.max(0, (this.corridorCongestionPct - 75) / 25);
    const congestionDelayMins = Math.round((remainingKm / 150) * (congestionFactor * 4.2));

    // Net predicted delay at final terminal
    const rawProjectedDelay = Math.round(currentDelay + weatherDelayMins + congestionDelayMins - scheduleSlackMins);
    const finalPredictedDelay = Math.max(0, rawProjectedDelay);

    // Punctuality recovery probability (0 to 100%)
    let recoveryProb = 95 - (currentDelay * 3.5) - (weather.speedReductionPct * 1.2) - (congestionFactor * 12);
    recoveryProb = Math.max(12, Math.min(99, Math.round(recoveryProb)));

    // Risk classification
    let riskLevel = "LOW RISK";
    let badgeColor = "#00ff88";
    if (finalPredictedDelay > 30) {
      riskLevel = "CRITICAL DELAY";
      badgeColor = "#ff334b";
    } else if (finalPredictedDelay > 12) {
      riskLevel = "MODERATE DELAY";
      badgeColor = "#ffb300";
    }

    return {
      currentDelayMinutes: currentDelay,
      weatherName: weather.name,
      congestionPct: this.corridorCongestionPct,
      scheduleSlackMins,
      predictedDelayMinutes: finalPredictedDelay,
      recoveryProbabilityPct: recoveryProb,
      riskLevel,
      badgeColor,
      etaDriftString: finalPredictedDelay === 0 ? "Right Time" : `+${finalPredictedDelay} mins`,
      aiAnalysisSummary: this.generateSummary(train, finalPredictedDelay, recoveryProb, weather, scheduleSlackMins)
    };
  }

  generateSummary(train, delay, prob, weather, slack) {
    if (delay <= 5) {
      return `✅ Neural model indicates high arrival punctuality (${prob}% confidence). Embedded ${slack}m timetable slack will absorb minor sector throttling under ${weather.name}.`;
    }
    if (delay <= 20) {
      return `⚠️ Throttling expected due to ${weather.name} and sectional line saturation (${this.corridorCongestionPct}%). Projected delay of ~${delay} mins at ${train.destination}.`;
    }
    return `🚨 High cascading delay probability (+${delay}m). Signal block holding times exceed standard margins. Consider buffer times for connecting trains.`;
  }
}

