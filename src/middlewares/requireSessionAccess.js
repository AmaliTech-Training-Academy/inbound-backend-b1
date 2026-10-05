import prisma from "../configs/prisma.js";
import { hashToken } from "../utils/generateToken.js";

export const requireSessionAccess = async (req, res, next) => {
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

    const sessionTokenHash = hashToken(token);
    const session = await prisma.session.findUnique({
      where: {
        
        tokenHash: sessionTokenHash,
      },
      select: {
        id: true,
        inboxes: true,
        createdAt: true,
        expiresAt: true,
        lastExtendedAt: true,
        tokenHash: true,
      },
    });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session Not Found",
      });
    }

    if (new Date() >= session.expiresAt) {
      return res.status(410).json({
        success: false,
        message: "Session Expired",
      });
    }

  
    if (!session.id) {
      throw new Error("Session record is missing its id");
    }

    req.session = {
      ...session,
      token: token,
    };

    return next();
  } catch (error) {
    console.error("Error in requireSessionAccess middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
