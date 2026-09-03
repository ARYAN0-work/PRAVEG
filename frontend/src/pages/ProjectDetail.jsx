import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProject, deleteProject } from "../api/projects";
import { getMockRisk } from "../mocks/mockRiskData";
import StatusPill from "../components/StatusPill";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import RiskPanel from "../components/RiskPanel";
import ProjectMap from "../components/ProjectMap";

// Field labels shown in the details grid. Keys must match your backend's
// actual field names - adjust if they differ.
const FIELDS = [
  { key: "state", label: "State" },
  { key: "district", label: "Districts" },
  { key: "landArea", label: "Land Area" },
  { key: "affectedFamilies", label: "Affected Families" },
  { key: "compensationStatus", label: "Compensation Status", pill: true },
  { key: "approvalStatus", label: "Approval Status", pill: true },
  { key: "legalDispute", label: "Legal Dispute", pill: true },
  { key: "possessionStatus", label: "Possession Status", pill: true },
  { key: "rehabilitationStatus", label: "Rehabilitation Status", pill: true },
];

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | error | ready

  const fetchProject = () => {
    setStatus("loading");
    getProject(id)
      .then((data) => {
        setProject(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleDelete = () => {
    // Placeholder confirmation until the ConfirmDialog component exists -
    // swap this block for opening ConfirmDialog when it's built.
    if (!window.confirm(`Delete "${project?.name}"? This cannot be undone.`)) return;

    deleteProject(id)
      .then(() => navigate("/projects"))
      .catch(() => alert("Failed to delete project. Please try again."));
  };

  if (status === "loading") return <LoadingState label="Loading project..." />;
  if (status === "error") {
    return <ErrorState message="Couldn't load this project." onRetry={fetchProject} />;
  }

  const risk = getMockRisk(project);

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to="/projects" className="text-xs text-slate-500 hover:underline">
            ← Back to Projects
          </Link>
          <h1 className="text-xl font-semibold text-[#16233A] mt-1">
            {project.name}
          </h1>
          {project.type && (
            <p className="text-sm text-slate-500">{project.type}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            to={`/projects/${id}/edit`}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-200 hover:bg-slate-50"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Core fields */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {FIELDS.map(({ key, label, pill }) => (
            <div key={key}>
              <div className="text-xs font-medium text-slate-500 uppercase mb-1">
                {label}
              </div>
              {pill ? (
                <StatusPill status={project[key]} />
              ) : (
                <div className="text-sm text-slate-800">
                  {Array.isArray(project[key])
                    ? project[key].join(", ") || "—"
                    : project[key] ?? "—"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Location map */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase mb-2">
          Project Location
        </h2>
        <ProjectMap state={project.state} districts={project.district} />
      </div>

      {/* Reserved AI risk sections - mocked for Phase 1 */}
      <RiskPanel risk={risk} />
    </div>
  );
}