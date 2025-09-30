/**
 * Data Fetching: React Query hook for trip activities with typed responses and graceful error surfacing.
 */
import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@shared/types";

export function useActivities(tripId?: string) {
  return useQuery<Activity[]>({
    queryKey: ["activities", tripId],
    enabled: Boolean(tripId),
    queryFn: async ({ signal }) => {
      if (!tripId) {
        throw new Error("Trip id is required to fetch activities");
      }

      const response = await fetch(`/api/trips/${tripId}/activities`, { signal });

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      return (await response.json()) as Activity[];
    },
  });
}
