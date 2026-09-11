// run app for our inbounder email server
import "dotenv/config"; // must be first: loads env before prisma.js reads DATABASE_URL
import express from "express";
import http from "node:http";
import swaggerUi from "swagger-ui-express";
import initRoute from "../v1/routes/initRoute.js";
import { v1Router } from "./routes/router.js";
import { initWebSocket } from "../../configs/websocket.js";
import swaggerDefinition from "../../configs/swagger.js";

const app = express();


const HOST = "0.0.0.0";
const PORT = process.env.PORT || 9001;


app.use(express.json({limit: "1mb"}))
app.use(express.urlencoded({
  extended: false,
  limit: "30mb"
}))

app.use(initRoute)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDefinition));
app.use(v1Router)

const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});


export {app}