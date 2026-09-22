# Inbound Email API

Temporary inbound-email service built with Node.js, Express, Prisma, PostgreSQL, Mailgun, and Socket.IO. The service creates short-lived inboxes, generates secure bearer tokens, receives Mailgun webhooks, parses MIME messages, sanitizes HTML content, persists message and attachment metadata, and exposes the inbox through a versioned REST API.

The API is designed for frontend clients that need to create disposable inboxes, monitor their lifecycle, retrieve messages, and mark messages as read. Mailgun handles inbound delivery; Prisma provides the persistence layer; Socket.IO provides optional inbox-scoped subscriptions.

## Database ERD

![Inbound Email API entity relationship diagram](Inbound-ERD.svg)

The Prisma schema is located at [`src/api/v1/prisma/schema.prisma`](src/api/v1/prisma/schema.prisma). The primary relationships are:

- One `Inbox` has many `Message` records.
- One `Message` has many `Attachment` records.
- `IngestLog` stores inbound delivery audit metadata independently.
- Messages and attachments are removed with their parent inbox/message through Prisma cascade relations.

## Project Structure

```text
src/
	api/v1/
		controllers/       HTTP request handlers
		routes/            Versioned REST and webhook routes
		services/          Mailgun, MIME parsing, and ingestion logic
		prisma/            Prisma schema
	configs/              Prisma, environment, Swagger, and WebSocket setup
	lib/                  Address and email helpers
	middlewares/          Bearer-token inbox authorization
	scripts/              Mailgun configuration and webhook simulation
tests/                  Vitest unit and integration-style tests
```

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL connection string
- A configured email domain for generated inbox addresses
- Mailgun credentials for live inbound delivery tests

## Environment Configuration

Create a `.env` file in the project root. The application requires the following values:

```dotenv
DATABASE_URL="postgresql://user:password@host:5432/database"
DOMAIN_ADDRESS="example.com"
INBOX_TTL_MINUTES=60
PORT=9001

MAILGUN_WEBHOOK_SIGNING_KEY="your-mailgun-webhook-signing-key"
MAILGUN_API_KEY="your-mailgun-private-api-key"
MAILGUN_API_BASE_URL="https://api.mailgun.net"
INBOX_DOMAIN="example.com"
APP_BASE_URL="https://your-public-host.example.com"

MAX_MESSAGE_SIZE_MB=25
MAX_ATTACHMENT_SIZE_MB=10
ALLOWED_ORIGINS='["http://localhost:3000"]'
CLIENT_ORIGIN="http://localhost:3000"
```

`DOMAIN_ADDRESS` is used when generating inbox addresses. `INBOX_DOMAIN` is used by the Mailgun route configuration script and should normally represent the same receiving domain. Keep signing keys and API keys outside source control.

## How to Run the Project

Install dependencies:

```bash
npm install
```

Format the Prisma schema and generate the Prisma client:

```bash
npm run prisma:format
npm run prisma:generate
```

Apply the current schema to the configured PostgreSQL database during local development:

```bash
npm run prisma:push
```

Start the development server with automatic reloads:

```bash
npm run dev
```

Start the server without Nodemon:

```bash
npm start
```

The default server address is `http://localhost:9001`.

### Prisma Commands

| Command | Purpose |
| --- | --- |
| `npm run prisma:format` | Format `src/api/v1/prisma/schema.prisma`. |
| `npm run prisma:generate` | Generate the Prisma client used by the API. |
| `npm run prisma:push` | Push the current schema directly to the configured database. |
| `npm run prisma:studio` | Open Prisma Studio on port `10129`. |

For production schema changes, review and apply a proper Prisma migration instead of relying on `db push`.

## Swagger API Documentation

With the server running, open the interactive OpenAPI documentation at:

<http://localhost:9001/api-docs>

The OpenAPI source is [`src/configs/swagger.js`](src/configs/swagger.js). The documented API distinguishes between:

- Public message responses returned to frontend clients.
- Prisma persistence fields used by the Mailgun ingestion pipeline.
- Internal fields such as `tokenHash`, raw storage keys, and attachment checksums that are not exposed by the message endpoint.

