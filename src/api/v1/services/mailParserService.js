import { simpleParser } from "mailparser";
import sanitizeHtml from "sanitize-html";

/**
 * Denylist model: every tag and attribute an email contains is preserved by
 * default (allowedTags/allowedAttributes set to `false`), so unknown, custom,
 * namespaced (VML `v:*`, `o:*`) and future tags survive untouched.
 *
 * Only constructs that can execute code or hijack the viewer are removed:
 *   script/iframe/object/embed/applet - arbitrary JS or nested documents
 *   base                              - would silently rewrite every relative URL
 *   form/input/button/textarea/select - credential phishing rendered inside the inbox
 *   meta http-equiv=refresh           - forces navigation away from the app
 * plus `on*` event-handler attributes and `javascript:`/`vbscript:` URLs.
 */
const BLOCKED_TAGS = new Set([
    "applet", "base", "button", "embed", "form", "frame", "frameset", "iframe",
    "input", "object", "script", "select", "textarea",
]);

// `data:` is deliberately absent from links: it would allow navigation to a
// data:text/html document. It stays available to images (see the per-tag map).
const LINK_SCHEMES = ["http", "https", "mailto", "tel", "sms", "callto", "webcal"];

const URL_SCHEMES = [
    ...LINK_SCHEMES, "cid", "data", "blob", "ftp", "ftps", "feed", "magnet",
];

const DANGEROUS_STYLE = /(?:expression\s*\(|(?:javascript|vbscript|mocha|livescript)\s*:|-moz-binding)/gi;

/**
 * Drop attribute-level script vectors. Applied to every element, including the
 * ones with their own transform.
 */
function scrubAttributes(attribs) {
    for (const rawName of Object.keys(attribs)) {
        const name = rawName.toLowerCase();

        if (name.startsWith("on") || name === "srcdoc" || name === "formaction") {
            delete attribs[rawName];
            continue;
        }

        // sanitize-html does not inspect CSS payloads inside `style`, so do it here.
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
        // Required for <style>; <script> is removed by the filter below, not by
        // this flag.
        allowVulnerableTags: true,
        allowedSchemes: URL_SCHEMES,
        allowedSchemesByTag: { a: LINK_SCHEMES, area: LINK_SCHEMES },
        allowedSchemesAppliedToAttributes: [
            "action", "background", "cite", "data", "formaction", "href",
            "longdesc", "poster", "src", "srcset", "xlink:href",
        ],
        allowProtocolRelative: true,
        // Preserve SVG camelCase (viewBox, preserveAspectRatio, gradientUnits).
        // Tag names stay lowercased so the denylist cannot be bypassed with
        // <SCRIPT> / <ScRiPt>.
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
            // <meta http-equiv="refresh">, whatever its casing.
            return frame.tag === "meta" && Object.entries(frame.attribs).some(
                ([name, value]) =>
                    name.toLowerCase() === "http-equiv" &&
                    String(value).toLowerCase() === "refresh",
            );
        },
    });
}

/**
 * Mailgun/mailparser keep inline (embedded) images as `cid:` references, which a
 * browser cannot resolve. Swap them for the matching attachment inlined as a
 * `data:` URI so they render without a public attachment endpoint.
 */
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
