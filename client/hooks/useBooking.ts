/**
 * Data Fetching: Retrieves a single booking (and trip details) for confirmation flows using React Query.
 */
import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@shared/types";
import { useAuth } from "@/context/AuthContext";
import { useAuthedApi } from "@/lib/api";

export function useBooking(bookingId?: string) {
  const { token, isAuthenticated } = useAuth();
  const authedFetch = useAuthedApi();

  return useQuery<Booking>({
    queryKey: ["booking", bookingId],
    enabled: Boolean(bookingId && token && isAuthenticated),
    queryFn: ({ signal }) => {
      if (!bookingId) {
        throw new Error("Booking id is required");
      }
      // Authed fetch automatically sets the Authorization header.
      return authedFetch<Booking>(`/bookings/${bookingId}`, { signal });
    },
  });
}
