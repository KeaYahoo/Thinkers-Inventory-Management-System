/**
 * Data Fetching: React Query hooks for pulling and submitting trip reviews with cache invalidation.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Review } from "@shared/types";
import { apiFetch, useAuthedApi } from "@/lib/api";

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
    queryFn: ({ signal }) => {
      if (!tripId) {
        throw new Error("Trip id is required to fetch reviews");
      }

      return apiFetch<ReviewWithUser[]>(`/trips/${tripId}/reviews`, { signal });
    },
  });
}

export function useCreateReview(tripId: string) {
  const queryClient = useQueryClient();
  const authedFetch = useAuthedApi();

  return useMutation({
    mutationFn: (payload: { rating: number; comment: string }) => {
      if (!tripId) {
        throw new Error("Trip id is required to submit a review");
      }

      return authedFetch<{ message: string; review: Review }>(`/trips/${tripId}/reviews`, {
        method: "POST",
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", tripId] });
    },
  });
}
