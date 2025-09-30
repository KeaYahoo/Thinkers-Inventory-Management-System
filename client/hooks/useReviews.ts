/**
 * Data Fetching: React Query hooks for pulling and submitting trip reviews with cache invalidation.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Review } from "@shared/types";
import { useAuth } from "@/context/AuthContext";

export type ReviewWithUser = Review & {
  user?: {
    id: string;
    email: string;
  };
};

export function useReviews(tripId?: string) {
  return useQuery<ReviewWithUser[]>({
    queryKey: ["reviews", tripId],
    enabled: Boolean(tripId),
    queryFn: async ({ signal }) => {
      if (!tripId) {
        throw new Error("Trip id is required to fetch reviews");
      }

      const response = await fetch(`/api/trips/${tripId}/reviews`, { signal });

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      return (await response.json()) as ReviewWithUser[];
    },
  });
}

export function useCreateReview(tripId: string) {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (payload: { rating: number; comment: string }) => {
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/trips/${tripId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data && typeof data.message === "string" ? data.message : "Failed to submit review";
        throw new Error(message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", tripId] });
    },
  });
}
