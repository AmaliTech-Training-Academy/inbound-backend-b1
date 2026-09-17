# Inbound Email API

Formal technical documentation for the temporary inbound-email service in this repository.

The service creates short-lived email inboxes, accepts inbound Mailgun messages, parses and sanitizes email content, stores message metadata in PostgreSQL through Prisma, and exposes the inbox through a REST API. Socket.IO support is included for inbox subscriptions.

## 1. Product Scope

### Implemented

- Temporary inbox creation with generated email addresses.
- Bearer-token access to an inbox and its messages.
- Inbox expiration and fixed five-minute extensions.
- Mailgun raw-MIME webhook ingestion.
- Mailgun signature verification with a five-minute freshness window.
- MIME parsing with `mailparser`.
- HTML sanitization with an explicit allowlist of tags, attributes, and URL schemes.
- Message and attachment metadata persistence in PostgreSQL through Prisma.
- Socket.IO room subscriptions scoped to an inbox.
- Swagger UI at `/api-docs`.
- Vitest unit tests for message-controller behavior and Socket.IO behavior.

### Not implemented

The current codebase does not implement outbound email, background cleanup, Redis/BullMQ workers, object-storage uploads, signed attachment downloads, pagination, inbox deletion endpoints, or automatic publication of ingested messages to Socket.IO clients.

Attachment records contain an `objectKey`, but attachment bytes are not uploaded to object storage by the current ingestion service.

## 2. Runtime Architecture

```text
Mail provider or simulator
          |
          | POST multipart/form-data
          v
Express HTTP server :9001
          |
          +--> Mailgun signature validation
          +--> Recipient and inbox validation
          +--> MIME parsing and HTML sanitization
          +--> PostgreSQL through Prisma
          |
          +--> Socket.IO server on the same HTTP server
```

The application is an ES module Node.js service. It listens on `0.0.0.0` and defaults to port `9001`.

When traffic passes through ngrok, Cloudflare, Nginx, or another reverse proxy, the deployment must match the Express `trust proxy` setting. The current application sets one trusted proxy hop. Change that value to match the real production topology and ensure the proxy manages `X-Forwarded-For` correctly.

## 3. Base URLs and Response Format

Local base URL:

```text
http://localhost:9001
```

REST API base path:

```text
/api/v1
```

Successful responses generally use:

```json
{
  "success": true,
  "message": "Description of the result",
  "data": {}
}
```

Error responses generally use:

```json
{
  "success": false,
  "message": "Description of the failure"
}
```

Dates are serialized by Express as ISO 8601 strings. UUIDs are returned as strings.

## 4. HTTP Endpoints

### 4.1 Service information

```http
GET /
```

Response `200`:

```json
{
  "success": true,
  "message": "The multiverse would never forgive me if I complied....",
  "data": {
    "service": "inbound-api",
    "version": "1.0.0"
  }
}
```

### 4.2 Health check

```http
GET /api/v1/health
```

Response `200`:

```json
{
  "success": true,
  "message": "API is healthy."
}
```

This endpoint confirms that the Express process is responding. It does not perform a database, Mailgun, or Socket.IO readiness check.

### 4.3 Create an inbox

```http
POST /api/v1/inbox
```

No request body is required.

The service:

1. Generates a cryptographically random token.
2. Stores only the SHA-256 hash of that token.
3. Generates a randomized local part from name-based patterns, letters, digits, and a uniqueness suffix.
4. Creates the address using `DOMAIN_ADDRESS`.
5. Sets expiration using `INBOX_TTL_MINUTES`.

Response `201`:

```json
{
  "success": true,
  "data": {
    "id": "8a5f1a9d-0c52-4d54-9f40-4b5a6d2e0d92",
    "address": "generated-address@example.com",
    "token": "raw-token-returned-once",
    "expiresAt": "2026-09-16T14:00:00.000Z"
  }
}
```

The raw token is returned only in this response. Clients should store it securely and send it as a bearer token for subsequent inbox operations.

Possible failure: `500` when address creation or persistence fails.

### 4.4 Fetch inbox information

```http
GET /api/v1/inbox/info
Authorization: Bearer <token>
```

Response `200`:

