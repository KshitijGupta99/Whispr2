import { Router } from "express";

import { streamChapterAudio } from "../controllers/media.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/media/audiobooks/:audiobookId/:chapterId.mp3",
  authMiddleware,
  streamChapterAudio,
);

export default router;
