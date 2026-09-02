import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getDistrictCoords } from "../mocks/districtCoordinates";

// react-leaflet + bundlers break the default marker icon path - this is
// the standard fix, pointing it at the CDN copies instead.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FitToPoints({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 9);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [30, 30] });
    }
  }, [points, map]);
  return null;
}

// `districts` accepts a single district string or an array - a project
// spanning multiple districts shows a pin for each.
export default function ProjectMap({ state, districts }) {
  const list = Array.isArray(districts) ? districts : [districts];

  const markers = list
    .map((d) => ({ name: d, coord: getDistrictCoords(state, d) }))
    .filter((m) => m.coord);

  if (markers.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-slate-400 border border-slate-200 rounded-lg bg-slate-50">
        No location data available for {list.filter(Boolean).join(", ") || "this project"}.
      </div>
    );
  }

  return (
    <div className="h-56 rounded-lg overflow-hidden border border-slate-200">
      <MapContainer
        center={markers[0].coord}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.name} position={m.coord}>
            <Popup>
              {m.name}, {state}
            </Popup>
          </Marker>
        ))}
        <FitToPoints points={markers.map((m) => m.coord)} />
      </MapContainer>
    </div>
  );
}