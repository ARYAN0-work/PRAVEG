import { MapPin } from "lucide-react";
import PortfolioMap from "./PortfolioMap";

export default function ProjectMap({ project }) {
  const count = Array.isArray(project?.districts) ? new Set(project.districts).size : 0;
  return <section className="surface-card p-5">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="eyebrow">Geographic coverage</p>
        <h2 className="mt-1 text-lg font-semibold text-[#16233A]">Project locations</h2>
        <p className="mt-1 text-xs text-slate-500">District centre markers · {project.state}</p>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700"><MapPin size={13} /> {count} districts</span>
    </div>
    <PortfolioMap projects={project ? [project] : []} height={288} />
    <p className="mt-3 text-xs text-slate-500">Markers show district centres, not acquired land parcels or project boundaries. Map tiles require an internet connection.</p>
  </section>;
}
