import "dotenv/config";
import prisma from "../configs/prisma.js";
import { cleanExpiredData } from "../api/v1/services/cleanupService.js";

async function main() {
  console.log("[Cleanup CLI] Starting manual cleanup of expired data...");
  try {
    const stats = await cleanExpiredData({ prisma });
    console.log(
      `[Cleanup CLI] Successfully purged expired data:\n` +
      `  - Inboxes deleted: ${stats.inboxes}\n` +
      `  - Messages deleted: ${stats.messages}\n` +
      `  - Attachments deleted: ${stats.attachments}\n` +
      `  - Sessions deleted: ${stats.sessions}\n` +
      `  - Timestamp: ${stats.cleanedAt.toISOString()}`
    );
  } catch (error) {
    console.error("[Cleanup CLI] Error during manual cleanup:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
