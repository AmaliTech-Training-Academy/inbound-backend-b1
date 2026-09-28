import express from "express";

import {
  getSessionInfo,
  getSessionInboxes,
} from "../controllers/sessionController.js";
import { requireSessionAccess } from "../../../middlewares/requireSessionAccess.js";
import { globalRateLimit } from "../../../utils/rateLimit.js";

const router = express.Router();

router.use(globalRateLimit);

router.get("/", requireSessionAccess, getSessionInfo);
router.get("/inboxes", requireSessionAccess, getSessionInboxes);

export { router as sessionRouter };
