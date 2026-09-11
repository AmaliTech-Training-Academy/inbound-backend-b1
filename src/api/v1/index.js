// run app for our inbounder email server
import "dotenv/config"; // must be first: loads env before prisma.js reads DATABASE_URL
import express from "express";
import initRoute from "../v1/routes/initRoute.js";
import { v1Router } from "./routes/router.js";

const app = express();


const HOST = "0.0.0.0";
const PORT = process.env.PORT || 9001;




app.use(initRoute)
app.use(v1Router)
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
