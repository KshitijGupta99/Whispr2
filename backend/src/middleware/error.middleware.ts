import type { NextFunction, Request, Response } from "express";

/**
 * Central Express error handler returning JSON bodies.
 */
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : "Server error";
  const status = (err as { status?: number }).status ?? 500;
  res.status(status).json({ message });
}
