import express from "express";
import { initAPI } from "../controllers/initController.js";
import {globalRateLimit} from "../../../utils/rateLimit.js";
const router = express.Router();

router.use(globalRateLimit);
// define init route
router.get("/", initAPI);

export default router;
