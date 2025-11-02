import { Email } from "../schema/email.schema.js";
import { Notification } from "../schema/notification.schema.js";
import { User } from "../schema/user.schema.js";
import { PhishingReport } from "../schema/phishingReport.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";
import admin from "../config/firebaseAdmin.js";
import { encryptText, decryptText } from "../utils/encryption.js";
import { Readable } from "stream";
import axios from "axios";

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
    const isEncrypted = Boolean(att.ivB64) || typeof att.encryptedSize === "number";
    const fileName = isEncrypted
      ? (att.originalName ? `${att.originalName}.enc` : undefined)
      : att.originalName;
    const fileSize = isEncrypted
      ? (typeof att.encryptedSize === "number" ? att.encryptedSize : undefined)
      : (typeof att.originalSize === "number" ? att.originalSize : undefined);
    const mimeType = att.mimeType;
    const cloudinaryUrl = att.url;
    const checksumSource = isEncrypted
      ? `${att.url || ""}|${att.ivB64 || ""}|${att.encryptedSize || ""}`
      : `${att.url || ""}|${att.originalSize || ""}`;
    const checksum = crypto.createHash("sha256").update(checksumSource).digest("hex");
    return { fileName, fileSize, mimeType, cloudinaryUrl, ivB64: att.ivB64, checksum, publicId: att.publicId, resourceType: att.resourceType, format: att.format };
  });

  // Format phishing report for database storage
  let formattedSecurityAnalysis = undefined;
  if (phishingReport && typeof phishingReport === 'object') {
    formattedSecurityAnalysis = {
      riskScore: phishingReport.riskScore || 50,
      riskLevel: phishingReport.riskLevel || "medium",
      indicators: Array.isArray(phishingReport.indicators) ? phishingReport.indicators.map(ind => ({
        type: ind.type || "auto_detected",
        severity: ind.severity || phishingReport.riskLevel || "medium",
        description: ind.description || "Phishing detected",
        detected: ind.detected !== undefined ? ind.detected : true,
      })) : [],
      analyzedAt: phishingReport.analyzedAt || new Date(),
      bypassedByUser: phishingReport.bypassedByUser || false,
    };
  }

  // Persist email in sender's sent folder
  const emailDoc = await Email.create({
    messageId: crypto.randomUUID() ,
    from: fromUser._id,
    to: toArray,
    subject,
    body: bodyCipherB64,
    bodyChecksum,
    attachments: mappedAttachments,
    securityAnalysis: formattedSecurityAnalysis,
    encryption: {
      algorithm: "AES-256-GCM",
      keyExchange: "RSA-2048",
      encryptedKeys: [],
    },
    mailbox: "sent",
    status: "sent",
  });

  // Detect phishing on incoming emails using ML model
  // Note: If client already scanned and provided phishingReport, we skip server-side scan
  let phishingDetectionResult = null;
  
  // Only run server-side ML scan if no phishingReport was provided by client
  if (!phishingReport) {
    try {
      // Extract plain text from body for ML model (strip HTML tags)
      const plainTextBody = body ? body.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';
      const emailText = `${subject || ''} ${plainTextBody}`.trim();
      
      if (emailText) {
        // Call PhishGuard ML model API - use 127.0.0.1 to match client URL
        const mlApiUrl = process.env.ML_API_URL || "http://127.0.0.1:8000";
        try {
          const mlResponse = await axios.post(
            `${mlApiUrl}/classify`,
            { email_text: emailText },
            { 
              timeout: 5000,
              validateStatus: (status) => status < 500 // Don't throw on 4xx, only 5xx
            }
          );
          
          if (mlResponse.status === 200 && mlResponse.data && mlResponse.data.is_phishing) {
            const confidence = mlResponse.data.confidence || 0.5;
            let riskLevel = "low";
            
            if (confidence >= 0.8) {
              riskLevel = "high";
            } else if (confidence >= 0.6) {
              riskLevel = "medium";
            }
            
            phishingDetectionResult = {
              riskScore: Math.round(confidence * 100),
              riskLevel: riskLevel,
              confidence: confidence,
              isPhishing: true,
              detectedPatterns: [`ML model detected phishing with ${Math.round(confidence * 100)}% confidence`]
            };
          }
        } catch (mlError) {
          // Log error but don't fail email sending - ML scan is optional
          if (mlError.response) {
            console.error("ML model detection error:", mlError.response.status, mlError.response.statusText);
          } else if (mlError.request) {
            console.error("ML model detection error: No response received from ML service");
          } else {
            console.error("ML model detection error:", mlError.message);
          }
          // Continue without ML detection if it fails
        }
      }
    } catch (error) {
      console.error("Phishing detection error:", error.message);
      // Continue - don't block email sending if ML scan fails
    }
  }

  // Use ML detection result if available, otherwise use provided phishingReport
  const finalSecurityAnalysis = phishingDetectionResult && phishingDetectionResult.isPhishing
    ? {
        riskScore: phishingDetectionResult.riskScore,
        riskLevel: phishingDetectionResult.riskLevel,
        indicators: phishingDetectionResult.detectedPatterns.map(desc => ({
          type: "auto_detected",
          severity: phishingDetectionResult.riskLevel,
          description: desc,
          detected: true,
        })),
        analyzedAt: new Date(),
        bypassedByUser: false,
      }
    : formattedSecurityAnalysis;

  // Determine mailbox - ALL phishing emails (any risk level) should go to spam
  // Check if there's any phishing detection (from ML model or client scan)
  const shouldGoToSpam = finalSecurityAnalysis && (
    phishingDetectionResult?.isPhishing === true || // ML model detected phishing
    formattedSecurityAnalysis !== undefined // Client detected phishing (user bypassed warning)
  );

  // Create copies for each recipient in their inbox or spam
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
      securityAnalysis: finalSecurityAnalysis,
      encryption: {
        algorithm: "AES-256-GCM",
        keyExchange: "RSA-2048",
        encryptedKeys: wrapped?.encryptedAESKey
          ? [{ recipient: recipient._id, email: recipient.email, encryptedAESKey: wrapped.encryptedAESKey }]
          : [],
      },
      mailbox: shouldGoToSpam ? "spam" : "inbox",
      status: "delivered",
    });

    // Create phishing report for medium+ threats
    if (finalSecurityAnalysis && 
        ["medium", "high", "critical"].includes(finalSecurityAnalysis.riskLevel)) {
      try {
        await PhishingReport.create({
          reportedBy: recipient._id,
          reportedAt: new Date(),
          reportType: "auto-detected",
          confidence: phishingDetectionResult?.confidence || 0.7,
          email: inboxDoc._id,
          analysis: {
            riskScore: finalSecurityAnalysis.riskScore,
            detectedPatterns: finalSecurityAnalysis.indicators.map(ind => ind.description),
            verificationStatus: "pending",
          },
          status: "active",
        });
      } catch (reportError) {
        console.error("Failed to create phishing report:", reportError);
      }
    }

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
      // Create a mapping of tokens to user IDs for error handling
      const tokenUserMap = recipientUsers
        .map((u, index) => ({
          userId: u._id,
          token: u.securitySettings?.notifications?.fcmToken,
        }))
        .filter((item) => item.token);

      const response = await admin.messaging().sendEachForMulticast(message);

      const userIdsToDeleteToken = [];

      response.responses.forEach((resp, index) => {
        if (!resp.success && tokenUserMap[index]) {
          const errorCode = resp.error.code;
          const tokenItem = tokenUserMap[index];

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
      query = { "to.user": user._id, mailbox: "inbox", status: { $ne: "draft" } };
    } else if (mailbox === "sent") {
      query = { from: user._id, mailbox: "sent" };
    } else if (mailbox === "trash") {
      query = {
        $or: [
          { "to.user": user._id },
          { from: user._id }
        ],
        mailbox: "trash"
      };
    } else if (mailbox === "starred") {
      query = { 
        $or: [
          { "to.user": user._id },
          { from: user._id }
        ],
        starred: true,
        mailbox: { $ne: "trash" }
      };
    } else if (mailbox === "archive") {
      query = { 
        $or: [
          { "to.user": user._id },
          { from: user._id }
        ],
        archived: true,
        mailbox: "archive"
      };
    } else if (mailbox === "spam") {
      query = { 
        "to.user": user._id,
        mailbox: "spam"
      };
    } else if (mailbox === "drafts") {
      query = { from: user._id, status: "draft" };
    } else {
      query = { $or: [
        { "to.user": user._id, mailbox: "inbox" },
        { from: user._id, mailbox: "sent" }
      ]};
    }
    
    const emails = await Email.find(query)
      .populate("from", "email username fullname displayImage")
      .populate("to.user", "email username fullname displayImage")
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

const toggleStarred = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const { id } = req.params;
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) return res.status(404).json({ message: "User not found" });
  
  const email = await Email.findOne({ _id: id, $or: [{ "to.user": user._id }, { from: user._id }] });
  if (!email) return res.status(404).json({ message: "Email not found" });
  
  email.starred = !email.starred;
  await email.save();
  
  return res.json({ success: true, starred: email.starred });
});

