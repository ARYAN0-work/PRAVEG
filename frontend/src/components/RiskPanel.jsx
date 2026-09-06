import RiskBadge from "./RiskBadge";

// Isolated as its own component so this is easy to give an independent
// loading/error state later, once risk data comes from a real (async) API
// instead of the synchronous mock.
export default function RiskPanel({ risk }) {
  return (
    <div className="border-2 border-dashed border-[#C9A227] rounded-lg p-5 bg-[#FFFBEF]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[#16233A] uppercase tracking-wide">
          AI Risk Analysis
        </h2>
        <span className="text-xs text-slate-500 italic">Latest saved prediction</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-3xl font-bold text-[#16233A]">{risk.score}<span className="text-base">/100</span></div>
        <RiskBadge level={risk.level} />
      </div>

      {risk.probabilities && (
        <div className="mb-4 text-sm text-slate-700">
          Delay probabilities — Low: {Math.round(risk.probabilities.Low * 100)}%, Medium: {Math.round(risk.probabilities.Medium * 100)}%, High: {Math.round(risk.probabilities.High * 100)}%
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">
          Why is it risky?
        </h3>
        <p className="text-sm text-slate-700">{risk.reason}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">
          Risk Factors
        </h3>
        {risk.factors.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            {risk.factors.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No major risk factors identified.</p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase mb-1">
          Recommendations
        </h3>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {risk.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
