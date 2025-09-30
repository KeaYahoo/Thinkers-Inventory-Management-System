/**
 * useUser Hook: fetches the authenticated user profile with optional name/avatar fields and caches it with React Query.
 * Ensures the request is only made when a JWT is present and keeps responses scoped to public-safe fields.
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@shared/types";

export type UserProfile = Pick<User, "id" | "email" | "full_name" | "avatar_url">;

async function fetchCurrentUser(token: string): Promise<UserProfile> {
  const response = await fetch("/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to load user profile");
  }

  return (await response.json()) as UserProfile;
}

export function useUser() {
  const { token, isAuthenticated } = useAuth();

  return useQuery<UserProfile>({
    queryKey: ["user", "me", token],
    enabled: Boolean(token && isAuthenticated),
    queryFn: () => fetchCurrentUser(token as string),
    staleTime: 5 * 60 * 1000,
  });
}
