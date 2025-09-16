import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {User} from "../schema/user.schema.js"
import admin from "../config/firebaseAdmin.js";

const userRegister = asyncHandler(async (req, res) => {
  const { uid, email, photoURL } = req.body;
console.log(req.user);
  if (!uid || !email) {
    throw new ApiError(400, "UID and Email are required");
  }

  // Fetch latest user record from Firebase Auth
  const firebaseUser = await admin.auth().getUser(uid);

  // Generate username (always unique, derived from UID)
  const username = `user_${uid.slice(-6)}`;

  // Fallback profile image
  const initial = email.charAt(0);
  const defaultImage = `https://api.dicebear.com/9.x/initials/svg?seed=${initial}`;

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

const userRegisterWithGoogle = asyncHandler(async(req, res)=>{
  const {uid, email, displayName, photoURL} = req.body;
  
  const userExist = await User.findOne({email}) 
  if(userExist){
    const existedUser = {
      firebaseUid: userExist.firebaseUid,
      email: userExist.email,
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

export {userRegister, userRegisterWithGoogle, userLogin};
