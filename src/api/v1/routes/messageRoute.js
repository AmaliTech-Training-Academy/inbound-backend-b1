import express from "express";
import {
  readMessage,
  fetchMessage,
  fetchInboxMessages,
  fetchAllUnreadMessages
} from "../controllers/messageController.js";
import { requireSessionAccess } from "../../../middlewares/requireSessionAccess.js";
import { globalRateLimit } from "../../../utils/rateLimit.js";
const router = express.Router();

router.use(globalRateLimit);
router.get("/", requireSessionAccess, fetchInboxMessages);
router.get("/:id/read", requireSessionAccess, readMessage);

router.get(
    "/:id",
    requireSessionAccess,
    fetchMessage
);

router.get(
    '/unread/all',
    requireSessionAccess,
    fetchAllUnreadMessages
);

export { router as messageRouter };
