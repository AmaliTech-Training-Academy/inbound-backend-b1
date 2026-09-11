import prisma from "../../../configs/prisma.js";
import asyncHandler from "express-async-handler";
import { generateAddress } from "../../../lib/addressGenerator.js";
import { generateToken, hashToken } from "../../../utils/generateToken.js";
import { MAIL_DOMAIN, INBOX_TTL_MINUTES } from "../../../configs/env.js";
import { getCurrentTime } from "../../../utils/getCurrentTime.js";

export const createInbox = asyncHandler(async (req, res) => {
  try {
    //token-hsah generation
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + INBOX_TTL_MINUTES * 60 * 1000);

    const MAX_ATTEMPTS = 5;
    //email address generation
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const { localPart, address } = generateAddress(MAIL_DOMAIN);

      try {
        //inbox creating in db
        const inbox = await prisma.inbox.create({
          data: {
            address,
            localPart,
            domain: MAIL_DOMAIN,
            expiresAt,
            tokenHash,
          },
        });

        return res.status(201).json({
          success: true,
          data: {
            id: inbox.id,
            address: inbox.address,
            token,
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
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Inbox id is required",
      });
    }

    const inbox = req.inbox;
    if (inbox.id !== id) {
      return res.status(404).json({
        success: false,
        message: "Inbox not found",
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
        domain: inbox.domain,
        createdAt: inbox.createdAt,
        expiresAt: inbox.expiresAt,
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while get inbox.",
    });
  }
});
