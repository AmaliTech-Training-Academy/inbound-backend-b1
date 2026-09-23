import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  prismaMock,
  hashTokenMock,
  sanitizeHtmlBodyMock,
} = vi.hoisted(() => ({
  prismaMock: {
    inbox: {
      findUnique: vi.fn(),
    },
    message: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },

  hashTokenMock: vi.fn(() => "hashed-token"),

  sanitizeHtmlBodyMock: vi.fn((body) => body),
}));

vi.mock("../src/configs/prisma.js", () => ({
  default: prismaMock,
}));

vi.mock("../src/utils/generateToken.js", () => ({
  hashToken: hashTokenMock,
}));

vi.mock("../src/api/v1/services/mailParserService.js", () => ({
  sanitizeHtmlBody: sanitizeHtmlBodyMock,
}));

import {
  fetchInboxMessages,
  fetchMessage,
  readMessage,
} from "../src/api/v1/controllers/messageController.js";

const createResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

beforeEach(() => {
  vi.clearAllMocks();

  hashTokenMock.mockReturnValue("hashed-token");
  sanitizeHtmlBodyMock.mockImplementation((body) => body);
});

describe("fetchInboxMessages", () => {
  it("should return all messages with attachment counts", async () => {
    prismaMock.inbox.findUnique.mockResolvedValue({
      id: "inbox-123",
    });
    prismaMock.message.findMany.mockResolvedValue([
      {
        id: "message-123",
        subject: "Welcome",
        fromName: "John Doe",
        fromAddress: "john@example.com",
        toAddress: "test@example.com",
        isRead: false,
        status: "PARSED",
        receivedAt: new Date("2026-09-16T10:00:00.000Z"),
        expiresAt: new Date("2026-09-20T10:00:00.000Z"),
        attachments: [{ id: "attachment-123" }, { id: "attachment-456" }],
      },
    ]);

    const req = {
      token: "test-token",
    };

    const res = createResponse();

    await fetchInboxMessages(req, res);

    expect(prismaMock.inbox.findUnique).toHaveBeenCalledWith({
      where: {
        tokenHash: "hashed-token",
      },
      select: {
        id: true,
      },
    });

    expect(prismaMock.message.findMany).toHaveBeenCalledWith({
      where: {
        inboxId: "inbox-123",
      },
      select: {
        id: true,
        subject: true,
        fromName: true,
        fromAddress: true,
        toAddress: true,
        isRead: true,
        status: true,
        receivedAt: true,
        expiresAt: true,
        attachments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        receivedAt: "desc",
      },
    });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Inbox messages fetched successfully",
      data: {
        messages: [
          {
            id: "message-123",
            subject: "Welcome",
            fromName: "John Doe",
            fromAddress: "john@example.com",
            toAddress: "test@example.com",
            isRead: false,
            status: "PARSED",
            receivedAt: new Date("2026-09-16T10:00:00.000Z"),
            expiresAt: new Date("2026-09-20T10:00:00.000Z"),
            attachmentCount: 2,
          },
        ],
      },
    });
  });
});

