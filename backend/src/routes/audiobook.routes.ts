import { Router } from "express";

import * as audiobook from "../controllers/audiobook.controller";

const router = Router();

router.post("/audiobooks/create", audiobook.createAudiobook);
router.get("/audiobooks/:id/status", audiobook.getStatus);
router.get("/audiobooks/:id", audiobook.getAudiobook);
router.get("/audiobooks", audiobook.listAudiobooks);
router.delete("/audiobooks/:id", audiobook.deleteAudiobook);

export default router;
