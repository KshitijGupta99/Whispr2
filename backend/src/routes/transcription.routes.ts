import { Router } from "express";
import multer from "multer";

import * as transcription from "../controllers/transcription.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();

router.post("/transcription/audio", upload.single("file"), transcription.transcribeAudio);
router.post("/transcription/extract", upload.single("file"), transcription.extractDocument);

export default router;
