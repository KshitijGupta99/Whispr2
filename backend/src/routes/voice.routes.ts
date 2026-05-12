import { Router } from "express";

import * as voice from "../controllers/voice.controller";

const router = Router();

router.get("/voices", voice.listVoices);
router.get("/voices/:id/preview", voice.previewVoice);

export default router;
