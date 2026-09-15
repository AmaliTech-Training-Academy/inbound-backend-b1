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