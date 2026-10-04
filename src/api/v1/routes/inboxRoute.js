import express from 'express'
import { createInbox, getInboxInfo, extendInboxTime, generateCustomInbox } from '../controllers/inboxController.js';
import { requireSessionAccess } from '../../../middlewares/requireSessionAccess.js';
import { messageRouter } from './messageRoute.js';
import { globalRateLimit } from '../../../utils/rateLimit.js';

const router = express.Router();
router.use(globalRateLimit);
router.post('/',
    createInbox
)

router.post('/custom',
    generateCustomInbox
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



export {router as inboxRouter};