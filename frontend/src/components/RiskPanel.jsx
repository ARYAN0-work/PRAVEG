
import { RefreshCw, CheckCircle2, AlertTriangle, Clock3 } from "lucide-react";
import RiskBadge from "./RiskBadge";

function percentage(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) : 0;
}

export default function RiskPanel({ risk, onRefresh, refreshing = false }) {
  if (!risk) {
    return (
      <div className="rounded-xl border border-dashed border-[#C9A227] bg-[#FFFBEF] p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A227]">
              AI Risk Analysis
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#16233A]">
              Prediction pending
            </h2>
          </div>
          <Clock3 className="h-6 w-6 text-[#C9A227]" />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          No saved prediction is available for this project yet.
        </p>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#16233A] px-3 py-2 text-sm font-medium text-white hover:bg-[#1E3352] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Generating..." : "Generate prediction"}
          </button>
        )}
      </div>
    );
  }

  const score = Number(risk.riskScore ?? 0);
  const level = risk.delayRisk || "Unknown";
  const probabilities = {
    Low: Number(risk.lowProbability ?? 0),
    Medium: Number(risk.mediumProbability ?? 0),
    High: Number(risk.highProbability ?? 0),
  };
  const factors = Array.isArray(risk.riskFactors) ? risk.riskFactors : [];
  const recommendations = Array.isArray(risk.recommendations)
    ? risk.recommendations
    : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A227]">
            AI Risk Analysis
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-4xl font-bold tracking-tight text-[#16233A]">
              {score}
            </span>
            <span className="text-sm text-slate-400">/100</span>
            <RiskBadge level={level} />
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            title="Generate a fresh prediction"
            className="rounded-md border border-slate-200 p-2 text-slate-500 hover:border-[#C9A227] hover:text-[#16233A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Model probabilities
          </h3>
          <span className="text-xs text-slate-400">
            Confidence {Math.round(Number(risk.confidence ?? 0) * 100)}%
          </span>
        </div>

        <div className="space-y-3">
          {[
            ["Low", probabilities.Low, "bg-emerald-600"],
            ["Medium", probabilities.Medium, "bg-amber-500"],
            ["High", probabilities.High, "bg-red-600"],
          ].map(([label, value, bar]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-slate-600">{label}</span>
                <span className="font-semibold text-[#16233A]">
                  {percentage(value)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${bar}`}
                  style={{ width: `${Math.min(100, Math.max(0, percentage(value)))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          {level === "High" ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Why this risk was recorded
          </h3>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {risk.reason || "No additional explanation was recorded."}
        </p>
      </div>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Risk factors
        </h3>
        {factors.length ? (
          <ul className="mt-2 space-y-2">
            {factors.map((factor, index) => (
              <li key={index} className="flex gap-2 text-sm leading-5 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A227]" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-400">No major risk factors identified.</p>
        )}
      </div>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recommendations
        </h3>
        {recommendations.length ? (
          <ul className="mt-2 space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex gap-2 text-sm leading-5 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#16233A]" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-400">No recommendations available.</p>
        )}
      </div>
    </div>
  );
}
