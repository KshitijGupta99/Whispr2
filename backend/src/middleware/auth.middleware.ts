import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-insecure-secret";

export interface AuthPayload {
  sub: string;
}

/**
 * Verifies JWT from Authorization header or `token` query for media requests.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const q = typeof req.query.token === "string" ? req.query.token : undefined;
  const raw = header?.startsWith("Bearer ") ? header.slice(7) : q;
  if (!raw) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(raw, JWT_SECRET) as AuthPayload;
    (req as Request & { userId?: string }).userId = decoded.sub;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

export { JWT_SECRET };
