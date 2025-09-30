/**
 * useUpdateUser Hook: wraps the profile update endpoint so mutations refresh cached user data.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile } from "@/hooks/useUser";

export interface UpdateUserPayload {
  full_name?: string | null;
  avatar_url?: string | null;
}

async function updateUserRequest(token: string, payload: UpdateUserPayload): Promise<UserProfile> {
  const response = await fetch("/api/users/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const fallback = "Failed to update profile";
    let message = fallback;
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch {
      message = fallback;
    }

    throw new Error(message);
  }

  return (await response.json()) as UserProfile;
}

export function useUpdateUser() {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["user", "me", "update"],
    mutationFn: async (payload: UpdateUserPayload) => {
      if (!token || !isAuthenticated) {
        throw new Error("You must be logged in to update your profile.");
      }
      return updateUserRequest(token, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}
