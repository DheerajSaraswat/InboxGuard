import express from "express";
import { verifyAuth } from "../middlewares/verifyAuth.js";
import { sendEmail } from "../controllers/email.controller.js";

const router = express.Router();

router.route("/send-mail").post(verifyAuth, sendEmail);

export default router;
