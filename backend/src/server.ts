import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { mkdir } from "fs/promises";
import path from "path";

import { authMiddleware } from "./middleware/auth.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { rateLimitMiddleware } from "./middleware/rateLimit.middleware";
import audiobookRoutes from "./routes/audiobook.routes";
import authRoutes from "./routes/auth.routes";
import mediaRoutes from "./routes/media.routes";
import transcriptionRoutes from "./routes/transcription.routes";
import voiceRoutes from "./routes/voice.routes";

dotenv.config();

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("postgresql")) {
  process.env.DATABASE_URL = "file:./prisma/dev.db";
  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.warn("Using SQLite at prisma/dev.db (set DATABASE_URL=file:./prisma/dev.db in .env)");
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

void mkdir(path.join(process.cwd(), "uploads", "audiobooks"), { recursive: true });

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", rateLimitMiddleware, authRoutes);

app.use("/api", rateLimitMiddleware, authMiddleware, mediaRoutes);
app.use("/api", rateLimitMiddleware, authMiddleware, audiobookRoutes);
app.use("/api", rateLimitMiddleware, authMiddleware, voiceRoutes);
app.use("/api", rateLimitMiddleware, authMiddleware, transcriptionRoutes);

app.use(errorMiddleware);

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";
app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Whispr API listening on http://${host}:${port}`);
});
