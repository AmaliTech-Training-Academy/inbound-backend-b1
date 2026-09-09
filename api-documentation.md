# Temp Inbox Service — API Documentation

A disposable/temporary email inbox platform. Users generate a throwaway address, receive mail in real time over WebSockets, view sanitized message bodies + attachments, and let inboxes auto-expire and hard-delete.

**Stack:** Express · PostgreSQL · Prisma · ws (WebSockets) · Redis · BullMQ · mailparser · S3/R2 · Zod · node-cron · Docker · OpenAPI/Swagger · Cloudflare/Nginx (reverse proxy for inbound mail)

**Language:** JavaScript only (no TypeScript). Zod is used for runtime request/response validation instead of static types.

---

## 1. High-Level Architecture

```
                        ┌────────────────────┐
   Inbound email  ───▶  │ Cloudflare / Nginx │  (MX + inbound-parse webhook,
   (SMTP / MX)          │  reverse proxy      │   or local dev SMTP server)
                        └─────────┬──────────┘
                                  │ POST /webhooks/inbound-email
                                  ▼
                        ┌────────────────────┐        ┌───────────────┐
                        │   Express API       │──────▶ │  PostgreSQL   │
                        │  (REST + Auth)       │        │  (Prisma)     │
                        └─────────┬──────────┘        └───────────────┘
                                  │ enqueue "parse-email" job
                                  ▼
                        ┌────────────────────┐        ┌───────────────┐
                        │  BullMQ Worker       │──────▶ │  Redis        │
                        │ (mailparser, sanitize│        │ (queue/state) │
                        │  HTML, store blobs)  │        └───────────────┘
                                  │                          │
                                  ▼                          │
                        ┌────────────────────┐               │
                        │ S3 / Cloudflare R2  │               │
                        │ (attachment blobs)  │               │
                        └────────────────────┘               │
                                  │                            │
                                  ▼                            │
                        ┌────────────────────┐                 │
                        │  WebSocket Server    │◀────publish────┘
                        │ (per-inbox channels) │   (Redis pub/sub)
                        └─────────┬──────────┘
                                  ▼
                             Frontend client

                        ┌────────────────────┐
                        │ node-cron worker     │──▶ hard-deletes expired
                        │ (expiry sweep)        │    inboxes/messages/attachments
                        └────────────────────┘
```

No outbound-send path exists anywhere in this system by design (T10 requirement).

---

## 2. Database Schema (Prisma)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Inbox {
  id         String     @id @default(uuid())
  address    String     @unique              // e.g. "swift-otter-482@tempmail.dev"
  localPart  String                          // "swift-otter-482" (indexed for regen retries)
  domain     String                          // "tempmail.dev"
  token      String     @unique              // bearer token to manage this inbox from frontend
  createdAt  DateTime   @default(now())
  expiresAt  DateTime                        // extendable
  lastExtendedAt DateTime?
  extendCount    Int    @default(0)          // cap extensions to prevent indefinite inboxes
  isDeleted  Boolean    @default(false)      // soft flag before hard delete sweep
  messages   Message[]

  @@index([expiresAt])
  @@index([address])
}

model Message {
  id           String       @id @default(uuid())
  inboxId      String
  inbox        Inbox        @relation(fields: [inboxId], references: [id], onDelete: Cascade)

  fromAddress  String
  fromName     String?
  toAddress    String
  subject      String?
  textBody     String?      // plain text
  htmlBody     String?      // sanitized HTML (safe to render)
  rawHtmlSize  Int?         // bytes, pre-sanitization, for auditing
  rawObjectKey String?      // S3/R2 key of the original raw .eml, for debugging/reprocessing

  status       MessageStatus @default(PENDING) // PENDING -> PARSED -> FAILED
  receivedAt   DateTime     @default(now())
  expiresAt    DateTime                        // inherited from inbox at ingestion time
  sizeBytes    Int          @default(0)

  attachments  Attachment[]

  @@index([inboxId, receivedAt])
  @@index([expiresAt])
}

enum MessageStatus {
  PENDING
  PARSED
  FAILED
}

model Attachment {
  id           String   @id @default(uuid())
  messageId    String
  message      Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)

  filename     String
  contentType  String
  sizeBytes    Int
  objectKey    String   // S3/R2 storage key
  checksum     String?  // sha256, for de-dup / integrity check
  createdAt    DateTime @default(now())
  expiresAt    DateTime // mirrors parent message expiry

  @@index([messageId])
  @@index([expiresAt])
}

