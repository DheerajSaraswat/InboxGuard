import { Router } from "express";
import {
  getPublicKey,
  storePublicKey,
  userLogin,
  userRegister,
  userRegisterWithGoogle,
  getUserProfile,
  updateUserProfile,
  updateSecuritySettings,
  saveFcmToken,
  uploadProfileImage,
} from "../controllers/user.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.js";
import {upload} from "../middlewares/multer.js"

const router = Router();

router.route("/register").post(userRegister);
router.route("/register-google").post(userRegisterWithGoogle);
router.route("/login").post(verifyAuth , userLogin);
router.route("/public-key").post(verifyAuth, storePublicKey);
router.route("/crypto/public-key").get(verifyAuth, getPublicKey);
router.route("/profile").get(verifyAuth, getUserProfile);
router.route("/profile").put(verifyAuth, updateUserProfile);
router.route("/profile/upload-image").post(verifyAuth, upload.single('image'), uploadProfileImage);
router.route("/security-settings").put(verifyAuth, updateSecuritySettings);
router.route("/fcm-token").post(verifyAuth, saveFcmToken);

export default router;