/**
 * React Query client: centralized instance with cache defaults tuned for REST interactions.
 */
import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        const isApiError = error instanceof ApiError;
        if (isApiError) {
          if (error.status >= 500) {
            return failureCount < 3;
          }
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error) => {
        const isApiError = error instanceof ApiError;
        if (isApiError) {
          if (error.status >= 500) {
            return failureCount < 2;
          }
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
