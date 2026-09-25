
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, ArrowRight, FolderKanban, Gauge, Clock3, MapPin, Activity } from "lucide-react";
import { getProjects } from "../api/projects";
import { useScope } from "../contexts/ScopeContext";
import StatCard from "../components/StatCard";
import RiskBadge from "../components/RiskBadge";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import PortfolioMap from "../components/PortfolioMap";

const RISK_COLORS = {
  High: "#dc2626",
  Medium: "#d97706",
  Low: "#15803d",
};

function getDistricts(project) {
  return Array.isArray(project?.districts) ? project.districts : [];
}

function isInScope(project, scope) {
  if (scope.role === "national") return true;
  if (scope.role === "state") return project.state === scope.state;
  if (scope.role === "district") {
    return (
      project.state === scope.state &&
      getDistricts(project).includes(scope.district)
    );
  }
  return true;
}

export default function Dashboard() {
  const { scope } = useScope();
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const fetchProjects = () => {
    setStatus("loading");
    getProjects()
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setStatus("ready");
      })
      .catch((failure) => { setError(failure.message); setStatus("error"); });
  };

  useEffect(() => {
    let active = true;
    getProjects().then((data) => {
      if (!active) return;
      setProjects(Array.isArray(data) ? data : []);
      setStatus("ready");
    }).catch((failure) => { if (active) { setError(failure.message); setStatus("error"); } });
    return () => { active = false; };
  }, []);

  const scopedProjects = useMemo(
    () => projects.filter((project) => isInScope(project, scope)),
    [projects, scope],
  );

  const stats = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    let predicted = 0;
    let scoreSum = 0;

    scopedProjects.forEach((project) => {
      const prediction = project.latestPrediction;
      if (!prediction) return;

      const level = prediction.delayRisk;
      if (level in counts) counts[level] += 1;

      if (Number.isFinite(Number(prediction.riskScore))) {
        scoreSum += Number(prediction.riskScore);
        predicted += 1;
      }
    });

    return {
      total: scopedProjects.length,
      pending: scopedProjects.filter((project) => !project.latestPrediction).length,
      counts,
      avgRisk: predicted ? Math.round(scoreSum / predicted) : 0,
    };
  }, [scopedProjects]);

  const distributionData = useMemo(
    () =>
      ["High", "Medium", "Low"]
        .map((level) => ({ name: level, value: stats.counts[level] }))
        .filter((entry) => entry.value > 0),
    [stats],
  );

  const highRiskProjects = useMemo(
    () =>
      scopedProjects
        .filter((project) => project.latestPrediction?.delayRisk === "High")
        .sort(
          (a, b) =>
            (b.latestPrediction?.riskScore ?? 0) -
            (a.latestPrediction?.riskScore ?? 0),
        )
        .slice(0, 5),
    [scopedProjects],
  );

  if (status === "loading") {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (status === "error") {
    return (
      <ErrorState
        message={error || "Couldn't load dashboard data."}
        onRetry={fetchProjects}
      />
    );
  }

  if (stats.total === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Create your first project to see live project and AI risk statistics here."
        action={
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#16233A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1E3352]"
          >
            Create project <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    );
  }

  const scopeLabel =
    scope.role === "national"
      ? "All projects"
      : scope.role === "state"
        ? scope.state
        : `${scope.district || "All districts"}, ${scope.state}`;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="overview-hero rounded-3xl p-6 text-white sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9A227]">
              Executive intelligence
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#16233A]">
              Land acquisition, in focus.
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track project exposure and geographic coverage across your portfolio. Risk scores reflect saved model predictions.
            </p>
          </div>
          <div className="text-sm text-slate-500">
            Viewing <span className="font-medium text-[#16233A]">{scopeLabel}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatCard label="Total Projects" value={stats.total} icon={FolderKanban} />
        <StatCard
          label="High Risk"
          value={stats.counts.High}
          accent="#dc2626"
          icon={AlertTriangle}
        />
        <StatCard
          label="Medium Risk"
          value={stats.counts.Medium}
          accent="#d97706"
          icon={Gauge}
        />
        <StatCard
          label="Low Risk"
          value={stats.counts.Low}
          accent="#15803d"
          icon={Gauge}
        />
        <StatCard
          label="Pending Prediction"
          value={stats.pending}
          accent="#C9A227"
          icon={Clock3}
        />
      </div>

      <section className="surface-card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><p className="eyebrow"><MapPin size={13} /> Geographic intelligence</p><h2 className="mt-1 text-xl font-semibold">Portfolio coverage</h2><p className="mt-1 text-sm text-slate-500">Select a district marker to explore its projects.</p></div>
          <Link to="/projects/new" className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900">Add project <Activity size={15}/></Link>
        </div>
        <PortfolioMap projects={scopedProjects} height={370} />
        <p className="mt-3 text-xs text-slate-500">District centre locations are approximate, not land parcel boundaries. Map tiles require internet access. Red is high risk, amber medium, green low, grey pending.</p>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#16233A]">
              Risk Distribution
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Only saved ML predictions are included.
            </p>
          </div>

          {distributionData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {distributionData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-slate-400">
              No predictions available yet.
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#16233A]">
                Highest-risk projects
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Ranked by the saved ML risk score.
              </p>
            </div>
            <div className="rounded-lg bg-[#FFFBEF] px-3 py-2 text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Average score
              </div>
              <div className="text-lg font-bold text-[#16233A]">
                {stats.avgRisk}
                <span className="text-xs font-medium text-slate-400">/100</span>
              </div>
            </div>
          </div>

          {highRiskProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No high-risk projects in this scope.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Projects appear here automatically after an ML prediction is saved.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {highRiskProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 transition hover:border-[#C9A227]/50 hover:bg-[#FFFBEF]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[#16233A]">
                      {project.name}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-500">
                      {getDistricts(project).join(", ") || "No district recorded"}
                    </div>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-[#16233A]">
                      {project.latestPrediction?.riskScore ?? "—"}/100
                    </span>
                    <RiskBadge level={project.latestPrediction?.delayRisk} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
