import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createProject, getProject, getReferenceData, updateProject } from "../api/projects";
import LoadingState from "../components/LoadingState";

const EMPTY_FORM = {
  name: "", projectType: "", state: "", districts: [], landAreaHectares: "",
  affectedFamilies: "", budgetAllocatedCrore: "", compensationPaidPercent: "",
  legalDisputes: "", possessionPercent: "", stakeholderResponsePercent: "",
  historicalPerformance: "",
};

const numericFields = [
  ["landAreaHectares", "Land Area (hectares)", 0, undefined, "any"],
  ["affectedFamilies", "Affected Families", 0, undefined, 1],
  ["budgetAllocatedCrore", "Budget Allocated (₹ crore)", 0, undefined, "any"],
  ["compensationPaidPercent", "Compensation Paid (%)", 0, 100, "any"],
  ["legalDisputes", "Active Legal Disputes", 0, undefined, 1],
  ["possessionPercent", "Land Possession (%)", 0, 100, "any"],
  ["stakeholderResponsePercent", "Stakeholder Response (%)", 0, 100, "any"],
  ["historicalPerformance", "Historical Performance (0–4)", 0, 4, 0.01],
];

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [reference, setReference] = useState({ states: [], projectTypes: [], districts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getReferenceData(), editing ? getProject(id) : Promise.resolve(null)])
      .then(([data, project]) => { setReference(data); if (project) setForm({ ...EMPTY_FORM, ...project }); })
      .catch(() => setError("Could not load the project form data."))
      .finally(() => setLoading(false));
  }, [editing, id]);

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault(); setError("");
    const payload = { ...form };
    numericFields.forEach(([key]) => { payload[key] = Number(payload[key]); });
    if (payload.affectedFamilies < 0 || !Number.isInteger(payload.affectedFamilies)) return setError("Affected families must be a non-negative whole number.");
    try {
      const saved = editing ? await updateProject(id, payload) : await createProject(payload);
      navigate(`/projects/${saved.id}`);
    } catch (err) { setError(err.response?.data?.errors?.join(" ") || err.message); }
  };

  if (loading) return <LoadingState label="Loading project form..." />;
  const input = "w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A227]";
  const band = form.stakeholderResponsePercent === "" ? "—" : Number(form.stakeholderResponsePercent) < 20 ? "Poor" : Number(form.stakeholderResponsePercent) < 40 ? "Low" : Number(form.stakeholderResponsePercent) < 70 ? "Moderate" : "High";
  return <div className="max-w-3xl">
    <Link to={editing ? `/projects/${id}` : "/projects"} className="text-xs text-slate-500 hover:underline">← Cancel</Link>
    <h1 className="text-xl font-semibold text-[#16233A] mt-1 mb-6">{editing ? "Edit Project" : "New Project"}</h1>
    {error && <p className="mb-4 p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</p>}
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Project Name"><input required className={input} value={form.name} onChange={(e) => change("name", e.target.value)} /></Field>
        <Field label="Project Type"><select required className={input} value={form.projectType} onChange={(e) => change("projectType", e.target.value)}><option value="">Select type</option>{reference.projectTypes.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="State"><select required className={input} value={form.state} onChange={(e) => change("state", e.target.value)}><option value="">Select state</option>{reference.states.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Districts (select one or more)"><select required multiple className={`${input} h-32`} value={form.districts} onChange={(e) => change("districts", Array.from(e.target.selectedOptions, (option) => option.value))}>{reference.districts.map((item) => <option key={item}>{item}</option>)}</select></Field>
        {numericFields.map(([key, label, min, max, step]) => <Field key={key} label={label}><input required type="number" min={min} max={max} step={step} className={input} value={form[key]} onChange={(e) => change(key, e.target.value)} /></Field>)}
        <Field label="Derived responsiveness band"><div className={`${input} bg-slate-50 text-slate-600`}>{band}</div></Field>
      </div>
      <p className="text-xs text-slate-500">Poor: below 20%; Low: 20–39%; Moderate: 40–69%; High: 70% or above.</p>
      <button className="px-4 py-2 text-sm rounded-md bg-[#16233A] text-white hover:bg-[#1E3352]">{editing ? "Save and refresh prediction" : "Create project and predict risk"}</button>
    </form>
  </div>;
}

function Field({ label, children }) { return <label className="block text-xs font-medium text-slate-500 uppercase"><span className="block mb-1">{label}</span>{children}</label>; }
