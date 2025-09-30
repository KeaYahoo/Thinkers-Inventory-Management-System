import React, { createContext, useState, useContext, useEffect } from "react";

type UserRole = "admin" | "user" | null;

type JwtPayload = {
  userId?: string | number;
  role?: "admin" | "user";
  [key: string]: unknown;
};

interface AuthContextType {
  token: string | null;
  role: UserRole;
  userId: string | number | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, roleHint?: "admin" | "user") => void;
  logout: () => void;
}

interface AuthState {
  token: string | null;
  role: UserRole;
  userId: string | number | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const decodeToken = (token: string): JwtPayload => {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return {};
    }
    const decoded = JSON.parse(atob(payload));
    return decoded as JwtPayload;
  } catch (error) {
    console.warn("Failed to decode JWT", error);
    return {};
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    role: null,
    userId: null,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("trvlsync_token");
    if (storedToken) {
      const decoded = decodeToken(storedToken);
      setAuthState({
        token: storedToken,
        role: (decoded.role as UserRole) ?? null,
        userId: decoded.userId ?? null,
      });
    }
  }, []);

  const login = (newToken: string, roleHint?: "admin" | "user") => {
    const decoded = decodeToken(newToken);
    const role = (decoded.role as UserRole) ?? roleHint ?? "user";
    const userId = decoded.userId ?? null;

    setAuthState({ token: newToken, role, userId });
    localStorage.setItem("trvlsync_token", newToken);
  };

  const logout = () => {
    setAuthState({ token: null, role: null, userId: null });
    localStorage.removeItem("trvlsync_token");
  };

  const isAuthenticated = Boolean(authState.token);
  const isAdmin = authState.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        token: authState.token,
        role: authState.role,
        userId: authState.userId,
        isAuthenticated,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
