export const getMockRisk = (project) => {
  const prediction = project?.latestPrediction;
  if (prediction) {
    return {
      level: prediction.delayRisk,
      score: prediction.riskScore,
      confidence: prediction.confidence,
      reason: prediction.reason,
      factors: prediction.riskFactors || [],
      recommendations: prediction.recommendations || [],
      probabilities: {
        Low: prediction.lowProbability,
        Medium: prediction.mediumProbability,
        High: prediction.highProbability,
      },
    };
  }
  return {
    level: "Unknown",
    score: 0,
    confidence: 0,
    reason: "Prediction is pending. Start the ML service and refresh this project.",
    factors: [],
    recommendations: [],
  };
};
