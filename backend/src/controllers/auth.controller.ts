import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import { signToken } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";

const googleClient = new OAuth2Client();

async function verifyGoogleIdToken(idToken: string): Promise<{
  sub: string;
  email: string;
  name: string;
  picture?: string;
} | null> {
  const audiences = [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_WEB_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
  ].filter((v): v is string => Boolean(v));

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: audiences.length ? audiences : undefined,
    });
    const p = ticket.getPayload();
    if (!p?.sub) return null;
    return {
      sub: p.sub,
      email: p.email ?? `${p.sub}@users.whispr.app`,
      name: p.name ?? "Whispr Listener",
      picture: p.picture,
    };
  } catch {
    return null;
  }
}

/**
 * Issues a JWT after Google ID token verification and user upsert.
 */
export async function googleAuth(req: Request, res: Response) {
  const idToken = typeof req.body?.idToken === "string" ? req.body.idToken : "";

  if (!idToken) {
    res.status(400).json({ message: "idToken required" });
    return;
  }

  let profile = await verifyGoogleIdToken(idToken);
  if (!profile && process.env.DEV_AUTH_BYPASS === "1") {
    const { createHash } = await import("crypto");
    const sub = `google_${createHash("sha256").update(idToken).digest("hex").slice(0, 18)}`;
    profile = { sub, email: "dev@whispr.app", name: "Dev Listener" };
  }
  if (!profile) {
    res.status(401).json({ message: "Invalid Google token. Set GOOGLE_WEB_CLIENT_ID on the API or DEV_AUTH_BYPASS=1 for local dev." });
    return;
  }

  const user = await prisma.user.upsert({
    where: { id: profile.sub },
    create: {
      id: profile.sub,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture ?? null,
    },
    update: {
      email: profile.email,
      name: profile.name,
      avatar: profile.picture ?? null,
    },
  });

  const token = signToken(user.id);
  res.json({
    token,
    refreshToken: token,
    user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
  });
}

/**
 * Rotates JWTs using a refresh token.
 */
export async function refresh(req: Request, res: Response) {
  const refreshToken = typeof req.body?.refreshToken === "string" ? req.body.refreshToken : "";
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET ?? "dev-insecure-secret",
    ) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    const token = signToken(decoded.sub);
    res.json({
      token,
      user: user
        ? { id: user.id, email: user.email, name: user.name, avatar: user.avatar }
        : { id: decoded.sub, email: "", name: "Listener" },
    });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
}
