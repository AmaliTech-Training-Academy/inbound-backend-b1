# Ticket T4–T5 — Mail ingestion & parsing

This is an implementation handoff for the first sprint ticket. It intentionally **does not change any application source file**. Copy the files below into the stated locations when implementation begins. It uses the official `mailgun.js` SDK to provision the inbound route; `mailparser` remains responsible for parsing the received RFC 822/MIME content because the Mailgun SDK is an HTTP API client, not a MIME parser.

## Outcome

`POST /api/v1/webhooks/mailgun/raw-mime` accepts a signed Mailgun raw-MIME callback, rejects unknown or expired recipients with `406`, parses the MIME with `mailparser`, sanitizes HTML, writes one `Message` and its `Attachment` records, and responds with `202`.

The route is deliberately named `raw-mime`: Mailgun's documented receiving behaviour supplies `body-mime` for forwarding URLs ending in `mime` or `raw-mime`. That preserves the original MIME body for `mailparser`, including attachment boundaries.

## Files to add or change

| Location | Action | Purpose |
|---|---|---|
| `package.json` | change | Runtime/test dependencies and scripts |
| `src/api/v1/index.js` | change | Register the raw-MIME body parser before routes |
| `src/api/v1/routes/router.js` | change | Mount webhook routes outside the inbox API |
| `src/api/v1/routes/webhookRoute.js` | add | Mailgun endpoint |
| `src/api/v1/controllers/mailgunWebhookController.js` | add | Webhook controller |
| `src/api/v1/services/mailIngestionService.js` | add | Validation, parse, persistence orchestration |
| `src/api/v1/services/mailParserService.js` | add | MIME parsing and HTML sanitizing |
| `src/api/v1/services/mailgunSignatureService.js` | add | HMAC/replay validation |
| `src/api/v1/services/mailgunClient.js` | add | Official Mailgun SDK client |
| `src/api/v1/services/objectStorage.js` | add | S3/R2 attachment storage adapter |
| `src/api/v1/utils/emailAddress.js` | add | Canonical recipient extraction |
| `src/api/v1/prisma/schema.prisma` | change | Add an idempotency key for Mailgun retries |
| `scripts/configure-mailgun-inbound-route.js` | add | Provision the Mailgun inbound route with `mailgun.js` |
| `test/fixtures/sample-with-attachment.eml` | add | Sample MIME message |
| `test/mailgunWebhook.test.js` | add | Ingestion, rejection, parsing, attachment tests |

## 1. Dependencies and scripts

In `package.json`, merge these entries. `node:test` is used, so no TypeScript or test runner is required.

```json
{
  "scripts": {
    "test": "node --test",
    "test:mail": "node --test test/mailgunWebhook.test.js"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.999.0",
    "form-data": "^4.0.4",
    "mailgun.js": "^13.0.0",
    "mailparser": "^3.9.0",
    "sanitize-html": "^2.17.0",
    "zod": "^4.3.0"
  },
  "devDependencies": {
    "supertest": "^7.1.4"
  }
}
```

Run `npm install`, then `npm run prisma:generate` after the schema change.

## 2. Schema change

In `src/api/v1/prisma/schema.prisma`, add Mailgun's unique token to `Message`. It makes successfully accepted retries idempotent; a duplicate callback returns the existing message rather than creating another message.

```prisma
model Message {
  id            String        @id @default(uuid())
  inboxId       String
  mailgunToken  String?       @unique
  fromAddress   String
  fromName      String?
  toAddress     String
  subject       String?
  textBody      String?
  htmlBody      String?
  rawHtmlSize   Int?
  rawObjectKey  String?
  status        MessageStatus @default(PENDING)
  receivedAt    DateTime      @default(now())
  expiresAt     DateTime
  sizeBytes     Int           @default(0)
  attachments   Attachment[]
  inbox         Inbox         @relation(fields: [inboxId], references: [id], onDelete: Cascade)

  @@index([inboxId, receivedAt])
  @@index([expiresAt])
}
```

Keep the existing `Attachment` and `IngestLog` models unchanged. Create a normal Prisma migration (rather than `db push`) in production.

## 3. App and route registration

### `src/api/v1/index.js` (replace)

