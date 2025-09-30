/**
 * Routing Security: Shared protected-route wrapper that redirects unauthenticated users to /login.
 */
import type { PropsWithChildren, ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: PropsWithChildren): ReactElement {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

