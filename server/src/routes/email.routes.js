import express from "express";
import { verifyAuth } from "../middlewares/verifyAuth.js";
import { sendEmail, showEmailList } from "../controllers/email.controller.js";
import crypto from "crypto";
import { Email } from "../schema/email.schema.js";
import { User } from "../schema/user.schema.js";
import admin from "../config/firebaseAdmin.js";
import { verifyMailgunSignature } from "../utils/mailgunWebhook.js";

const router = express.Router();

router.route("/send-mail").post(verifyAuth, sendEmail);
router.route("/emailList").get(verifyAuth, showEmailList);

// Mailgun inbound webhook to record received emails into MongoDB
router.post("/mailgun/inbound", async (req, res) => {
  // Optionally validate Mailgun signature here if webhooks are used
  try {
    const sig = req.body?.signature || req.body["signature"]; // if using mailgun MIME route, structure differs
    const timestamp = sig?.timestamp || req.body["timestamp"]; 
    const token = sig?.token || req.body["token"]; 
    const signature = sig?.signature || req.body["signature"]; 
    if (!verifyMailgunSignature({ timestamp, token, signature })) {
      return res.status(401).json({ ok: false, message: "Invalid signature" });
    }

    const { sender, subject, "body-plain": bodyPlain, From, To } = req.body || {};
    const toAddresses = (To || req.body.to || "").split(/,\s*/).filter(Boolean);
    const recipients = await User.find({ email: { $in: toAddresses } });
    if (!recipients.length) return res.status(200).json({ ok: true });

    const bodyChecksum = crypto.createHash("sha256").update(bodyPlain || "").digest("hex");
    const toArray = recipients.map((u) => ({ user: u._id, deliveryStatus: "delivered" }));
    const fromUser = await User.findOne({ email: sender || From });

    const emailDoc = await Email.create({
      from: fromUser?._id,
      to: toArray,
      subject: subject || "",
      body: bodyPlain || "",
      bodyChecksum,
      mailbox: "inbox",
      status: "delivered",
    });
    // Push notification to recipients
    const tokens = recipients.map((u) => u.securitySettings?.notifications?.fcmToken).filter(Boolean);
    if (tokens.length) {
      const message = {
        notification: { title: `New email from ${sender || From}`, body: subject || "New message" },
        data: { emailId: String(emailDoc._id) },
        tokens,
      };
      try { await admin.messaging().sendEachForMulticast(message); } catch {}
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Inbound store error:", e.message);
    return res.status(500).json({ ok: false });
  }
});

export default router;
