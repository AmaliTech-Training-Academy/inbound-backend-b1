import express from 'express'
import { createInbox, getInboxInfo, extendInboxTime } from '../controllers/inboxController.js';
import { requireSessionAccess } from '../../../middlewares/requireSessionAccess.js';
import { messageRouter } from './messageRoute.js';
import { globalRateLimit } from '../../../utils/rateLimit.js';
import { attachmentRouter } from './attachmentRoute.js';

const router = express.Router();
router.use(globalRateLimit);
router.post('/',
    createInbox
)

router.get('/:id',
    requireSessionAccess,
    getInboxInfo
)

router.patch('/extend/:id',
    requireSessionAccess,
    extendInboxTime
)

router.use('/messages', messageRouter);

router.use('/attachments', attachmentRouter);


export {router as inboxRouter};