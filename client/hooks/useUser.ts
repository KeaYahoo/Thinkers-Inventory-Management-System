/**
 * useUser Hook: fetches the authenticated user profile with optional name/avatar fields and caches it with React Query.
 * Ensures the request is only made when a JWT is present and keeps responses scoped to public-safe fields.
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useAuthedApi } from "@/lib/api";
import type { User } from "@shared/types";

export type UserProfile = Pick<User, "id" | "email" | "full_name" | "avatar_url">;

export function useUser() {
  const { token, isAuthenticated } = useAuth();
  const authedFetch = useAuthedApi();

  return useQuery<UserProfile>({
    queryKey: ["user", "me", token],
    enabled: Boolean(token && isAuthenticated),
    queryFn: () => authedFetch<UserProfile>("/users/me"),
    staleTime: 5 * 60 * 1000,
  });
}
