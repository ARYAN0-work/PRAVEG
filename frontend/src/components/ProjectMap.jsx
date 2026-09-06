const ProjectMap = ({ project }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
      <h3 className="text-lg font-semibold text-[#16233A]">
        Project Location
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {project?.state || "Location not available"}
      </p>

      <div className="mt-4 flex h-48 items-center justify-center rounded-md bg-slate-100">
        <span className="text-sm text-slate-400">
          Map location will be displayed here
        </span>
      </div>
    </div>
  );
};

export default ProjectMap;