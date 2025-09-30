/**
 * Security Update: Removed hard-coded JWT secret fallback and rely solely on process.env.JWT_SECRET.
 * Ensures middleware only validates tokens with the configured secret, blocking forgery risks.
 */
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Authentication secret is not configured.' });
    }

    const payload = jwt.verify(token, jwtSecret as string) as { userId?: number | string };
    if (!payload || !payload.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    (req as any).userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
