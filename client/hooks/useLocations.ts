/**
 * Data Fetching: Retrieves trip and activity locations for map rendering with React Query caching.
 */
import { useQuery } from "@tanstack/react-query";

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
    queryFn: async ({ signal }) => {
      if (!tripId) {
        throw new Error("Trip id is required to fetch locations");
      }

      const response = await fetch(`/api/trips/${tripId}/locations`, { signal });

      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }

      return (await response.json()) as LocationPoint[];
    },
  });
}
