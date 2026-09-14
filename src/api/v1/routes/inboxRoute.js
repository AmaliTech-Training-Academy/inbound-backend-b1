import express from 'express'
import { createInbox, getInboxInfo } from '../controllers/inboxController.js';
import { requireInboxAccess } from '../../../middlewares/requireInboxAccess.js';

const router = express.Router();

router.post('/',
    createInbox
)

router.get('/info',
    requireInboxAccess,
    getInboxInfo
)

export {router as inboxRouter};