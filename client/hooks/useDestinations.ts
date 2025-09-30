/**
 * Data Fetching: Added a React Query hook for destinations to provide caching, retries, and unified loading/error states.
 */
import { useQuery } from "@tanstack/react-query";
import type { Destination } from "@shared/types";
import { apiFetch } from "@/lib/api";

export function useDestinations() {
  return useQuery<Destination[]>({
    queryKey: ["destinations"],
    queryFn: ({ signal }) => {
      // Fetch destinations via the centralized helper.
      return apiFetch<Destination[]>("/destinations", { signal });
    },
  });
}
