import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getProjects } from "../api/projects";
import { getMockRisk } from "../mocks/mockRiskData";
import StatCard from "../components/StatCard";
import RiskBadge from "../components/RiskBadge";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

const RISK_COLORS = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | error | ready

  const fetchProjects = () => {
    setStatus("loading");
    getProjects()
      .then((data) => {
        setProjects(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Same mock risk source as ProjectList/ProjectDetails, so every number
  // shown here matches what you'd see clicking into any individual
  // project. Swapping to the real ML API later = changing getMockRisk's
  // implementation in one file, not touching this page.
  const projectsWithRisk = useMemo(
    () => projects.map((p) => ({ ...p, risk: getMockRisk(p) })),
    [projects]
  );

  const stats = useMemo(() => {
    const total = projectsWithRisk.length;
    const counts = { High: 0, Medium: 0, Low: 0 };
    let scoreSum = 0;

    projectsWithRisk.forEach((p) => {
      counts[p.risk.level] = (counts[p.risk.level] || 0) + 1;
      scoreSum += p.risk.score;
    });

    const avgRisk = total > 0 ? Math.round(scoreSum / total) : 0;
    return { total, counts, avgRisk };
  }, [projectsWithRisk]);

  const distributionData = useMemo(
    () =>
      ["High", "Medium", "Low"]
        .map((level) => ({ name: level, value: stats.counts[level] || 0 }))
        .filter((d) => d.value > 0),
    [stats]
  );

  const highRiskProjects = useMemo(
    () =>
      [...projectsWithRisk]
        .filter((p) => p.risk.level === "High")
        .sort((a, b) => b.risk.score - a.risk.score)
        .slice(0, 5),
    [projectsWithRisk]
  );

  if (status === "loading") return <LoadingState label="Loading dashboard..." />;
  if (status === "error") {
    return <ErrorState message="Couldn't load dashboard data." onRetry={fetchProjects} />;
  }
  if (stats.total === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Create your first project to see dashboard stats here."
      />
    );
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Projects" value={stats.total} />
        <StatCard label="High Risk" value={stats.counts.High || 0} accent="#ef4444" />
        <StatCard label="Medium Risk" value={stats.counts.Medium || 0} accent="#f59e0b" />
        <StatCard label="Average Risk Score" value={stats.avgRisk} accent="#C9A227" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk distribution donut chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-[#16233A] mb-4">Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={distributionData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {distributionData.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* High-risk project list */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-[#16233A] mb-4">High-Risk Projects</h2>
          {highRiskProjects.length === 0 ? (
            <p className="text-sm text-slate-400">No high-risk projects right now.</p>
          ) : (
            <ul className="space-y-1">
              {highRiskProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/projects/${p.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50"
                  >
                    <div>
                      <div className="text-sm font-medium text-[#16233A]">{p.name}</div>
                      <div className="text-xs text-slate-500">
                        {(p.districts || []).join(", ")}
                      </div>
                    </div>
                    <RiskBadge level={p.risk.level} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