```json
{
  "success": true,
  "message": "Inbox Fetched Success",
  "data": {
    "address": "generated-address@example.com",
    "localPart": "generated-address",
    "extendCount": 0,
    "domain": "example.com",
    "createdAt": "2026-09-16T13:00:00.000Z",
    "expiresAt": "2026-09-16T14:00:00.000Z",
    "message": {
      "count": 0
    }
  }
}
```

The route authenticates by hashing the supplied token and comparing it with `Inbox.tokenHash`. It does not accept an inbox ID or query parameter.

Possible failures:

- `401` when the authorization header is missing or malformed.
- `404` when the inbox cannot be found or is deleted.
- `410` when the inbox has expired.
- `500` for an unexpected database or server error.

### 4.5 Extend inbox expiration

```http
PATCH /api/v1/inbox/extend
Authorization: Bearer <token>
```

No request body is required. Each successful call adds exactly five minutes to the current expiration time and increments `extendCount`.

Response `200`:

```json
{
  "success": true,
  "message": "Inbox time extended successfully",
  "data": {
    "expiresAt": "2026-09-16T14:05:00.000Z",
    "lastExtendedAt": "2026-09-16T14:00:00.000Z",
    "extendCount": 1
  }
}
```

The current implementation does not enforce a maximum extension count and rejects expired inboxes in the access middleware before this controller runs.

### 4.6 Fetch a message

```http
GET /api/v1/inbox/messages/:id
Authorization: Bearer <token>
```

The message must belong to the inbox represented by the bearer token.

Response `200`:

```json
{
  "success": true,
  "message": "Message Fetched Success",
  "data": {
    "id": "message-uuid",
    "subject": "Verification code",
    "sender": "Example Sender <sender@example.com>",
    "from": "sender@example.com",
    "to": "generated-address@example.com",
    "body": "<p>Sanitized message body</p>",
    "inboxId": "inbox-uuid",
    "attachments": [
      {
        "id": "attachment-uuid",
        "filename": "document.pdf",
        "contentType": "application/pdf",
        "size": 48213,
        "url": "mailgun:token:document.pdf",
        "expiresAt": "2026-09-16T14:00:00.000Z"
      }
    ],
    "isRead": false,
    "status": "PARSED",
    "receivedAt": "2026-09-16T13:10:00.000Z",
    "expiresAt": "2026-09-16T14:00:00.000Z"
  }
}
```

HTML is sanitized again when the message is read. The `url` value is currently an object-key value, not a downloadable HTTP URL.

Possible failures: `400` for missing parameters, `401` for missing or invalid authorization, `404` for a missing inbox or message, `410` for an expired inbox, and `500` for an unexpected server error.

### 4.7 Mark a message as read

```http
GET /api/v1/inbox/messages/:id/read
Authorization: Bearer <token>
```

Response `200`:

```json
{
  "success": true,
  "message": "Message marked as read"
}
```

The current route uses `GET` for this state-changing operation. The implementation should be reviewed before production use because the update query currently filters by message ID without also applying the authenticated inbox ID.

### 4.8 Mailgun raw-MIME webhook

```http
POST /api/v1/webhooks/mailgun/raw-mime
Content-Type: multipart/form-data
```

The endpoint accepts Mailgun fields including:

| Field | Required | Description |
|---|---:|---|
| `timestamp` | Yes | Unix timestamp used for signature validation. |
| `token` | Yes | Mailgun webhook token. |
| `signature` | Yes | 64-character hexadecimal HMAC-SHA256 signature. |
| `recipient` | Yes | Target inbox address. |
| `body-mime` | Yes for raw ingestion | Raw MIME message as a file part. |
| `sender` | No | Sender fallback value. |
| `from` | No | Display name and sender address. |
| `subject` | No | Subject fallback value. |

Processing includes multipart parsing with Multer, Mailgun signature verification, five-minute timestamp validation, recipient canonicalization, active-inbox lookup, size checks, MIME parsing, HTML sanitization, and creation of `Message` and `Attachment` records.

Response `202`:

```json
{
  "success": true,
  "duplicate": false,
  "messageId": "message-uuid"
}
```

Current rejection responses include:

