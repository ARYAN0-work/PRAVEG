import { responsivenessBand } from "./reference-data.js";

type ProjectInput = {
  landAreaHectares: number | null;
  affectedFamilies: number | null;
  budgetAllocatedCrore: number | null;
  compensationPaidPercent: number | null;
  compensationStatus?: string | null;
  legalDisputes: number | null;
  possessionPercent: number | null;
  stakeholderResponsePercent: number | null;
  stakeholderResponsiveness?: string | null;
  historicalPerformance: number | null;
  projectType: string;
  state: string;
};

type ModelResponse = {
  predicted_class: "Low" | "Medium" | "High";
  confidence: number;
  probabilities: {
    Low: number;
    Medium: number;
    High: number;
  };
};

export function buildModelInput(project: ProjectInput) {
  const stakeholderResponsiveness =
    project.stakeholderResponsiveness ??
    (project.stakeholderResponsePercent != null
      ? responsivenessBand(project.stakeholderResponsePercent)
      : "Unknown");

  return {
    project_type: project.projectType,
    land_area: project.landAreaHectares,
    affected_families: project.affectedFamilies,
    stakeholder_responsiveness: stakeholderResponsiveness,
    historical_performance: project.historicalPerformance,
    possession_status: project.possessionPercent,
    state: project.state,
  };
}

export async function requestPrediction(project: ProjectInput) {
  const baseUrl = process.env.ML_API_URL ?? "http://127.0.0.1:8000";

  const response = await fetch(`${baseUrl}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildModelInput(project)),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`ML API returned ${response.status}`);
  }

  return (await response.json()) as ModelResponse;
}

export function explainPrediction(
  project: ProjectInput,
  output: ModelResponse
) {
  const factors: string[] = [];
  const recommendations: string[] = [];

  const responsiveness =
    project.stakeholderResponsiveness ??
    (project.stakeholderResponsePercent != null
      ? responsivenessBand(project.stakeholderResponsePercent)
      : null);

  if (responsiveness === "Poor" || responsiveness === "Low") {
    const value =
      project.stakeholderResponsePercent != null
        ? ` (${project.stakeholderResponsePercent}%)`
        : "";

    factors.push(
      `Stakeholder responsiveness is ${responsiveness.toLowerCase()}${value}.`
    );

    recommendations.push(
      "Assign an escalation owner and close stakeholder grievances on a time-bound schedule."
    );
  }

  if (
    project.compensationPaidPercent != null &&
    project.compensationPaidPercent < 70
  ) {
    factors.push(
      `Only ${project.compensationPaidPercent}% of compensation has been paid.`
    );

    recommendations.push(
      "Prioritize compensation verification and payment for pending affected families."
    );
  }

  if (
    project.possessionPercent != null &&
    project.possessionPercent < 70
  ) {
    factors.push(
      `Land possession is ${project.possessionPercent}%, below the 70% readiness threshold.`
    );

    recommendations.push(
      "Prepare a district-wise possession recovery plan with weekly review milestones."
    );
  }

  if (project.legalDisputes != null && project.legalDisputes > 0) {
    factors.push(
      `${project.legalDisputes} active legal dispute${
        project.legalDisputes === 1 ? "" : "s"
      } recorded.`
    );

    recommendations.push(
      "Create a case-wise legal-resolution tracker and escalate long-pending matters."
    );
  }

  if (
    project.historicalPerformance != null &&
    project.historicalPerformance < 2
  ) {
    factors.push(
      "Historical performance is below the expected operating baseline."
    );

    recommendations.push(
      "Review prior project bottlenecks and assign corrective milestones before the next stage."
    );
  }

  if (!factors.length) {
    factors.push(
      "No rule-based operational risk factor crossed the configured thresholds."
    );
  }

  if (!recommendations.length) {
    recommendations.push(
      "Continue milestone monitoring and refresh the project snapshot regularly."
    );
  }

  // 0 = no predicted delay; 100 = high-delay probability.
  // Medium contributes half weight.
  const riskScore = Math.round(
    output.probabilities.High * 100 +
      output.probabilities.Medium * 50
  );

  return {
    delayRisk: output.predicted_class.toUpperCase() as
      | "LOW"
      | "MEDIUM"
      | "HIGH",
    riskScore,
    confidence: output.confidence,
    lowProbability: output.probabilities.Low,
    mediumProbability: output.probabilities.Medium,
    highProbability: output.probabilities.High,
    reason: factors[0],
    riskFactors: factors,
    recommendations,
    modelVersion: "delay_model.pkl-v4",
  };
}