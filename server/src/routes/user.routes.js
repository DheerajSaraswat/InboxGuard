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
  getSecuritySettings,
  saveFcmToken,
  uploadProfileImage,
  lookupPublicKeys,
  getStorageUsage,
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
router.route("/security-settings").get(verifyAuth, getSecuritySettings);
router.route("/fcm-token").post(verifyAuth, saveFcmToken);
router.route("/storage-usage").get(verifyAuth, getStorageUsage);
router.route("/crypto/lookup-public-keys").post(verifyAuth, lookupPublicKeys);
router.route("/update-fcm-token").post(verifyAuth, saveFcmToken)

export default router;