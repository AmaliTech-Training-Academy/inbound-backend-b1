import {simpleParser} from "mailparser";
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
    "a", "b", "blockquote", "br", "code", "div", "em", "h1", "h2", "h3",
    "hr", "img", "li", "ol", "p", "pre", "span", "strong", "table", "tbody",
    "td", "th", "thead", "tr", "u", "ul",
];

export async function parseInboundEmail(rawEmail){
    const parsedEmail = await simpleParser(rawEmail, {
        skipHtmlToText: false,
        skipTextToHtml: true,
    });
    
    const rawHtml = parsedEmail.html || "";
    const htmlBody = rawHtmml ? sanitizeHtml(rawHtml,{
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: {
            a: ["href", "name", "target"],
            img: ["src", "alt"],
            "*": ["class"],
        },
        allowedSchemes: ["http", "https", "mailto"],
        disallowedTagsMode: "discard",
        transformTags:{
            a: sanitizeHtml.simpleTransform("a",{
                rel: "noopener noreferrer",
                target: "_blank"
            },true)
        }
    }) : "";

    return {
        formAddress: parsedEmail.from?.value?.[0]?.address?.toLowerCase() || "unknown",
        fromName: parsedEmail.from?.value?.[0]?.name || "unknown",
        subject: parsedEmail.subject || "No Subject",
        textBody: parsedEmail.text || "",
        htmlBody: htmlBody,
        rawHtmlSize: rawHtml ? Buffer.byteLength(rawHtml) : null,
        attachments: parsedEmail.attachments.map(attachment =>({
            filename: attachment.filename || "attachment",
            contentType: attachment.contentType || "application/octet-stream",
            sizeBytes: attachment.size,
            objectKey: attachment.content,
            checksum: attachment.checksum || null
        })),

    };
} 