`express.urlencoded` must appear before the router so Mailgun's urlencoded `body-mime` payload is available. The 30 MB ceiling is intentionally above the 25 MB service limit only to allow form encoding overhead.

```js
import "dotenv/config";
import express from "express";
import initRoute from "../v1/routes/initRoute.js";
import { v1Router } from "./routes/router.js";

const app = express();
const HOST = "0.0.0.0";
const PORT = process.env.PORT || 9001;

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "30mb" }));
app.use(initRoute);
app.use(v1Router);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });
}

export { app };
```

### `src/api/v1/routes/webhookRoute.js` (new)

```js
import express from "express";
import { createMailgunWebhookController } from "../controllers/mailgunWebhookController.js";
import prisma from "../../../configs/prisma.js";
import { createObjectStorage } from "../services/objectStorage.js";

const webhookRouter = express.Router();

webhookRouter.post(
  "/mailgun/raw-mime",
  createMailgunWebhookController({ prisma, storage: createObjectStorage() }),
);

export { webhookRouter };
```

### `src/api/v1/routes/router.js` (change)

Add the import and mount this route before the catch-all handler. Do not put it behind inbox bearer-token middleware.

```js
import { webhookRouter } from "./webhookRoute.js";

// after `const v1Router = express.Router();`
v1Router.use(`${API_VERSION}/webhooks`, webhookRouter);
```

## 4. Mailgun signature and recipient utilities

### `src/api/v1/services/mailgunClient.js` (new)

`mailgun.js` is used explicitly for Mailgun API operations such as route provisioning. It must never be used to send mail in this application.

```js
import formData from "form-data";
import Mailgun from "mailgun.js";

export function createMailgunClient() {
  if (!process.env.MAILGUN_API_KEY) {
    throw new Error("MAILGUN_API_KEY is required to configure Mailgun routes.");
  }

  const mailgun = new Mailgun(formData);
  return mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
    url: process.env.MAILGUN_API_BASE_URL || "https://api.mailgun.net",
  });
}
```

### `src/api/v1/services/mailgunSignatureService.js` (new)

```js
import crypto from "node:crypto";

const MAX_WEBHOOK_AGE_SECONDS = 5 * 60;

export function verifyMailgunSignature({ timestamp, token, signature, signingKey, now = Date.now() }) {
  if (!timestamp || !token || !signature || !signingKey) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isSafeInteger(timestampSeconds)) return false;
  if (Math.abs(Math.floor(now / 1000) - timestampSeconds) > MAX_WEBHOOK_AGE_SECONDS) return false;

  const expected = crypto
    .createHmac("sha256", signingKey)
    .update(`${timestamp}${token}`)
    .digest("hex");

  const received = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return received.length === expectedBuffer.length
    && crypto.timingSafeEqual(received, expectedBuffer);
}
```

### `src/api/v1/utils/emailAddress.js` (new)

```js
export function canonicalizeRecipient(value) {
  if (typeof value !== "string") return null;
  const candidate = value.trim().toLowerCase();
  const match = candidate.match(/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/);
  return match ? candidate : null;
}
```

## 5. MIME parser and object storage

### `src/api/v1/services/mailParserService.js` (new)

```js
import { simpleParser } from "mailparser";
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "a", "b", "blockquote", "br", "code", "div", "em", "h1", "h2", "h3",
  "hr", "img", "li", "ol", "p", "pre", "span", "strong", "table", "tbody",
  "td", "th", "thead", "tr", "u", "ul",
];

export async function parseInboundMime(rawMime) {
  const parsed = await simpleParser(rawMime, {
    skipHtmlToText: false,
    skipTextToHtml: true,
  });

  const rawHtml = parsed.html || null;
  const htmlBody = rawHtml
    ? sanitizeHtml(rawHtml, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: { a: ["href", "title"], img: ["alt", "title"], "*": ["class"] },
        allowedSchemes: ["http", "https", "mailto"],
        disallowedTagsMode: "discard",
        transformTags: {
          a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }, true),
        },
      })
    : null;

  return {
    fromAddress: parsed.from?.value?.[0]?.address?.toLowerCase() || "unknown@invalid",
    fromName: parsed.from?.value?.[0]?.name || null,
    subject: parsed.subject || null,
    textBody: parsed.text || null,
    htmlBody,
    rawHtmlSize: rawHtml ? Buffer.byteLength(rawHtml) : null,
    attachments: parsed.attachments.map((attachment) => ({
      filename: attachment.filename || "attachment",
      contentType: attachment.contentType || "application/octet-stream",
      sizeBytes: attachment.size,
      content: attachment.content,
      checksum: attachment.checksum || null,
    })),
  };
}
```

