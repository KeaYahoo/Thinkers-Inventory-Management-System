/**
 * Data Fetching: Retrieves trip and activity locations for map rendering with React Query caching.
 */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type LocationPoint = {
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  type: "trip" | "activity";
};

export function useLocations(tripId?: string) {
  return useQuery<LocationPoint[]>({
    queryKey: ["locations", tripId],
    enabled: Boolean(tripId),
    queryFn: ({ signal }) => {
      if (!tripId) {
        throw new Error("Trip id is required to fetch locations");
      }
      // Leverage the API helper for location lookups.
      return apiFetch<LocationPoint[]>(`/trips/${tripId}/locations`, { signal });
    },
  });
}
