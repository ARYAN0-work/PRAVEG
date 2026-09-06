// Small reusable stat tile for the Dashboard - one number, one label,
// optional accent color for the value.
export default function StatCard({ label, value, accent = "#16233A" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="text-xs font-medium text-slate-500 uppercase mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}