### `src/api/v1/services/objectStorage.js` (new)

This is a small T6-compatible boundary needed because `Attachment.objectKey` is already required by the present schema. It does not expose a download endpoint.

```js
import crypto from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export function createObjectStorage() {
  const client = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  return {
    async putRawMessage({ inboxId, messageId, body }) {
      const key = `inboxes/${inboxId}/messages/${messageId}/source.eml`;
      await client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: "message/rfc822",
        ContentLength: body.length,
      }));
      return key;
    },
    async putAttachment({ inboxId, messageId, filename, contentType, body }) {
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `inboxes/${inboxId}/messages/${messageId}/${crypto.randomUUID()}-${safeName}`;
      await client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        ContentLength: body.length,
      }));
      return key;
    },
  };
}
```

## 6. Ingestion service and controller

### `src/api/v1/services/mailIngestionService.js` (new)

The service checks the inbox before parsing or uploading data. `406` is reserved for permanent rejections, whereas unexpected failures propagate as `500` so Mailgun retries them.

```js
import { z } from "zod";
import { canonicalizeRecipient } from "../utils/emailAddress.js";
import { verifyMailgunSignature } from "./mailgunSignatureService.js";
import { parseInboundMime } from "./mailParserService.js";

const payloadSchema = z.object({
  recipient: z.string().min(3),
  "body-mime": z.string().min(1),
  timestamp: z.string().regex(/^\d+$/),
  token: z.string().min(1),
  signature: z.string().regex(/^[a-f0-9]{64}$/i),
});

const MAX_ATTACHMENT_BYTES = Number(process.env.MAX_ATTACHMENT_SIZE_MB || 10) * 1024 * 1024;
const MAX_MESSAGE_BYTES = Number(process.env.MAX_MESSAGE_SIZE_MB || 25) * 1024 * 1024;

export class PermanentIngestError extends Error {}

export async function ingestMailgunMessage({ body, prisma, storage, signingKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY }) {
  const input = payloadSchema.safeParse(body);
  if (!input.success) throw new PermanentIngestError("Malformed Mailgun payload.");
  if (!verifyMailgunSignature({ ...input.data, signingKey })) {
    throw new PermanentIngestError("Invalid Mailgun signature.");
  }

  const recipient = canonicalizeRecipient(input.data.recipient);
  if (!recipient) throw new PermanentIngestError("Invalid recipient.");

  const inbox = await prisma.inbox.findFirst({
    where: { address: recipient, isDeleted: false, expiresAt: { gt: new Date() } },
    select: { id: true, address: true, expiresAt: true },
  });
  if (!inbox) throw new PermanentIngestError("Unknown or expired inbox.");

  const duplicate = await prisma.message.findUnique({ where: { mailgunToken: input.data.token } });
  if (duplicate) return { message: duplicate, duplicate: true };

  const rawMime = Buffer.from(input.data["body-mime"], "utf8");
  if (rawMime.length > MAX_MESSAGE_BYTES) throw new PermanentIngestError("Message exceeds size limit.");

  const parsed = await parseInboundMime(rawMime);
  const attachmentBytes = parsed.attachments.reduce((total, item) => total + item.sizeBytes, 0);
  if (attachmentBytes > MAX_MESSAGE_BYTES || parsed.attachments.some((item) => item.sizeBytes > MAX_ATTACHMENT_BYTES)) {
    throw new PermanentIngestError("Attachment size limit exceeded.");
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
  });

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
```

### `src/api/v1/controllers/mailgunWebhookController.js` (new)

```js
import asyncHandler from "express-async-handler";
import { ingestMailgunMessage, PermanentIngestError } from "../services/mailIngestionService.js";

export function createMailgunWebhookController({ prisma, storage }) {
  return asyncHandler(async (req, res) => {
    try {
      const { message, duplicate } = await ingestMailgunMessage({ body: req.body, prisma, storage });
      res.status(duplicate ? 200 : 202).json({ success: true, messageId: message.id, duplicate });
    } catch (error) {
      if (error instanceof PermanentIngestError) {
        res.status(406).json({ success: false, error: error.message });
        return;
      }
      throw error;
    }
  });
}
```

