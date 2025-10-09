import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({ username: "api", key: process.env.MAILGUN_API_KEY });

export const sendMailViaMailgun = async ({
  from,
  to = [],
  subject,
  text,
  html,
  attachments = [],
}) => {
  if (!process.env.MAILGUN_DOMAIN) throw new Error("MAILGUN_DOMAIN not set");
  const domain = process.env.MAILGUN_DOMAIN;

  // Basic internal policy example: allow internal only if configured
  if (process.env.INTERNAL_ONLY === "true") {
    const allInternal = [from, ...to].every((addr) => /@inboxguard\.com$/i.test(addr));
    if (!allInternal) throw new Error("Unauthorized: only internal mail allowed");
  }

  const files = attachments.map((a) => ({
    filename: a.filename,
    data: a.buffer,
    contentType: a.contentType,
  }));

  const payload = {
    from,
    to,
    subject,
    text,
    html,
  };
  if (files.length) payload.attachment = files;

  const result = await mg.messages.create(domain, payload);
  return result;
};

