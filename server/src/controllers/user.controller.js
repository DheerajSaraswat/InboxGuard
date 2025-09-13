import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {User} from "../schema/user.schema.js"
import admin from "../config/firebaseAdmin.js";

const userRegister = asyncHandler(async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;

  if (!uid || !email) {
    throw new ApiError(400, "UID and Email are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ firebaseUid: uid });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  // 🔥 Fetch latest user record from Firebase Auth
  const firebaseUser = await admin.auth().getUser(uid);

  // Generate username (always unique, derived from UID)
  const username = `user_${uid.slice(-6)}`;

  // Fallback profile image
  const defaultImage = `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`;

  // Create new user in MongoDB
  const newUser = await User.create({
    firebaseUid: uid,
    email,
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
});

export {userRegister};
