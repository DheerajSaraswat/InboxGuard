// import { Email } from "../schema/email.schema";
import { asyncHandler } from "../utils/asyncHandler.js";

const sendEmail = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  const { to, subject, encryptedBody, attachments, phishingReport } = req.body;

  if (!to || !subject || !encryptedBody) {
    return res
      .status(400)
      .json({ message: "To, subject and encryptedBody are required." });
  }
});

export { sendEmail };
