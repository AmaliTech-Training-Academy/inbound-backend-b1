import crypto from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		attachment: {
			findFirst: vi.fn(),
		},
	},
}));

vi.mock("../src/configs/prisma.js", () => ({
	default: prismaMock,
}));

const previousAttachmentLimit = process.env.MAX_ATTACHMENT_SIZE_MB;
process.env.MAX_ATTACHMENT_SIZE_MB = "0.00001";

const { ingestMailgunMessage } = await import(
	"../src/api/v1/services/mailIngestionService.js"
);
const { downloadAttachment } = await import(
	"../src/api/v1/controllers/attachmentController.js"
);

if (previousAttachmentLimit === undefined) {
	delete process.env.MAX_ATTACHMENT_SIZE_MB;
} else {
	process.env.MAX_ATTACHMENT_SIZE_MB = previousAttachmentLimit;
}

const signingKey = "unit-test-mailgun-signing-key";
const inbox = {
	id: "inbox-1",
	address: "inbox@example.test",
	expiresAt: new Date(Date.now() + 60_000),
};

function signedWebhookFields() {
	const timestamp = Math.floor(Date.now() / 1000).toString();
	const token = "mailgun-request-token";
	const signature = crypto
		.createHmac("sha256", signingKey)
		.update(`${timestamp}${token}`)
		.digest("hex");
	return { timestamp, token, signature };
}

function sampleEmail(originalBytes) {
	const encodedBytes = originalBytes.toString("base64");
	return Buffer.from([
		"From: jameskekeli@example.test",
		"To: inbox@example.test",
		"Subject: Attachment acceptance test",
		"MIME-Version: 1.0",
		'Content-Type: multipart/mixed; boundary="sample-boundary"',
		"",
		"--sample-boundary",
		'Content-Type: text/plain; charset="utf-8"',
		"",
		"The message body is delivered.",
		"--sample-boundary",
		'Content-Type: application/octet-stream; name="sample.bin"',
		'Content-Disposition: attachment; filename="sample.bin"',
		"Content-Transfer-Encoding: base64",
		"",
		encodedBytes,
		"--sample-boundary--",
		"",
	].join("\r\n"));
}

function createIngestionPrisma() {
	let persistedMessage;
	return {
		inbox: {
			findFirst: vi.fn().mockResolvedValue(inbox),
		},
		message: {
			create: vi.fn().mockImplementation(async ({ data }) => {
				persistedMessage = {
					id: "message-1",
					...data,
				};
				return persistedMessage;
			}),
		},
		get persistedMessage() {
			return persistedMessage;
		},
	};
}

function createResponse() {
	return {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		attachment: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		send: vi.fn().mockReturnThis(),
	};
}

beforeEach(() => {
	vi.clearAllMocks();
});

afterAll(() => {
	if (previousAttachmentLimit === undefined) {
		delete process.env.MAX_ATTACHMENT_SIZE_MB;
	} else {
		process.env.MAX_ATTACHMENT_SIZE_MB = previousAttachmentLimit;
	}
});

describe("attachment ingestion and download", () => {
	it("parses a sample email and downloads the exact original attachment bytes", async () => {
		const originalBytes = Buffer.from([0, 255, 13, 10, 65]);
		const prisma = createIngestionPrisma();
		const body = {
			...signedWebhookFields(),
			recipient: inbox.address,
			"body-mime": sampleEmail(originalBytes),
		};

		await ingestMailgunMessage({ body, prisma, signingKey });

		const storedAttachment = prisma.persistedMessage.attachments.create[0];
		expect(storedAttachment).toMatchObject({
			filename: "sample.bin",
			contentType: "application/octet-stream",
			sizeBytes: originalBytes.length,
		});
		expect(Buffer.from(storedAttachment.content)).toEqual(originalBytes);

		prismaMock.attachment.findFirst.mockResolvedValue({
			id: "attachment-1",
			...storedAttachment,
		});
		const req = {
			params: { attachmentId: "attachment-1" },
			session: { id: "session-1" },
		};
		const res = createResponse();

		await downloadAttachment(req, res);

		expect(prismaMock.attachment.findFirst).toHaveBeenCalledWith({
			where: {
				id: "attachment-1",
				message: {
					is: {
						inbox: {
							is: {
								sessionId: "session-1",
								isDeleted: false,
								expiresAt: { gt: expect.any(Date) },
							},
						},
					},
				},
			},
			select: {
				filename: true,
				contentType: true,
				sizeBytes: true,
				content: true,
			},
		});
		expect(res.attachment).toHaveBeenCalledWith("sample.bin");
		expect(res.set).toHaveBeenCalledWith(
			"Content-Type",
			"application/octet-stream",
		);
		expect(res.set).toHaveBeenCalledWith(
			"X-Content-Type-Options",
			"nosniff",
		);
		expect(res.set).toHaveBeenCalledWith(
			"Cache-Control",
			"private, no-store",
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(Buffer.from(res.send.mock.calls[0][0])).toEqual(originalBytes);
	});

	it("rejects an oversized attachment but still delivers the message", async () => {
		const prisma = createIngestionPrisma();
		const messageBody = "The message body is delivered.";
		const oversizedBytes = Buffer.from("01234567890");
		const body = {
			...signedWebhookFields(),
			recipient: inbox.address,
			"body-mime": sampleEmail(oversizedBytes),
		};

		const result = await ingestMailgunMessage({ body, prisma, signingKey });

		expect(result).toMatchObject({
			duplicate: false,
			message: { id: "message-1", textBody: messageBody },
		});
		expect(prisma.message.create).toHaveBeenCalledOnce();
		expect(prisma.persistedMessage.attachments.create).toEqual([]);
	});
})