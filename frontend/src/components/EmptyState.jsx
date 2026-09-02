export default function EmptyState({ title = "Nothing here yet", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
      <p className="text-base font-medium text-slate-700">{title}</p>
      {description && <p className="text-sm mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}