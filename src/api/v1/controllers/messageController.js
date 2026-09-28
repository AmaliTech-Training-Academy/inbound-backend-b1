import asyncHandler from "express-async-handler";
import prisma from "../../../configs/prisma.js";
import { sanitizeHtmlBody } from "../services/mailParserService.js";

const activeSessionInboxFilter = (req) => ({
  is: {
    sessionId: req.session.id,
    isDeleted: false,
    expiresAt: { gt: new Date() },
    ...(req.query?.inboxId ? { id: req.query.inboxId } : {}),
  },
});

export const fetchInboxMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
        where: { inbox: activeSessionInboxFilter(req) },
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
        session: req.session,
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
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing Message Id",
      });
    }

    const message = await prisma.message.findFirst({
      where: {
        id,
        inbox: activeSessionInboxFilter(req),
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
        // session: req.session,
        // id: message.id,
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
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing Message Id",
      });
    }
    const ownedMessage = await prisma.message.findFirst({
      where: { id, inbox: activeSessionInboxFilter(req) },
      select: { id: true },
    });
    if (!ownedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message Not Found",
      });
    }

    await prisma.message.update({
      where: { id: ownedMessage.id },
      data: {
        isRead: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: {
        session: req.session,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking message as read",
    });
  }
});


export const fetchAllUnreadMessages = asyncHandler(async (req, res) => {
  try {
    const unreadMessages = await prisma.message.findMany({
      where: {
        inbox: activeSessionInboxFilter(req),
        isRead: false,
      },
      orderBy: {
        receivedAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Unread messages fetched successfully",
      data: {
        session: req.session,
        messages: unreadMessages.map((message) => ({
          id: message.id,
          subject: message.subject,
          sender: message.fromName
            ? `${message.fromName} <${message.fromAddress}>`
            : message.fromAddress,
          to: message.toAddress,
          receivedAt: message.receivedAt,
          isRead: message.isRead,
        })),
      },
    });
  }
  catch (error) {
    console.error("Error fetching unread messages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching unread messages",
    });
  }
});