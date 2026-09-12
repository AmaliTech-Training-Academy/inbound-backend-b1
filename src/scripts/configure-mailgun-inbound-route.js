import "dotenv/config";
import { createMailgunClient } from "../api/v1/services/mailgunClient.js";

const domain = process.env.INBOX_DOMAIN;
const publicHost = process.env.APP_BASE_URL;

if (!domain || !publicHost) {
  throw new Error("INBOX_DOMAIN and APP_BASE_URL are required.");
}

const escapedDomain = domain.replace(/\./g, "\\.");

const destination = `${publicHost.replace(/\/$/, "")}/api/v1/webhooks/mailgun/raw-mime`;

const routeParams = {
  priority: 0,
  description: `Temporary inbox raw-MIME ingestion for ${domain}`,
  expression: `match_recipient(".*@${escapedDomain}")`,
  action: [`forward("${destination}")`, "stop()"],
};

const mailgun = createMailgunClient();

async function main() {
  const existing = await mailgun.routes.list();
  
  const routes = Array.isArray(existing) ? existing : (existing.items ?? []);

  try {
    if (routes.length > 0) {
      //update existing route
      const target = routes[0];
      const updated = await mailgun.routes.update(target.id, routeParams);

      console.log(`Updated existing route (${target.id}):`);
      console.log(updated);
    } else {
      const created = await mailgun.routes.create(routeParams);

      console.log("Created new route:");
      console.log(created);
    }
  } catch (err) {
    console.error("Failed to configure route:");
    console.error(err?.details || err?.message || err);
    process.exit(1);
  }
}

main();