import { Router } from "express";

import * as auth from "../controllers/auth.controller";

const router = Router();

router.post("/google", auth.googleAuth);
router.post("/refresh", auth.refresh);

export default router;
