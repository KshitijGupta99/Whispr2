import type { NextFunction, Request, Response } from "express";

const hits = new Map<string, { count: number; reset: number }>();

/**
 * Very small sliding-window rate limiter for anonymous abuse protection.
 */
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip ?? "unknown";
  const now = Date.now();
  const windowMs = 60_000;
  const max = 120;
  const cur = hits.get(ip);
  if (!cur || now > cur.reset) {
    hits.set(ip, { count: 1, reset: now + windowMs });
    return next();
  }
  if (cur.count >= max) {
    res.status(429).json({ message: "Too many requests" });
    return;
  }
  cur.count += 1;
  next();
}
