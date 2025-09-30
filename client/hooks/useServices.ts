/**
 * Data Fetching: Added a React Query hook for services to standardize caching and error handling.
 */
import { useQuery } from "@tanstack/react-query";
import type { Service } from "@shared/types";
import { apiFetch } from "@/lib/api";

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: ({ signal }) => {
      // Use the centralized helper for services.
      return apiFetch<Service[]>("/services", { signal });
    },
  });
}