model IngestLog {
  id            String   @id @default(uuid())
  rawObjectKey  String?
  recipient     String
  accepted      Boolean
  rejectReason  String?
  createdAt     DateTime @default(now())

  @@index([createdAt])
}
```

### Field type summary (for frontend contracts)

| Model | Field | Type | Notes |
|---|---|---|---|
| Inbox | id | UUID string | primary key |
| Inbox | address | string | full email address |
| Inbox | token | string (secret) | only returned once, on creation |
| Inbox | createdAt / expiresAt / lastExtendedAt | ISO 8601 string | |
| Inbox | extendCount | integer | |
| Message | fromAddress, toAddress | string | |
| Message | subject, fromName | string \| null | |
| Message | textBody, htmlBody | string \| null | htmlBody is sanitized |
| Message | status | enum: `PENDING`\|`PARSED`\|`FAILED` | |
| Message | sizeBytes | integer | |
| Attachment | filename, contentType | string | |
| Attachment | sizeBytes | integer | enforce max (e.g. 10 MB/file, 25 MB/message) |
| Attachment | objectKey | string | never exposed raw; served via signed download URL |

---

## 3. Environment Variables

```
# App
PORT=3000
NODE_ENV=production
APP_BASE_URL=https://tempmail.dev
INBOX_DOMAIN=tempmail.dev
JWT_OR_TOKEN_SECRET=<random-256-bit>

# Postgres
DATABASE_URL=postgresql://user:pass@postgres:5432/tempmail

# Redis / BullMQ
REDIS_URL=redis://redis:6379

# Object storage (S3-compatible / Cloudflare R2)
S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
S3_BUCKET=tempmail-attachments
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_REGION=auto

# Inbound mail
INBOUND_PROVIDER=postmark|mailgun|sendgrid|local-smtp
INBOUND_WEBHOOK_SECRET=<verifies signature of inbound-parse POST>
LOCAL_SMTP_PORT=2525   # only used in dev mode

# Limits
DEFAULT_INBOX_TTL_MINUTES=30
MAX_EXTENDS=3
EXTEND_TTL_MINUTES=15
MAX_ATTACHMENT_SIZE_MB=10
MAX_MESSAGE_SIZE_MB=25

