import express from "express";
import { verifyAuth } from "../middlewares/verifyAuth.js";
import { sendEmail, showEmailList, getEmailById, markEmailRead, moveToTrash, bulkMoveToTrash, deletePermanently, toggleStarred, toggleArchive, saveDraft, downloadAttachment } from "../controllers/email.controller.js";

const router = express.Router();

router.route("/sendMail").post(verifyAuth, sendEmail);
router.route("/emailList").get(verifyAuth, showEmailList);
router.route("/draft").post(verifyAuth, saveDraft);
router.route("/:id").get(verifyAuth, getEmailById);
router.route("/:id/read").patch(verifyAuth, markEmailRead);
router.route("/:id/trash").patch(verifyAuth, moveToTrash);
router.route("/:id/star").patch(verifyAuth, toggleStarred);
router.route("/:id/archive").patch(verifyAuth, toggleArchive);
router.route("/trash/bulk").patch(verifyAuth, bulkMoveToTrash);
router.route("/:id/delete").delete(verifyAuth, deletePermanently);

// Proxy download for attachments
router.route("/:id/attachments/:idx/download").get(verifyAuth, downloadAttachment);


export default router;
