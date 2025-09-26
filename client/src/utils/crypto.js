// helper conversions
function bufToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function base64ToArrayBuffer(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
}

// 1) RSA keypair generation (store private locally, upload public to your server)
export async function generateRSAKeypair() {
  const kp = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
  const pub = await crypto.subtle.exportKey("spki", kp.publicKey);
  const priv = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
  return { publicKeyB64: bufToBase64(pub), privateKeyB64: bufToBase64(priv) };
}

// 2) AES key generation
export async function generateAESKeyRaw() {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const raw = await crypto.subtle.exportKey("raw", key);
  return { key, raw: new Uint8Array(raw) };
}

// 3) AES encrypt plaintext -> returns base64 cipher + iv base64
export async function aesEncryptText(plaintext, aesKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(plaintext);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    enc
  );
  return { cipherB64: bufToBase64(cipher), ivB64: bufToBase64(iv) };
}

// 4) Encrypt AES raw for recipient's public key (recipientPubB64)
export async function encryptAESForRecipient(aesRawBytes, recipientPubB64) {
  const spki = base64ToArrayBuffer(recipientPubB64);
  const pubKey = await crypto.subtle.importKey(
    "spki",
    spki,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );
  const enc = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    pubKey,
    aesRawBytes
  );
  return bufToBase64(enc);
}

// 5) AES decrypt / RSA decrypt helpers (for client decryption flow) - implement similarly when reading
