import { Router } from "express";
import {
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
router.route("/public-key").post(verifyAuth, storePublicKey)

export default router;