## API Endpoint Summary

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | None | Return service information. |
| `GET` | `/api/v1/health` | None | Confirm the HTTP process is responding. |
| `POST` | `/api/v1/inbox` | None | Create a temporary inbox and return its raw bearer token. |
| `GET` | `/api/v1/inbox/info` | Bearer token | Retrieve authenticated inbox metadata. |
| `PATCH` | `/api/v1/inbox/extend` | Bearer token | Add five minutes to inbox expiration. |
| `GET` | `/api/v1/inbox/messages/:id` | Bearer token | Retrieve one message belonging to the inbox. |
| `GET` | `/api/v1/inbox/messages/:id/read` | Bearer token | Mark a message as read. |
| `POST` | `/api/v1/webhooks/mailgun/raw-mime` | Mailgun signature | Persist a raw MIME message and its attachment metadata. |
| `POST` | `/api/v1/webhooks/mailgun/parsed` | Mailgun signature | Validate and acknowledge a parsed Mailgun webhook. |

### Create an Inbox

```bash
curl -X POST http://localhost:9001/api/v1/inbox
```

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

The raw token is returned only when the inbox is created. Store it securely and send it as `Authorization: Bearer <token>` for protected operations.

### Fetch Inbox Information

```bash
curl http://localhost:9001/api/v1/inbox/info \
	-H "Authorization: Bearer <token>"
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
		"message": {}
	}
}
```

The current controller serializes `message` as an empty object because the Prisma-loaded message array has no `count` property.

### Fetch a Message

```bash
curl http://localhost:9001/api/v1/inbox/messages/<message-id> \
	-H "Authorization: Bearer <token>"
```

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
		"expiresAt": "2026-09-16T14:00:00.000Z",
		"createdAt": "2026-09-16T13:10:00.000Z"
	}
}
```

The message endpoint returns a public projection of the Prisma record. In the current implementation, attachment `size` maps from Prisma `sizeBytes`, and attachment `url` contains the stored `objectKey`; it is not a downloadable HTTP URL.

## Testing the Project

Run the complete automated test suite:

```bash
npm test
```

The repository uses Vitest. The tests cover message-controller behavior and Socket.IO behavior.

## Testing the Mailgun Inbound Pipeline

The simulator exercises the complete local pipeline:

```text
multipart request
	-> Mailgun signature verification
	-> recipient canonicalization
	-> active inbox lookup
	-> MIME parsing
	-> HTML sanitization
	-> Prisma Message and Attachment creation
```

### 1. Start the API

```bash
npm run dev
```

Confirm that the server is available at `http://localhost:9001`.

### 2. Create a fresh test inbox

```bash
curl -X POST http://localhost:9001/api/v1/inbox
```

Copy `data.address` and use it as `TEST_RECIPIENT`. The inbox must still be active when the simulated message is sent.

### 3. Configure the environment

Set these variables before running the simulator:

```dotenv
MAILGUN_WEBHOOK_SIGNING_KEY=your-mailgun-webhook-signing-key
TARGET_URL=http://localhost:9001/api/v1/webhooks/mailgun/raw-mime
TEST_RECIPIENT=generated-address@example.com
```

For a real Mailgun route, expose the server through a public HTTPS tunnel and set `TARGET_URL` to that public webhook URL.

### 4. Simulate a signed webhook

```bash
npm run mailgun:simulate-webhook
```

The simulator creates a valid HMAC signature, builds a multipart `body-mime` file, and posts it to the webhook. A successful response is `202`:

```json
{
	"success": true,
	"duplicate": false,
	"messageId": "message-uuid"
}
```

To include a MIME attachment in the simulated message:

```bash
INCLUDE_ATTACHMENT=true npm run mailgun:simulate-webhook
```

Optional variables:

| Variable | Purpose |
| --- | --- |
| `TEST_SENDER` | Override the simulator sender address. |
| `INCLUDE_ATTACHMENT=true` | Add a text attachment to the MIME message. |

### 5. Verify the persisted record

Use the returned `messageId` with the inbox token:

```bash
curl http://localhost:9001/api/v1/inbox/messages/<message-id> \
	-H "Authorization: Bearer <token>"
```

