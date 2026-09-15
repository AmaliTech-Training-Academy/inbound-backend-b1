import {healthCheckController} from '../controllers/health.js';
import express from "express";

const router = express.Router();



router.get("/", healthCheckController);


export default router;