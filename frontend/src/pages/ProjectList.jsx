import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { getProjects } from "../api/projects";
import RiskBadge from "../components/RiskBadge";
import StatusPill from "../components/StatusPill";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

// NOTE: confirm these match your backend's actual riskLevel values
// (e.g. "High" vs "HIGH") - check the Network tab response and adjust.
const RISK_LEVELS = ["High", "Medium", "Low"];

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | error | ready

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");

  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

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

  // Adjust field names below (name/state/district/status/riskLevel) to
  // match your actual backend response shape once you confirm it.
  const states = useMemo(
    () => [...new Set(projects.map((p) => p.state).filter(Boolean))].sort(),
    [projects]
  );

  // District options scoped to the selected state.
  const districts = useMemo(
    () =>
      [
        ...new Set(
          projects
            .filter((p) => !stateFilter || p.state === stateFilter)
            .map((p) => p.district)
            .filter(Boolean)
        ),
      ].sort(),
    [projects, stateFilter]
  );

  const filtered = useMemo(() => {
    const result = projects.filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
      const matchesState = !stateFilter || p.state === stateFilter;
      const matchesDistrict = !districtFilter || p.district === districtFilter;
      const matchesRisk = !riskFilter || p.riskLevel === riskFilter;
      return matchesSearch && matchesState && matchesDistrict && matchesRisk;
    });

    result.sort((a, b) => {
      const valA = a[sortKey] ?? "";
      const valB = b[sortKey] ?? "";
      const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [projects, search, stateFilter, districtFilter, riskFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const columns = [
    { key: "name", label: "Project" },
    { key: "state", label: "State" },
    { key: "district", label: "District" },
    { key: "status", label: "Status" },
    { key: "riskLevel", label: "Risk" },
  ];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md
              focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
          />
        </div>

        <select
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(e.target.value);
            setDistrictFilter(""); // districts depend on the selected state
          }}
          className="text-sm border border-slate-200 rounded-md px-3 py-2"
        >
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-md px-3 py-2"
        >
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-md px-3 py-2"
        >
          <option value="">All risk levels</option>
          {RISK_LEVELS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {status === "loading" && <LoadingState label="Loading projects..." />}
      {status === "error" && (
        <ErrorState message="Couldn't load projects." onRetry={fetchProjects} />
      )}
      {status === "ready" && filtered.length === 0 && (
        <EmptyState
          title="No projects found"
          description="Try adjusting your search or filters, or create a new project."
        />
      )}

      {status === "ready" && filtered.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="text-left px-4 py-3 font-medium text-slate-600 cursor-pointer select-none"
                  >
                    {col.label}
                    {sortKey === col.key && (sortDir === "asc" ? " ▲" : " ▼")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/projects/${p.id}`}
                      className="font-medium text-[#16233A] hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.state}</td>
                  <td className="px-4 py-3 text-slate-600">{p.district}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge level={p.riskLevel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}