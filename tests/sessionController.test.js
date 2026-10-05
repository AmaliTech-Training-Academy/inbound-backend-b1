import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, hashTokenMock } = vi.hoisted(() => ({
  prismaMock: {
    session: {
      findUnique: vi.fn(),
    },
    inbox: {
      count: vi.fn(),
    },
  },
  hashTokenMock: vi.fn((token) => `hash-${token}`),
}));

vi.mock("../src/configs/prisma.js", () => ({
  default: prismaMock,
}));

vi.mock("../src/utils/generateToken.js", () => ({
  hashToken: hashTokenMock,
}));

import {
  getSessionInfo,
  getSessionInboxes,
} from "../src/api/v1/controllers/sessionController.js";

const createResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

describe("sessionController expiration guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validFutureDate = new Date(Date.now() + 60 * 60 * 1000);
  const pastDate = new Date(Date.now() - 60 * 60 * 1000);

  describe("getSessionInboxes", () => {
    it("filters out expired and deleted inboxes when fetching session inboxes", async () => {
      prismaMock.session.findUnique.mockResolvedValue({
        id: "session-123",
        tokenHash: "hash-my-token",
        expiresAt: validFutureDate,
        inboxes: [
          {
            id: "inbox-active",
            address: "active@inbound.test",
            localPart: "active",
            domain: "inbound.test",
            createdAt: new Date(),
            expiresAt: validFutureDate,
            _count: { messages: 3 },
          },
        ],
      });

      const req = {
        session: { token: "my-token" },
      };
      const res = createResponse();

      await getSessionInboxes(req, res);

      // Verify that the query explicitly filtered for active, non-expired inboxes
      expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: "hash-my-token" },
        include: {
          inboxes: {
            where: {
              isDeleted: false,
              expiresAt: { gt: expect.any(Date) },
            },
            include: {
              _count: { select: { messages: true } },
            },
          },
        },
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Session Inboxes Fetched Success",
        data: {
          inboxes: [
            expect.objectContaining({
              id: "inbox-active",
              address: "active@inbound.test",
              messageCount: 3,
            }),
          ],
        },
      });
    });

    it("returns 410 when the parent session itself is expired", async () => {
      prismaMock.session.findUnique.mockResolvedValue({
        id: "session-123",
        tokenHash: "hash-my-token",
        expiresAt: pastDate,
      });

      const req = { session: { token: "my-token" } };
      const res = createResponse();

      await getSessionInboxes(req, res);

      expect(res.status).toHaveBeenCalledWith(410);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Session has expired",
      });
    });
  });

  describe("getSessionInfo", () => {
    it("counts only active unexpired inboxes", async () => {
      prismaMock.session.findUnique.mockResolvedValue({
        id: "session-123",
        tokenHash: "hash-my-token",
        createdAt: new Date(),
        expiresAt: validFutureDate,
        lastExtendedAt: null,
      });
      prismaMock.inbox.count.mockResolvedValue(2);

      const req = { session: { token: "my-token" } };
      const res = createResponse();

      await getSessionInfo(req, res);

      expect(prismaMock.inbox.count).toHaveBeenCalledWith({
        where: {
          sessionId: "session-123",
          isDeleted: false,
          expiresAt: { gt: expect.any(Date) },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            inboxCount: 2,
          }),
        })
      );
    });
  });
});
