
import prisma from  '../configs/prisma.js'
import { hashToken } from '../utils/generateToken.js';

export const requireInboxAccess = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = authorization.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }
  const tokenHash = hashToken(token);
    const inbox = await prisma.inbox.findUnique({
      where: {
    tokenHash,
      },
    });
    if (!inbox) {
      return res.status(401).json({
        success: false,
        message: "Inbox Not Found",
      });
    }

    if (new Date() >= inbox.expiresAt) {
      return res.status(410).json({
        success: false,
        message: "Inbox has expired",
      });
    }

    

    
    req.token = token;

    next();
  } catch (error) {
    console.error("Inbox authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
