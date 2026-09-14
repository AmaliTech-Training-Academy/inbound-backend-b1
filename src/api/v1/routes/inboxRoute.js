import express from 'express'
import { createInbox, getInboxInfo, extendInboxTime } from '../controllers/inboxController.js';
import { requireInboxAccess } from '../../../middlewares/requireInboxAccess.js';

const router = express.Router();

router.post('/',
    createInbox
)

router.get('/info',
    requireInboxAccess,
    getInboxInfo
)

router.patch('/extend',
    requireInboxAccess,
    extendInboxTime
)

export {router as inboxRouter};