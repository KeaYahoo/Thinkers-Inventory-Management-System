/**
 * Data Fetching: Dedicated React Query hook for single-trip lookups with robust error handling and caching.
 */
import { useQuery } from "@tanstack/react-query";
import type { Trip } from "@shared/types";
import { apiFetch } from "@/lib/api";

export function useTrip(id?: string) {
  return useQuery<Trip>({
    queryKey: ["trip", id],
    enabled: Boolean(id),
    queryFn: ({ signal }) => {
      if (!id) {
        throw new Error("Trip id is required");
      }
      // Delegate to the centralized API helper.
      return apiFetch<Trip>(`/trips/${id}`, { signal });
    },
  });
}
