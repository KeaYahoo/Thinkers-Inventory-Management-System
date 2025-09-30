/**
 * Data Fetching: Dedicated React Query hook for single-trip lookups with robust error handling and caching.
 */
import { useQuery } from "@tanstack/react-query";
import type { Trip } from "@shared/types";

export function useTrip(id?: string) {
  return useQuery<Trip>({
    queryKey: ["trip", id],
    enabled: Boolean(id),
    queryFn: async ({ signal }) => {
      if (!id) {
        throw new Error("Trip id is required");
      }

      const response = await fetch(`/api/trips/${id}`, { signal });
      const data = (await response.json().catch(() => null)) as Trip | { message?: string } | null;

      if (!response.ok || !data) {
        const message = typeof data === "object" && data && "message" in data && data.message
          ? data.message
          : "Failed to fetch trip";
        throw new Error(message);
      }

      return data as Trip;
    },
  });
}
