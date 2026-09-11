import express from 'express'
import { createInbox } from '../controllers/inboxController.js';

const router = express.Router();

router.get('/',
    createInbox
)

export {router as inboxRouter};