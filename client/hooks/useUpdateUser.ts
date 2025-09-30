/**
 * useUpdateUser Hook: wraps the profile update endpoint so mutations refresh cached user data.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useAuthedApi } from "@/lib/api";
import type { UserProfile } from "@/hooks/useUser";

export interface UpdateUserPayload {
  full_name?: string | null;
  avatar_url?: string | null;
}

export function useUpdateUser() {
  const { isAuthenticated, token } = useAuth();
  const queryClient = useQueryClient();
  const authedFetch = useAuthedApi();

  return useMutation({
    mutationKey: ["user", "me", "update"],
    mutationFn: async (payload: UpdateUserPayload) => {
      if (!isAuthenticated || !token) {
        throw new Error("You must be logged in to update your profile.");
      }
      // Use authedFetch to submit the update; the token is inserted automatically.
      return authedFetch<UserProfile>("/users/me", { method: "PUT", body: payload as Record<string, unknown> });
    },
    onSuccess: () => {
      // Invalidate cached user profile on success.
      void queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}
