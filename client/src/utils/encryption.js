import api from "./api";
import {
  generateAESKeyRaw,
  aesEncryptText,
  encryptAESForRecipient,
} from "./crypto";

function base64FromArrayBuffer(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function encryptFileWithAES(file, aesCryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const arrayBuffer = await file.arrayBuffer();
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesCryptoKey,
    arrayBuffer
  );

  const encryptedBlob = new Blob([cipherBuffer], { type: "application/octet-stream" });
  return {
    blob: encryptedBlob,
    ivB64: base64FromArrayBuffer(iv),
    size: encryptedBlob.size,
  };
}

async function uploadToCloudinary({ blob, fileName }) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary env vars missing: VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UNSIGNED_PRESET");
  }

  const form = new FormData();
  form.append("file", blob, fileName);
  form.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return {
    url: json.secure_url || json.url,
    publicId: json.public_id,
    bytes: json.bytes,
    format: json.format,
    resourceType: json.resource_type,
  };
}

async function getCurrentUserPublicKeyB64() {
  const response = await api.get("/users/crypto/public-key");
  const publicKeyB64 = response.data.data.publicKey;
  // Expect { publicKeyB64: string }
  if (!publicKeyB64) {
    throw new Error("Missing user public key from server");
  }
  return publicKeyB64;
}

export async function encryptEmailAndAttachments({ subject, htmlBody, attachments }) {
  // 1) Generate AES session key
  const { key: aesKey, raw: aesRaw } = await generateAESKeyRaw();

  // 2) Encrypt body (HTML)
  const { cipherB64: bodyCipherB64, ivB64: bodyIvB64 } = await aesEncryptText(
    htmlBody,
    aesKey
  );

  // 3) Encrypt attachments and upload to Cloudinary
  const encryptedUploads = [];
  for (const f of attachments || []) {
    const { blob, ivB64, size } = await encryptFileWithAES(f.file, aesKey);
    const fileName = `${f.name}.enc`;
    const uploaded = await uploadToCloudinary({ blob, fileName });
    encryptedUploads.push({
      originalName: f.name,
      originalSize: f.size,
      mimeType: f.type,
      encryptedSize: size,
      ivB64,
      url: uploaded.url,
      publicId: uploaded.publicId,
      resourceType: uploaded.resourceType,
      format: uploaded.format,
    });
  }

  // 4) Encrypt AES key with current user's public key for at-rest storage
  const userPublicKeyB64 = await getCurrentUserPublicKeyB64();
  const encryptedAesKeyB64 = await encryptAESForRecipient(aesRaw, userPublicKeyB64);

  return {
    subject, // stored in plaintext unless you decide otherwise
    encryptedBody: {
      cipherB64: bodyCipherB64,
      ivB64: bodyIvB64,
      encryptedAesKeyB64,
      algo: "AES-GCM-256",
      keyWrappedWith: "RSA-OAEP-2048-SHA256",
    },
    attachments: encryptedUploads,
  };
}




