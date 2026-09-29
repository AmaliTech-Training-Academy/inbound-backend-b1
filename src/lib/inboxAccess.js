import crypto from "node:crypto";
import prisma from "../configs/prisma.js";
import { hashToken } from "../utils/generateToken.js";

export async function verifyInboxAccess(address, token) {
  if (
    typeof address !== "string" ||
    !address.trim() ||
    typeof token !== "string" ||
    !token.trim()
  ) {
    return null;
  }

  const normalizedAddress = address.trim().toLowerCase();

  const inbox = await prisma.inbox.findUnique({
    where: { address: normalizedAddress },
    include: { session: true },
  });

  if (!inbox || inbox.isDeleted || inbox.expiresAt <= new Date()) {
    return null;
  }

  if (
    !inbox.session ||
    !inbox.session.tokenHash ||
    inbox.session.expiresAt <= new Date()
  ) {
    return null;
  }

  const providedHash = Buffer.from(hashToken(token.trim()), "hex");
  const storedHash = Buffer.from(inbox.session.tokenHash, "hex");

  if (
    providedHash.length !== storedHash.length ||
    !crypto.timingSafeEqual(providedHash, storedHash)
  ) {
    return null;
  }

  return inbox;
}

