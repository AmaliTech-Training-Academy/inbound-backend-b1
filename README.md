## Prisma Commands

### `npm run prisma:format`

Formats the Prisma schema to keep it clean and properly structured.

### `npm run prisma:generate`

Generates the Prisma Client files based on the current schema.

### `npm run prisma:push`

Pushes schema changes directly to the database.

### `npm run prisma:studio`

Launches Prisma Studio, allowing you to manage and view your database through a GUI.

## Database ERD

![ERD](/Inbound-ERD.svg)


## Testing the Mailgun Inbound Pipeline

This section walks through testing the email ingestion pipeline locally, from generating a test inbox to receiving a fully parsed message.

1. Generate a test inbox

Create a real inbox via the API — this is required because the ingestion pipeline only accepts mail addressed to an active, non-expired inbox in the database:

> curl -X POST http://localhost:9001/api/v1/inbox

Copy the data.address value from the response. Note its expiresAt — inboxes are short-lived, so create a fresh one if yours has expired.

2. Set up your environment

Make sure these are present in .env:

MAILGUN_WEBHOOK_SIGNING_KEY=...   # Mailgun dashboard → Settings → API Security → Webhook Signing Key
MAILGUN_API_KEY=...               # Mailgun dashboard → Settings → API Security → Private API key
INBOX_DOMAIN=...                  # e.g. sandboxXXXX.mailgun.org
APP_BASE_URL=...                  # your current cloudflared tunnel URL

APP_BASE_URL changes every time cloudflared restarts (unless you're on a named tunnel), so double-check it's current before testing.

3. Configure the Mailgun inbound route

> npm run mailgun:configure-inbound

This creates (or updates, if one already exists — free/sandbox plans are capped at 1 route) a route that forwards all mail on INBOX_DOMAIN to ${APP_BASE_URL}/api/v1/webhooks/mailgun/raw-mime. Safe to rerun any time your tunnel URL changes.

4. Simulate a webhook call locally

Test the ingestion pipeline directly, without waiting on real email delivery:

**.env.example**
MAILGUN_WEBHOOK_SIGNING_KEY=your-key \
TARGET_URL=https://your-tunnel-url/api/v1/webhooks/mailgun/raw-mime \
TEST_RECIPIENT=the-address-from-step-1 \

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


temp