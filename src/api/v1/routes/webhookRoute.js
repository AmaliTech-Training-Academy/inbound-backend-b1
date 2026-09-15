import express from "express";
import multer from "multer";
import prisma from "../../../configs/prisma.js";
import {
	createMailgunDashboardController,
	createMailgunWebhookController,
} from "../controllers/mailgunWebhookController.js";

const webhookRoute = express.Router();

// Mailgun sends multipart/form-data (text fields + the raw body-mime file part).
// Express's built-in json()/urlencoded() parsers can't read this format, so
// without multer, req.body is empty and every field (recipient, signature,
// timestamp, etc.) comes through as undefined.
const upload = multer(); // memory storage — files land in req.file/req.files as Buffers

webhookRoute.post(
	"/mailgun/raw-mime",
	upload.any(), // parses all fields; body-mime will be in req.files, not req.body
	createMailgunWebhookController({ prisma })
);

webhookRoute.post(
	"/mailgun/parsed",
	upload.any(),
	createMailgunDashboardController()
);

export default webhookRoute;