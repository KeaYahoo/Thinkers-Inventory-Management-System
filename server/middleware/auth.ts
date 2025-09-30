/**
 * Security Middleware: validates JWT tokens and enforces optional admin access.
 */
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: string | number;
  role?: "admin" | "user";
}

type TokenPayload = {
  userId?: string | number;
  role?: "admin" | "user";
};

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: "Authentication secret is not configured." });
    }

    const payload = jwt.verify(token, jwtSecret as string) as TokenPayload;
    if (!payload || !payload.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const request = req as AuthenticatedRequest;
    request.userId = payload.userId;
    request.role = payload.role ?? "user";

    next();
  } catch (error) {
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
