export interface EncryptedMetadata {
  iv: string;   // Base64 Initialization Vector
  salt: string; // Base64 Salt for Key Derivation
  mimeType: string; // Original MIME type of the file
}

export interface VaultRecord {
  id: string;           // Blockchain ID
  ipfsCid: string;      // The pointer to the file
  ownerRef: string;     // Pseudonymous ID
  timestamp: number;
  encryptedData: string; // Base64 encoded encrypted string (Simulating IPFS content)
  metadata: EncryptedMetadata;
  hash: string;         // Integrity hash of the encrypted blob
}

export enum VaultState {
  IDLE,
  ENCRYPTING,
  UPLOADING,
  DECRYPTING,
  ERROR,
  SUCCESS
}

export interface DecryptedImage {
  id: string;
  dataUrl: string;
}