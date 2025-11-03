import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {User} from "../schema/user.schema.js"
import admin from "../config/firebaseAdmin.js";
import {v2 as cloudinary} from "cloudinary";
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const userRegister = asyncHandler(async (req, res) => {
  const { uid, email, fullname, photoURL } = req.body;
  if (!uid) {
    throw new ApiError(400, "UID is required");
  }

  // Fetch latest user record from Firebase Auth
  const firebaseUser = await admin.auth().getUser(uid);

  // Generate username (always unique, derived from UID)
  const username = `user_${uid.slice(-6)}`;

  // Fallback profile image
  const initial = email.charAt(0);
  const defaultImage = `https://api.dicebear.com/9.x/initials/svg?seed=${initial}`;

  const customEmail = username + "@inboxguard.live";

  // Create new user in MongoDB
  const newUser = await User.create({
    firebaseUid: uid,
    email,
    platformMail: customEmail,
    username,
    fullname,
    displayImage: photoURL || firebaseUser.photoURL || defaultImage,
    emailVerified: firebaseUser.emailVerified, // ✅ synced from Firebase
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "User registered successfully"));
});

const userRegisterWithGoogle = asyncHandler(async(req, res)=>{
  const {uid, email, photoURL} = req.body;
  
  const userExist = await User.findOne({email}) 
  if(userExist){
    const existedUser = {
      firebaseUid: userExist.firebaseUid,
      email: userExist.email,
      platformMail: userExist.platformMail,
      username: userExist.username,
      displayImage: userExist.displayImage,
      emailVerified: userExist.emailVerified,
      isActive: userExist.isActive,
      createdAt: userExist.createdAt,
      updatedAt: userExist.updatedAt
    }
    return res.status(200).json(new ApiResponse(201, existedUser, "User existed already."))
  } else {
    const firebaseUser = await admin.auth().getUser(uid);

    // Generate username (always unique, derived from UID)
    const username = `user_${uid.slice(-6)}`;

    // Fallback profile image
    const initial = email.charAt(0);
    const defaultImage = `https://api.dicebear.com/9.x/initials/svg?seed=${initial}`;

    const customEmail = username + "@inboxguard.live";

    // Create new user in MongoDB
    const newUser = await User.create({
      firebaseUid: uid,
      email,
      platformMail: customEmail,
      username,
      displayImage: photoURL || firebaseUser.photoURL || defaultImage,
      emailVerified: firebaseUser.emailVerified, // ✅ synced from Firebase
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newUser, "User registered successfully"));
  }
})

const userLogin = asyncHandler(async(req, res)=>{
  try {
    const decoded = req.user; // set by verifyAuth middleware
    // Sync emailVerified
    if (decoded.email_verified) {
      await User.updateOne(
        { firebaseUid: decoded.uid },
        { $set: { emailVerified: true } }
      );
    }
    // Fetch latest Mongo user
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
})

const storePublicKey = asyncHandler(async(req,res)=>{
  const {publicKey} = req.body
  const {user_id} = req.user
  
  if(!publicKey){
    throw new ApiError(400, "Public key is required.")
  }
  const user = await User.findOne({firebaseUid: user_id})
  if(!user){
    throw new ApiError(404, "User not found.")
  }
  user.securitySettings.encryption.publicKey = publicKey;
  user.securitySettings.encryption.keyGeneratedAt = new Date();
  await user.save();
  res.status(200).json(new ApiResponse(200, null, "Public key stored successfully."))
})

const getPublicKey = asyncHandler(async(req, res)=>{
  const {user_id} = req.user
  const user = await User.findOne({firebaseUid: user_id})
  if(!user){
    throw new ApiError(404, "User not found.")
  }
  const publicKey = user.securitySettings.encryption.publicKey;
  if(!publicKey){
    throw new ApiError(404, "Public key not found. Please generate one first.")
  }
  res.status(200).json(new ApiResponse(200, {publicKey}, "Public key fetched successfully."))
})

// Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const user = await User.findOne({ firebaseUid: user_id }).select('fullname displayImage bio email username platformMail');
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully."));
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const {username, fullname, bio} = req.body;
  
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  
  let payload = {};
  
  if (username !== undefined && username !== user.username) {
    
    const existingUsername = await User.findOne({username: username.trim()});
    if(existingUsername){
      throw new ApiError(400, "Username already taken.");
    }

    payload.username = username.trim();
    payload.platformMail = username.trim() + "@inboxguard.live"

  }

  if(fullname !== undefined && fullname !== user.fullname){
    payload.fullname = fullname.trim();
  }

  if(bio!==undefined && bio !== user.bio){
    payload.bio = bio.trim();
  }

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "No changes detected.");
  }

  const updatedUser = await User.findOneAndUpdate(
    { firebaseUid: user_id },
    { $set: payload, updatedAt: new Date() },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully."));
});

