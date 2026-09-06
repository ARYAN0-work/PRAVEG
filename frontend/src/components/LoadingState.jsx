export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-[#16233A] rounded-full animate-spin mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}