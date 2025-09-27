import { uploadPublicKeyToServer } from "../apiRequests/uploadPublicKeyToServer";

// helper conversions
function bufToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function base64ToArrayBuffer(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
}

const DB_NAME = "E2EE_KeyStore";
const KEY_STORE_NAME = "privateKeys";


function getDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(KEY_STORE_NAME)) {
        db.createObjectStore(KEY_STORE_NAME, { keyPath: "userId" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) =>
      reject(new Error("IndexedDB error: " + event.target.error));
  });
}

export async function checkLocalPrivateKey(userId) {
  try {
    const db = await getDb();
    const transaction = db.transaction([KEY_STORE_NAME], "readonly");
    const store = transaction.objectStore(KEY_STORE_NAME);
    const request = store.get(userId);

    return new Promise((resolve) => {
      request.onsuccess = (event) => resolve(!!event.target.result);
      request.onerror = () => resolve(false);
    });
  } catch (error) {
    console.error("Error checking local key:", error);
    return false;
  }
}

export async function generateAndStoreKeyPair(userId) {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-256",
    },
    // Private key is NOT extractable, Public Key is extractable
    { extractable: true, usages: ["encrypt"] },
    ["encrypt", "decrypt"]
  );

  // Store the non-exportable private key in IndexedDB
  try {
    const db = await getDb();
    const transaction = db.transaction([KEY_STORE_NAME], "readwrite");
    const store = transaction.objectStore(KEY_STORE_NAME);

    const request = store.put({ userId: userId, key: keyPair.privateKey });

    await new Promise((resolve, reject) => {
      request.onsuccess = resolve;
      request.onerror = reject;
    });

    return keyPair;
  } catch (error) {
    console.error("Failed to store private key:", error);
    throw new Error(
      "E2EE initialization failed: Could not securely store private key."
    );
  }
}
// 1) RSA keypair generation (store private locally, upload public to your server)
/**
 * Executes after a successful login/verification, ensuring the user has a key pair.
 */
export async function initializeUserKeys(userId, userPublicKeysFromServer = []) {
    
    // 1. CHECK LOCAL STORAGE (IndexedDB)
    // Your e2ee.js file must have a function to check for the Private Key.
    const privateKeyExists = await checkLocalPrivateKey(userId);

    if (privateKeyExists) {
        console.log("Private key already exists on this device. Initialization complete.");
        return;
    }

    // 2. CHECK SERVER FOR KEY BACKUP
    // You should also check if the user has a key backup stored on the server 
    // (e.g., encrypted with their password).
    const backupKeyAvailable = userPublicKeysFromServer.some(key => key.isBackup); 

    if (backupKeyAvailable) {
        console.log("No local key found. Prompting user to restore key from backup.");
        // Prompt user for their backup password and call restorePrivateKeyWithPassword()
        // ... (restore logic) ...
        return;
    }

    // 3. GENERATE NEW KEY (First Time on this device)
    console.log("No key found locally or via backup. Generating a new key pair.");
    
    // This is the only place generateAndStoreKeyPair() should be called outside of a key rotation.
    const newKeys = await generateAndStoreKeyPair(userId); 

    // 4. UPLOAD NEW PUBLIC KEY
    const keyBuffer = await window.crypto.subtle.exportKey(
      "spki",
      newKeys.publicKey
    );
    const base64Key = bufToBase64(keyBuffer);
    await uploadPublicKeyToServer(base64Key);

    console.log("New key pair generated and public key uploaded.");
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