// Update security settings
const updateSecuritySettings = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const { phishingDetection, notifications, encryption, blacklist, whitelist, storage } = req.body;
  
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Guard rails: Disallow changes to algorithms or non-user-configurable fields
  if (encryption !== undefined || storage !== undefined) {
    throw new ApiError(403, "Attempt to change restricted settings.");
  }

  // Explicitly block any algorithm changes under phishingDetection or encryption
  if (phishingDetection && (phishingDetection.algorithm !== undefined)) {
    throw new ApiError(403, "Scanning algorithm cannot be changed.");
  }
  if (phishingDetection && phishingDetection.sensitivity) {
    const allowed = ["low", "medium", "high"];
    if (!allowed.includes(phishingDetection.sensitivity)) {
      throw new ApiError(400, "Invalid sensitivity value.");
    }
  }

  // Update phishing detection settings
  if (phishingDetection) {
    if (phishingDetection.enabled !== undefined) {
      user.securitySettings.phishingDetection.enabled = phishingDetection.enabled;
    }
    if (phishingDetection.sensitivity) {
      user.securitySettings.phishingDetection.sensitivity = phishingDetection.sensitivity;
    }
  }

  // Update notification settings
  if (notifications) {
    if (notifications.phishingAlerts !== undefined) {
      user.securitySettings.notifications.phishingAlerts = notifications.phishingAlerts;
    }
    if (notifications.emailNotifications !== undefined) {
      user.securitySettings.notifications.emailNotifications = notifications.emailNotifications;
    }
    if (notifications.desktopNotifications !== undefined) {
      user.securitySettings.notifications.desktopNotifications = notifications.desktopNotifications;
    }
  }

  // Update block/allow lists (replace with provided entries)
  if (Array.isArray(blacklist)) {
    user.securitySettings.blacklist = blacklist
      .filter((v) => typeof v === 'string' && v.trim().length > 0)
      .map((v) => ({ type: v.includes('@') ? 'email' : 'domain', value: v.trim(), addedAt: new Date() }));
  }
  if (Array.isArray(whitelist)) {
    user.securitySettings.whitelist = whitelist
      .filter((v) => typeof v === 'string' && v.trim().length > 0)
      .map((v) => ({ type: v.includes('@') ? 'email' : 'domain', value: v.trim(), addedAt: new Date() }));
  }

  user.updatedAt = new Date();
  await user.save();

  res.status(200).json(new ApiResponse(200, user.securitySettings, "Security settings updated successfully."));
});

// Get security settings
const getSecuritySettings = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const user = await User.findOne({ firebaseUid: user_id }).select("securitySettings");
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return res.status(200).json(new ApiResponse(200, user.securitySettings, "Security settings fetched successfully."));
});

// Save FCM token for push notifications
const saveFcmToken = asyncHandler(async (req, res) => {
  console.log("hello");
  const { token } = req.body;
  const { user_id } = req.user;
  if (!token) return res.status(400).json({ message: "token required" });
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) return res.status(404).json({ message: "User not found" });
  user.securitySettings.notifications.fcmToken = token;
  user.updatedAt = new Date();
  await user.save();
  res.json({ success: true });
});

// Upload profile image
const uploadProfileImage = asyncHandler(async (req, res) => {
  const { user_id } = req.user;

  if (!req.file) {
    throw new ApiError(400, "No image file provided.");
  }

  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Delete old image if it exists and isn't a default avatar
  if (
    user.publicId &&
    !user.displayImage.includes("api.dicebear.com") &&
    !user.displayImage.includes("firebase")
  ) {
    try {
      await cloudinary.uploader.destroy(user.publicId);
      console.log("Old image deleted from Cloudinary");
    } catch (error) {
      console.log("Error deleting old image:", error.message);
    }
  }

  // Upload new image
  const uploadResponse = await uploadOnCloudinary(req.file.path);
  if (!uploadResponse) {
    throw new ApiError(500, "Failed to upload image to Cloudinary.");
  }

  // Update user info
  user.displayImage = uploadResponse.secure_url;
  user.publicId = uploadResponse.public_id;
  user.updatedAt = new Date();
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { displayImage: user.displayImage },
        "Profile image uploaded successfully."
      )
    );
});

// Lookup public keys for a list of user emails
const lookupPublicKeys = asyncHandler(async (req, res) => {
  const { emails } = req.body || {};
  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: "emails[] required" });
  }
  const users = await User.find({
    $or: [
      { email: { $in: emails } },
      { platformMail: { $in: emails } },
    ],
  }).select("email platformMail securitySettings.encryption.publicKey");
  const results = users.map((u) => ({
    email: u.email,
    platformMail: u.platformMail,
    publicKey: u.securitySettings?.encryption?.publicKey || null,
  }));
  return res.json({ success: true, keys: results });
});

export {userRegister, userRegisterWithGoogle, userLogin, storePublicKey, getPublicKey, getUserProfile, updateUserProfile, updateSecuritySettings, getSecuritySettings, saveFcmToken, uploadProfileImage, lookupPublicKeys};
// Storage usage
export const getStorageUsage = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const user = await User.findOne({ firebaseUid: user_id });
  if (!user) return res.status(404).json({ message: "User not found" });
  // naive compute: sum attachments sizes of user's emails
  const sent = await (await import("../schema/email.schema.js")).Email.aggregate([
    { $match: { from: user._id } },
    { $unwind: { path: "$attachments", preserveNullAndEmptyArrays: true } },
    { $group: { _id: null, total: { $sum: { $ifNull: ["$attachments.fileSize", 0] } } } },
  ]);
  const inbox = await (await import("../schema/email.schema.js")).Email.aggregate([
    { $match: { "to.user": user._id } },
    { $unwind: { path: "$attachments", preserveNullAndEmptyArrays: true } },
    { $group: { _id: null, total: { $sum: { $ifNull: ["$attachments.fileSize", 0] } } } },
  ]);
  const used = (sent[0]?.total || 0) + (inbox[0]?.total || 0);
  res.json({ success: true, used, limit: user.storage?.limit || (1*1024*1024*1024) });
});
