import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Projects", icon: FolderKanban },
];

function Sidebar() {
  const [collapse, setCollapse] = useState(false);

  return (
    <aside
      className={`h-screen shrink-0 bg-[#16233A] text-slate-200 flex flex-col
        ${collapse ? "w-[76px]" : "w-64"}`}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <ShieldCheck className="w-6 h-6 text-[#C9A227] shrink-0" />
        {!collapse && (
          <span className="font-semibold text-sm leading-tight text-white">
            PRAVEG
            <br />
            Prediction 
          </span>
        )}
      </div>

      <div className="px-3 pt-4">
        <NavLink
          to="/projects/new"
          className="flex items-center gap-2 justify-center rounded-md
            bg-[#C9A227] text-[#16233A] font-medium text-sm py-2
            hover:bg-[#dab53a]"
        >
          <Plus className="w-4 h-4" />
          {!collapse && "New Project"}
        </NavLink>
      </div>

      <nav className="flex-1 px-3 mt-6 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
              ${
                isActive
                  ? "bg-white/10 text-white border-l-2 border-[#C9A227]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapse && label}
          </NavLink>
        ))}
      </nav>
      
      {/**<div className="px-3 py-3 border-t border-white/10 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0">
          A
        </div>
        {!collapse && (
          <span className="text-xs text-slate-400">Logged in as Admin</span>
        )}
      </div>**/}

      <button
        onClick={() => setCollapse((c) => !c)}
        className="flex items-center justify-center gap-2 py-3 border-t
          border-white/10 text-slate-400 hover:text-white text-xs"
      >
        {collapse ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <>
            <ChevronLeft className="w-4 h-4" />
            Close
          </>
        )}
      </button>
    </aside>
  );
}

export default Sidebar;
