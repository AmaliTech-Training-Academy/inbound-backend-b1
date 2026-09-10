import express from "express";
import rateLimit from "express-rate-limit";
import health from "./healthRoute.js";

const API_VERSION = "/api/v1";
const v1Router = express.Router();

const notFoundLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 30, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many invalid requests. Please try again later.",
  },
});

const routes = [
 {
    path: '/health',
    route: health
 }
];


routes.forEach(({ path, route }) => {
 

  v1Router.use(`${API_VERSION}${path}`, route);
});


v1Router.use(notFoundLimiter);

v1Router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found.",
  });
});

export { v1Router };
