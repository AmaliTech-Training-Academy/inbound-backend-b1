import express from "express";
import {
  readMessage,
  fetchMessage,
  fetchInboxMessages,
} from "../controllers/messageController.js";
import { requireInboxAccess } from "../../../middlewares/requireInboxAccess.js";
import { globalRateLimit } from "../../../utils/rateLimit.js";
const router = express.Router();

router.use(globalRateLimit);
router.get("/", requireInboxAccess, fetchInboxMessages);
router.get("/:id/read", requireInboxAccess, readMessage);

router.get("/:id", requireInboxAccess, fetchMessage);

export { router as messageRouter };
