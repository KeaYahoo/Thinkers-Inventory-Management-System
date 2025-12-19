import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

type UserRole = "admin" | "user" | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  token: string | null;
  role: UserRole;
  userId: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const token = session?.access_token ?? null;
  const isAuthenticated = !!session;
  const userId = user?.id ?? null;
  
  // TODO: Check admin role properly locally if needed, or rely on server.
  // We can check user.email against a known admin email if simplistic check is sufficient for UI.
  // Or check user_metadata.
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase(); // Make sure this env var exists if we rely on it
  // Fallback to simplistic check matching server logic if possible, or just default to User.
  const isAdmin = !!(user?.email && adminEmail && user.email.toLowerCase() === adminEmail);
  const role: UserRole = isAdmin ? "admin" : "user";

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        token,
        role,
        userId,
        isAuthenticated,
        isAdmin,
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
