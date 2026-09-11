import prisma from '../../../configs/prisma.js'
import asyncHandler from "express-async-handler";
import { generateAddress }from '../../../lib/addressGenerator.js'
import {generateToken, hashToken} from '../../../utils/generateToken.js'
import {
  MAIL_DOMAIN,
  INBOX_TTL_MINUTES,
} from "../../../configs/env.js";

export const createInbox = asyncHandler(async (req, res) => {

   

try {
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(
      Date.now() + INBOX_TTL_MINUTES * 60 * 1000
    );

    const MAX_ATTEMPTS = 5;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const { localPart, address } = generateAddress(MAIL_DOMAIN);

      try {
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
          id: inbox.id,
          address: inbox.address,
          token,
          expiresAt: inbox.expiresAt,
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
        console.log(error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
     
    });

  }
});