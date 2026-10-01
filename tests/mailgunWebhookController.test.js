import { beforeEach, describe, expect, it, vi } from "vitest";

const { ingestMock, verifyMock, publishMock, PermanentIngestionErrorMock } =
	vi.hoisted(() => ({
		ingestMock: vi.fn(),
		verifyMock: vi.fn(),
		publishMock: vi.fn(),
		PermanentIngestionErrorMock: class PermanentIngestionError extends Error {},
	}));

vi.mock("../src/api/v1/services/mailIngestionService.js", () => ({
	ingestMailgunMessage: ingestMock,
	PermanentIngestionError: PermanentIngestionErrorMock,
}));

vi.mock("../src/api/v1/services/mailgunSignatureService.js", () => ({
	verifyMailgunSignature: verifyMock,
}));

vi.mock("../src/configs/websocket.js", () => ({
	publishNewMessage: publishMock,
}));

const { createMailgunDashboardController, createMailgunWebhookController } =
	await import("../src/api/v1/controllers/mailgunWebhookController.js");

const createResponse = () => ({
	status: vi.fn().mockReturnThis(),
	json: vi.fn().mockReturnThis(),
});

beforeEach(() => {
	vi.clearAllMocks();
	verifyMock.mockReturnValue(true);
});

describe("createMailgunDashboardController", () => {
	it("accepts a valid parsed Mailgun dashboard webhook", () => {
		const req = {
			body: {
				timestamp: "1780000000",
				token: "mailgun-token",
				signature: "signature",
				recipient: "inbox@example.test",
				"body-plain": "Message body",
			},
		};
		const res = createResponse();

		createMailgunDashboardController()(req, res);

		expect(verifyMock).toHaveBeenCalledWith({
			timestamp: req.body.timestamp,
			token: req.body.token,
			signature: req.body.signature,
			signingKey: process.env.MAILGUN_WEBHOOK_SIGNING_KEY,
		});
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: "Mailgun dashboard webhook received.",
		});
	});

	it("rejects missing parsed content or an invalid signature", () => {
		const controller = createMailgunDashboardController();
		const missingContentResponse = createResponse();
		controller(
			{ body: { recipient: "inbox@example.test" } },
			missingContentResponse,
		);

		expect(missingContentResponse.status).toHaveBeenCalledWith(406);
		expect(verifyMock).not.toHaveBeenCalled();

		verifyMock.mockReturnValue(false);
		const invalidSignatureResponse = createResponse();
		controller(
			{
				body: {
					recipient: "inbox@example.test",
					"body-html": "<p>Body</p>",
				},
			},
			invalidSignatureResponse,
		);

		expect(invalidSignatureResponse.status).toHaveBeenCalledWith(406);
		expect(invalidSignatureResponse.json).toHaveBeenCalledWith({
			success: false,
			message: "Invalid Mailgun dashboard webhook.",
		});
	});
});

describe("createMailgunWebhookController", () => {
	it("ingests multipart data, publishes the message, and returns 202", async () => {
		const message = { id: "message-1", inboxId: "inbox-1" };
		ingestMock.mockResolvedValue({ message, duplicate: false });
		const prisma = { message: {} };
		const io = { name: "socket-server" };
		const req = {
			body: { recipient: "inbox@example.test" },
			files: [{ fieldname: "body-mime", buffer: Buffer.from("raw MIME") }],
			app: { get: vi.fn(() => io) },
		};
		const res = createResponse();

		await createMailgunWebhookController({ prisma })(req, res);

		const ingestionInput = ingestMock.mock.calls[0][0];
		expect(ingestionInput).toMatchObject({
			body: { recipient: "inbox@example.test" },
			prisma,
		});
		expect(ingestionInput.body["body-mime"]).toBe(req.files[0].buffer);
		expect(publishMock).toHaveBeenCalledWith(io, "inbox-1", message);
		expect(res.status).toHaveBeenCalledWith(202);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			duplicate: false,
			messageId: "message-1",
		});
	});

	it("returns 406 for a permanent ingestion error", async () => {
		ingestMock.mockRejectedValue(
			new PermanentIngestionErrorMock("Invalid Mailgun signature."),
		);
		const res = createResponse();

		await createMailgunWebhookController({ prisma: {} })(
			{ body: {}, files: [], app: { get: vi.fn() } },
			res,
		);

		expect(res.status).toHaveBeenCalledWith(406);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: "Invalid Mailgun signature.",
		});
		expect(publishMock).not.toHaveBeenCalled();
	});

	it("returns 500 for unexpected ingestion errors", async () => {
		const error = new Error("Database unavailable");
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		ingestMock.mockRejectedValue(error);
		const res = createResponse();

		await createMailgunWebhookController({ prisma: {} })(
			{ body: {}, files: [], app: { get: vi.fn() } },
			res,
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: "Unable to process inbound email.",
		});
		expect(consoleError).toHaveBeenCalledWith(
			"Mailgun webhook ingestion failed:",
			error,
		);
	});
});