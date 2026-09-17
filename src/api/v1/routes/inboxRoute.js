import express from 'express'
import { createInbox, getInboxInfo, extendInboxTime } from '../controllers/inboxController.js';
import { requireInboxAccess } from '../../../middlewares/requireInboxAccess.js';
import { messageRouter } from './messageRoute.js';
import { globalRateLimit } from '../../../utils/rateLimit.js';

const router = express.Router();
router.use(globalRateLimit);
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

router.use('/messages', messageRouter);



export {router as inboxRouter};