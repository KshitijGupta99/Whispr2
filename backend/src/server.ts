import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { authMiddleware } from "./middleware/auth.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { rateLimitMiddleware } from "./middleware/rateLimit.middleware";
import audiobookRoutes from "./routes/audiobook.routes";
import authRoutes from "./routes/auth.routes";
import transcriptionRoutes from "./routes/transcription.routes";
import voiceRoutes from "./routes/voice.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", rateLimitMiddleware, authRoutes);

app.use("/api", rateLimitMiddleware, authMiddleware, audiobookRoutes);
app.use("/api", rateLimitMiddleware, authMiddleware, voiceRoutes);
app.use("/api", rateLimitMiddleware, authMiddleware, transcriptionRoutes);

app.use(errorMiddleware);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Whispr API listening on http://localhost:${port}`);
});
