import express from "express";
import { verifyAuth } from "../middlewares/verifyAuth.js";
import { sendEmail, showEmailList, getEmailById, markEmailRead, moveToTrash, bulkMoveToTrash, deletePermanently } from "../controllers/email.controller.js";

const router = express.Router();

router.route("/sendMail").post(verifyAuth, sendEmail);
router.route("/emailList").get(verifyAuth, showEmailList);
router.route("/:id").get(verifyAuth, getEmailById);
router.route("/:id/read").patch(verifyAuth, markEmailRead);
router.route("/:id/trash").patch(verifyAuth, moveToTrash);
router.route("/trash/bulk").patch(verifyAuth, bulkMoveToTrash);
router.route("/:id/delete").delete(verifyAuth, deletePermanently);


export default router;
