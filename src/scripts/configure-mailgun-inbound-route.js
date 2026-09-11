import "dotenv/config";
import { createMailgunClient } from "../api/v1/services/mailgunClient";

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
        "forward(\"${publicHost.replace(/\\\\/$/, '')}/api/v1/webhooks/mailgun/raw-mime\")",
        "stop()",
    ],
});
console.log(`Created Mailgun route: ${route.id}`);