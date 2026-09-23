import { ingestMailgunMessage, PermanentIngestionError } from "../services/mailIngestionService.js";
import { verifyMailgunSignature } from "../services/mailgunSignatureService.js";
import { publishNewMessage } from "../../../configs/websocket.js";

export function createMailgunDashboardController() {
	return (req, res) => {
		const { timestamp, token, signature, recipient } = req.body || {};
		const hasParsedBody = typeof req.body?.["body-plain"] === "string" || typeof req.body?.["body-html"] === "string";

		if (!recipient || !hasParsedBody || !verifyMailgunSignature({ timestamp, token, signature, signingKey: process.env.MAILGUN_WEBHOOK_SIGNING_KEY })) {
			return res.status(406).json({ success: false, message: "Invalid Mailgun dashboard webhook." });
		}

		return res.status(200).json({ success: true, message: "Mailgun dashboard webhook received." });
	};
}

export function createMailgunWebhookController({ prisma }) {
	return async (req, res) => {
		try {
			// multer (upload.any()) puts text fields in req.body, but the
			// body-mime file part lands in req.files as a Buffer, not a string.
			// ingestMailgunMessage() expects body["body-mime"] to be a string,
			// so we merge it back in here before handing off.
			const bodyMimeFile = (req.files || []).find(
				(file) => file.fieldname === "body-mime"
			);

			const body = {
				...req.body,
				...(bodyMimeFile
					? { "body-mime": bodyMimeFile.buffer.toString("utf8") }
					: {}),
			};

			const result = await ingestMailgunMessage({ body, prisma });

			const io = req.app?.get("io");
			if (io && result.message) {
				publishNewMessage(io, result.message.inboxId, result.message);
			}

			return res.status(202).json({
				success: true,
				duplicate: result.duplicate,
				messageId: result.message.id,
			});
		} catch (error) {
			if (error instanceof PermanentIngestionError) {
				return res.status(406).json({ success: false, message: error.message });
			}

			console.error("Mailgun webhook ingestion failed:", error);
			return res.status(500).json({
				success: false,
				message: "Unable to process inbound email.",
			});
		}
	};
}