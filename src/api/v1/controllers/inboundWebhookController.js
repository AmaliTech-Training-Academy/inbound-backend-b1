import asyncHandler from "express-async-handler";
import prisma from "../../../configs/prisma.js";
import { publishNewMessage } from "../../../configs/websocket.js";

const rejectIngest = async (recipient, reason, res) => {
  if (recipient) {
    await prisma.ingestLog.create({
      data: {
        recipient,
        accepted: false,
        rejectReason: reason
      }
    });
  }

  return res.status(200).json({ accepted: false });
};

export const createInboundWebhookController = (io) => asyncHandler(async (req, res) => {
  const { recipient, fromAddress, fromName, subject, textBody, htmlBody, sizeBytes } = req.body ?? {};
  const providedSecret = req.get("x-inbound-webhook-secret");

  if (!process.env.INBOUND_WEBHOOK_SECRET || providedSecret !== process.env.INBOUND_WEBHOOK_SECRET) {
    return res.status(401).json({ accepted: false, error: "invalid webhook credentials" });
  }

  if (typeof recipient !== "string" || typeof fromAddress !== "string") {
    return rejectIngest(recipient, "recipient and fromAddress are required", res);
  }

  const normalizedRecipient = recipient.trim().toLowerCase();
  const inbox = await prisma.inbox.findFirst({
    where: {
      address: normalizedRecipient,
      isDeleted: false,
      expiresAt: { gt: new Date() }
    }
  });

  if (!inbox) {
    return rejectIngest(normalizedRecipient, "inbox not found or expired", res);
  }

  const message = await prisma.message.create({
    data: {
      inboxId: inbox.id,
      fromAddress: fromAddress.trim(),
      fromName: typeof fromName === "string" ? fromName : null,
      toAddress: normalizedRecipient,
      subject: typeof subject === "string" ? subject : null,
      textBody: typeof textBody === "string" ? textBody : null,
      htmlBody: typeof htmlBody === "string" ? htmlBody : null,
      sizeBytes: Number.isInteger(sizeBytes) && sizeBytes >= 0 ? sizeBytes : 0,
      expiresAt: inbox.expiresAt
    }
  });

  publishNewMessage(io, inbox.id, message);

  return res.status(202).json({
    accepted: true,
    messageId: message.id
  });
});