- `406` `Malformed Mailgun payload.`
- `406` `Invalid Mailgun signature.`
- `406` `Invalid recipient address.`
- `406` `Inbox not found,unknown or expired`
- `406` `Message exceeds size limit.`
- `406` `Attachment Exceeds Size Limit.`
- `500` for unexpected ingestion or persistence errors.

The `duplicate` value is currently always `false`; deduplication is not implemented.

### 4.9 Mailgun parsed webhook acknowledgement

```http
POST /api/v1/webhooks/mailgun/parsed
Content-Type: multipart/form-data
```

This endpoint validates the Mailgun signature, recipient, and presence of `body-plain` or `body-html`, then returns an acknowledgement. It does not persist a message.

Response `200`:

```json
{
  "success": true,
  "message": "Mailgun dashboard webhook received."
}
```

### 4.10 Swagger UI

```http
GET /api-docs
```

The application serves the checked-in OpenAPI definition through `swagger-ui-express`. Treat the implementation routes in this document as authoritative where the generated Swagger description differs from the controllers and routes.

### 4.11 Unknown API routes

Unknown `/api/v1` routes return a JSON `404` response. The not-found handler is protected by a rate limiter allowing 30 invalid requests per five-minute window, with standard rate-limit headers enabled.

## 5. Authentication and Address Rules

### Bearer authentication

Protected endpoints require:

```http
Authorization: Bearer <raw-token>
```

The raw token is hashed with SHA-256 and compared with the stored `tokenHash`. Tokens are not stored in plaintext.

The access middleware returns `401` for missing, malformed, unknown, or empty credentials and `410` for an expired inbox.

### Recipient canonicalization

Inbound recipients are trimmed and lowercased. A recipient is accepted only when it has exactly one `@`, a non-empty local part, and a domain containing a dot. Display-name forms such as `Name <user@example.com>` and values containing spaces are rejected.

### Address generation

Generated local parts use cryptographically secure random selection from name lists, digits, letters, and multiple address patterns. A time-based base-36 suffix and random component reduce collisions. The controller retries unique-constraint collisions up to five times.

## 6. Email Parsing, Sanitization, and Limits

Raw MIME messages are parsed with `mailparser`. Stored message data includes sender information, subject, plain text, sanitized HTML, size values, and attachment metadata.

The sanitizer permits a controlled set of common text, formatting, list, table, and link tags. Link schemes are limited to `http`, `https`, and `mailto`. Links are normalized with `target="_blank"` and `rel="noopener noreferrer"`; disallowed tags are discarded. Message HTML is sanitized during ingestion and again when returned by the message endpoint.

Limits are configured through:

```text
MAX_MESSAGE_SIZE_MB       default: 25
MAX_ATTACHMENT_SIZE_MB    default: 10 total attachment bytes per message
```

The current attachment flow stores metadata and an object key only. It does not persist attachment bytes to S3, R2, or another object store.

## 7. Socket.IO Real-Time Interface

The application initializes Socket.IO on the same HTTP server as Express. It is not a raw WebSocket protocol.

