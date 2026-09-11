// run app for our inbounder email server
import express from "express";
import initRoute from "../v1/routes/initRoute.js";
import { v1Router } from "./routes/router.js";

const app = express();


const HOST = "0.0.0.0";
const PORT = process.env.PORT || 9001;


app.use(express.json({limit: "1mb"}))
app.use(express.urlencoded({
  extended: false,
  limit: "30mb"
}))

app.use(initRoute)
app.use(v1Router)
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});


export {app}