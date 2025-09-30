/**
 * useMyBookings Hook: wraps the /api/my-bookings endpoint with React Query and surfaces upcoming/past partitions.
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import type { Booking } from "@shared/types";

export interface PartitionedBookings {
  upcoming: Booking[];
  past: Booking[];
}

async function fetchMyBookings(token: string): Promise<PartitionedBookings> {
  const response = await fetch("/api/my-bookings", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to load bookings");
  }

  return (await response.json()) as PartitionedBookings;
}

export function useMyBookings() {
  const { token, isAuthenticated } = useAuth();

  return useQuery<PartitionedBookings>({
    queryKey: ["bookings", "me"],
    enabled: Boolean(token && isAuthenticated),
    queryFn: () => {
      if (!token) {
        throw new Error("Missing auth token");
      }
      return fetchMyBookings(token);
    },
    staleTime: 60 * 1000,
  });
}
