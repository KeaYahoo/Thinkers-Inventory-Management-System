/**
 * useTripAvailability: fetches the available start dates and pricing for a given trip.
 */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { TripAvailability } from "@shared/types";

export function useTripAvailability(tripId?: string) {
  return useQuery<TripAvailability[]>({
    queryKey: ["trip", tripId, "availability"],
    enabled: Boolean(tripId),
    queryFn: ({ signal }) => {
      if (!tripId) {
        throw new Error("Trip id is required to fetch availability");
      }
      return apiFetch<TripAvailability[]>(`/trips/${tripId}/availability`, { signal });
    },
  });
}