## 7. Test fixture

### `test/fixtures/sample-with-attachment.eml` (new)

```eml
From: Ada Lovelace <ada@example.test>
To: inbox@example.test
Subject: Parsing test
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="mixed-boundary"

--mixed-boundary
Content-Type: multipart/alternative; boundary="alt-boundary"

--alt-boundary
Content-Type: text/plain; charset="utf-8"

Hello from the plain text body.

--alt-boundary
Content-Type: text/html; charset="utf-8"

<p>Hello from the <strong>HTML</strong> body.</p><script>alert('unsafe')</script>

--alt-boundary--
--mixed-boundary
Content-Type: text/plain; name="note.txt"
Content-Disposition: attachment; filename="note.txt"
Content-Transfer-Encoding: base64

YXR0YWNobWVudCBjb250ZW50Cg==
--mixed-boundary--
```

## 8. Unit test

### `test/mailgunWebhook.test.js` (new)

```js
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import express from "express";
import request from "supertest";
import { createMailgunWebhookController } from "../src/api/v1/controllers/mailgunWebhookController.js";

const signingKey = "test-signing-key";
const rawMime = await readFile(new URL("./fixtures/sample-with-attachment.eml", import.meta.url), "utf8");

function signedPayload(overrides = {}) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const token = "mailgun-retry-token-1";
  return {
    recipient: "inbox@example.test",
    "body-mime": rawMime,
    timestamp,
    token,
    signature: crypto.createHmac("sha256", signingKey).update(`${timestamp}${token}`).digest("hex"),
    ...overrides,
  };
}

function createPrisma({ inbox }) {
  const messages = [];
  const attachments = [];
  return {
    messages,
    attachments,
    inbox: { findFirst: async () => (inbox && inbox.expiresAt > new Date() ? inbox : null) },
    message: {
      findUnique: async ({ where }) => messages.find((item) => item.mailgunToken === where.mailgunToken) || null,
      create: async ({ data }) => {
        const value = { id: `message-${messages.length + 1}`, ...data };
        messages.push(value);
        return value;
      },
      update: async ({ where, data }) => {
        const message = messages.find((item) => item.id === where.id);
        Object.assign(message, data);
        return message;
      },
      delete: async ({ where }) => { messages.splice(messages.findIndex((item) => item.id === where.id), 1); },
    },
    attachment: { create: async ({ data }) => { attachments.push(data); return data; } },
  };
}

function appFor({ inbox }) {
  const prisma = createPrisma({ inbox });
  const uploaded = [];
  const storage = {
    putRawMessage: async (item) => { uploaded.push(item); return "test/source.eml"; },
    putAttachment: async (item) => { uploaded.push(item); return `test/${item.filename}`; },
  };
  const app = express();
  app.use(express.urlencoded({ extended: false, limit: "30mb" }));
  app.post("/api/v1/webhooks/mailgun/raw-mime", createMailgunWebhookController({ prisma, storage }));
  return { app, prisma, uploaded };
}

const activeInbox = { id: "inbox-1", address: "inbox@example.test", expiresAt: new Date(Date.now() + 60_000) };

test("ingests and parses a valid raw MIME message with an attachment", async () => {
  const { app, prisma, uploaded } = appFor({ inbox: activeInbox });
  const response = await request(app).post("/api/v1/webhooks/mailgun/raw-mime").type("form").send(signedPayload()).expect(202);

  assert.equal(response.body.success, true);
  assert.equal(prisma.messages.length, 1);
  assert.equal(prisma.messages[0].inboxId, "inbox-1");
  assert.equal(prisma.messages[0].fromAddress, "ada@example.test");
  assert.equal(prisma.messages[0].fromName, "Ada Lovelace");
  assert.equal(prisma.messages[0].subject, "Parsing test");
  assert.equal(prisma.messages[0].rawObjectKey, "test/source.eml");
  assert.match(prisma.messages[0].textBody, /plain text body/);
  assert.match(prisma.messages[0].htmlBody, /HTML/);
  assert.doesNotMatch(prisma.messages[0].htmlBody, /script/i);
  assert.equal(prisma.attachments.length, 1);
  assert.equal(prisma.attachments[0].filename, "note.txt");
  assert.equal(uploaded[0].body.toString(), rawMime);
  assert.equal(uploaded[1].body.toString(), "attachment content\n");
});

test("rejects mail for an unknown inbox without creating a message", async () => {
  const { app, prisma } = appFor({ inbox: null });
  await request(app).post("/api/v1/webhooks/mailgun/raw-mime").type("form").send(signedPayload()).expect(406);
  assert.equal(prisma.messages.length, 0);
});

test("rejects mail for an expired inbox without creating a message", async () => {
  const expired = { ...activeInbox, expiresAt: new Date(Date.now() - 60_000) };
  const { app, prisma } = appFor({ inbox: expired });
  await request(app).post("/api/v1/webhooks/mailgun/raw-mime").type("form").send(signedPayload()).expect(406);
  assert.equal(prisma.messages.length, 0);
});
```

