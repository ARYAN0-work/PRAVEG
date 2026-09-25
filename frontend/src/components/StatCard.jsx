
export default function StatCard({
  label,
  value,
  accent = "#16233A",
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold text-[#16233A]">{value}</div>
        </div>
        {Icon && (
          <div
            className="rounded-lg p-2"
            style={{ backgroundColor: `${accent}12`, color: accent }}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
