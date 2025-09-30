/**
 * Data Fetching: Added a React Query hook for destinations to provide caching, retries, and unified loading/error states.
 */
import { useQuery } from "@tanstack/react-query";
import type { Destination } from "@shared/types";

export function useDestinations() {
  return useQuery<Destination[]>({
    queryKey: ["destinations"],
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/destinations", { signal });

      if (!response.ok) {
        throw new Error("Failed to fetch destinations");
      }

      return (await response.json()) as Destination[];
    },
  });
}
