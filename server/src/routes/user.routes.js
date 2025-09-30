import { Router } from "express";
import {
  getPublicKey,
  storePublicKey,
  userLogin,
  userRegister,
  userRegisterWithGoogle,
} from "../controllers/user.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.js";

const router = Router();

router.route("/register").post(userRegister);
router.route("/register-google").post(userRegisterWithGoogle);
router.route("/login").post(verifyAuth , userLogin);
router.route("/public-key").post(verifyAuth, storePublicKey);
router.route("/crypto/public-key").get(verifyAuth, getPublicKey);

export default router;