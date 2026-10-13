import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const DEFAULT_ERROR_MESSAGE = "Too many requests. Please try again later.";

export const createRateLimiter = ({
  windowMs,
  max,
  message = DEFAULT_ERROR_MESSAGE,
  ...overrides
}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip),
    message: {
      status: 429,
      message,
    },
    ...overrides,
  });

export const globalRateLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});




