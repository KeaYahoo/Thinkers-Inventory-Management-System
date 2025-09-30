/**
 * Data Fetching: Added a React Query hook for services to standardize caching and error handling.
 */
import { useQuery } from "@tanstack/react-query";
import type { Service } from "@shared/types";

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/services", { signal });
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
      return (await response.json()) as Service[];
    },
  });
}
