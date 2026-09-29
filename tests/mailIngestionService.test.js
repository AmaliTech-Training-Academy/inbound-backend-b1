import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { parseMock, sanitizeMock } = vi.hoisted(() => ({
	parseMock: vi.fn(),
	sanitizeMock: vi.fn((html) => `safe:${html}`),
}));

vi.mock("../src/api/v1/services/mailParserService.js", () => ({
	parseInboundEmail: parseMock,
	sanitizeHtmlBody: sanitizeMock,
}));

const { ingestMailgunMessage, PermanentIngestionError } = await import(
	"../src/api/v1/services/mailIngestionService.js"
);

const signingKey = "unit-test-mailgun-signing-key";
const activeInbox = {
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

function createPrisma(inbox = activeInbox) {
	return {
		inbox: { findFirst: vi.fn().mockResolvedValue(inbox) },
		message: {
			create: vi.fn().mockImplementation(async ({ data }) => ({
				id: "message-1",
				...data,
			})),
		},
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	parseMock.mockResolvedValue({
		fromAddress: "sender@example.test",
		fromName: "Sender",
		subject: "Raw MIME subject",
		textBody: "raw text",
		htmlBody: "",
		rawHtmlSize: null,
		attachments: [],
	});
	sanitizeMock.mockImplementation((html) => `safe:${html}`);
});

describe("ingestMailgunMessage", () => {
	it("passes a raw MIME Buffer unchanged to the parser and persists the message", async () => {
		const prisma = createPrisma();
		const rawMime = Buffer.from("From: sender@example.test\r\n\r\nraw text");
		const body = {
			...signedWebhookFields(),
			recipient: "INBOX@example.test",
			"body-mime": rawMime,
		};

		const result = await ingestMailgunMessage({ body, prisma, signingKey });

		expect(prisma.inbox.findFirst).toHaveBeenCalledWith({
			where: {
				address: "inbox@example.test",
				isDeleted: false,
				expiresAt: { gt: expect.any(Date) },
			},
			select: { id: true, address: true, expiresAt: true },
		});
		expect(parseMock).toHaveBeenCalledWith(rawMime);
		expect(parseMock.mock.calls[0][0]).toBe(rawMime);
		expect(prisma.message.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				inboxId: activeInbox.id,
				toAddress: activeInbox.address,
				subject: "Raw MIME subject",
				textBody: "raw text",
			}),
		});
		expect(result).toMatchObject({
			duplicate: false,
			message: { id: "message-1", inboxId: activeInbox.id },
		});
	});

	it("uses parsed text and sanitizes parsed HTML", async () => {
		const prisma = createPrisma();
		const body = {
			...signedWebhookFields(),
			recipient: activeInbox.address,
			from: "Example Sender <sender@example.test>",
			subject: "Parsed subject",
			"body-plain": "plain content",
			"body-html": "<script>unsafe()</script><p>hello</p>",
		};

		await ingestMailgunMessage({ body, prisma, signingKey });

		expect(parseMock).not.toHaveBeenCalled();
		expect(sanitizeMock).toHaveBeenCalledWith(body["body-html"]);
		expect(prisma.message.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				fromAddress: "sender@example.test",
				fromName: "Example Sender",
				subject: "Parsed subject",
				textBody: "plain content",
				htmlBody: `safe:${body["body-html"]}`,
			}),
		});
	});

	it("rejects malformed input before database access", async () => {
		const prisma = createPrisma();

		await expect(
			ingestMailgunMessage({ body: {}, prisma, signingKey }),
		).rejects.toThrow("Malformed Mailgun payload.");
		expect(prisma.inbox.findFirst).not.toHaveBeenCalled();
		expect(prisma.message.create).not.toHaveBeenCalled();
	});

	it("rejects an invalid signature before inbox lookup", async () => {
		const prisma = createPrisma();
		const body = {
			...signedWebhookFields(),
		recipient: activeInbox.address,
			"body-plain": "plain content",
			signature: "0".repeat(64),
		};

		await expect(
			ingestMailgunMessage({ body, prisma, signingKey }),
		).rejects.toBeInstanceOf(PermanentIngestionError);
		expect(prisma.inbox.findFirst).not.toHaveBeenCalled();
		expect(prisma.message.create).not.toHaveBeenCalled();
	});

	it("rejects a recipient with no active inbox", async () => {
		const prisma = createPrisma(null);
		const body = {
			...signedWebhookFields(),
			recipient: activeInbox.address,
			"body-plain": "plain content",
		};

		await expect(
			ingestMailgunMessage({ body, prisma, signingKey }),
		).rejects.toThrow("Inbox not found,unknown or expired");
		expect(prisma.message.create).not.toHaveBeenCalled();
	});
});