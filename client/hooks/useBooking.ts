/**
 * Data Fetching: Retrieves a single booking (and trip details) for confirmation flows using React Query.
 */
import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@shared/types";
import { useAuth } from "@/context/AuthContext";

export function useBooking(bookingId?: string) {
  const { token } = useAuth();

  return useQuery<Booking>({
    queryKey: ["booking", bookingId],
    enabled: Boolean(bookingId && token),
    queryFn: async ({ signal }) => {
      if (!bookingId) {
        throw new Error("Booking id is required");
      }

      if (!token) {
        throw new Error("Authentication token missing");
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch booking details");
      }

      return (await response.json()) as Booking;
    },
  });
}
