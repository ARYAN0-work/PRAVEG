
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpDown, Plus, Search } from "lucide-react";
import { getProjects } from "../api/projects";
import { useScope } from "../contexts/ScopeContext";
import RiskBadge from "../components/RiskBadge";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const RISK_LEVELS = ["High", "Medium", "Low"];

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

export default function ProjectList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { scope } = useScope();
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const riskFilter = searchParams.get("risk") || "";
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

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
    () => projects.filter((project) => inScope(project, scope)),
    [projects, scope],
  );

  const states = useMemo(
    () =>
      [...new Set(scopedProjects.map((project) => project.state).filter(Boolean))].sort(),
    [scopedProjects],
  );

  const districts = useMemo(
    () =>
      [
        ...new Set(
          scopedProjects
            .filter((project) => !stateFilter || project.state === stateFilter)
            .flatMap(districtsOf)
            .filter(Boolean),
        ),
      ].sort(),
    [scopedProjects, stateFilter],
  );

  const filtered = useMemo(() => {
    const result = scopedProjects.filter((project) => {
      const name = String(project.name || "").toLowerCase();
      const level = project.latestPrediction?.delayRisk || "";
      return (
        name.includes(search.toLowerCase()) &&
        (!stateFilter || project.state === stateFilter) &&
        (!districtFilter || districtsOf(project).includes(districtFilter)) &&
        (!riskFilter || level === riskFilter)
      );
    });

    result.sort((a, b) => {
      let valueA;
      let valueB;

      if (sortKey === "riskScore") {
        valueA = a.latestPrediction?.riskScore ?? -1;
        valueB = b.latestPrediction?.riskScore ?? -1;
        return sortDir === "asc" ? valueA - valueB : valueB - valueA;
      }

      if (sortKey === "riskLevel") {
        const order = { High: 3, Medium: 2, Low: 1 };
        valueA = order[a.latestPrediction?.delayRisk] || 0;
        valueB = order[b.latestPrediction?.delayRisk] || 0;
        return sortDir === "asc" ? valueA - valueB : valueB - valueA;
      }

      valueA =
        sortKey === "districts"
          ? districtsOf(a).join(", ")
          : a[sortKey] ?? "";
      valueB =
        sortKey === "districts"
          ? districtsOf(b).join(", ")
          : b[sortKey] ?? "";

      const comparison = String(valueA).localeCompare(String(valueB), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    scopedProjects,
    search,
    stateFilter,
    districtFilter,
    riskFilter,
    sortKey,
    sortDir,
  ]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const scopeLabel =
    scope.role === "national"
      ? "All projects"
      : scope.role === "state"
        ? scope.state
        : `${scope.district || "All districts"}, ${scope.state}`;

  if (status === "loading") {
    return <LoadingState label="Loading projects..." />;
  }

  if (status === "error") {
    return (
      <ErrorState
        message={error || "Couldn't load projects."}
        onRetry={fetchProjects}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A227]">
            Project registry
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#16233A]">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Viewing <span className="font-medium text-[#16233A]">{scopeLabel}</span>
          </p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#16233A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1E3352]"
        >
          <Plus className="h-4 w-4" /> New project
        </Link>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by project name..."
              className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
            />
          </div>

          <select
            value={stateFilter}
            onChange={(event) => {
              setStateFilter(event.target.value);
              setDistrictFilter("");
            }}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A227]"
          >
            <option value="">All states</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <select
            value={districtFilter}
            onChange={(event) => setDistrictFilter(event.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A227]"
          >
            <option value="">All districts</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

          <select
            value={riskFilter}
            onChange={(event) => setSearchParams(event.target.value ? { risk: event.target.value } : {})}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C9A227]"
          >
            <option value="">All risk levels</option>
            {RISK_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            title="No matching projects"
            description="Try changing the search or filters, or create a new project."
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <Header label="Project" active={sortKey === "name"} direction={sortDir} onClick={() => toggleSort("name")} />
                  <Header label="State" active={sortKey === "state"} direction={sortDir} onClick={() => toggleSort("state")} />
                  <Header label="Districts" active={sortKey === "districts"} direction={sortDir} onClick={() => toggleSort("districts")} />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Prediction
                  </th>
                  <Header label="Risk" active={sortKey === "riskLevel"} direction={sortDir} onClick={() => toggleSort("riskLevel")} />
                  <Header label="Score" active={sortKey === "riskScore"} direction={sortDir} onClick={() => toggleSort("riskScore")} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => {
                  const prediction = project.latestPrediction;
                  return (
                    <tr
                      key={project.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-[#FFFBEF]/70"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-semibold text-[#16233A] hover:text-[#C9A227]"
                        >
                          {project.name}
                        </Link>
                        <div className="mt-0.5 text-xs text-slate-400">
                          {project.projectType}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{project.state}</td>
                      <td className="max-w-[240px] px-4 py-3 text-slate-600">
                        <span className="line-clamp-2">
                          {districtsOf(project).join(", ") || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {prediction ? (
                          <span className="text-xs font-medium text-emerald-700">
                            Generated
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-amber-700">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge level={prediction?.delayRisk} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#16233A]">
                        {prediction ? `${prediction.riskScore}/100` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
            <span>{filtered.length} project{filtered.length === 1 ? "" : "s"}</span>
            <span className="inline-flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" /> Click a column heading to sort
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ label, active, direction, onClick }) {
  return (
    <th className="px-4 py-3 text-left">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-[#16233A]"
      >
        {label}
        {active && <span>{direction === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}
