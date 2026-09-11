import express from 'express'
import { createInbox } from '../controllers/inboxController.js';

const router = express.Router();

router.post('/',
    createInbox
)

export {router as inboxRouter};