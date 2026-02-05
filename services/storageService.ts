import { VaultRecord, EncryptedMetadata } from '../types';

// Mock delay to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEY = 'secure_vault_ledger';

export const uploadRecord = async (
  encryptedData: string,
  metadata: EncryptedMetadata,
  hash: string
): Promise<VaultRecord> => {
  await delay(1500); // Simulate network upload time

  // 1. Simulate IPFS Upload (Generation of CID)
  // In real life: const result = await ipfs.add(encryptedData);
  const pseudoCid = `Qm${Math.random().toString(36).substring(2, 15)}...${Math.random().toString(36).substring(2, 6)}`;

  // 2. Simulate Blockchain Transaction
  // In real life: await contract.storeImage(pseudoCid, hash);
  const newRecord: VaultRecord = {
    id: crypto.randomUUID(),
    ipfsCid: pseudoCid,
    ownerRef: '0xUser...' + Math.floor(Math.random() * 1000),
    timestamp: Date.now(),
    encryptedData, // Storing locally for demo purposes. In prod, this lives on IPFS.
    metadata,
    hash
  };

  // 3. Update Local Ledger
  const currentLedgerRaw = localStorage.getItem(STORAGE_KEY);
  const currentLedger: VaultRecord[] = currentLedgerRaw ? JSON.parse(currentLedgerRaw) : [];
  
  const updatedLedger = [newRecord, ...currentLedger];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLedger));

  return newRecord;
};

export const fetchRecords = async (): Promise<VaultRecord[]> => {
  await delay(500);
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const clearVault = () => {
  localStorage.removeItem(STORAGE_KEY);
};