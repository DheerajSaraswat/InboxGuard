import { Email } from "../schema/email.schema.js";
import { Notification } from "../schema/notification.schema.js";
import { User } from "../schema/user.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";
import admin from "../config/firebaseAdmin.js";
import { encryptText, decryptText } from "../utils/encryption.js";

const sendEmail = asyncHandler(async (req, res) => {
  const { user_id, email: senderEmail } = req.user;
  const { to, subject, body, attachments = [], phishingReport, encryptedKeys = [] } = req.body;

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
  const recipientUsers = await User.find({
    $or: [
      { platformMail: { $in: to } },
      { email: { $in: to } },
    ],
  });
  const foundEmails = new Set(recipientUsers.map((u) => u.platformMail || u.email));
  const missing = to.filter((e) => !foundEmails.has(e));
  if (!recipientUsers.length) {
    return res.status(400).json({ message: "No valid recipients found", missing });
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
    return { fileName, fileSize, mimeType, cloudinaryUrl, ivB64: att.ivB64, checksum };
  });

  // Persist email in sender's sent folder
  const emailDoc = await Email.create({
    messageId: crypto.randomUUID() ,
    from: fromUser._id,
    to: toArray,
    subject,
    body: bodyCipherB64,
    bodyChecksum,
    attachments: mappedAttachments,
    securityAnalysis: phishingReport || undefined,
    encryption: {
      algorithm: "AES-256-GCM",
      keyExchange: "RSA-2048",
      encryptedKeys: [],
    },
    mailbox: "sent",
    status: "sent",
  });

  // Create copies for each recipient in their inbox
  for (const recipient of recipientUsers) {
    // find encrypted key by email if provided
    const wrapped = Array.isArray(encryptedKeys)
      ? encryptedKeys.find((k) => String(k.email).toLowerCase() === String(recipient.email).toLowerCase())
      : null;
    const inboxDoc = await Email.create({
      messageId: crypto.randomUUID() ,
      from: fromUser._id,
      to: [{ user: recipient._id, deliveryStatus: "delivered" }],
      subject,
      body: bodyCipherB64,
      bodyChecksum,
      attachments: mappedAttachments,
      securityAnalysis: phishingReport || undefined,
      encryption: {
        algorithm: "AES-256-GCM",
        keyExchange: "RSA-2048",
        encryptedKeys: wrapped?.encryptedAESKey
          ? [{ recipient: recipient._id, email: recipient.email, encryptedAESKey: wrapped.encryptedAESKey }]
          : [],
      },
      mailbox: "inbox",
      status: "delivered",
    });

    // Create in-app notification record
    await Notification.create({
      user: recipient._id,
      type: "email_received",
      title: `New email from ${fromUser.email}`,
      message: subject || "Encrypted message",
      priority: phishingReport?.riskLevel && ["high","critical"].includes(phishingReport.riskLevel) ? "high" : "normal",
      data: { email: inboxDoc._id },
      channels: { inApp: { sent: true, read: false } },
      status: "pending",
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
      const response = await admin.messaging().sendEachForMulticast(message);

      const userIdsToDeleteToken = [];

      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          const errorCode = resp.error.code;
          const tokenItem = tokensWithId[index];

          // Check for errors indicating an invalid, expired, or uninstalled token
          if (
            errorCode === "messaging/registration-token-not-registered" ||
            errorCode === "messaging/invalid-argument" ||
            errorCode === "messaging/not-found"
          ) {
            console.warn(
              `FCM Token cleanup: Deleting token for User ID ${tokenItem.userId} due to error: ${errorCode}`
            );
            userIdsToDeleteToken.push(tokenItem.userId);
          }
        }
      });

      // 4. Clean up the database
      if (userIdsToDeleteToken.length > 0) {
        // Bulk update to remove the fcmToken field for all users whose tokens failed
        await User.updateMany(
          { _id: { $in: userIdsToDeleteToken } },
          { $unset: { "securitySettings.notifications.fcmToken": "" } }
        );
        console.log(
          `FCM Cleanup: Removed tokens for ${userIdsToDeleteToken.length} users.`
        );
      }
    }
  } catch (e) {
    console.error("FCM notify error:", e.message);
  }

  return res.status(201).json({ success: true, id: emailDoc._id, missingRecipients: missing });
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

    // Provide decrypted preview while keeping full body encrypted at rest
    const withPreviews = emails.map((doc) => {
      const obj = doc.toObject();
      try {
        const decrypted = decryptText(obj.body);
        // strip HTML tags for preview
        const plain = decrypted.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        obj.bodyPreview = plain.slice(0, 200);
      } catch (e) {
        obj.bodyPreview = "";
      }
      // Do not expose full encrypted body to list consumers to avoid gibberish
      delete obj.body;
      return obj;
    });

    return res.status(200).json({ success: true, emails: withPreviews });
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

const markEmailRead = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const { id } = req.params;
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) return res.status(404).json({ message: "User not found" });
  const email = await Email.findOne({ _id: id, "to.user": user._id });
  if (!email) return res.status(404).json({ message: "Email not found" });
  await Email.updateOne({ _id: id, "to.user": user._id }, { $set: { "to.$.readAt": new Date() } });
  return res.json({ success: true });
});

const moveToTrash = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const { id } = req.params;
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) return res.status(404).json({ message: "User not found" });
  const email = await Email.findOne({ _id: id, $or: [{ "to.user": user._id }, { from: user._id }] });
  if (!email) return res.status(404).json({ message: "Email not found" });
  email.mailbox = "trash";
  await email.save();
  return res.json({ success: true });
});

const bulkMoveToTrash = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const { ids = [] } = req.body || {};
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: "ids[] required" });
  await Email.updateMany(
    { _id: { $in: ids }, $or: [{ "to.user": user._id }, { from: user._id }] },
    { $set: { mailbox: "trash" } }
  );
  return res.json({ success: true });
});

const deletePermanently = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const { id } = req.params;
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) return res.status(404).json({ message: "User not found" });
  const result = await Email.deleteOne({ _id: id, $or: [{ "to.user": user._id }, { from: user._id }] });
  if (result.deletedCount === 0) return res.status(404).json({ message: "Email not found" });
  return res.json({ success: true });
});

export { sendEmail, showEmailList, getEmailById, markEmailRead, moveToTrash, bulkMoveToTrash, deletePermanently };
