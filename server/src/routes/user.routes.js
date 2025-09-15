import { Router } from "express";
import {
  userLogin,
  userRegister,
  userRegisterWithGoogle,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(userRegister);
router.route("/register-google").post(userRegisterWithGoogle);
router.route("/login").post(userLogin);

export default router;