# Cleanup
CLEANUP_CRON="*/5 * * * *"
```

---

## 4. REST API

Base URL: `/api/v1`
All responses are JSON. Errors follow:
```json
{ "error": { "code": "INBOX_NOT_FOUND", "message": "Inbox does not exist or has expired." } }
```

Auth model: creating an inbox returns a **token**. Mutating/reading a specific inbox (`GET`, `extend`, `DELETE`) requires either the token in `Authorization: Bearer <token>` header, or the inbox `id` if you treat it as capability-based (recommend token-based for stronger guessing-resistance).

### 4.1 `POST /inboxes`
Generate a new disposable inbox.

**Request body (Zod: `createInboxSchema`)**
```js
z.object({
  ttlMinutes: z.number().int().min(5).max(120).optional(), // default DEFAULT_INBOX_TTL_MINUTES
  preferredLocalPart: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/).optional() // best-effort, falls back to random on collision
})
```

**Response `201`**
```json
{
  "id": "b6e1...",
  "address": "swift-otter-482@tempmail.dev",
  "token": "tmi_9f2c...",   // shown ONLY here — store client-side
  "createdAt": "2026-09-09T10:00:00.000Z",
  "expiresAt": "2026-09-09T10:30:00.000Z"
}
```

### 4.2 `GET /inboxes/:id`
Fetch inbox metadata + its messages (paginated).

**Auth:** Bearer token required.

**Query params:** `?cursor=<messageId>&limit=20`

**Response `200`**
```json
{
  "id": "b6e1...",
  "address": "swift-otter-482@tempmail.dev",
  "createdAt": "2026-09-09T10:00:00.000Z",
  "expiresAt": "2026-09-09T10:30:00.000Z",
  "extendCount": 0,
  "messages": [
    {
      "id": "m1...",
      "fromAddress": "no-reply@github.com",
      "fromName": "GitHub",
      "subject": "Verify your email",
      "receivedAt": "2026-09-09T10:05:00.000Z",
      "hasAttachments": false,
      "status": "PARSED"
    }
  ],
  "nextCursor": null
}
```
`404 INBOX_NOT_FOUND` if missing/expired/deleted.

### 4.3 `GET /inboxes/:id/messages/:messageId`
Full message detail including sanitized `htmlBody`, `textBody`, and attachment metadata.

**Response `200`**
```json
{
  "id": "m1...",
  "fromAddress": "no-reply@github.com",
  "fromName": "GitHub",
  "toAddress": "swift-otter-482@tempmail.dev",
  "subject": "Verify your email",
  "textBody": "Click the link below...",
  "htmlBody": "<div>...(sanitized)...</div>",
  "receivedAt": "2026-09-09T10:05:00.000Z",
  "attachments": [
    { "id": "a1...", "filename": "invoice.pdf", "contentType": "application/pdf", "sizeBytes": 48213 }
  ]
}
```

### 4.4 `POST /inboxes/:id/extend`
Extend expiry. Capped by `MAX_EXTENDS`.

**Request body**
```js
z.object({ extendMinutes: z.number().int().min(5).max(60).optional() }) // default EXTEND_TTL_MINUTES
```

**Response `200`**
```json
{ "id": "b6e1...", "expiresAt": "2026-09-09T10:45:00.000Z", "extendCount": 1 }
```
`409 EXTEND_LIMIT_REACHED` once `extendCount >= MAX_EXTENDS`.

### 4.5 `DELETE /inboxes/:id`
Immediate hard delete (cascades to messages/attachments, removes S3 objects).

**Response:** `204 No Content`

### 4.6 `GET /inboxes/:id/messages/:messageId/attachments/:attachmentId`
Returns a short-lived signed download URL rather than streaming the file directly through the API process.

**Response `200`**
```json
{ "downloadUrl": "https://r2.../invoice.pdf?X-Amz-Expires=300&...", "expiresIn": 300 }
```

### 4.7 `POST /webhooks/inbound-email` (internal, provider-facing)
Receives inbound-parse payload (or local SMTP handoff translated into the same shape). Not part of the public/frontend API — protected by `INBOUND_WEBHOOK_SECRET` signature verification, not user auth.

**Request:** raw MIME (`multipart/form-data` or raw body depending on provider) containing recipient, sender, and message payload.

**Behavior:**
1. Verify webhook signature.
2. Resolve `recipient` → active, non-expired `Inbox`. If not found: log to `IngestLog` with `accepted: false`, respond `200` anyway (avoid provider retry storms) or `404` for local SMTP mode.
3. Store raw MIME to object storage (`rawObjectKey`), create `Message` row with `status: PENDING`.
4. Enqueue `parse-email` BullMQ job with `{ messageId, rawObjectKey }`.
5. Respond `202 Accepted`.

### 4.8 `GET /healthz`
Liveness/readiness probe for Docker/orchestrator. Checks DB + Redis connectivity.

---

## 5. Zod Schemas (shared validation layer)

```js
// src/validation/inbox.schema.js
import { z } from 'zod';

export const createInboxSchema = z.object({
  ttlMinutes: z.number().int().min(5).max(120).optional(),
  preferredLocalPart: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/).optional(),
});

export const extendInboxSchema = z.object({
  extendMinutes: z.number().int().min(5).max(60).optional(),
});

export const paginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const inboundEmailSchema = z.object({
  recipient: z.string().email(),
  sender: z.string().email(),
  subject: z.string().optional(),
  rawMime: z.string(), // base64 or raw text depending on provider
});
```

Express middleware pattern:
```js
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: result.error.issues[0].message, issues: result.error.issues },
    });
  }
  req[source] = result.data;
  next();
};
```

---

## 6. Address Generator (T3)

```js
// src/services/addressGenerator.js
import { customAlphabet } from 'nanoid';
import prisma from '../db/prisma.js';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);
const MAX_RETRIES = 5;

export async function generateUniqueAddress(domain, preferredLocalPart) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const localPart = attempt === 0 && preferredLocalPart
      ? `${preferredLocalPart}-${nanoid(4)}`
      : nanoid();
    const address = `${localPart}@${domain}`;
    const existing = await prisma.inbox.findUnique({ where: { address } });
    if (!existing) return { address, localPart };
  }
  throw new Error('ADDRESS_GENERATION_FAILED');
}
```
Uniqueness is enforced both at the application level (retry loop) and the database level (`@unique` constraint) to close the race-condition window.

---

## 7. WebSocket Protocol (T7)

**Connect:** `wss://tempmail.dev/ws?inboxId=<id>&token=<token>`

