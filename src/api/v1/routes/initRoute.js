import express from "express";
import { initAPI } from "../controllers/initController.js";

const router = express.Router();

// define init route
router.get("/", initAPI);

export default router;
