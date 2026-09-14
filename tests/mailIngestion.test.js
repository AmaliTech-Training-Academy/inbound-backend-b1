import { describe, expect, it, vi } from "vitest";

vi.mock("../src/api/v1/services/mailgunSignatureService.js", () => ({
  verifyMailgunSignature: vi.fn(() => true)
}));

const { ingestMailgunMessage, PermanentIngestionError } = await import(
  "../src/api/v1/services/mailIngestionService.js"
);

function createPrisma(message) {
  return {
    inbox: {
      findFirst: vi.fn(async () => ({
        id: "inbox-1",
        address: "client@temp.com",
        expiresAt: new Date(Date.now() + 60_000)
      }))
    },
    message: {
      create: vi.fn(async () => message)
    }
  };
}

describe("Mailgun ingestion publishing", () => {
  it("publishes the saved message to its inbox after persistence", async () => {
    const savedMessage = {
      id: "message-1",
      fromAddress: "sender@example.com",
      subject: "Hello",
      receivedAt: new Date()
    };
    const publishMessage = vi.fn();
    const prisma = createPrisma(savedMessage);

    const result = await ingestMailgunMessage({
      body: {
        recipient: "client@temp.com",
        timestamp: String(Math.floor(Date.now() / 1000)),
        token: "mailgun-token",
        signature: "a".repeat(64),
        from: "Sender <sender@example.com>",
        subject: "Hello",
        "body-plain": "Hello from the webhook"
      },
      prisma,
      publishMessage
    });

    expect(result.message).toBe(savedMessage);
    expect(prisma.message.create).toHaveBeenCalledOnce();
    expect(publishMessage).toHaveBeenCalledOnce();
    expect(publishMessage).toHaveBeenCalledWith("inbox-1", savedMessage);
  });

  it("does not publish rejected webhook data", async () => {
    const publishMessage = vi.fn();
    const prisma = createPrisma({});

    await expect(
      ingestMailgunMessage({
        body: { recipient: "client@temp.com" },
        prisma,
        publishMessage
      })
    ).rejects.toBeInstanceOf(PermanentIngestionError);

    expect(publishMessage).not.toHaveBeenCalled();
    expect(prisma.message.create).not.toHaveBeenCalled();
  });
});
