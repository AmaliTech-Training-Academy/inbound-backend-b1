import asyncHandler from "express-async-handler"
import prisma from "../../../configs/prisma.js"

const activeInboxFilter = (sessionId) => ({
    is: {
        sessionId,
        isDeleted: false,
        expiresAt: {gt: new Date()},
    }
})

const SAFE_CONTENNT_TYPE = /^[\w!#$&^_.+-]+\/[\w!#$&^_.+-]+$/;

export const downloadAttachment = asyncHandler ( async (req,res) => {
    const {attachmentId} = req.params

    if(!attachmentId){
        return res.status(400).json({

            success: false,
            message: "Missing Attachment Id",
        })
    }

    try{
        const attachment = await prisma.attachment.findFirst({
            where:{id:attachmentId,message:{is:{
               inbox:activeInboxFilter(req.session.id) 
            }}},
            select:{filename:true,contentType:true,sizeBytes:true,content:true}
        })

        if(!attachment || attachment.content == null){
            return res.status(404).json({
                success: false,
                message: "Attachment not found",
            })
        }

        const contentType = SAFE_CONTENNT_TYPE.test(attachment.contentType || "") 
            ? attachment.contentType 
            : "application/octet-stream"

        res.attachment(attachment.filename || "attachment");
        res.set("Content-Type", contentType);
        res.set("X-Content-Type-Options", "nosniff");
        res.set("Cache-Control", "private, no-store");

        return res.status(200).send(attachment.content)
    }catch{
        return res.status(500).json({
            success: false,
            message: "Failed to download attachment",
        })
    }
})