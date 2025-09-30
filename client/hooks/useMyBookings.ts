/**
 * useMyBookings Hook: wraps the /api/my-bookings endpoint with React Query and surfaces upcoming/past partitions.
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useAuthedApi } from "@/lib/api";
import type { Booking } from "@shared/types";

export interface PartitionedBookings {
  upcoming: Booking[];
  past: Booking[];
}

export function useMyBookings() {
  const { isAuthenticated, token } = useAuth();
  const authedFetch = useAuthedApi();

  return useQuery<PartitionedBookings>({
    queryKey: ["bookings", "me"],
    enabled: Boolean(isAuthenticated && token),
    queryFn: () => {
      // The authed API helper injects the Bearer token automatically.
      return authedFetch<PartitionedBookings>("/my-bookings");
    },
    staleTime: 60 * 1000,
  });
}
