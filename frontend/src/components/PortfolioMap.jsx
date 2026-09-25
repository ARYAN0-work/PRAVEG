import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { getDistrictCoords } from "../mocks/districtCoordinates";
import "leaflet/dist/leaflet.css";

const COLORS = { High: "#dc4d4d", Medium: "#d49b30", Low: "#259574", Pending: "#60748b" };

function FitMarkers({ positions }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    if (positions.length === 1) map.setView(positions[0], 9);
    if (positions.length > 1) map.fitBounds(positions, { padding: [36, 36], maxZoom: 9 });
    return () => clearTimeout(timer);
  }, [map, positions]);
  return null;
}

export default function PortfolioMap({ projects, height = 360 }) {
  const pins = useMemo(() => {
    const byDistrict = new Map();
    projects.forEach((project) => {
      const districts = Array.isArray(project.districts) ? [...new Set(project.districts)] : [];
      districts.forEach((district) => {
        const coord = getDistrictCoords(project.state, district);
        if (!coord) return;
        const key = `${project.state}:${district}`;
        if (!byDistrict.has(key)) byDistrict.set(key, { key, district, state: project.state, coord, projects: [] });
        byDistrict.get(key).projects.push(project);
      });
    });
    return [...byDistrict.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [projects]);

  const positions = useMemo(() => pins.map((pin) => pin.coord), [pins]);
  if (!pins.length) {
    return <div className="flex items-center justify-center rounded-2xl bg-slate-50 px-8 text-center text-sm text-slate-500" style={{ height }}>
      No mapped districts in this view. Add a project with a supported district to see it here.
    </div>;
  }

  return <div className="overflow-hidden rounded-2xl border border-slate-200" style={{ height }} role="region" aria-label="Project districts map">
    <MapContainer center={[26.8, 80.95]} zoom={7} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pins.map((pin) => {
        const risk = pin.projects.some((p) => p.latestPrediction?.delayRisk === "High") ? "High"
          : pin.projects.some((p) => p.latestPrediction?.delayRisk === "Medium") ? "Medium"
          : pin.projects.some((p) => p.latestPrediction?.delayRisk === "Low") ? "Low" : "Pending";
        return <CircleMarker key={pin.key} center={pin.coord} radius={Math.min(15, 6 + pin.projects.length * 1.5)}
          pathOptions={{ color: "#fff", weight: 2, fillColor: COLORS[risk], fillOpacity: 0.88 }}>
          <Popup>
            <div className="min-w-44">
              <strong>{pin.district}, {pin.state}</strong>
              <div className="mt-1 text-xs text-slate-500">{pin.projects.length} project{pin.projects.length === 1 ? "" : "s"} · Highest risk: {risk}</div>
              <ul className="mt-2 space-y-1">
                {pin.projects.slice(0, 6).map((project) => <li key={project.id}><Link className="font-medium text-blue-700 underline" to={`/projects/${project.id}`}>{project.name}</Link></li>)}
                {pin.projects.length > 6 && <li className="text-xs text-slate-500">+{pin.projects.length - 6} more</li>}
              </ul>
            </div>
          </Popup>
        </CircleMarker>;
      })}
      <FitMarkers positions={positions} />
    </MapContainer>
  </div>;
}
