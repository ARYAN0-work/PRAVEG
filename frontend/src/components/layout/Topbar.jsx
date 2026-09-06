import { Bell } from "lucide-react";

export default function Topbar({ title = "Dashboard" }) {
  return (
    <header
      className="h-16 flex items-center justify-between px-6
        bg-white border-b-2 border-[#C9A227] shrink-0"
    >
      <h1 className="text-lg font-semibold text-[#16233A]">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notifications placeholder - deferred feature, shown disabled */}
        <button
          disabled
          title="Notifications (coming soon)"
          className="text-slate-300 cursor-not-allowed"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* User indicator */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <div
            className="w-8 h-8 rounded-full bg-[#16233A] text-white
              flex items-center justify-center text-xs font-medium"
          >
            A
          </div>
          <span className="text-sm text-[#16233A] font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
}