import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    inbox: {
      deleteMany: vi.fn(),
    },
    message: {
      deleteMany: vi.fn(),
    },
    attachment: {
      deleteMany: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("../src/configs/prisma.js", () => ({
  default: prismaMock,
}));

import { cleanExpiredData } from "../src/api/v1/services/cleanupService.js";

describe("cleanupService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("cleanExpiredData", () => {
    it("hard-deletes expired and soft-deleted inboxes along with messages, attachments, and sessions", async () => {
      const fixedNow = new Date("2026-10-01T12:00:00.000Z");

      prismaMock.inbox.deleteMany.mockResolvedValue({ count: 5 });
      prismaMock.message.deleteMany.mockResolvedValue({ count: 14 });
      prismaMock.attachment.deleteMany.mockResolvedValue({ count: 4 });
      prismaMock.session.deleteMany.mockResolvedValue({ count: 2 });

      const stats = await cleanExpiredData({ prisma: prismaMock, now: fixedNow });

      expect(prismaMock.inbox.deleteMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.inbox.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { expiresAt: { lte: fixedNow } },
            { isDeleted: true },
          ],
        },
      });

      expect(prismaMock.message.deleteMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lte: fixedNow },
        },
      });

      expect(prismaMock.attachment.deleteMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.attachment.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lte: fixedNow },
        },
      });

      expect(prismaMock.session.deleteMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lte: fixedNow },
        },
      });

      expect(stats).toEqual({
        inboxes: 5,
        messages: 14,
        attachments: 4,
        sessions: 2,
        cleanedAt: fixedNow,
      });
    });

    it("defaults now to the current time when omitted", async () => {
      prismaMock.inbox.deleteMany.mockResolvedValue({ count: 0 });
      prismaMock.message.deleteMany.mockResolvedValue({ count: 0 });
      prismaMock.attachment.deleteMany.mockResolvedValue({ count: 0 });
      prismaMock.session.deleteMany.mockResolvedValue({ count: 0 });

      const before = new Date();
      const stats = await cleanExpiredData({ prisma: prismaMock });
      const after = new Date();

      expect(stats.cleanedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(stats.cleanedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(stats.inboxes).toBe(0);
    });

    it("propagates any database errors during cleanup", async () => {
      prismaMock.inbox.deleteMany.mockRejectedValue(new Error("Database connection lost"));

      await expect(cleanExpiredData({ prisma: prismaMock })).rejects.toThrow(
        "Database connection lost"
      );
    });
  });
});