const toggleArchive = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const { id } = req.params;
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) return res.status(404).json({ message: "User not found" });
  
  const email = await Email.findOne({ _id: id, $or: [{ "to.user": user._id }, { from: user._id }] });
  if (!email) return res.status(404).json({ message: "Email not found" });
  
  email.archived = !email.archived;
  if (email.archived) {
    email.mailbox = "archive";
  } else {
    // Restore to original mailbox (inbox or sent)
    email.mailbox = email.from.toString() === user._id.toString() ? "sent" : "inbox";
  }
  await email.save();
  
  return res.json({ success: true, archived: email.archived });
});

const saveDraft = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const { to, subject, body, attachments = [] } = req.body;
  const fromUser = await User.findOne({ firebaseUid: user_id });
  if (!fromUser) return res.status(404).json({ message: "User not found" });

  // Encrypt email body
  const bodyCipherB64 = body ? encryptText(body) : "";
  const bodyChecksum = crypto
    .createHash("sha256")
    .update(bodyCipherB64)
    .digest("hex");

  const mappedAttachments = (attachments || []).map((att) => {
    const isEncrypted = Boolean(att.ivB64) || typeof att.encryptedSize === "number";
    const fileName = isEncrypted
      ? (att.originalName ? `${att.originalName}.enc` : undefined)
      : att.originalName;
    const fileSize = isEncrypted
      ? (typeof att.encryptedSize === "number" ? att.encryptedSize : undefined)
      : (typeof att.originalSize === "number" ? att.originalSize : undefined);
    const mimeType = att.mimeType;
    const cloudinaryUrl = att.url;
    const checksumSource = isEncrypted
      ? `${att.url || ""}|${att.ivB64 || ""}|${att.encryptedSize || ""}`
      : `${att.url || ""}|${att.originalSize || ""}`;
    const checksum = crypto.createHash("sha256").update(checksumSource).digest("hex");
    return { fileName, fileSize, mimeType, cloudinaryUrl, ivB64: att.ivB64, checksum, publicId: att.publicId, resourceType: att.resourceType, format: att.format };
  });

  const draftDoc = await Email.create({
    messageId: crypto.randomUUID(),
    from: fromUser._id,
    to: to ? [{ user: fromUser._id }] : [],
    subject: subject || "",
    body: bodyCipherB64,
    bodyChecksum,
    attachments: mappedAttachments,
    encryption: {
      algorithm: "AES-256-GCM",
      keyExchange: "RSA-2048",
      encryptedKeys: [],
    },
    mailbox: "inbox", // Drafts are stored in inbox with draft status
    status: "draft",
  });

  return res.status(201).json({ success: true, id: draftDoc._id });
});

