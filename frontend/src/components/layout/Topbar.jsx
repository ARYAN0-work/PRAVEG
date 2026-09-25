
import { ShieldCheck } from "lucide-react";
import RoleSwitcher from "../Roleswitcher";

export default function Topbar({ title = "Dashboard" }) {
  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden rounded-lg bg-[#FFFBEF] p-2 sm:block">
          <ShieldCheck className="h-4 w-4 text-[#C9A227]" />
        </div>
        <h1 className="truncate text-base font-semibold text-[#16233A] sm:text-lg">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <RoleSwitcher />
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16233A] text-xs font-medium text-white">
            A
          </div>
          <span className="hidden text-sm font-medium text-[#16233A] md:block">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
