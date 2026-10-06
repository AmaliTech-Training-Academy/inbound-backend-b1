import { beforeEach, describe, expect, it, vi } from "vitest";

const { cronMock, cleanExpiredDataMock, prismaMock } = vi.hoisted(() => {
  const scheduledTask = {
    stop: vi.fn(),
    start: vi.fn(),
  };

  return {
    cronMock: {
      schedule: vi.fn((schedule, callback) => {
        scheduledTask._callback = callback;
        return scheduledTask;
      }),
      scheduledTask,
    },
    cleanExpiredDataMock: vi.fn(),
    prismaMock: {},
  };
});

vi.mock("node-cron", () => ({
  default: cronMock,
}));

vi.mock("../src/configs/prisma.js", () => ({
  default: prismaMock,
}));

vi.mock("../src/api/v1/services/cleanupService.js", () => ({
  cleanExpiredData: cleanExpiredDataMock,
}));

import { startCleanupCron } from "../src/jobs/cleanupJob.js";

describe("cleanupJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CLEANUP_CRON_SCHEDULE;
    delete process.env.DISABLE_CLEANUP_CRON;
  });

  describe("startCleanupCron", () => {
    it("initializes cron schedule with the default 6-hour interval ('0 */6 * * *')", () => {
      const worker = startCleanupCron({ prisma: prismaMock });

      expect(cronMock.schedule).toHaveBeenCalledWith(
        "0 */6 * * *",
        expect.any(Function)
      );
      expect(worker.task).toBe(cronMock.scheduledTask);

      worker.stop();
      expect(cronMock.scheduledTask.stop).toHaveBeenCalledTimes(1);
    });

    it("uses custom schedule from environment variable CLEANUP_CRON_SCHEDULE", () => {
      process.env.CLEANUP_CRON_SCHEDULE = "0 0 * * *";

      startCleanupCron({ prisma: prismaMock });

      expect(cronMock.schedule).toHaveBeenCalledWith(
        "0 0 * * *",
        expect.any(Function)
      );
    });

    it("uses schedule passed explicitly in options over env", () => {
      process.env.CLEANUP_CRON_SCHEDULE = "0 0 * * *";

      startCleanupCron({ prisma: prismaMock, schedule: "*/30 * * * *" });

      expect(cronMock.schedule).toHaveBeenCalledWith(
        "*/30 * * * *",
        expect.any(Function)
      );
    });

    it("respects DISABLE_CLEANUP_CRON=true without scheduling a cron task", () => {
      process.env.DISABLE_CLEANUP_CRON = "true";

      const worker = startCleanupCron({ prisma: prismaMock });

      expect(cronMock.schedule).not.toHaveBeenCalled();
      expect(worker.task).toBeNull();

      // stop should be safe no-op
      expect(() => worker.stop()).not.toThrow();
    });

    it("triggers cleanExpiredData when the scheduled callback fires", async () => {
      cleanExpiredDataMock.mockResolvedValue({
        inboxes: 3,
        messages: 7,
        attachments: 1,
        sessions: 1,
        cleanedAt: new Date(),
      });

      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      startCleanupCron({ prisma: prismaMock });

      expect(cronMock.schedule).toHaveBeenCalledTimes(1);
      const callback = cronMock.scheduledTask._callback;
      expect(callback).toBeTypeOf("function");

      await callback();

      expect(cleanExpiredDataMock).toHaveBeenCalledWith({ prisma: prismaMock });
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Cleanup Worker] Cleaned expired data at")
      );

      logSpy.mockRestore();
    });

    it("handles errors gracefully inside the scheduled callback without throwing", async () => {
      cleanExpiredDataMock.mockRejectedValue(new Error("Scheduled delete failed"));

      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      startCleanupCron({ prisma: prismaMock });
      const callback = cronMock.scheduledTask._callback;

      await expect(callback()).resolves.toBeUndefined();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Cleanup Worker] Error during scheduled cleanup run:"),
        expect.any(Error)
      );

      errorSpy.mockRestore();
    });

    it("runs immediately on startup when runOnStartup is true", async () => {
      cleanExpiredDataMock.mockResolvedValue({
        inboxes: 1,
        messages: 0,
        attachments: 0,
        sessions: 0,
        cleanedAt: new Date(),
      });

      startCleanupCron({ prisma: prismaMock, runOnStartup: true });

      expect(cleanExpiredDataMock).toHaveBeenCalledTimes(1);
    });

    it("allows manual invocation via runOnce()", async () => {
      cleanExpiredDataMock.mockResolvedValue({
        inboxes: 2,
        messages: 4,
        attachments: 0,
        sessions: 1,
        cleanedAt: new Date(),
      });

      const worker = startCleanupCron({ prisma: prismaMock });
      const result = await worker.runOnce();

      expect(result.inboxes).toBe(2);
      expect(result.messages).toBe(4);
    });
  });
});
