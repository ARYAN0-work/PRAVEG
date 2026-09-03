import { Routes, Route, useLocation, matchPath } from "react-router-dom";
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
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id/edit" element={<ProjectForm />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}