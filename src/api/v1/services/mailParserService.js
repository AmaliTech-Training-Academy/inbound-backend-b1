import { simpleParser } from "mailparser";
import sanitizeHtml from "sanitize-html";


const BLOCKED_TAGS = new Set([
    "applet", "base", "button", "embed", "form", "frame", "frameset", "iframe",
    "input", "object", "script", "select", "textarea",
]);

const LINK_SCHEMES = ["http", "https", "mailto", "tel", "sms", "callto", "webcal"];

const URL_SCHEMES = [
    ...LINK_SCHEMES, "cid", "data", "blob", "ftp", "ftps", "feed", "magnet",
];

const DANGEROUS_STYLE = /(?:expression\s*\(|(?:javascript|vbscript|mocha|livescript)\s*:|-moz-binding)/gi;

function scrubAttributes(attribs) {
    for (const rawName of Object.keys(attribs)) {
        const name = rawName.toLowerCase();

        if (name.startsWith("on") || name === "srcdoc" || name === "formaction") {
            delete attribs[rawName];
            continue;
        }

        if (name === "style" && typeof attribs[rawName] === "string") {
            attribs[rawName] = attribs[rawName].replace(DANGEROUS_STYLE, "/*blocked*/");
        }
    }
    return attribs;
}

export function sanitizeHtmlBody(html) {
    return sanitizeHtml(html || "", {
        allowedTags: false,
        allowedAttributes: false,
        allowVulnerableTags: true,
        allowedSchemes: URL_SCHEMES,
        allowedSchemesByTag: { a: LINK_SCHEMES, area: LINK_SCHEMES },
        allowedSchemesAppliedToAttributes: [
            "action", "background", "cite", "data", "formaction", "href",
            "longdesc", "poster", "src", "srcset", "xlink:href",
        ],
        allowProtocolRelative: true,
        parser: { lowerCaseAttributeNames: false },
        disallowedTagsMode: "discard",
        transformTags: {
            "*": (tagName, attribs) => ({ tagName, attribs: scrubAttributes(attribs) }),
            a: (tagName, attribs) => ({
                tagName,
                attribs: {
                    ...scrubAttributes(attribs),
                    rel: "noopener noreferrer",
                    target: "_blank",
                },
            }),
        },
        exclusiveFilter: (frame) => {
            if (BLOCKED_TAGS.has(String(frame.tag).toLowerCase())) return true;

            return frame.tag === "meta" && Object.entries(frame.attribs).some(
                ([name, value]) =>
                    name.toLowerCase() === "http-equiv" &&
                    String(value).toLowerCase() === "refresh",
            );
        },
    });
}

function inlineCidImages(html, attachments) {
    if (!html || !html.includes("cid:")) return html;

    const cidMap = new Map();
    for (const attachment of attachments) {
        const contentId = attachment.cid || attachment.contentId;
        if (!contentId || !Buffer.isBuffer(attachment.content)) continue;

        const key = String(contentId)
            .replace(/^</, "")
            .replace(/>$/, "")
            .trim()
            .toLowerCase();

        const contentType = attachment.contentType || "application/octet-stream";
        cidMap.set(key, `data:${contentType};base64,${attachment.content.toString("base64")}`);
    }

    if (cidMap.size === 0) return html;

    return html.replace(/cid:\s*([^"'\s)>]+)/gi, (match, rawId) => {
        let id = rawId;
        try {
            id = decodeURIComponent(rawId);
        } catch {
            // Malformed escape - fall back to the raw value.
        }
        return cidMap.get(id.trim().toLowerCase()) || match;
    });
}

export async function parseInboundEmail(rawEmail){
    const parsedEmail = await simpleParser(rawEmail, {
        skipHtmlToText: false,
        skipTextToHtml: true,
    });

    const rawHtml = parsedEmail.html || "";
    const withInlineImages = inlineCidImages(rawHtml, parsedEmail.attachments || []);
    const htmlBody = sanitizeHtmlBody(withInlineImages);

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
