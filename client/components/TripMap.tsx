/**
 * Trip Map: visualises trip and activity coordinates with Leaflet markers and resilient loading states.
 */
import { useId, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useLocations } from "@/hooks/useLocations";
import type { LocationPoint } from "@/hooks/useLocations";

const isClient = typeof window !== "undefined";

if (isClient) {
  const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  L.Marker.prototype.options.icon = defaultIcon;
}

type TripMapProps = {
  tripId?: string;
};

export default function TripMap({ tripId }: TripMapProps) {
  const { data: locations = [], isLoading, isError } = useLocations(tripId);
  const headingId = useId();
  const descriptionId = useId();
  const validLocations = useMemo(
    () =>
      locations.filter(
        (location: LocationPoint) =>
          typeof location.latitude === "number" && typeof location.longitude === "number",
      ),
    [locations],
  );

  if (!tripId) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="px-6 pb-16">
        <div className="mx-auto h-96 w-full max-w-6xl animate-pulse rounded-2xl border border-border bg-muted" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-6xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600" role="status">
          We couldn't load the map right now. Please try again later.
        </div>
      </section>
    );
  }

  if (validLocations.length === 0 || !isClient) {
    return (
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-6xl rounded-lg border border-border bg-white p-6 text-sm text-gray-600">
          Location details are coming soon. Check back for map updates!
        </div>
      </section>
    );
  }

  const bounds =
    validLocations.length > 1
      ? L.latLngBounds(validLocations.map((location) => [location.latitude!, location.longitude!]))
      : null;

  const center = bounds ? undefined : ([validLocations[0].latitude!, validLocations[0].longitude!] as [number, number]);

  return (
    <section className="px-6 pb-16">
      <div className="mx-auto max-w-6xl" role="region" aria-labelledby={headingId} aria-describedby={descriptionId}>
        <h2 id={headingId} className="mb-4 text-2xl font-semibold text-velvet-green">
          Map and nearby highlights
        </h2>
        <p id={descriptionId} className="sr-only">
          Interactive map showing trip highlights. Use keyboard arrows to move between markers and press Enter to open details. Scroll zoom is disabled.
        </p>
        <MapContainer
          className="h-96 w-full rounded-2xl shadow-lg"
          {...(bounds ? { bounds } : { center, zoom: 12 })}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validLocations.map((location) => (
            <Marker
              key={`${location.type}-${location.name}`}
              position={[location.latitude!, location.longitude!]}
              title={location.name}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{location.name}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{location.type}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
