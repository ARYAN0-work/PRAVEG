const RISK_STYLES = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function RiskBadge({ level }) {
  const style = RISK_STYLES[level] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {level || "Unknown"}
    </span>
  );
}