import type { NextFunction, Request, Response } from "express";

/**
 * Central Express error handler returning JSON bodies.
 */
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : "Server error";
  const status = (err as { status?: number }).status ?? 500;
  // Log error details for server-side diagnostics
  // eslint-disable-next-line no-console
  console.error(`[${new Date().toISOString()}] ERROR ${status}:`,
    err instanceof Error ? err.stack ?? err.message : err);
  res.status(status).json({ message });
}
