/**
 * usePendingReviews: fetches unapproved reviews for admin moderation.
 */
import { useQuery } from "@tanstack/react-query";
import { useAuthedApi } from "@/lib/api";
import type { ReviewWithUser } from "@shared/types";

export function usePendingReviews() {
  const authedFetch = useAuthedApi();

  return useQuery<ReviewWithUser[]>({
    queryKey: ["admin", "reviews", "pending"],
    queryFn: ({ signal }) => authedFetch<ReviewWithUser[]>("/admin/reviews/pending", { signal }),
  });
}
