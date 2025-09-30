/**
 * useApproveReview: approves a pending review via the admin API.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthedApi } from "@/lib/api";

export function useApproveReview() {
  const authedFetch = useAuthedApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", "reviews", "approve"],
    mutationFn: (reviewId: string) =>
      authedFetch<{ message: string }>(`/admin/reviews/${reviewId}/approve`, {
        method: "POST",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "reviews", "pending"] });
    },
  });
}
