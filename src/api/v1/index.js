// run app for our inbounder email server
import express from "express";
import http from "node:http";
import initRoute from "../v1/routes/initRoute.js";
import { v1Router } from "./routes/router.js";
import { initWebSocket } from "../../configs/websocket.js";
import swaggerDefinition from "../../configs/swagger.js";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";

const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
const HOST = "0.0.0.0";
const PORT = process.env.PORT || 9001;

const normalizeOrigin = (value) =>
  String(value ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\/+$/, "");

const parseAllowedOrigins = (...values) =>
  Array.from(
    new Set(
      values
        .flatMap((value) => String(value ?? "").split(","))
        .map((value) => normalizeOrigin(value))
        .filter(Boolean),
    ),
  );

const isAllowedOrigin = (origin, whitelist = []) => {
  const requestOrigin = normalizeOrigin(origin);

  if (!requestOrigin) {
    return false;
  }

  return whitelist.includes(requestOrigin);
};
const allowedOrigins = parseAllowedOrigins(
  JSON.parse(process.env.ALLOWED_ORIGINS || '["*"]'),
); // we would apply the prod web-client url here in production

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, false);
    }

    return callback(null, isAllowedOrigin(origin, allowedOrigins));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-session-id",
    "X-Session-Id",
    "X-Session-Token",
    "x-session-token",
    "X-Requested-With",
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.set("trust proxy", 1);

app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "*"], // will put in site-url for production
      connectSrc: ["'self'", "*"], // will put in site-url for production
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  }),
);

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(
  express.urlencoded({
    extended: false,
    limit: "30mb",
  }),
);
// app.use((req, res, next) => {
//   if (
//     (req.method === "POST" || req.method === "PUT") &&
//     (!req.body || Object.keys(req.body).length === 0)
//   ) {
//     return res.status(400).json({
//       error: "Request body is missing",
//     });
//   }
//   next();
// });



app.use(cookieParser());
app.disable("x-powered-by");

app.use(initRoute);
app.use(v1Router);

const server = http.createServer(app);
const io = initWebSocket(server);
app.set("io", io);

app.use(initRoute);
app.use(v1Router);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

export { app };
