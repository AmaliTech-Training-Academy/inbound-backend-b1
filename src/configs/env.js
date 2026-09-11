const MAIL_DOMAIN = process.env.DOMAIN_ADDRESS;

const INBOX_TTL_MINUTES = Number(
  process.env.INBOX_TTL_MINUTES || 60
);

if (!MAIL_DOMAIN) {
  throw new Error("MAIL_DOMAIN is not configured");
}

if (!Number.isInteger(INBOX_TTL_MINUTES) || INBOX_TTL_MINUTES <= 0) {
  throw new Error(
    "INBOX_TTL_MINUTES must be a positive integer"
  );
}

export {
  MAIL_DOMAIN,
  INBOX_TTL_MINUTES,
};