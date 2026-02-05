import { EncryptedMetadata } from '../types';

// Utils for ArrayBuffer <-> Base64
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Derives a cryptographic key from a password using PBKDF2.
 * SECURITY UPGRADE: Increased iterations to 600,000 (OWASP 2024 Recommendation).
 * This makes brute-forcing significantly harder but takes ~0.5s on a modern CPU.
 */
export const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 600000, // OWASP recommended minimum for PBKDF2-SHA256
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 }, // AES-256
    false, // Key is not extractable
    ["encrypt", "decrypt"]
  );
};

/**
 * Encrypts file data using AES-GCM-256.
 * Generates a random IV and Salt.
 */
export const encryptFile = async (
  file: File, 
  password: string
): Promise<{ encryptedData: string; metadata: EncryptedMetadata; hash: string }> => {
  
  // 1. Prepare Salt and Key
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  
  // 2. Prepare IV (Initialization Vector) - Must be unique per encryption
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

  // 3. Read File
  const fileBuffer = await file.arrayBuffer();

  // 4. Encrypt
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    fileBuffer
  );

  // 5. Generate Integrity Hash of the Encrypted Blob (for Blockchain)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encryptedBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    encryptedData: bufferToBase64(encryptedBuffer),
    metadata: {
      iv: bufferToBase64(iv.buffer),
      salt: bufferToBase64(salt.buffer),
      mimeType: file.type || 'application/octet-stream'
    },
    hash: hashHex
  };
};

/**
 * Decrypts data using the password and stored metadata (Salt + IV).
 */
export const decryptFile = async (
  encryptedDataBase64: string,
  metadata: EncryptedMetadata,
  password: string
): Promise<string> => { // Returns Data URL
  try {
    // 1. Reconstruct Buffers
    const salt = new Uint8Array(base64ToBuffer(metadata.salt));
    const iv = new Uint8Array(base64ToBuffer(metadata.iv));
    const encryptedData = base64ToBuffer(encryptedDataBase64);

    // 2. Derive Key (Must allow failure here if password is wrong)
    const key = await deriveKey(password, salt);

    // 3. Decrypt
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encryptedData
    );

    // 4. Convert to Blob/URL for display
    // FIX: Use the stored mimeType so the browser knows how to display it
    const blob = new Blob([decryptedBuffer], { type: metadata.mimeType || 'image/png' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Decryption failed", error);
    throw new Error("Invalid password or corrupted data.");
  }
};

/**
 * Calculates a simple entropy score for password strength feedback.
 * 0-20: Weak, 20-40: Fair, 40-60: Good, 60+: Strong
 */
export const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (!password) return { score: 0, label: 'Empty', color: 'bg-slate-700' };

  // Length Check
  score += password.length * 4;

  // Complexity Checks
  if (/[A-Z]/.test(password)) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  // Deduction for obvious patterns
  if (/^password/i.test(password)) score -= 30;
  if (/^12345/.test(password)) score -= 30;

  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  if (score < 30) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score < 60) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score < 80) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
};