Server validates token against the inbox, subscribes the socket to a Redis pub/sub channel named `inbox:<id>`. When the BullMQ worker finishes parsing a message, it publishes to that channel; the WS server relays to all connected sockets for that inbox.

**Server → Client events**
```json
{ "type": "message:new", "payload": { "id": "m1...", "fromAddress": "...", "subject": "...", "receivedAt": "..." } }
```
```json
{ "type": "inbox:expiring_soon", "payload": { "expiresAt": "2026-09-09T10:30:00.000Z" } }
```
```json
{ "type": "inbox:expired", "payload": { "id": "b6e1..." } }
```

**Client → Server events**
```json
{ "type": "ping" }
```
```json
{ "type": "subscribe", "payload": { "inboxId": "b6e1...", "token": "tmi_..." } }
```

Reconnect strategy on the frontend: exponential backoff, re-`subscribe` on reconnect, and reconcile by re-fetching `GET /inboxes/:id` in case events were missed while disconnected.

---

## 8. Background Jobs

### 8.1 BullMQ — `parse-email` queue (T5)
```js
// src/queues/parseEmail.worker.js
import { Worker } from 'bullmq';
import { simpleParser } from 'mailparser';
import sanitizeHtml from 'sanitize-html';

new Worker('parse-email', async (job) => {
  const { messageId, rawObjectKey } = job.data;
  const raw = await downloadFromObjectStorage(rawObjectKey);
  const parsed = await simpleParser(raw);

  const safeHtml = parsed.html
    ? sanitizeHtml(parsed.html, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']), allowedSchemes: ['http','https','mailto','data'] })
    : null;

  const attachments = [];
  for (const att of parsed.attachments ?? []) {
    if (att.size > MAX_ATTACHMENT_SIZE_BYTES) continue; // enforce limit
    const objectKey = await uploadToObjectStorage(att.content, att.filename, att.contentType);
    attachments.push({ filename: att.filename, contentType: att.contentType, sizeBytes: att.size, objectKey, checksum: sha256(att.content) });
  }

  await persistParsedMessage({ messageId, from: parsed.from, subject: parsed.subject, text: parsed.text, html: safeHtml, attachments });
  await redisPublish(`inbox:${inboxIdFor(messageId)}`, { type: 'message:new', payload: {/* summary */} });
}, { connection: redisConnection, concurrency: 5 });
```

### 8.2 node-cron — expiry sweep (T8)
```js
// src/jobs/cleanup.cron.js
import cron from 'node-cron';

cron.schedule(process.env.CLEANUP_CRON, async () => {
  const now = new Date();
  const expiredInboxes = await prisma.inbox.findMany({ where: { expiresAt: { lt: now } }, select: { id: true } });

  for (const { id } of expiredInboxes) {
    const attachments = await prisma.attachment.findMany({ where: { message: { inboxId: id } } });
    await Promise.all(attachments.map((a) => deleteFromObjectStorage(a.objectKey)));
    await prisma.inbox.delete({ where: { id } }); // cascades Message + Attachment rows
  }
});
```

---

## 9. Frontend Integration Contract

Minimal client-facing surface the frontend needs:

| Action | Endpoint | Notes |
|---|---|---|
| Generate address | `POST /inboxes` | store `token` + `id` in memory/localStorage |
| List/poll inbox | `GET /inboxes/:id` | used for initial load / reconnect reconciliation |
| Live updates | `WSS /ws?inboxId&token` | primary channel for new mail |
| Read message | `GET /inboxes/:id/messages/:messageId` | render `htmlBody` in a **sandboxed iframe** (`sandbox="allow-same-origin"` only, no scripts) even though it's server-sanitized |
| Download attachment | `GET .../attachments/:attachmentId` | returns signed URL, not the file itself |
| Extend | `POST /inboxes/:id/extend` | disable button once `extendCount === MAX_EXTENDS` |
| New address | `POST /inboxes` again | discard old token/socket, open new WS subscription |

Suggested frontend state shape (framework-agnostic):
```js
{
  inbox: { id, address, token, createdAt, expiresAt, extendCount },
  messages: [ { id, fromAddress, fromName, subject, receivedAt, status, hasAttachments } ],
  activeMessage: { /* full detail incl. htmlBody/textBody/attachments */ } | null,
  connectionStatus: 'connecting' | 'open' | 'closed'
}
```

---

