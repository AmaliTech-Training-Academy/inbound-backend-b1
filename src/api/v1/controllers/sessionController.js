import asyncHandler from "express-async-handler";
import prisma from "../../../configs/prisma.js";
import { hashToken } from "../../../utils/generateToken.js";

export const getSessionInfo = asyncHandler(async (req, res) => {
  try {
    const sessionToken = req.session.token;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: "Session token is required",
      });
    }

    const sessionTokenHash = hashToken(sessionToken);
    const session = await prisma.session.findUnique({
      where: {
        tokenHash: sessionTokenHash,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session Not Found",
      });
    }

    if (new Date() >= session.expiresAt) {
      return res.status(410).json({
        success: false,
        message: "Session has expired",
      });
    }

    const activeInboxCount = await prisma.inbox.count({
      where: {
        sessionId: session.id,
        isDeleted: false,
        expiresAt: { gt: new Date() },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Session Info Fetched Success",
      data: {
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        lastExtendedAt: session.lastExtendedAt,
        inboxCount: activeInboxCount,
      },
    });
  } catch (error) {
    console.error("Error fetching session info:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});



export const getSessionInboxes = asyncHandler(async (req, res) => {
  try {
    const sessionToken = req.session.token;


    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: "Session token is required",
      });
    }

    const sessionTokenHash = hashToken(sessionToken);
    const session = await prisma.session.findUnique({
      where: {
        tokenHash: sessionTokenHash,
      },
      include: {
        inboxes: {
          where: {
            isDeleted: false,
            expiresAt: { gt: new Date() },
          },
          include: {
            _count: {
              select: {
                messages: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session Not Found",
      });
    }

    if (new Date() >= session.expiresAt) {
      return res.status(410).json({
        success: false,
        message: "Session has expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Session Inboxes Fetched Success",
        data: {
            inboxes: session.inboxes.map((inbox) => ({
              id: inbox.id,
                address: inbox.address,
                localPart: inbox.localPart,
                domain: inbox.domain,
                createdAt: inbox.createdAt,
                expiresAt: inbox.expiresAt,
                messageCount: inbox._count.messages,
            })),
        },
    });
  }
    catch (error) {
    console.error("Error fetching session inboxes:", error);
    return res.status(500).json({
      success: false,
        message: "Error fetching session inboxes",
    });
  }
});