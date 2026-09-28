import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  prismaMock,
  hashTokenMock,
  sanitizeHtmlBodyMock,
} = vi.hoisted(() => ({
  prismaMock: {
    message: {
      findFirst: vi.fn(),
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
  fetchAllUnreadMessages,
} from "../src/api/v1/controllers/messageController.js";

const createResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

const session = {
  id: "session-123",
  createdAt: new Date("2026-09-16T09:00:00.000Z"),
  expiresAt: new Date("2026-09-20T10:00:00.000Z"),
  lastExtendedAt: null,
};

const ownedInboxFilter = (inboxId) => ({
  is: expect.objectContaining({
    sessionId: session.id,
    isDeleted: false,
    expiresAt: { gt: expect.any(Date) },
    ...(inboxId ? { id: inboxId } : {}),
  }),
});

beforeEach(() => {
  vi.clearAllMocks();

  hashTokenMock.mockReturnValue("hashed-token");
  sanitizeHtmlBodyMock.mockImplementation((body) => body);
});

describe("fetchInboxMessages", () => {
  it("should return all messages with attachment counts", async () => {
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
      session,
    };

    const res = createResponse();

    await fetchInboxMessages(req, res);

    expect(prismaMock.message.findMany).toHaveBeenCalledWith({
      where: {
        inbox: ownedInboxFilter(),
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
        session,
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

    expect(prismaMock.message.findFirst).not.toHaveBeenCalled();
  });

  it("should return 404 when the message is outside the session", async () => {
    prismaMock.message.findFirst.mockResolvedValue(null);

    const req = {
      params: {
        id: "message-123",
      },
      session,
    };

    const res = createResponse();

    await fetchMessage(req, res);

    expect(prismaMock.message.findFirst).toHaveBeenCalledWith({
      where: { id: "message-123", inbox: ownedInboxFilter() },
      include: { inbox: true, attachments: true },
    });

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Message Not Found",
    });
  });

  it("should return 404 when message is not found", async () => {
    prismaMock.message.findFirst.mockResolvedValue(null);

    const req = {
      params: {
        id: "message-123",
      },
      session,
    };

    const res = createResponse();

    await fetchMessage(req, res);

    expect(prismaMock.message.findFirst).toHaveBeenCalledWith({
      where: { id: "message-123", inbox: ownedInboxFilter() },
      include: { inbox: true, attachments: true },
    });

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Message Not Found",
    });
  });

  it("should fetch a message successfully", async () => {
    prismaMock.message.findFirst.mockResolvedValue({
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
      session,
    };

    const res = createResponse();

    await fetchMessage(req, res);

    expect(prismaMock.message.findFirst).toHaveBeenCalledWith({
      where: { id: "message-123", inbox: ownedInboxFilter() },
      include: { inbox: true, attachments: true },
    });

    expect(sanitizeHtmlBodyMock).toHaveBeenCalledWith(
      "<p>Hello <strong>there</strong></p>",
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Message Fetched Success",
      data: {
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
    prismaMock.message.findFirst.mockResolvedValue({
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
      session,
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
    prismaMock.message.findFirst.mockRejectedValue(
      new Error("Database error"),
    );

    const req = {
      params: {
        id: "message-123",
      },
      session,
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

  it("should return 404 when the message is outside the session", async () => {
    prismaMock.message.findFirst.mockResolvedValue(null);
    const req = {
      params: {
        id: "message-123",
      },
      session,
    };

    const res = createResponse();

    await readMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Message Not Found",
    });

    expect(prismaMock.message.update).not.toHaveBeenCalled();
  });

  it("should mark a message as read successfully", async () => {
    prismaMock.message.findFirst.mockResolvedValue({ id: "message-123" });
    prismaMock.message.update.mockResolvedValue({
      id: "message-123",
      isRead: true,
    });

    const req = {
      params: {
        id: "message-123",
      },
      session,
    };

    const res = createResponse();

    await readMessage(req, res);

    expect(prismaMock.message.findFirst).toHaveBeenCalledWith({
      where: { id: "message-123", inbox: ownedInboxFilter() },
      select: { id: true },
    });

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
      data: {
        session,
      },
    });
  });

  it("should return 500 when marking the message as read fails", async () => {
    prismaMock.message.findFirst.mockResolvedValue({ id: "message-123" });
    prismaMock.message.update.mockRejectedValue(
      new Error("Database error"),
    );

    const req = {
      params: {
        id: "message-123",
      },
      session,
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

describe("fetchAllUnreadMessages", () => {
  it("returns unread messages with session metadata", async () => {
    prismaMock.message.findMany.mockResolvedValue([
      {
        id: "message-123",
        subject: "Welcome",
        fromName: null,
        fromAddress: "sender@example.com",
        toAddress: "test@example.com",
        receivedAt: new Date("2026-09-16T10:00:00.000Z"),
        isRead: false,
      },
    ]);

    const req = {
      session,
    };
    const res = createResponse();

    await fetchAllUnreadMessages(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Unread messages fetched successfully",
      data: {
        session,
        messages: [
          {
            id: "message-123",
            subject: "Welcome",
            sender: "sender@example.com",
            to: "test@example.com",
            receivedAt: new Date("2026-09-16T10:00:00.000Z"),
            isRead: false,
          },
        ],
      },
    });
  });
});