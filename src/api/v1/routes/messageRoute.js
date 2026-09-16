import express from  'express'
import { readMessage,fetchMessage } from '../controllers/messageController.js';
import { requireInboxAccess } from '../../../middlewares/requireInboxAccess.js';
const router = express.Router();



router.get(
    '/:id/read',
    requireInboxAccess,
    readMessage
);


router.get(
    "/:id",
    requireInboxAccess,
    fetchMessage
);

export { router as messageRouter };

