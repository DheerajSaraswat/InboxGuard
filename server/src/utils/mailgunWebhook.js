import crypto from "crypto";

// Verify Mailgun webhook signature per docs:
// signature = HMAC-SHA256(apiKey, timestamp + token)
export const verifyMailgunSignature = ({ timestamp, token, signature }) => {
  const apiKey = process.env.MAILGUN_API_KEY;
  if (!apiKey) return false;
  if (!timestamp || !token || !signature) return false;
  const hmac = crypto.createHmac("sha256", apiKey).update(timestamp + token).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
};


