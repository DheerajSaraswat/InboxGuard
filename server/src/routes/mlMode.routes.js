import { Router } from "express";
import { getReport } from "../controllers/mlModel.controller.js";
import { verifyAuth } from "../middlewares/verifyAuth.js";


const router = Router();

router.route("/phish").post(verifyAuth, getReport)

export default router