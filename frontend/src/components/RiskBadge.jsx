
const RISK_STYLES = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function RiskBadge({ level }) {
  const style =
    RISK_STYLES[level] || "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {level || "Pending"}
    </span>
  );
}