describe("fetchMessage", () => {
  it("should return 400 when message ID is missing", async () => {
    const req = {
      params: {},
      token: "test-token",
    };

    const res = createResponse();

    await fetchMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Missing Message Id",
    });

    expect(prismaMock.inbox.findUnique).not.toHaveBeenCalled();
  });

  it("should return 400 when token is missing", async () => {
    const req = {
      params: {
        id: "message-123",
      },
      token: null,
    };

    hashTokenMock.mockReturnValueOnce(null);

    const res = createResponse();

    await fetchMessage(req, res);

    expect(hashTokenMock).toHaveBeenCalledWith(null);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token Message Id",
    });

    expect(prismaMock.inbox.findUnique).not.toHaveBeenCalled();
  });

  it("should return 404 when inbox is not found", async () => {
    prismaMock.inbox.findUnique.mockResolvedValue(null);

    const req = {
      params: {
        id: "message-123",
      },
      token: "test-token",
    };

    const res = createResponse();

    await fetchMessage(req, res);

    expect(hashTokenMock).toHaveBeenCalledWith("test-token");

    expect(prismaMock.inbox.findUnique).toHaveBeenCalledWith({
      where: {
        tokenHash: "hashed-token",
      },
    });

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Inbox Not Found",
    });
  });

  it("should return 404 when message is not found", async () => {
    prismaMock.inbox.findUnique.mockResolvedValue({
      id: "inbox-123",
    });

    prismaMock.message.findUnique.mockResolvedValue(null);

    const req = {
      params: {
        id: "message-123",
      },
      token: "test-token",
    };

    const res = createResponse();

    await fetchMessage(req, res);

    expect(prismaMock.message.findUnique).toHaveBeenCalledWith({
      where: {
        id: "message-123",
        inboxId: "inbox-123",
      },
      include: {
        inbox: true,
        attachments: true,
      },
    });

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Message Not Found",
    });
  });

  it("should fetch a message successfully", async () => {
    prismaMock.inbox.findUnique.mockResolvedValue({
      id: "inbox-123",
    });

    prismaMock.message.findUnique.mockResolvedValue({
      id: "message-123",
      subject: "Welcome to our service",
      fromName: "John Doe",
      fromAddress: "john@example.com",
      toAddress: "test@example.com",
      htmlBody: "<p>Hello <strong>there</strong></p>",
      textBody: "Hello there",
      inboxId: "inbox-123",
      attachments: [
        {
          id: "attachment-123",
          filename: "document.pdf",
          contentType: "application/pdf",
          sizeBytes: 1024,
          objectKey: "messages/document.pdf",
          expiresAt: new Date("2026-09-20T00:00:00.000Z"),
        },
      ],
      isRead: false,
      status: "PENDING",
      receivedAt: new Date("2026-09-16T10:00:00.000Z"),
      expiresAt: new Date("2026-09-20T10:00:00.000Z"),
      createdAt: new Date("2026-09-16T09:00:00.000Z"),
    });

    sanitizeHtmlBodyMock.mockReturnValue("<p>Sanitized body</p>");

    const req = {
      params: {
        id: "message-123",
      },
      token: "test-token",
    };

    const res = createResponse();

    await fetchMessage(req, res);

    expect(prismaMock.inbox.findUnique).toHaveBeenCalledWith({
      where: {
        tokenHash: "hashed-token",
      },
    });

    expect(prismaMock.message.findUnique).toHaveBeenCalledWith({
      where: {
        id: "message-123",
        inboxId: "inbox-123",
      },
      include: {
        inbox: true,
        attachments: true,
      },
    });

    expect(sanitizeHtmlBodyMock).toHaveBeenCalledWith(
      "<p>Hello <strong>there</strong></p>",
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Message Fetched Success",
      data: {
        id: "message-123",
        subject: "Welcome to our service",
        sender: "John Doe <john@example.com>",
        from: "john@example.com",
        to: "test@example.com",
        body: "<p>Sanitized body</p>",
        inboxId: "inbox-123",
        attachments: [
          {
            id: "attachment-123",
            filename: "document.pdf",
            contentType: "application/pdf",
            size: 1024,
            url: "messages/document.pdf",
            expiresAt: new Date("2026-09-20T00:00:00.000Z"),
          },
        ],
        isRead: false,
        status: "PENDING",
        receivedAt: new Date("2026-09-16T10:00:00.000Z"),
        expiresAt: new Date("2026-09-20T10:00:00.000Z"),
        createdAt: new Date("2026-09-16T09:00:00.000Z"),
      },
    });
  });

  it("should use text body when HTML body is not available", async () => {
    prismaMock.inbox.findUnique.mockResolvedValue({
      id: "inbox-123",
    });

    prismaMock.message.findUnique.mockResolvedValue({
      id: "message-123",
      subject: "Plain text email",
      fromName: null,
      fromAddress: "john@example.com",
      toAddress: "test@example.com",
      htmlBody: null,
      textBody: "Hello from plain text",
      inboxId: "inbox-123",
      attachments: [],
      isRead: false,
      status: "PENDING",
      receivedAt: new Date("2026-09-16T10:00:00.000Z"),
      expiresAt: new Date("2026-09-20T10:00:00.000Z"),
      createdAt: new Date("2026-09-16T09:00:00.000Z"),
    });

    const req = {
      params: {
        id: "message-123",
      },
      token: "test-token",
    };

    const res = createResponse();

    await fetchMessage(req, res);

    expect(sanitizeHtmlBodyMock).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          sender: "john@example.com",
          body: "Hello from plain text",
        }),
      }),
    );
  });

  it("should return 500 when fetching the message fails", async () => {
    prismaMock.inbox.findUnique.mockRejectedValue(
      new Error("Database error"),
    );

    const req = {
      params: {
        id: "message-123",
      },
      token: "test-token",
    };

    const res = createResponse();

    await fetchMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error fetching message",
    });
  });
});

describe("readMessage", () => {
  it("should return 400 when message ID is missing", async () => {
    const req = {
      params: {},
      token: "test-token",
    };

    const res = createResponse();

    await readMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Missing Message Id",
    });

    expect(prismaMock.message.update).not.toHaveBeenCalled();
  });

  it("should return 400 when token is missing", async () => {
    hashTokenMock.mockReturnValueOnce(null);

    const req = {
      params: {
        id: "message-123",
      },
      token: null,
    };

    const res = createResponse();

    await readMessage(req, res);

    expect(hashTokenMock).toHaveBeenCalledWith(null);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token Message Id",
    });

    expect(prismaMock.message.update).not.toHaveBeenCalled();
  });

  it("should mark a message as read successfully", async () => {
    prismaMock.message.update.mockResolvedValue({
      id: "message-123",
      isRead: true,
    });

    const req = {
      params: {
        id: "message-123",
      },
      token: "test-token",
    };

    const res = createResponse();

    await readMessage(req, res);

    expect(hashTokenMock).toHaveBeenCalledWith("test-token");

    expect(prismaMock.message.update).toHaveBeenCalledWith({
      where: {
        id: "message-123",
      },
      data: {
        isRead: true,
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Message marked as read",
    });
  });

  it("should return 500 when marking the message as read fails", async () => {
    prismaMock.message.update.mockRejectedValue(
      new Error("Database error"),
    );

    const req = {
      params: {
        id: "message-123",
      },
      token: "test-token",
    };

    const res = createResponse();

    await readMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error marking message as read",
    });
  });
});