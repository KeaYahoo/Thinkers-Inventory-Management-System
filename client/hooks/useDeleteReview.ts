/**
 * useDeleteReview: deletes a review via the admin API.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthedApi } from "@/lib/api";

export function useDeleteReview() {
  const authedFetch = useAuthedApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", "reviews", "delete"],
    mutationFn: (reviewId: string) =>
      authedFetch<{ message: string }>(`/admin/reviews/${reviewId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "reviews", "pending"] });
    },
  });
}
