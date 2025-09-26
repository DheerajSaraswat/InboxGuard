import express from "express";
import { verifyAuth } from "../middlewares/verifyAuth.js";
// import { sendMail } from "../controllers/email.controller.js";

const router = express.Router();

// router.post("/send-mail").post(verifyAuth).post(sendMail);

export default router;
