import express from "express";
import {
  readMessage,
  fetchMessage,
  fetchInboxMessages,
  fetchAllUnreadMessages
} from "../controllers/messageController.js";
import { requireInboxAccess } from "../../../middlewares/requireInboxAccess.js";
import { globalRateLimit } from "../../../utils/rateLimit.js";
const router = express.Router();

router.use(globalRateLimit);
router.get("/", requireInboxAccess, fetchInboxMessages);
router.get("/:id/read", requireInboxAccess, readMessage);

router.get(
    "/:id",
    requireInboxAccess,
    fetchMessage
);

router.get(
    '/unread/all',
    requireInboxAccess,
    fetchAllUnreadMessages
);

export { router as messageRouter };