const downloadAttachment = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const { id, idx } = req.params;
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) return res.status(404).json({ message: "User not found" });

  const email = await Email.findOne({
    _id: id,
    $or: [
      { "to.user": user._id },
      { from: user._id }
    ]
  });
  if (!email) return res.status(404).json({ message: "Email not found" });

  const index = Number(idx);
  const att = Array.isArray(email.attachments) ? email.attachments[index] : null;
  if (!att) return res.status(404).json({ message: "Attachment not found" });
  const url = att.cloudinaryUrl;
  if (!url) return res.status(400).json({ message: "Attachment URL missing" });

  const name = att.fileName || att.originalName || `attachment-${index+1}`;
  try {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok || !response.body) {
      return res.status(502).json({ message: "Failed to fetch attachment" });
    }
    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    res.setHeader("Content-Type", att.mimeType || response.headers.get("content-type") || "application/octet-stream");

    const nodeStream = Readable.fromWeb(response.body);
    nodeStream.pipe(res);
  } catch (e) {
    console.error("Download proxy error:", e.message);
    return res.status(500).json({ message: "Download failed" });
  }
});

export { sendEmail, showEmailList, getEmailById, markEmailRead, moveToTrash, bulkMoveToTrash, deletePermanently, toggleStarred, toggleArchive, saveDraft, downloadAttachment };