### Client connection

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:9001");
```

### Join an inbox room

```js
socket.emit(
  "join-inbox",
  {
    address: "generated-address@example.com",
    token: "raw-token"
  },
  (response) => console.log(response)
);
```

Successful acknowledgement:

```json
{
  "success": true,
  "room": "inbox:inbox-uuid"
}
```

Invalid or expired credentials receive:

```json
{
  "success": false,
  "error": "invalid or expired inbox credentials"
}
```

The server removes a socket from any previous inbox room before joining a new one.

### New-message event

The exported `publishNewMessage` helper emits `message:new` to the matching inbox room:

```json
{
  "id": "message-uuid",
  "fromAddress": "sender@example.com",
  "subject": "Verification code",
  "receivedAt": "2026-09-16T13:10:00.000Z"
}
```

The current Mailgun ingestion path does not call `publishNewMessage`, so successful ingestion does not yet automatically push a real-time event.

Socket.IO CORS uses `CLIENT_ORIGIN` when set and otherwise allows `*`.

## 8. Persistence Model

The PostgreSQL schema is defined in `src/api/v1/prisma/schema.prisma`.

### Inbox

Stores the generated address, local part, domain, hashed token, lifecycle timestamps, extension count, and soft-delete fields. An inbox owns zero or more messages.

### Message

Stores sender and recipient addresses, sender name, subject, plain text, sanitized HTML, size metadata, parsing status, read state, expiry, and the parent inbox relation.

Message statuses are `PENDING`, `PARSED`, and `FAILED`.

### Attachment

Stores filename, content type, size, object key, checksum, timestamps, expiry, and the parent message relation. Database cascade deletion removes attachments when their parent message is deleted.

### IngestLog

The schema defines an `IngestLog` model for accepted and rejected inbound attempts, but the current ingestion implementation does not write to it.

## 9. Environment Configuration

Create a local `.env` file. Never commit credentials or copy real secrets into documentation.

### Application and database

```env
PORT=9001
DATABASE_URL=postgresql://user:password@localhost:5432/database
DOMAIN_ADDRESS=example.com
INBOX_TTL_MINUTES=60
```

`DOMAIN_ADDRESS` is required during application startup. `PORT` defaults to `9001`; `INBOX_TTL_MINUTES` defaults to `60`.

### Mailgun and webhook processing

```env
MAILGUN_WEBHOOK_SIGNING_KEY=your-mailgun-webhook-signing-key
MAX_MESSAGE_SIZE_MB=25
MAX_ATTACHMENT_SIZE_MB=10
```

### Mailgun route configuration

```env
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_API_BASE_URL=https://api.mailgun.net
INBOX_DOMAIN=your-mailgun-inbound-domain
APP_BASE_URL=https://your-public-tunnel-or-production-host
```

`APP_BASE_URL` is used by the route configuration script to create the destination `${APP_BASE_URL}/api/v1/webhooks/mailgun/raw-mime`.

### Local webhook simulation

```env
TARGET_URL=http://localhost:9001/api/v1/webhooks/mailgun/raw-mime
TEST_RECIPIENT=active-inbox@example.com
TEST_SENDER=test.sender@example.com
INCLUDE_ATTACHMENT=false
```

For ngrok or another tunnel, set `TARGET_URL` to the public URL with the complete webhook path.

### Socket.IO

```env
CLIENT_ORIGIN=http://localhost:3000
```

When omitted, Socket.IO uses a permissive `*` origin configuration.

## 10. Local Development and Mailgun Testing

### Install dependencies

```bash
npm install
```

### Prepare Prisma

```bash
npm run prisma:format
npm run prisma:generate
npm run prisma:push
```

`prisma:push` applies the schema directly to the configured database. Use it intentionally in development environments.

### Start the server

```bash
npm run dev
```

The server should report:

```text
Server running at http://0.0.0.0:9001
```

### Create an inbox for testing

```bash
curl -X POST http://localhost:9001/api/v1/inbox
```

Copy the returned `data.address` and use it as `TEST_RECIPIENT`. The inbox must still be active when the simulator runs.

### Expose the local server publicly

Start ngrok, Cloudflare Tunnel, or another trusted tunnel that forwards to port `9001`:

```bash
ngrok http 9001
```

Set `APP_BASE_URL` to the current public URL before configuring Mailgun.

### Configure the Mailgun inbound route

```bash
npm run mailgun:configure-inbound
```

The script lists existing Mailgun routes and updates the first route when one exists; otherwise it creates a route. The route forwards matching recipients to `/api/v1/webhooks/mailgun/raw-mime` and stops further route processing.

### Simulate a standard webhook

```bash
npm run mailgun:simulate-webhook
```

The simulator creates a valid HMAC signature and sends a multipart request containing a raw MIME message. A successful result is HTTP `202` with a `messageId`.

### Simulate an attachment

```bash
INCLUDE_ATTACHMENT=true npm run mailgun:simulate-webhook
```

The simulator adds a text attachment to the MIME message. The current service records attachment metadata but does not upload the attachment bytes to external object storage.

### Public tunnel simulation

```bash
TARGET_URL=https://your-tunnel.ngrok-free.app/api/v1/webhooks/mailgun/raw-mime \
npm run mailgun:simulate-webhook
```

If the request returns `406 Inbox not found,unknown or expired`, create a new inbox and update `TEST_RECIPIENT`. If it returns `406 Malformed Mailgun payload`, verify that the simulator is sending multipart `body-mime` and that the URL points to the raw-MIME route.

### Inspect stored data

```bash
npm run prisma:studio
```

Prisma Studio uses port `10129` according to the package script.

## 11. Test and Verification Commands

Run the automated test suite:

```bash
npm test
```

The checked-in tests cover message-controller behavior, authorization lookup, sanitization, response shaping, Socket.IO connection, room subscription, invalid-token rejection, room isolation, and disconnect behavior.

Useful syntax and operational checks:

```bash
node --check src/scripts/simulate-mailgun-webhook.js
npm run prisma:format
npm run prisma:generate
```

The Mailgun simulator is an integration-style manual pipeline check, not a Vitest test. No automated end-to-end test currently starts Express, provisions an inbox, configures Mailgun, and delivers a webhook.

## 12. Repository Structure

```text
.
├── api-documentation.md
├── CHANGELOG.md
├── LICENSE
├── package.json
├── prisma.config.js
├── README.md
├── src
│   ├── api/v1
│   │   ├── index.js                         # Express, HTTP server, Socket.IO, Swagger
│   │   ├── controllers
│   │   │   ├── health.js                    # Health response
│   │   │   ├── inboxController.js            # Create, inspect, extend inboxes
│   │   │   ├── initController.js             # Service metadata
│   │   │   └── mailgunWebhookController.js   # Mailgun webhook handlers
│   │   ├── prisma/schema.prisma               # PostgreSQL data model
│   │   ├── routes
│   │   │   ├── healthRoute.js
│   │   │   ├── inboxRoute.js
│   │   │   ├── initRoute.js
│   │   │   ├── messageRoute.js
│   │   │   ├── router.js
│   │   │   └── webhookRoute.js
│   │   └── services
│   │       ├── mailgunClient.js               # Mailgun SDK client
│   │       ├── mailgunSignatureService.js     # HMAC and timestamp checks
│   │       ├── mailIngestionService.js        # Validation and persistence
│   │       └── mailParserService.js           # MIME parsing and sanitization
│   ├── configs
│   │   ├── env.js                             # Required environment validation
│   │   ├── generated/prisma                  # Generated Prisma client
│   │   ├── prisma.js                          # Prisma PostgreSQL adapter
│   │   ├── swagger.js                         # OpenAPI definition
│   │   └── websocket.js                       # Socket.IO rooms and events
│   ├── lib
│   │   ├── addressGenerator.js                # Random local-part generation
│   │   ├── components/rand_name.js            # Name dictionaries
│   │   ├── emailAddress.js                    # Recipient canonicalization
│   │   └── inboxAccess.js                     # Socket.IO token verification
│   ├── middlewares
│   │   └── requireInboxAccess.js              # REST bearer-token middleware
│   ├── scripts
│   │   ├── configure-mailgun-inbound-route.js # Mailgun route management
│   │   └── simulate-mailgun-webhook.js        # Signed multipart simulator
│   └── utils
│       ├── generateToken.js                   # Token generation and hashing
│       └── getCurrentTime.js                  # Time helper
└── tests
    ├── messageController.test.js
    └── websocket.test.js
```

## 13. Operational and Security Notes

- Treat the inbox token as a secret. It is the capability used to read and extend an inbox.
- Do not commit `.env` files, Mailgun keys, database credentials, or webhook signing keys.
- Keep the Mailgun signing key identical between Mailgun and the application environment.
- Use HTTPS for public production traffic and configure the reverse proxy to sanitize forwarding headers.
- Set `trust proxy` according to the actual number or identity of trusted proxy hops; do not blindly trust arbitrary forwarding headers.
- Review the message-read update query before production deployment so the authenticated inbox boundary is enforced consistently.
- Implement object-storage upload and authorized download handling before exposing attachment functionality to untrusted clients.
- Add expiration cleanup, ingestion auditing, deduplication, and ingestion-to-Socket.IO publication if those capabilities are required by the production design.

## 14. Source of Truth

This document describes the current executable implementation. The route files, controllers, services, Prisma schema, and `package.json` are authoritative when documentation, Swagger descriptions, or earlier design notes disagree with runtime behavior.
