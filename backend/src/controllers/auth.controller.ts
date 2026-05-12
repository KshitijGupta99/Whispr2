import { createHash } from "crypto";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET, signToken } from "../middleware/auth.middleware";

/**
 * Issues a JWT after Google ID token exchange (verification omitted in dev template).
 */
export function googleAuth(req: Request, res: Response) {
  const idToken = typeof req.body?.idToken === "string" ? req.body.idToken : "";
  const sub = idToken
    ? `google_${createHash("sha256").update(idToken).digest("hex").slice(0, 18)}`
    : `user_${Math.random().toString(36).slice(2, 12)}`;
  const token = signToken(sub);
  res.json({
    token,
    refreshToken: token,
    user: { id: sub, email: "reader@whispr.app", name: "Whispr Reader" },
  });
}

/**
 * Rotates JWTs using a refresh token (dev: issues a fresh token).
 */
export function refresh(req: Request, res: Response) {
  const refreshToken = typeof req.body?.refreshToken === "string" ? req.body.refreshToken : "";
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { sub: string };
    const token = signToken(decoded.sub);
    res.json({
      token,
      user: { id: decoded.sub, email: "reader@whispr.app", name: "Whispr Reader" },
    });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
}
