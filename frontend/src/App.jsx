import { Routes, Route, useLocation, matchPath, NavLink } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Plus } from "lucide-react";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard";
import ProjectList from "./pages/ProjectList";
import ProjectDetails from "./pages/ProjectDetail";
import ProjectForm from "./pages/ProjectForm";
import "./index.css"

// Maps the current route to a Topbar title, so the title stays correct
// without every page having to know about/set it itself. More specific
// static paths (e.g. "/projects/new") are listed before the dynamic
// "/projects/:id" so they're matched first.
const TITLE_ROUTES = [
  { path: "/", title: "Dashboard" },
  { path: "/projects", title: "Projects" },
  { path: "/projects/new", title: "New Project" },
  { path: "/projects/:id/edit", title: "Edit Project" },
  { path: "/projects/:id", title: "Project Details" },
];

function getPageTitle(pathname) {
  const match = TITLE_ROUTES.find((route) =>
    matchPath({ path: route.path, end: true }, pathname)
  );
  return match?.title || "Dashboard";
}

function AppLayout() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-[#f4f6fa]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id/edit" element={<ProjectForm />} />
            <Route path="/projects/:id" element={<ProjectDetails key={location.pathname} />} />
          </Routes>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {[["/", "Overview", LayoutDashboard], ["/projects", "Projects", FolderKanban], ["/projects/new", "Add project", Plus]].map(([to, label, Icon]) =>
          <NavLink key={to} to={to} end className={({ isActive }) => `flex flex-col items-center gap-1 px-4 py-2 text-[11px] ${isActive ? "text-amber-300" : "text-slate-300"}`}><Icon size={18}/>{label}</NavLink>)}
      </nav>
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
