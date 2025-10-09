import { Email } from "../schema/email.schema.js";
import { User } from "../schema/user.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";
import { sendMailViaMailgun } from "../utils/Mailgun.js";
import admin from "../config/firebaseAdmin.js";
import { encryptText } from "../utils/encryption.js";

const sendEmail = asyncHandler(async (req, res) => {
  const { user_id, email: senderEmail } = req.user;
  const { to, subject, encryptedBody, body, attachments = [], phishingReport } = req.body;

  if (!Array.isArray(to) || !subject) {
    return res
      .status(400)
      .json({ message: "To (array) and subject are required." });
  }

  // Resolve sender
  const fromUser = await User.findOne({ firebaseUid: user_id });
  if (!fromUser) {
    return res.status(404).json({ message: "Sender not found" });
  }

  // Resolve recipients by email string -> User
  const recipientUsers = await User.find({ email: { $in: to } });
  if (recipientUsers.length !== to.length) {
    // Some recipients not found; you might choose to allow partials
    const foundEmails = new Set(recipientUsers.map((u) => u.email));
    const missing = to.filter((e) => !foundEmails.has(e));
    return res.status(400).json({ message: "Some recipients not found", missing });
  }

  const toArray = recipientUsers.map((u) => ({ user: u._id }));

  // Compute checksums
  const bodyCipherB64 = encryptedBody?.cipherB64 || (body ? encryptText(body) : "");
  if (!bodyCipherB64) {
    return res.status(400).json({ message: "Missing body or encryptedBody.cipherB64" });
  }
  const bodyChecksum = crypto
    .createHash("sha256")
    .update(bodyCipherB64)
    .digest("hex");

  const mappedAttachments = (attachments || []).map((att) => {
    const fileName = att.originalName ? `${att.originalName}.enc` : undefined;
    const fileSize = typeof att.encryptedSize === "number" ? att.encryptedSize : undefined;
    const mimeType = att.mimeType;
    const cloudinaryUrl = att.url;
    // Deterministic checksum based on encrypted metadata (no need to re-download)
    const checksumSource = `${att.url || ""}|${att.ivB64 || ""}|${att.encryptedSize || ""}`;
    const checksum = crypto.createHash("sha256").update(checksumSource).digest("hex");
    return { fileName, fileSize, mimeType, cloudinaryUrl, checksum };
  });

  // Persist email
  const emailDoc = await Email.create({
    from: fromUser._id,
    to: toArray,
    subject,
    body: bodyCipherB64,
    bodyChecksum,
    attachments: mappedAttachments,
    securityAnalysis: phishingReport || undefined,
    mailbox: "sent",
    status: "sent",
  });

  // Attempt delivery via Mailgun
  try {
    const plainTextFallback = "This message is encrypted at rest in InboxGuard.";
    await sendMailViaMailgun({
      from: senderEmail || process.env.MAILGUN_FROM_EMAIL,
      to,
      subject,
      text: plainTextFallback,
      html: `<p>${plainTextFallback}</p>`,
    });
  } catch (err) {
    console.error("Mailgun send failed:", err.message);
  }

  // Notify recipients via FCM if token exists
  try {
    const tokens = recipientUsers
      .map((u) => u.securitySettings?.notifications?.fcmToken)
      .filter(Boolean);
    if (tokens.length) {
      const message = {
        notification: {
          title: `New email from ${fromUser.email}`,
          body: subject || "Encrypted message",
        },
        data: { emailId: String(emailDoc._id) },
        tokens,
      };
      await admin.messaging().sendEachForMulticast(message);
    }
  } catch (e) {
    console.error("FCM notify error:", e.message);
  }

  return res.status(201).json({ success: true, id: emailDoc._id });
});

const showEmailList = asyncHandler(async(req, res)=>{
  const { user_id } = req.user;
  console.log(user_id);
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const emails = await Email.find({ "to.user": user._id })
    .populate("from", "email username")
    .sort({ createdAt: -1 });
  return res.status(200).json({ success: true, emails });
})

export { sendEmail, showEmailList };
