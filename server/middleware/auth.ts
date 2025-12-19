/**
 * Security Middleware: validates JWT tokens and enforces optional admin access.
 */
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: string | number;
  role?: "admin" | "user";
  token?: string;
}

type TokenPayload = {
  userId?: string | number;
  role?: "admin" | "user";
};

import { createSupabaseClient } from "../lib/supabaseClient";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token with Supabase and get user
    const supabase = createSupabaseClient(token);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Attach user to request
    (req as AuthenticatedRequest).userId = user.id;
    // Check for admin role based on email or other criteria
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const isOwner = adminEmail && user.email?.toLowerCase() === adminEmail;
    
    (req as AuthenticatedRequest).role = isOwner ? "admin" : "user";
    (req as AuthenticatedRequest).token = token;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const { role } = req as AuthenticatedRequest;
  if (role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}
