import express from "express";
import { createInboundWebhookController } from "../controllers/inboundWebhookController.js";

export const createInboundWebhookRouter = (io) => {
  const router = express.Router();
  router.post("/inbound-email", createInboundWebhookController(io));
  return router;
};