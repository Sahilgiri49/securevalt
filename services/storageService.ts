import { VaultRecord, EncryptedMetadata } from '../types';

// Mock delay to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY = 'secure_vault_ledger';

import { addToBlockchain, fetchFromBlockchain } from './web3Service';

export const uploadRecord = async (
  encryptedData: string,
  metadata: EncryptedMetadata,
  hash: string
): Promise<VaultRecord> => {

  // 1. Prepare JSON Payload (Data + Metadata)
  // We store the encrypted data AND the metadata (IV, Salt, MimeType) in a single JSON on IPFS.
  const payload = JSON.stringify({
    encryptedData,
    metadata,
    hash
  });

  const blob = new Blob([payload], { type: 'application/json' });
  const file = new File([blob], `secure_record_${Date.now()}.json`);

  // 2. Upload to Pinata IPFS
  const formData = new FormData();
  formData.append('file', file);

  const pinataMetadata = JSON.stringify({
    name: `SecureVault_Record_${Date.now()}`,
    keyvalues: {
      type: 'encrypted_bundle',
      hash_integrity: hash
    }
  });
  formData.append('pinataMetadata', pinataMetadata);
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
      },
      body: formData,
    });

    if (!res.ok) throw new Error(`Pinata Upload Failed: ${res.statusText}`);

    const resData = await res.json();
    const realCid = resData.IpfsHash;

    // 3. STORAGE UPGRADE: Mint to Blockchain (Polygon Amoy)
    // This replaces LocalStorage as the "Source of Truth"
    await addToBlockchain(realCid, hash);

    // 4. Create Record (Client-side return only)
    const newRecord: VaultRecord = {
      id: crypto.randomUUID(),
      ipfsCid: realCid,
      ownerRef: 'AdminWallet',
      timestamp: Date.now(),
      encryptedData,
      metadata,
      hash
    };

    updateLocalCache(newRecord);
    return newRecord;

  } catch (error) {
    console.error("Upload/Mint Error:", error);
    throw error;
  }
};

export const fetchRecords = async (): Promise<VaultRecord[]> => {
  try {
    // Fetch from Blockchain
    const chainData = await fetchFromBlockchain();

    // Retrieve local cache to see if we already have the data
    const localData = getLocalCache();

    return chainData.map((item: any) => {
      const localMatch = localData.find(l => l.ipfsCid === item.cid);
      return {
        id: localMatch?.id || crypto.randomUUID(),
        ipfsCid: item.cid,
        ownerRef: 'Blockchain',
        timestamp: Number(item.timestamp),
        // If local match exists, populate data. Else leave empty to indicate "Needs Fetch"
        encryptedData: localMatch?.encryptedData || '',
        metadata: localMatch?.metadata || { iv: '', salt: '', mimeType: '' },
        hash: item.fileHash
      };
    }).reverse();

  } catch (err) {
    console.warn("Blockchain fetch failed, falling back to local", err);
    return getLocalCache();
  }
};

// New Helper to fetch actual content from IPFS if missing locally
export const hydrateRecordFromIPFS = async (cid: string): Promise<{ encryptedData: string, metadata: EncryptedMetadata }> => {
  try {
    // Use a public gateway or Pinata gateway
    const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    if (!res.ok) throw new Error("Failed to fetch from IPFS");

    const json = await res.json();
    return {
      encryptedData: json.encryptedData,
      metadata: json.metadata
    };
  } catch (err) {
    console.error("IPFS Hydrate Error", err);
    throw err;
  }
};

// Local Storage Helpers
function getLocalCache(): VaultRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function updateLocalCache(record: VaultRecord) {
  const cache = getLocalCache();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...cache]));
}

export const clearVault = () => {
  localStorage.removeItem(STORAGE_KEY);
};