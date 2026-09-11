import crypto from "node:crypto";
import prisma from "../configs/prisma.js";
import { hashToken } from "../utils/generate_token.js";

export async function verifyInboxAccess(address, token) {
  const inbox = await prisma.inbox.findUnique({
    where: { address }
  });

  if (!inbox || inbox.isDeleted || inbox.expiresAt <= new Date()) {
    return null;
  }

  const providedHash = Buffer.from(hashToken(token), "hex");
  const storedHash = Buffer.from(inbox.tokenHash, "hex");

  if (providedHash.length !== storedHash.length || !crypto.timingSafeEqual(providedHash, storedHash)) {
    return null;
  }

  return inbox;
}