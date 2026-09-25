
import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { getProjects } from "../../api/projects";
import { useScope } from "../../contexts/ScopeContext";
import { getRecentlyViewed } from "../../utils/recentlyViewed";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
];

function districtsOf(project) {
  return Array.isArray(project?.districts) ? project.districts : [];
}

function inScope(project, scope) {
  if (scope.role === "national") return true;
  if (scope.role === "state") return project.state === scope.state;
  if (scope.role === "district") {
    return (
      project.state === scope.state &&
      districtsOf(project).includes(scope.district)
    );
  }
  return true;
}

export default function Sidebar() {
  const { scope } = useScope();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts] = useState({ total: null, high: null });
  const recent = getRecentlyViewed();

  useEffect(() => {
    let active = true;

    getProjects()
      .then((data) => {
        if (!active) return;

        const scoped = (Array.isArray(data) ? data : []).filter((project) =>
          inScope(project, scope),
        );

        setCounts({
          total: scoped.length,
          high: scoped.filter(
            (project) => project.latestPrediction?.delayRisk === "High",
          ).length,
        });
      })
      .catch(() => {
        if (active) setCounts({ total: null, high: null });
      });

    return () => {
      active = false;
    };
  }, [scope, location.pathname]);

  return (
    <aside
      className={`app-sidebar flex h-screen shrink-0 flex-col bg-[#16233A] text-slate-200 transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <ShieldCheck className="h-6 w-6 shrink-0 text-[#C9A227]" />
        {!collapsed && (
          <span className="text-sm font-semibold leading-tight text-white">
            PRAVEG
            <br />
            Risk Intelligence
          </span>
        )}
      </div>

      <div className="px-3 pt-4">
        <NavLink
          to="/projects/new"
          className="flex items-center justify-center gap-2 rounded-md bg-[#C9A227] py-2 text-sm font-semibold text-[#16233A] transition hover:bg-[#dab53a]"
        >
          <Plus className="h-4 w-4" />
          {!collapsed && "New Project"}
        </NavLink>
      </div>

      <nav className="mt-6 flex-1 space-y-5 overflow-y-auto px-3">
        <div>
          {!collapsed && (
            <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Overview
            </div>
          )}
          <div className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "border-[#C9A227] bg-white/10 text-white"
                      : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && label}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          {!collapsed && (
            <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Projects
            </div>
          )}

          <div className="space-y-1">
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `flex items-center justify-between rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "border-[#C9A227] bg-white/10 text-white"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <FolderKanban className="h-4 w-4 shrink-0" />
                {!collapsed && "Projects"}
              </span>
              {!collapsed && counts.total !== null && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                  {counts.total}
                </span>
              )}
            </NavLink>

            <Link
              to="/projects?risk=High"
              className="flex items-center justify-between rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
            >
              <span className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                {!collapsed && "High-Risk Projects"}
              </span>
              {!collapsed && counts.high !== null && counts.high > 0 && (
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                  {counts.high}
                </span>
              )}
            </Link>
          </div>
        </div>

        {!collapsed && recent.length > 0 && (
          <div>
            <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Recently Viewed
            </div>
            <div className="space-y-1">
              {recent.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
                >
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-3 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
          A
        </div>
        {!collapsed && (
          <span className="text-xs text-slate-400">Admin workspace</span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((current) => !current)}
        className="flex items-center justify-center gap-2 border-t border-white/10 py-3 text-xs text-slate-400 hover:text-white"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            Collapse
          </>
        )}
      </button>
    </aside>
  );
}
