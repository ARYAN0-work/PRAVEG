import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProject, createProject, updateProject } from "../api/projects";
import LoadingState from "../components/LoadingState";

const APPROVAL_OPTIONS = ["Pending", "Approved", "Rejected"];
const PROGRESS_OPTIONS = ["Not Started", "In Progress", "Completed"];
const LEGAL_OPTIONS = ["None", "Ongoing", "Resolved"];

const EMPTY_FORM = {
  name: "",
  type: "",
  state: "",
  district: "",
  landArea: "",
  affectedFamilies: "",
  compensationStatus: "Not Started",
  approvalStatus: "Pending",
  legalDispute: "None",
  possessionStatus: "Not Started",
  rehabilitationStatus: "Not Started",
};

export default function ProjectForm() {
  const { id } = useParams(); // present only in edit mode (/projects/:id/edit)
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    getProject(id)
      .then((data) => setForm({ ...EMPTY_FORM, ...data }))
      .catch(() => setSubmitError("Couldn't load this project for editing."))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Project name is required.";
    if (!form.state.trim()) next.state = "State is required.";
    if (!form.district.trim()) next.district = "District is required.";
    if (form.affectedFamilies && Number.isNaN(Number(form.affectedFamilies))) {
      next.affectedFamilies = "Must be a number.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        affectedFamilies: form.affectedFamilies ? Number(form.affectedFamilies) : 0,
      };

      const saved = isEditMode
        ? await updateProject(id, payload)
        : await createProject(payload);

      navigate(`/projects/${saved.id}`);
    } catch (err) {
      // Surfaces backend validation messages if present, falls back to a
      // generic message otherwise.
      setSubmitError(
        err?.response?.data?.message || "Something went wrong while saving. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading project..." />;

  const inputClass = (key) =>
    `w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A227] ${
      errors[key] ? "border-red-400" : "border-slate-200"
    }`;

  return (
    <div className="max-w-2xl">
      <Link
        to={isEditMode ? `/projects/${id}` : "/projects"}
        className="text-xs text-slate-500 hover:underline"
      >
        ← Cancel
      </Link>
      <h1 className="text-xl font-semibold text-[#16233A] mt-1 mb-6">
        {isEditMode ? "Edit Project" : "New Project"}
      </h1>

      {submitError && (
        <div className="mb-4 px-4 py-2 text-sm rounded-md bg-red-50 text-red-700 border border-red-200">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Project Name" error={errors.name} span={2}>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={inputClass("name")}
              placeholder="e.g. Riverside Highway Expansion"
            />
          </Field>

          <Field label="Project Type">
            <input
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className={inputClass("type")}
              placeholder="e.g. Road Infrastructure"
            />
          </Field>

          <Field label="Land Area">
            <input
              value={form.landArea}
              onChange={(e) => handleChange("landArea", e.target.value)}
              className={inputClass("landArea")}
              placeholder="e.g. 45 acres"
            />
          </Field>

          <Field label="State" error={errors.state}>
            <input
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
              className={inputClass("state")}
            />
          </Field>

          <Field label="District" error={errors.district}>
            <input
              value={form.district}
              onChange={(e) => handleChange("district", e.target.value)}
              className={inputClass("district")}
            />
          </Field>

          <Field label="Affected Families" error={errors.affectedFamilies}>
            <input
              value={form.affectedFamilies}
              onChange={(e) => handleChange("affectedFamilies", e.target.value)}
              className={inputClass("affectedFamilies")}
              placeholder="e.g. 128"
            />
          </Field>

          <Field label="Approval Status">
            <select
              value={form.approvalStatus}
              onChange={(e) => handleChange("approvalStatus", e.target.value)}
              className={inputClass("approvalStatus")}
            >
              {APPROVAL_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>

          <Field label="Compensation Status">
            <select
              value={form.compensationStatus}
              onChange={(e) => handleChange("compensationStatus", e.target.value)}
              className={inputClass("compensationStatus")}
            >
              {PROGRESS_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>

          <Field label="Possession Status">
            <select
              value={form.possessionStatus}
              onChange={(e) => handleChange("possessionStatus", e.target.value)}
              className={inputClass("possessionStatus")}
            >
              {PROGRESS_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>

          <Field label="Rehabilitation Status">
            <select
              value={form.rehabilitationStatus}
              onChange={(e) => handleChange("rehabilitationStatus", e.target.value)}
              className={inputClass("rehabilitationStatus")}
            >
              {PROGRESS_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>

          <Field label="Legal Dispute">
            <select
              value={form.legalDispute}
              onChange={(e) => handleChange("legalDispute", e.target.value)}
              className={inputClass("legalDispute")}
            >
              {LEGAL_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-[#16233A] text-white
              hover:bg-[#1E3352] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Project"}
          </button>
          <Link
            to={isEditMode ? `/projects/${id}` : "/projects"}
            className="px-4 py-2 text-sm rounded-md border border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, span, children }) {
  return (
    <div className={span === 2 ? "col-span-2" : ""}>
      <label className="block text-xs font-medium text-slate-500 uppercase mb-1">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}


 