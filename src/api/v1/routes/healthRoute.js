import { globalRateLimit } from '../../../utils/rateLimit.js';
import {healthCheckController} from '../controllers/health.js';
import express from "express";

const router = express.Router();


router.use(globalRateLimit);
router.get("/", healthCheckController);


export default router;