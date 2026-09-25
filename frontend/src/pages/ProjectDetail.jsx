
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Trash2, Pencil } from "lucide-react";
import {
  getProject,
  deleteProject,
  predictProjectRisk,
} from "../api/projects";
import StatusPill from "../components/StatusPill";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import RiskPanel from "../components/RiskPanel";
import ProjectMap from "../components/ProjectMap";
import { addRecentlyViewed } from "../utils/recentlyViewed";

const FIELDS = [
  { key: "state", label: "State" },
  { key: "districts", label: "Districts" },
  { key: "projectType", label: "Project Type" },
  { key: "landAreaHectares", label: "Land Area (hectares)" },
  { key: "affectedFamilies", label: "Affected Families" },
  { key: "budgetAllocatedCrore", label: "Budget (₹ crore)" },
  { key: "compensationPaidPercent", label: "Compensation Paid (%)" },
  { key: "legalDisputes", label: "Active Legal Disputes" },
  { key: "possessionPercent", label: "Land Possession (%)" },
  { key: "stakeholderResponsePercent", label: "Stakeholder Response (%)" },
  { key: "stakeholderResponsiveness", label: "Responsiveness Band", pill: true },
  { key: "historicalPerformance", label: "Historical Performance (0–4)" },
];

function formatValue(key, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (
    ["landAreaHectares", "budgetAllocatedCrore", "historicalPerformance"].includes(
      key,
    )
  ) {
    return Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  }
  if (
    ["compensationPaidPercent", "possessionPercent", "stakeholderResponsePercent"].includes(
      key,
    )
  ) {
    return `${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}%`;
  }
  return value;
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("loading");
  const [refreshing, setRefreshing] = useState(false);
  const currentIdRef = useRef(id);

  const fetchProject = () => {
    setStatus("loading");
    getProject(id)
      .then((data) => {
        if (currentIdRef.current !== id) return;
        setProject(data);
        setStatus("ready");
        addRecentlyViewed(data);
      })
      .catch(() => {
        if (currentIdRef.current === id) setStatus("error");
      });
  };

  useEffect(() => {
    currentIdRef.current = id;
    getProject(id).then((data) => {
      if (currentIdRef.current !== id) return;
      setProject(data);
      setStatus("ready");
      addRecentlyViewed(data);
    }).catch(() => { if (currentIdRef.current === id) setStatus("error"); });
  }, [id]);

  const handleDelete = async () => {
    if (!project) return;
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteProject(id);
      navigate("/projects");
    } catch {
      window.alert("Failed to delete project. Please try again.");
    }
  };

  const handleRefreshPrediction = async () => {
    setRefreshing(true);
    try {
      const prediction = await predictProjectRisk(id);
      setProject((current) =>
        current ? { ...current, latestPrediction: prediction } : current,
      );
    } catch (error) {
      window.alert(error.message || "Could not generate a prediction.");
    } finally {
      setRefreshing(false);
    }
  };

  if (status === "loading") return <LoadingState label="Loading project..." />;

  if (status === "error") {
    return (
      <ErrorState
        message="Couldn't load this project."
        onRetry={fetchProject}
      />
    );
  }

  const prediction = project?.latestPrediction;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/projects"
            className="text-xs font-medium text-slate-500 hover:text-[#16233A]"
          >
            ← Back to Projects
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#16233A]">
              {project.name}
            </h1>
            {prediction && <RiskPanelMini level={prediction.delayRisk} />}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {project.projectType} · {project.state}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/projects/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-[#16233A] hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A227]">
            Project profile
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[#16233A]">
            Acquisition and implementation data
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {FIELDS.map(({ key, label, pill }) => (
            <div key={key}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                {label}
              </div>
              <div className="mt-1 text-sm font-medium text-slate-800">
                {pill ? (
                  <StatusPill status={project[key]} />
                ) : (
                  formatValue(key, project[key])
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ProjectMap project={project} />
        <RiskPanel
          risk={prediction}
          onRefresh={handleRefreshPrediction}
          refreshing={refreshing}
        />
      </div>
    </div>
  );
}

function RiskPanelMini({ level }) {
  const styles = {
    High: "bg-red-50 text-red-700 border-red-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[level] || "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {level} Risk
    </span>
  );
}
