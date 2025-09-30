/**
 * Data Fetching: React Query hook for trip activities with typed responses and graceful error surfacing.
 */
import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@shared/types";
import { apiFetch } from "@/lib/api";

export function useActivities(tripId?: string) {
  return useQuery<Activity[]>({
    queryKey: ["activities", tripId],
    enabled: Boolean(tripId),
    queryFn: ({ signal }) => {
      if (!tripId) {
        throw new Error("Trip id is required to fetch activities");
      }
      // Use the API helper for activities.
      return apiFetch<Activity[]>(`/trips/${tripId}/activities`, { signal });
    },
  });
}
