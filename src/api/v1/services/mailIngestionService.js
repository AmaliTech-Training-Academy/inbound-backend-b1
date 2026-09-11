import {z} from "zod"
import {CanonicalizeRecipient} from "../../../utils/emailAddress"
import {verifyMailgunSignature} from "../services/mailgunSignatureService"
import {parseInboundEmail} from "../services/mailParserService"

import { z } from "zod";

const payloadSchema = z.object({
  recipient: z.string().min(3),
  "body-mime": z.string().min(1),
  timestamp: z.string().datetime() || z.string().numeric(), 
  token: z.string().min(1),
  signature: z.string().length(64).hex(),
});

const MAX_ATTACHMENT_BYTES = Number(process.env.MAX_ATTACHMENT_SIZE_MB || 10) * 1024 * 1024
const MAX_MESSAGE_BYTES = Number(process.env.MAX_MESSAGE_SIZE_MB || 25) * 1024 * 1024

export class PermanentIngestionError extends Error{}

export async function ingestMailgunMessage({body,prisma,storage,signingKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY}){
    const input = payloadSchema.safeParse(body);

    if (!input.success) {
    throw new PermanentIngestionError("Malformed Mailgun payload.");
    }

    const isAuthentic = verifyMailgunSignature({
        timestamp: input.data.timestamp,
        token: input.data.token,
        signature: input.data.signature,
        signingKey,
    });

    if (!isAuthentic) {
    throw new PermanentIngestionError("Invalid Mailgun signature.");
    }

    const recipient = CanonicalizeRecipient(input.data.recipient);

    if (!recipient) {
    throw new PermanentIngestionError("Invalid recipient address.");
    }

    //check inbox
    const  inbox = await prisma.inbox.findFirst({
        where: {address: recipient, isDeleted: false, expiresAt:{gt: new Date()}},
        select: {id:true, address:true, expiresAt: true},
    })
    if (!inbox){
        throw new PermanentIngestionError("Inbox not found,unknown or expired")

    }
    //check duplicates
    const duplicate = await prisma.message.findUnique({
        where:{mailgunToken:input.data.token},
    })
    if (duplicate){
        return {message: duplicate, duplicate: true}
    }
    //check size
    const rawEmail = Buffer.from(input.data["body-mime"], "utf8");
    if (rawEmail.length > MAX_MESSAGE_BYTES) {
        throw new PermanentIngestionError("Message Exceeds Size Limit.")
    }

    const parsed = await parseInboundEmail(rawEmail)
    const attachmentBytes = parsed.attachments.reduce((total,item)=>total + item.sizeBytes,0)

    if (attachmentBytes > MAX_ATTACHMENT_BYTES) {
        throw new PermanentIngestionError("Attachment Exceeds Size Limit.")
    }

    const message = await prisma.message.create({
        data: {
            inboxId: inbox.id,
            mailgunToken: input.data.token,
            fromAddress: parsed.fromAddress,
            fromName: parsed.fromName,
            toAddress: inbox.address,
            subject: parsed.subject,
            textBody: parsed.textBody,
            htmlBody: parsed.htmlBody,
            rawHtmlSize: parsed.rawHtmlSize,
            status: "PARSED",
            expiresAt: inbox.expiresAt,
            sizeBytes: rawMime.length,
        },
    })

    try {
        const rawObjectKey = await storage.putRawMessage({
        inboxId: inbox.id,
        messageId: message.id,
        body: rawMime,
        });
        await prisma.message.update({ where: { id: message.id }, data: { rawObjectKey } });

        for (const attachment of parsed.attachments) {
        const objectKey = await storage.putAttachment({
            inboxId: inbox.id,
            messageId: message.id,
            filename: attachment.filename,
            contentType: attachment.contentType,
            body: attachment.content,
        });
        await prisma.attachment.create({
            data: {
            messageId: message.id,
            filename: attachment.filename,
            contentType: attachment.contentType,
            sizeBytes: attachment.sizeBytes,
            checksum: attachment.checksum,
            objectKey,
            expiresAt: inbox.expiresAt,
            },
        });
        }
    } catch (error) {
        await prisma.message.delete({ where: { id: message.id } });
        throw error;
    }

    return { message, duplicate: false };

}