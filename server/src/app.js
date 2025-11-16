import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", process.env.CORS_ORIGIN],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));

import userRouter from "./routes/user.routes.js";
import emailRouter from "./routes/email.routes.js"
import reportRouter from "./routes/report.routes.js"
import modelRouter from "./routes/mlMode.routes.js"

app.use("/api/users",userRouter);
app.use("/api/emails",emailRouter)
app.use("/api/report", reportRouter)
app.use("/api/ml", modelRouter)
app.get("/api/health", (req, res) => {
  res.status(200).send("OK");
});


export {app};