import express from "express";
import {asyncHandler} from "../utils/asyncHandler.js";
import { PhishingReport } from "../schema/phishingReport.schema.js";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = req.body;
    // validate minimal: reportedBy and contentSignature
    const report = await PhishingReport.create(body);
    res.status(201).json({ ok: true, id: report._id });
  })
);

export default router;
