/**
 * Data Fetching: Retrieves trips with optional search/price filters using React Query.
 */
import { useQuery } from "@tanstack/react-query";
import type { Trip } from "@shared/types";
import { apiFetch } from "@/lib/api";

export interface TripsFilters {
  searchTerm?: string;
  maxPrice?: number | null;
}

export function useTrips(filters: TripsFilters) {
  return useQuery<Trip[]>({
    queryKey: ["trips", filters.searchTerm ?? "", filters.maxPrice ?? null],
    queryFn: ({ signal }) => {
      const params = new URLSearchParams();
      if (filters.searchTerm) {
        params.set("search", filters.searchTerm);
      }
      if (typeof filters.maxPrice === "number" && Number.isFinite(filters.maxPrice)) {
        params.set("maxPrice", String(filters.maxPrice));
      }

      const query = params.toString();
      const path = query ? `/trips?${query}` : "/trips";
      return apiFetch<Trip[]>(path, { signal });
    },
  });
}
