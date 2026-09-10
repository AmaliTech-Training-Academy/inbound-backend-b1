import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import { generateAddress }from '../../../lib/addressGenerator.js'

export const createInbox = asyncHandler((req, res) => {

    const generated_email = generateAddress();

    // return res.status(201).json({
    //     success:true,
    
    //     generatedEmail: generated_email
    // })
    
})