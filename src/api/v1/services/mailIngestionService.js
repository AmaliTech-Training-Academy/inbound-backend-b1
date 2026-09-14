import { canonicalizeRecipient } from "../../../utils/emailAddress.js";
import { verifyMailgunSignature } from "./mailgunSignatureService.js";
import { parseInboundEmail } from "./mailParserService.js";

const MAX_ATTACHMENT_BYTES = Number(process.env.MAX_ATTACHMENT_SIZE_MB || 10) * 1024 * 1024
const MAX_MESSAGE_BYTES = Number(process.env.MAX_MESSAGE_SIZE_MB || 25) * 1024 * 1024

export class PermanentIngestionError extends Error{}

function getAddress(value) {
    if (typeof value !== "string") return "unknown";
    const match = value.match(/<([^>]+)>/);
    return (match ? match[1] : value).trim().toLowerCase();
}

function getName(value) {
    if (typeof value !== "string") return "unknown";
    return value.match(/^\s*([^<]+?)\s*</)?.[1]?.trim() || "unknown";
}

export async function ingestMailgunMessage({body, prisma, signingKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY, publishMessage}){
    const hasRawMime = typeof body?.["body-mime"] === "string" && body["body-mime"].length > 0;
    const hasParsedBody = typeof body?.["body-plain"] === "string" || typeof body?.["body-html"] === "string";

    if (!body?.recipient || (!hasRawMime && !hasParsedBody) || !/^\d+$/.test(String(body.timestamp)) || !body.token || !/^[a-f\d]{64}$/i.test(body.signature || "")) {
        throw new PermanentIngestionError("Malformed Mailgun payload.");
    }

    const isAuthentic = verifyMailgunSignature({
        timestamp: body.timestamp,
        token: body.token,
        signature: body.signature,
        signingKey,
    });

    if (!isAuthentic) {
        throw new PermanentIngestionError("Invalid Mailgun signature.");
    }

    const recipient = canonicalizeRecipient(body.recipient);

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
    //check size
    const rawEmail = hasRawMime ? Buffer.from(body["body-mime"], "utf8") : null;
    if (rawEmail && rawEmail.length > MAX_MESSAGE_BYTES) {
        throw new PermanentIngestionError("Message exceeds size limit.")
    }

    const parsed = rawEmail
        ? await parseInboundEmail(rawEmail)
        : {
            fromAddress: getAddress(body.from || body.sender),
            fromName: getName(body.from),
            subject: body.subject || "No Subject",
            textBody: body["body-plain"] || "",
            htmlBody: body["body-html"] || "",
            attachments: [],
        };
    const attachmentBytes = parsed.attachments.reduce((total,item)=>total + item.sizeBytes,0)

    if (attachmentBytes > MAX_ATTACHMENT_BYTES) {
        throw new PermanentIngestionError("Attachment Exceeds Size Limit.")
    }

    const message = await prisma.message.create({
        data: {
            inboxId: inbox.id,
            fromAddress: parsed.fromAddress,
            fromName: parsed.fromName,
            toAddress: inbox.address,
            subject: parsed.subject,
            textBody: parsed.textBody,
            htmlBody: parsed.htmlBody,
            status: "PARSED",
            parsedAt: new Date(),
            expiresAt: inbox.expiresAt,
            sizeBytes: rawEmail?.length || Buffer.byteLength(parsed.textBody + parsed.htmlBody),
            rawSizeBytes: rawEmail?.length || null,
            attachments: {
                create: parsed.attachments.map((attachment) => ({
                    filename: attachment.filename,
                    contentType: attachment.contentType,
                    sizeBytes: attachment.sizeBytes,
                    checksum: attachment.checksum,
                    objectKey: `mailgun:${body.token}:${attachment.filename}`,
                    expiresAt: inbox.expiresAt,
                })),
            },
        },
    })

    publishMessage?.(inbox.id, message);

    return { message, duplicate: false };

}