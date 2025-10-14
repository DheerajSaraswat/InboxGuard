import { Email } from "../schema/email.schema.js";
import { User } from "../schema/user.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";
import admin from "../config/firebaseAdmin.js";
import { encryptText, decryptText } from "../utils/encryption.js";

const sendEmail = asyncHandler(async (req, res) => {
  const { user_id, email: senderEmail } = req.user;
  const { to, subject, body, attachments = [], phishingReport } = req.body;

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

  // Encrypt email body
  const bodyCipherB64 = body ? encryptText(body) : "";
  if (!bodyCipherB64) {
    return res.status(400).json({ message: "Email body is required" });
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

  // Persist email in sender's sent folder
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

  // Create copies for each recipient in their inbox
  for (const recipient of recipientUsers) {
    await Email.create({
      from: fromUser._id,
      to: [{ user: recipient._id, deliveryStatus: "delivered" }],
      subject,
      body: bodyCipherB64,
      bodyChecksum,
      attachments: mappedAttachments,
      securityAnalysis: phishingReport || undefined,
      mailbox: "inbox",
      status: "delivered",
    });
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
  const { mailbox = "inbox" } = req.query;
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    let query = {};
    if (mailbox === "inbox") {
      query = { "to.user": user._id, mailbox: "inbox" };
    } else if (mailbox === "sent") {
      query = { from: user._id, mailbox: "sent" };
    } else {
      query = { $or: [
        { "to.user": user._id, mailbox: "inbox" },
        { from: user._id, mailbox: "sent" }
      ]};
    }
    
    const emails = await Email.find(query)
      .populate("from", "email username displayImage")
      .populate("to.user", "email username displayImage")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, emails });
  } catch (error) {
    console.log(error);
    throw error
  }
})

const getEmailById = asyncHandler(async(req, res)=>{
  const { user_id } = req.user;
  const { id } = req.params;
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    const email = await Email.findOne({
      _id: id,
      $or: [
        { "to.user": user._id },
        { from: user._id }
      ]
    })
    .populate("from", "email username displayImage")
    .populate("to.user", "email username displayImage");
    
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }
    
    // Decrypt email body
    const decryptedBody = decryptText(email.body);
    const emailWithDecryptedBody = {
      ...email.toObject(),
      body: decryptedBody
    };
    
    return res.status(200).json({ success: true, email: emailWithDecryptedBody });
  } catch (error) {
    console.log(error);
    throw error
  }
})

export { sendEmail, showEmailList, getEmailById };
