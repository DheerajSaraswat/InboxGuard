import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export async function sendMailViaMailgun({
  from,
  to = [],
  subject,
  text,
  html,
  attachments = [],
}) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
    url: process.env.MAILGUN_BASE_URL,
  });

  try {
    if (!process.env.MAILGUN_DOMAIN) throw new Error("MAILGUN_DOMAIN not set");
    const domain = process.env.MAILGUN_DOMAIN;

    // Allow only internal emails if configured
    if (process.env.INTERNAL_ONLY === "true") {
      const internalDomain = domain.replace(/\./g, "\\.");
      const allInternal = [from, ...to].every((addr) =>
        new RegExp(`@${internalDomain}$`, "i").test(addr)
      );
      if (!allInternal)
        throw new Error("Unauthorized: only internal mail allowed");
    }

    // Prepare attachments if any
    const files = attachments.map((a) => ({
      filename: a.filename,
      data: a.buffer,
      contentType: a.contentType,
    }));

    // Send to multiple recipients in parallel
    const results = await Promise.all(
      to.map((recipient) =>
        mg.messages.create(domain, {
          from: from || `postmaster@${domain}`, // fallback if not provided
          to: recipient,
          subject,
          text,
          html,
          ...(files.length && { attachment: files }),
        })
      )
    );

    console.log("Emails sent successfully:", results);
    return results;
  } catch (error) {
    console.error("Error sending emails:", error);
    throw error;
  }
}
