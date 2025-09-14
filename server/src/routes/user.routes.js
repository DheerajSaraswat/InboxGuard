import {Router} from "express";
import { userRegister, userRegisterWithGoogle } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(userRegister);
router.route("/register-google").post(userRegisterWithGoogle)

export default router;