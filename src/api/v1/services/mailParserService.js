import { simpleParser } from "mailparser";
import sanitizeHtml from "sanitize-html";

export function sanitizeHtmlBody(html) {
    return sanitizeHtml(html || "", {
        allowedTags: false,
        allowedAttributes: false,
        allowedStyles: {
            '*': {
                '.*': [/.*/]
            }
        },
        
        allowedSchemes: ["http", "https", "mailto", "data"], // Added data for base64 inline images
        disallowedTagsMode: "discard",
        transformTags: {
            a: sanitizeHtml.simpleTransform("a", {
                rel: "noopener noreferrer",
                target: "_blank",
            }, true),
        },
    });
}

export async function parseInboundEmail(rawEmail){
    const parsedEmail = await simpleParser(rawEmail, {
        skipHtmlToText: false,
        skipTextToHtml: true,
    });
    
    const rawHtml = parsedEmail.html || "";
    const htmlBody = sanitizeHtmlBody(rawHtml);

    return {
        fromAddress: parsedEmail.from?.value?.[0]?.address?.toLowerCase() || "unknown",
        fromName: parsedEmail.from?.value?.[0]?.name || "unknown",
        subject: parsedEmail.subject || "No Subject",
        textBody: parsedEmail.text || "",
        htmlBody: htmlBody,
        rawHtmlSize: rawHtml ? Buffer.byteLength(rawHtml) : null,
        attachments: parsedEmail.attachments.map(attachment =>({
            filename: attachment.filename || "attachment",
            contentType: attachment.contentType || "application/octet-stream",
            sizeBytes: attachment.size,
            content: attachment.content,
            checksum: attachment.checksum || null
        })),
    };
}
