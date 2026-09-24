import asyncHandler from "express-async-handler";
import prisma from "../../../configs/prisma.js";
import { hashToken } from "../../../utils/generateToken.js";
import { sanitizeHtmlBody } from "../services/mailParserService.js";

export const fetchInboxMessages = asyncHandler(async (req, res) => {
  try {
    const token = hashToken(req.token);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Missing Token",
      });
    }

    const inbox = await prisma.inbox.findUnique({
      where: {
        tokenHash: token,
      },
      select: {
        id: true,
      },
    });
    if (!inbox) {
      return res.status(404).json({
        success: false,
        message: "Inbox Not Found",
      });
    }

    const messages = await prisma.message.findMany({
        where: {
          inboxId: inbox.id,
        },
        select: {
          id: true,
          subject: true,
          fromName: true,
          fromAddress: true,
          toAddress: true,
          isRead: true,
          status: true,
          receivedAt: true,
          expiresAt: true,
          attachments: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          receivedAt: "desc",
        },
      });

    res.status(200).json({
      success: true,
      message: "Inbox messages fetched successfully",
      data: {
        messages: messages.map(({ attachments, ...message }) => ({
          ...message,
          attachmentCount: attachments.length,
        })),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching inbox messages",
    });
  }
});


export const fetchMessage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const token = hashToken(req.token);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing Message Id",
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token Message Id",
      });
    }

    const inbox = await prisma.inbox.findUnique({
      where: {
        tokenHash: token,
      },
    });
    if (!inbox) {
      return res.status(404).json({
        success: false,
        message: "Inbox Not Found",
      });
    }
    const inboxId = inbox.id;
    const message = await prisma.message.findUnique({
      where: {
        id,
        inboxId,
      },
      include: {
        inbox: true,
        attachments: true,
      },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message Fetched Success",
      data: {
        id: message.id,
        subject: message.subject,
        sender: message.fromName
          ? `${message.fromName} <${message.fromAddress}>`
          : message.fromAddress,
        from: message.fromAddress,
        to: message.toAddress,
        body: message.htmlBody
          ? sanitizeHtmlBody(message.htmlBody)
          : message.textBody || "",
        inboxId: message.inboxId,

        attachments: message.attachments.map((attachment) => ({
          id: attachment.id,
          filename: attachment.filename,
          contentType: attachment.contentType,
          size: attachment.sizeBytes,
          url: attachment.objectKey,
          expiresAt: attachment.expiresAt,
        })),
        isRead: message.isRead,
        status: message.status,
        receivedAt: message.receivedAt,
        expiresAt: message.expiresAt,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching message",
    });
  }
});


//on-click mark as read
export const readMessage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const token = hashToken(req.token);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing Message Id",
      });
    }
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token Message Id",
      });
    }

    await prisma.message.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking message as read",
    });
  }
});
