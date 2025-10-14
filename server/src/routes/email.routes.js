import express from "express";
import { verifyAuth } from "../middlewares/verifyAuth.js";
import { sendEmail, showEmailList, getEmailById } from "../controllers/email.controller.js";

const router = express.Router();

router.route("/send-mail").post(verifyAuth, sendEmail);
router.route("/emailList").get(verifyAuth, showEmailList);
router.route("/:id").get(verifyAuth, getEmailById);


export default router;