## 10. OpenAPI / Swagger

Serve interactive docs at `GET /docs` via `swagger-ui-express`, generated from `openapi.yaml`:

```yaml
openapi: 3.0.3
info:
  title: Temp Inbox API
  version: 1.0.0
servers:
  - url: /api/v1
paths:
  /inboxes:
    post:
      summary: Create a disposable inbox
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                ttlMinutes: { type: integer, minimum: 5, maximum: 120 }
                preferredLocalPart: { type: string }
      responses:
        '201':
          description: Inbox created
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: { type: string, format: uuid }
                  address: { type: string }
                  token: { type: string }
                  createdAt: { type: string, format: date-time }
                  expiresAt: { type: string, format: date-time }
  /inboxes/{id}:
    get:
      summary: Get inbox + messages
      security: [{ bearerAuth: [] }]
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200': { description: OK }
        '404': { description: Not found or expired }
    delete:
      summary: Delete inbox immediately
      security: [{ bearerAuth: [] }]
      responses:
        '204': { description: Deleted }
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```
(Full spec would enumerate every route in section 4; kept abbreviated here.)

---

## 11. Project Structure

```
temp-inbox/
├── docker-compose.yml
├── Dockerfile
├── openapi.yaml
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app.js
│   ├── server.js                # http + ws upgrade
│   ├── config/env.js
│   ├── db/prisma.js
│   ├── redis/client.js
│   ├── routes/
│   │   ├── inboxes.routes.js
│   │   ├── messages.routes.js
│   │   └── webhooks.routes.js
│   ├── controllers/
│   ├── services/
│   │   ├── addressGenerator.js
│   │   ├── objectStorage.js
│   │   └── mailIngest.js
│   ├── validation/*.schema.js
│   ├── queues/
│   │   ├── parseEmail.queue.js
│   │   └── parseEmail.worker.js
│   ├── jobs/cleanup.cron.js
│   ├── ws/server.js
│   └── middleware/{auth,validate,errorHandler}.js
├── tests/
│   ├── addressGenerator.test.js
│   ├── mailIngest.test.js
│   ├── websocket.test.js
│   ├── cleanup.test.js
│   └── noSendPath.test.js
└── README.md
```

---

## 12. Docker Compose (skeleton)

```yaml
services:
  api:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [postgres, redis]
  worker:
    build: .
    command: node src/queues/parseEmail.worker.js
    env_file: .env
    depends_on: [postgres, redis]
  cron:
    build: .
    command: node src/jobs/cleanup.cron.js
    env_file: .env
    depends_on: [postgres]
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: tempmail
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes: [pgdata:/var/lib/postgresql/data]
  redis:
    image: redis:7
volumes:
  pgdata:
```

---

## 13. Testing Plan (T10)

| Test | What it proves |
|---|---|
| `addressGenerator.test.js` | Collisions trigger retry; final address is unique and matches pattern |
| `mailIngest.test.js` | A fixture `.eml` with an attachment is ingested → `Message.status === 'PARSED'`, attachment row created, HTML sanitized (script tags stripped) |
| `websocket.test.js` | A connected client subscribed to an inbox receives a `message:new` event within a timeout after ingestion |
| `cleanup.test.js` | An inbox/message/attachment with `expiresAt` in the past is hard-deleted (DB row gone, object-storage key deleted) after cron run |
| `noSendPath.test.js` | Asserts no outbound-mail route, controller, or SMTP client exists in the codebase (e.g. grep-based check or route table introspection) — confirms the service cannot send mail |

Suggested tooling: **Vitest** or **Jest** (plain JS, no TS), `supertest` for HTTP, `ws` client for socket tests, a Postgres test database reset between runs (via `prisma migrate reset` or a transaction-rollback pattern).

---

## 14. Security Notes

- Inbox `token` is a capability secret — treat like a password; never log it, only return it once on creation.
- Local part generation uses a cryptographically random alphabet (`nanoid`) to prevent guessing.
- All inbound HTML is sanitized server-side before storage (defense in depth: also sandbox the iframe client-side).
- Attachment downloads go through short-lived signed URLs, not proxied through the API, to limit blast radius and bandwidth cost.
- Inbound webhook endpoint verifies a provider signature/secret — it is not user-authenticated and must not trust the `recipient` field blindly beyond resolving it to a real, non-expired inbox.
- Rate-limit `POST /inboxes` per IP to prevent inbox-creation abuse.
