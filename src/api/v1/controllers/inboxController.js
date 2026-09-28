import asyncHandler from "express-async-handler";
import { generateAddress } from "../../../lib/addressGenerator.js";
import { generateToken, hashToken } from "../../../utils/generateToken.js";
import { MAIL_DOMAIN, INBOX_TTL_MINUTES } from "../../../configs/env.js";
import { getCurrentTime } from "../../../utils/getCurrentTime.js";
import prisma from "../../../configs/prisma.js";

export const createInbox = asyncHandler(async (req, res) => {
  try {
    //token-hash generation
    const inboxToken = generateToken();
    const tokenHash = hashToken(inboxToken);
    const MAX_ATTEMPTS = 5;
    const expiresAt = new Date(Date.now() + INBOX_TTL_MINUTES * 60 * 1000);




   
    const authorization = req.headers?.authorization;
    const providedSessionToken = authorization?.startsWith("Bearer ")
      ? authorization.substring(7).trim()
      : null;
    let session = null;

    if (!session && providedSessionToken) {
      session = await prisma.session.findUnique({
        where: { tokenHash: hashToken(providedSessionToken) },
      });
      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Session Not Found",
        });
      }
    }

    const reuseSession = Boolean(
      session && providedSessionToken && new Date() < session.expiresAt
    );
    const sessionToken = reuseSession ? providedSessionToken : generateToken();
    const sessionTokenHash = reuseSession ? null : hashToken(sessionToken);
    const sessionExpiresAt = reuseSession && session.expiresAt > expiresAt
      ? session.expiresAt
      : expiresAt;



    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const { localPart, address } = generateAddress(MAIL_DOMAIN);

      try {
        //inbox creating in db
        const data = {
          address,
          localPart,
          domain: MAIL_DOMAIN,
          expiresAt,
          tokenHash,
          session: reuseSession
            ? { connect: { id: session.id } }
            : {
                create: {
                  tokenHash: sessionTokenHash,
                  expiresAt,
                },
              },
        };
        const inbox = reuseSession
          ? await prisma.$transaction(async (transaction) => {
              const createdInbox = await transaction.inbox.create({ data });
              if (session.expiresAt < expiresAt) {
                await transaction.session.update({
                  where: { id: session.id },
                  data: { expiresAt },
                });
              }
              return createdInbox;
            })
          : await prisma.inbox.create({ data });

        return res.status(201).json({
          success: true,
          data: {
            session: {
              token: sessionToken,
              expiresAt: sessionExpiresAt,
            },
            address: inbox.address,
            token: inboxToken,
          
            expiresAt: inbox.expiresAt,
          },
        });
      } catch (error) {
        if (error.code === "P2002" && attempt < MAX_ATTEMPTS) {
          continue;
        }

        if (error.code === "P2002") {
          throw new Error("Unable to generate a unique inbox address");
        }
        throw error;
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

export const getInboxInfo = asyncHandler(async (req, res) => {
  try {
    const token = req.token;

    const decodedToken = hashToken(token);
    const inbox = await prisma.inbox.findUnique({
      where: {
        tokenHash: decodedToken,
      },
      include: {
        messages:true
      }
    });

    if (!inbox) {
      return res.status(404).json({
        success: false,
        message: "Inbox Not Found",
      });
    }

    if (inbox.isDeleted == true) {
      return res.status(404).json({
        success: false,
        message: "Inbox has been deleted",
      });
    }

    const currentTime = getCurrentTime();
    if (currentTime >= inbox.expiresAt) {
      return res.status(410).json({
        success: false,
        message: "Inbox has expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inbox Fetched Success",
      data: {
        address: inbox.address,
        localPart: inbox.localPart,
        extendCount :inbox.extendCount,
        domain: inbox.domain,
        createdAt: inbox.createdAt,
        expiresAt: inbox.expiresAt,
        message: {
          count: inbox.messages.length,
        }
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while get inbox.",
    });
  }
});


export const extendInboxTime = asyncHandler(async(req,res) => {
  try {
    const tokenHash = hashToken(req.token);
    const inbox = await prisma.inbox.findUnique({
      where: { tokenHash },
      include: {
        session: {
          select: {
            expiresAt: true,
          },
        },
      },
    });

    if (!inbox) {
      return res.status(404).json({
        success: false,
        message: "Inbox Not Found",
      });
    }

    if (inbox.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Inbox has been deleted",
      });
    }

    const extensionMinutes = 5;
    const now = new Date();
    const baseTime = inbox.expiresAt > now ? inbox.expiresAt : now;
    const expiresAt = new Date(
      baseTime.getTime() + extensionMinutes * 60 * 1000
    );

    const sessionExpiresAt =
      inbox.session.expiresAt > expiresAt ? inbox.session.expiresAt : expiresAt;

    const updatedInbox = await prisma.$transaction(async (transaction) => {
      const updatedInboxRecord = await transaction.inbox.update({
        where: { tokenHash },
        data: {
          expiresAt,
          lastExtendedAt: now,
          extendCount: { increment: 1 },
        },
      });

      await transaction.session.update({
        where: { id: inbox.sessionId },
        data: {
          expiresAt: sessionExpiresAt,
          lastExtendedAt: now,
        },
      });

      return updatedInboxRecord;
    });

    return res.status(200).json({
      success: true,
      message: "Inbox time extended successfully",
      data: {
        expiresAt: updatedInbox.expiresAt,
        lastExtendedAt: updatedInbox.lastExtendedAt,
        extendCount: updatedInbox.extendCount,
      },
    });
  } catch (error) {
    console.error("Inbox time extension error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to extend inbox time",
    });
  }
});
