import { Router } from "express";
import multer from "multer";

import * as transcription from "../controllers/transcription.controller";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post("/transcription/audio", upload.single("file"), transcription.transcribeAudio);

export default router;
