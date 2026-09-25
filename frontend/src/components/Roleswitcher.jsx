import { useScope } from "../contexts/ScopeContext";
import {
  getAllStates,
  getDistrictsForState,
} from "../mocks/districtCoordinates";

// Stands in for real role-based access until auth exists: a real system
// would derive this from the logged-in user's assigned jurisdiction, not
// let them pick it. Placed in the Topbar since it affects the whole
// session's data scope, not just the Dashboard page.
export default function RoleSwitcher() {
  const { scope, setNational, setStateScope, setDistrictScope } = useScope();
  const states = getAllStates();
  const districts = scope.state ? getDistrictsForState(scope.state) : [];

  return (
    <div className="flex items-center gap-2 text-xs">
      <select
        value={scope.role}
        onChange={(e) => {
          const role = e.target.value;
          if (role === "national") setNational();
          else if (role === "state") setStateScope(scope.state || states[0]);
          else setDistrictScope(scope.state || states[0], null);
        }}
        className="border border-slate-200 rounded-md px-2 py-1"
      >
        <option value="national">National View</option>
        <option value="state">State View</option>
        <option value="district">District View</option>
      </select>

      {(scope.role === "state" || scope.role === "district") && (
        <select
          value={scope.state || ""}
          onChange={(e) =>
            scope.role === "state"
              ? setStateScope(e.target.value)
              : setDistrictScope(e.target.value, null)
          }
          className="border border-slate-200 rounded-md px-2 py-1"
        >
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {scope.role === "district" && (
        <select
          value={scope.district || ""}
          onChange={(e) => setDistrictScope(scope.state, e.target.value)}
          className="border border-slate-200 rounded-md px-2 py-1"
        >
          <option value="">Select district</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