You can inspect the underlying Prisma records with:

```bash
npm run prisma:studio
```

Verify that the `Message` row contains the expected `inboxId`, sender fields, subject, body fields, `PARSED` status, expiration, and size metadata. When the simulator includes an attachment, verify the related `Attachment` row contains `filename`, `contentType`, `sizeBytes`, `checksum`, `objectKey`, and `expiresAt`.

### 6. Configure and test real Mailgun delivery

To configure the inbound Mailgun route:

```dotenv
MAILGUN_API_KEY=your-mailgun-private-api-key
INBOX_DOMAIN=example.com
APP_BASE_URL=https://your-public-host.example.com
```

Then run:

```bash
npm run mailgun:configure-inbound
```

Send an email to the generated inbox address and verify:

1. Mailgun logs show the message was forwarded.
2. The API logs show the webhook was accepted.
3. The `Message` and related `Attachment` records exist in PostgreSQL.
4. The message can be retrieved using the inbox bearer token.

## Socket.IO

Socket.IO runs on the same origin as the HTTP server. The current WebSocket implementation supports inbox room subscriptions, but the Mailgun ingestion path does not automatically publish newly ingested messages to connected clients.

## Current Limitations

- The current attachment API returns metadata and an internal `objectKey`; it does not expose a file-download endpoint.
- Attachment bytes are not uploaded to object storage by the current ingestion service.
- There is no pagination endpoint for messages.
- There is no inbox deletion endpoint or background cleanup worker.
- The parsed Mailgun acknowledgement endpoint validates the webhook but does not persist a message.
- The health endpoint checks HTTP responsiveness only; it does not verify database or Mailgun readiness.


## Testing the Mailgun Inbound Pipeline

This section walks through testing the email ingestion pipeline locally, from generating a test inbox to receiving a fully parsed message.

1. Generate a test inbox

Create a real inbox via the API — this is required because the ingestion pipeline only accepts mail addressed to an active, non-expired inbox in the database:

> curl -X POST http://localhost:9001/api/v1/inbox

Copy the data.address value from the response. Note its expiresAt — inboxes are short-lived, so create a fresh one if yours has expired.

2. Set up your environment

Make sure these are present in .env:

```bash
MAILGUN_WEBHOOK_SIGNING_KEY=...   # Mailgun dashboard → Settings → API Security → Webhook Signing Key
MAILGUN_API_KEY=...               # Mailgun dashboard → Settings → API Security → Private API key
INBOX_DOMAIN=...                  # e.g. sandboxXXXX.mailgun.org
APP_BASE_URL=...                  # your current cloudflared tunnel URL
```

APP_BASE_URL changes every time cloudflared restarts (unless you're on a named tunnel), so double-check it's current before testing.

3. Configure the Mailgun inbound route

> npm run mailgun:configure-inbound

This creates (or updates, if one already exists — free/sandbox plans are capped at 1 route) a route that forwards all mail on INBOX_DOMAIN to ${APP_BASE_URL}/api/v1/webhooks/mailgun/raw-mime. Safe to rerun any time your tunnel URL changes.

4. Simulate a webhook call locally

Test the ingestion pipeline directly, without waiting on real email delivery:

**.env.example**
```bash
MAILGUN_WEBHOOK_SIGNING_KEY=your-key \
TARGET_URL=https://your-tunnel-url/api/v1/webhooks/mailgun/raw-mime \
TEST_RECIPIENT=the-address-from-step-1 \
```

> npm run mailgun:simulate-webhook

This builds a validly-signed multipart request with a fake MIME message and posts it straight to your local server. A 202 response with a messageId means the full pipeline (signature check → recipient lookup → parsing → DB write) succeeded.

Optional flags:

TEST_SENDER — override the fake sender address
INCLUDE_ATTACHMENT=true — also test the attachment/object-storage path

5. Test with a real email

Once the simulated call succeeds, send an actual email from any provider to the address from step 1. Check:

Mailgun dashboard → Sending → Logs, to confirm the route matched and forwarded successfully
Your server logs, to confirm the webhook was received
The Message table (npm run prisma:studio), for the new row

## License

This project is distributed under the license in [`LICENSE`](LICENSE).