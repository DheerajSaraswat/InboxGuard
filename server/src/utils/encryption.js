import crypto from "crypto";

// AES-256-GCM symmetric encryption using an app-level key
// The ciphertext format returned is base64 of: iv(12 bytes) + ciphertext + authTag(16 bytes)
const getKey = () => {
  const keyB64 = process.env.APP_ENCRYPTION_KEY_B64;
  if (!keyB64) {
    throw new Error("APP_ENCRYPTION_KEY_B64 is not set");
  }
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) {
    throw new Error("APP_ENCRYPTION_KEY_B64 must decode to 32 bytes (AES-256)");
  }
  return key;
};

export const encryptText = (plaintext) => {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, ciphertext, authTag]);
  return combined.toString("base64");
};

export const decryptText = (cipherB64) => {
  const key = getKey();
  const buf = Buffer.from(cipherB64, "base64");
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(buf.length - 16);
  const ciphertext = buf.subarray(12, buf.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  return plaintext;
};


