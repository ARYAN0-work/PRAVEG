
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import {
  createProject,
  getProject,
  getReferenceData,
  updateProject,
} from "../api/projects";
import LoadingState from "../components/LoadingState";

const EMPTY_FORM = {
  name: "",
  projectType: "",
  state: "",
  districts: [],
  landAreaHectares: "",
  affectedFamilies: "",
  budgetAllocatedCrore: "",
  compensationPaidPercent: "",
  legalDisputes: "",
  possessionPercent: "",
  stakeholderResponsePercent: "",
  historicalPerformance: "",
};

const PROJECT_INPUT_KEYS = [
  "name",
  "projectType",
  "state",
  "districts",
  "landAreaHectares",
  "affectedFamilies",
  "budgetAllocatedCrore",
  "compensationPaidPercent",
  "legalDisputes",
  "possessionPercent",
  "stakeholderResponsePercent",
  "historicalPerformance",
];

const NUMERIC_FIELDS = [
  ["landAreaHectares", "Land Area (hectares)", 0, undefined, "any"],
  ["affectedFamilies", "Affected Families", 0, undefined, 1],
  ["budgetAllocatedCrore", "Budget Allocated (₹ crore)", 0, undefined, "any"],
  ["compensationPaidPercent", "Compensation Paid (%)", 0, 100, "any"],
  ["legalDisputes", "Active Legal Disputes", 0, undefined, 1],
  ["possessionPercent", "Land Possession (%)", 0, 100, "any"],
  ["stakeholderResponsePercent", "Stakeholder Response (%)", 0, 100, "any"],
  ["historicalPerformance", "Historical Performance (0–4)", 0, 4, 0.01],
];

function responsivenessBand(value) {
  if (value === "" || value === null || value === undefined) return "—";
  const number = Number(value);
  if (number < 20) return "Poor";
  if (number < 40) return "Low";
  if (number < 70) return "Moderate";
  return "High";
}

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [reference, setReference] = useState({
    states: [],
    projectTypes: [],
    districts: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getReferenceData(),
      editing ? getProject(id) : Promise.resolve(null),
    ])
      .then(([data, project]) => {
        setReference(data || { states: [], projectTypes: [], districts: [] });

        if (project) {
          setForm({
            ...EMPTY_FORM,
            ...Object.fromEntries(PROJECT_INPUT_KEYS.map((key) => [key, project[key] ?? EMPTY_FORM[key]])),
            districts: Array.isArray(project.districts) ? project.districts : [],
          });
        }
      })
      .catch(() => setError("Could not load the project form data."))
      .finally(() => setLoading(false));
  }, [editing, id]);

  const change = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = Object.fromEntries(
      PROJECT_INPUT_KEYS.map((key) => [key, form[key]]),
    );

    NUMERIC_FIELDS.forEach(([key]) => {
      payload[key] = Number(payload[key]);
    });

    if (!payload.districts.length) {
      setSubmitting(false);
      return setError("Select at least one district.");
    }

    if (
      payload.affectedFamilies < 0 ||
      !Number.isInteger(payload.affectedFamilies)
    ) {
      setSubmitting(false);
      return setError("Affected families must be a non-negative whole number.");
    }

    try {
      const saved = editing
        ? await updateProject(id, payload)
        : await createProject(payload);

      navigate(`/projects/${saved.id}`);
    } catch (err) {
      setError(
        err.response?.data?.errors?.join(" ") ||
          err.message ||
          "Could not save the project.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading project form..." />;

  const input =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 disabled:bg-slate-50";

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to={editing ? `/projects/${id}` : "/projects"}
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#16233A]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Cancel
      </Link>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A227]">
            Project intake
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#16233A]">
            {editing ? "Edit project" : "Create new project"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Enter the project parameters used by the current delay-risk model.
            A prediction is generated automatically after saving.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-7">
          <section>
            <SectionTitle title="Project identity" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Project Name">
                <input
                  required
                  className={input}
                  value={form.name}
                  onChange={(event) => change("name", event.target.value)}
                  maxLength={200}
                />
              </Field>

              <Field label="Project Type">
                <select
                  required
                  className={input}
                  value={form.projectType}
                  onChange={(event) => change("projectType", event.target.value)}
                >
                  <option value="">Select type</option>
                  {reference.projectTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="State">
                <select
                  required
                  className={input}
                  value={form.state}
                  onChange={(event) => change("state", event.target.value)}
                >
                  <option value="">Select state</option>
                  {reference.states.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Districts">
                <MultiSelectDropdown
                  options={reference.districts}
                  selected={form.districts}
                  onChange={(next) => change("districts", next)}
                  inputClassName={input}
                />
              </Field>
            </div>
          </section>

          <section>
            <SectionTitle title="Acquisition and implementation inputs" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {NUMERIC_FIELDS.map(([key, label, min, max, step]) => (
                <Field key={key} label={label}>
                  <input
                    required
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    className={input}
                    value={form[key]}
                    onChange={(event) => change(key, event.target.value)}
                  />
                </Field>
              ))}

              <Field label="Derived stakeholder responsiveness">
                <div className={`${input} bg-slate-50 text-slate-600`}>
                  {responsivenessBand(form.stakeholderResponsePercent)}
                </div>
              </Field>
            </div>
          </section>

          <div className="rounded-lg border border-[#C9A227]/30 bg-[#FFFBEF] p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#C9A227]" />
              <div>
                <p className="text-sm font-semibold text-[#16233A]">
                  What happens after saving?
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  The backend sends the seven model inputs to the FastAPI ML
                  service, stores the returned prediction, probabilities and
                  operational explanation, and then opens the saved project.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-[#16233A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E3352] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Saving and generating prediction..."
                : editing
                  ? "Save and refresh prediction"
                  : "Create project and predict risk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
      {title}
    </h2>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function MultiSelectDropdown({
  options,
  selected,
  onChange,
  inputClassName,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const toggleOption = (value) => {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        aria-expanded={open}
        className={`${inputClassName} flex items-center justify-between text-left`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">
          {selected.length ? selected.join(", ") : "Select districts"}
        </span>
        <span className="ml-2 text-xs text-slate-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-xl">
          {options.map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() => toggleOption(item)}
                className="accent-[#16233A]"
              />
              {item}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