## 9. DNS and Mailgun configuration

1. Add the MX records Mailgun shows for the verified inbound domain (usually `mxa.mailgun.org` and `mxb.mailgun.org`, priority 10). Do not invent DNS values; copy the exact records from the Mailgun domain-verification page.
2. Verify the domain in Mailgun and wait for its MX status to become active.
3. Provision the inbound Route with the official SDK. Add this file as `scripts/configure-mailgun-inbound-route.js`:

   ```js
   import "dotenv/config";
   import { createMailgunClient } from "../src/api/v1/services/mailgunClient.js";

   const domain = process.env.INBOX_DOMAIN;
   const publicHost = process.env.APP_BASE_URL;
   if (!domain || !publicHost) throw new Error("INBOX_DOMAIN and APP_BASE_URL are required.");
   const escapedDomain = domain.replace(/\./g, "\\\\.");

   const mailgun = createMailgunClient();
   const route = await mailgun.routes.create({
     priority: 0,
     description: `Temporary inbox raw-MIME ingestion for ${domain}`,
     expression: `match_recipient(".*@${escapedDomain}")`,
     action: [
       `forward("${publicHost.replace(/\\/$/, "")}/api/v1/webhooks/mailgun/raw-mime")`,
       "stop()",
     ],
   });
   console.log(`Created Mailgun route: ${route.id}`);
   ```

   Add this script to `package.json`:

   ```json
   { "scripts": { "mailgun:configure-inbound": "node scripts/configure-mailgun-inbound-route.js" } }
   ```

   Run `npm run mailgun:configure-inbound` once after the domain is verified. The raw-MIME suffix is essential: it makes Mailgun send the `body-mime` field consumed by `mailparser`.

4. Set `MAILGUN_API_KEY` for the one-time route provisioning script, and `MAILGUN_WEBHOOK_SIGNING_KEY` to the **Webhook Signing Key** for the receiver; they are separate credentials. Set the S3/R2 variables in the existing environment documentation.
5. Ensure the reverse proxy accepts at least 30 MB for this path (`client_max_body_size 30m` in Nginx). HTTPS is required for production callbacks.
6. For local development, expose the server via an HTTPS tunnel and temporarily configure the Route target to the tunnel URL. Never disable webhook signature verification.

Mailgun treats `200` as success and `406` as a non-retryable rejection; the controller uses `202` for a newly stored accepted message and `200` for a recognized replay.

## Verification checklist

```bash
npm install
npm run prisma:generate
npm test
```

- Valid signed raw-MIME email creates exactly one message under the active recipient inbox.
- Unknown and expired recipients produce `406` and no message/attachment rows.
- Fixture assertions prove sender, subject, text, sanitized HTML, and attachment bytes are parsed.
- Invalid/replayed/out-of-window signatures produce `406`.
- No outbound-mail code, SMTP transport, or send endpoint is introduced.

## Follow-on boundaries

This ticket intentionally does not add BullMQ jobs, WebSocket publishing, attachment download URLs, or expiry cleanup; those are tickets T6–T8. The `storage` dependency is injected so T6 can add queueing/object lifecycle without changing the externally visible webhook contract.
