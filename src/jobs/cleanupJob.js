import cron from "node-cron";
import defaultPrisma from "../configs/prisma.js";
import { cleanExpiredData } from "../api/v1/services/cleanupService.js";

/**
 * Starts a scheduled cron job to periodically purge expired records.
 * Default schedule is every 6 hours ("0 *\/6 * * *", 4 times a day).
 *
 * @param {Object} options
 * @param {import("@prisma/client").PrismaClient} [options.prisma]
 * @param {string} [options.schedule]
 * @param {boolean} [options.runOnStartup]
 * @returns {{ task: import("node-cron").ScheduledTask | null, stop: () => void, runOnce: () => Promise<any> }}
 */
export function startCleanupCron({
  prisma = defaultPrisma,
  schedule = process.env.CLEANUP_CRON_SCHEDULE || "0 */6 * * *",
  runOnStartup = false,
} = {}) {
  if (process.env.DISABLE_CLEANUP_CRON === "true") {
    console.log("[Cleanup Worker] Cron is disabled via DISABLE_CLEANUP_CRON=true");
    return {
      task: null,
      stop: () => {},
      runOnce: () => cleanExpiredData({ prisma }),
    };
  }

  const executeCleanup = async () => {
    try {
      const stats = await cleanExpiredData({ prisma });
      console.log(
        `[Cleanup Worker] Cleaned expired data at ${stats.cleanedAt.toISOString()}: ` +
        `${stats.inboxes} inboxes, ${stats.messages} messages, ${stats.attachments} attachments, ${stats.sessions} sessions.`
      );
      return stats;
    } catch (error) {
      console.error("[Cleanup Worker] Error during scheduled cleanup run:", error);
    }
  };

  if (runOnStartup) {
    executeCleanup();
  }

  const task = cron.schedule(schedule, executeCleanup);
  console.log(`[Cleanup Worker] Scheduled cleanup worker initialized with cron expression: "${schedule}"`);

  return {
    task,
    stop: () => {
      task.stop();
      console.log("[Cleanup Worker] Scheduled cleanup worker stopped.");
    },
    runOnce: executeCleanup,
  };
}
