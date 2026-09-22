import "dotenv/config";
import crypto from "node:crypto";

const SIGNING_KEY = process.env.MAILGUN_WEBHOOK_SIGNING_KEY;
const TARGET_URL = process.env.TARGET_URL;
const RECIPIENT = process.env.TEST_RECIPIENT || "hello@mail.yourdomain.com";
const SENDER = process.env.TEST_SENDER || "test.sender@example.com";
const INCLUDE_ATTACHMENT = process.env.INCLUDE_ATTACHMENT === "true";

if (!SIGNING_KEY || !TARGET_URL) {
  console.error("Set MAILGUN_WEBHOOK_SIGNING_KEY and TARGET_URL env vars first.");
  process.exit(1);
}

//builds a valid signature
const timestamp = Math.floor(Date.now() / 1000).toString();
const token = crypto.randomBytes(16).toString("hex");
const signature = crypto
  .createHmac("sha256", SIGNING_KEY)
  .update(`${timestamp}${token}`)
  .digest("hex");

//builds a minimal raw MIME message to check parsing
const boundary = "sim-boundary-1234";

const rawMime = INCLUDE_ATTACHMENT
  ? [
      `From: Test Sender <${SENDER}>`,
      `To: ${RECIPIENT}`,
      `Subject: Simulated inbound email with attachment`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      ``,
      `This is a simulated inbound message body for local testing.`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; name="second_note.txt"`,
      `Content-Disposition: attachment; filename="second_note.txt"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      Buffer.from("This is a test for sending attachments.").toString("base64"),
      ``,
      `--${boundary}--`,
    ].join("\r\n")
  : [
      `From: Test Sender <${SENDER}>`,
      `To: ${RECIPIENT}`,
      `Subject: Simulated inbound email`,
      `Content-Type: text/plain; charset="UTF-8"`,
      ``,
      `This is a simulated inbound message body for local testing.`,
    ].join("\r\n");

// Mailgun sends the raw MIME message as a multipart file field.
const form = new FormData();
form.append("timestamp", timestamp);
form.append("token", token);
form.append("signature", signature);
form.append("recipient", RECIPIENT);
form.append("sender", SENDER);
form.append("from", `Test Sender <${SENDER}>`);
form.append("subject", "Simulated inbound email");

form.append(
  "body-mime",
  new Blob([rawMime], { type: "message/rfc822" }),
  "message.eml"
);

async function main() {
  const response = await fetch(TARGET_URL, {
    method: "POST",
    body: form,
  });

  const body = await response.text();
  console.log("Status:", response.status);
  console.log("Body:", body);

  if (response.ok) {
    console.log("Webhook accepted. \nCheck DB for the new Message row.");
  } else {
    console.log("Webhook rejected.");
  }
}

main().catch((err) => {
  console.error("Request failed:", err);
  process.exit(1);
});