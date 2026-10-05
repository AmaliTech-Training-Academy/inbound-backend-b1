import defaultPrisma from "../../../configs/prisma.js";

/**
 * Hard-deletes expired and soft-deleted inboxes, along with expired messages,
 * attachments, and sessions.
 *
 * Foreign key cascades in PostgreSQL automatically remove associated messages
 * and attachments when an inbox is deleted. Explicit deletes for standalone expired
 * messages and attachments are also performed as a safeguard.
 *
 * @param {Object} options
 * @param {import("@prisma/client").PrismaClient} [options.prisma]
 * @param {Date} [options.now]
 * @returns {Promise<{ inboxes: number, messages: number, attachments: number, sessions: number, cleanedAt: Date }>}
 */
export async function cleanExpiredData({ prisma = defaultPrisma, now = new Date() } = {}) {
  // 1. Hard-delete expired and soft-deleted inboxes
  // (Postgres foreign key cascade automatically deletes messages & attachments belonging to these inboxes)
  const inboxesResult = await prisma.inbox.deleteMany({
    where: {
      OR: [
        { expiresAt: { lte: now } },
        { isDeleted: true },
      ],
    },
  });

  // 2. Hard-delete any standalone expired messages
  const messagesResult = await prisma.message.deleteMany({
    where: {
      expiresAt: { lte: now },
    },
  });

  // 3. Hard-delete any standalone expired attachments
  const attachmentsResult = await prisma.attachment.deleteMany({
    where: {
      expiresAt: { lte: now },
    },
  });

  // 4. Hard-delete expired sessions
  const sessionsResult = await prisma.session.deleteMany({
    where: {
      expiresAt: { lte: now },
    },
  });

  return {
    inboxes: inboxesResult.count,
    messages: messagesResult.count,
    attachments: attachmentsResult.count,
    sessions: sessionsResult.count,
    cleanedAt: now,
  };
}
