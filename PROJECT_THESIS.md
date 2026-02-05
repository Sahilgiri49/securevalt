# Privacy-Preserving Secure Image Vault
## Final Year Project Documentation

### A. High-Level Architecture
The system follows a "Zero-Knowledge" architecture. This means the service provider (the web app/IPFS/Blockchain) never has access to the user's unencrypted data or their password.

1.  **Client (Browser):** Acts as the trusted environment. All encryption and decryption happen here using the Web Crypto API.
2.  **IPFS (InterPlanetary File System):** Acts as the "Dumb Storage Layer". It stores opaque blobs of encrypted data. It knows nothing about the contents.
3.  **Blockchain (Polygon Testnet):** Acts as the "Immutable Ledger". It stores the mapping between a User and their IPFS CIDs, along with a checksum hash to verify data hasn't been tampered with.

### B. Data Flow

**Upload Flow:**
1.  User Selects Image -> Browser reads file into memory.
2.  User Enters Password -> **Client validates Entropy**.
3.  Browser derives AES-256 Key using **PBKDF2-SHA256 (600,000 Iterations)**.
4.  Browser Encrypts Image -> Generates `EncryptedBlob` + `IV` + `Salt`.
5.  Browser Uploads `EncryptedBlob` to IPFS -> IPFS returns `CID`.
6.  Browser sends `CID` + `Hash(EncryptedBlob)` to Smart Contract.

**View Flow:**
1.  Browser queries Smart Contract -> Gets list of `CID`s.
2.  Browser fetches `EncryptedBlob` from IPFS using `CID`.
3.  User Enters Password -> Browser derives AES-256 Key (using stored Salt).
4.  Browser Decrypts `EncryptedBlob` using Key + stored `IV`.
5.  Browser renders image in memory (Blob URL).

### C. Threat Model

| Threat | Impact | Mitigation | Limitation |
| :--- | :--- | :--- | :--- |
| **Server Breach** | Attacker gets IPFS links and Blockchain records. | Data is AES-256 encrypted. Useless without password. | None. |
| **Platform Malice** | Admin tries to view user photos. | Zero-knowledge architecture. Admin has no keys. | None. |
| **Weak Password** | User uses "password123". | Attacker could brute-force the key offline. | **Mitigated:** App enforces Strength Meter & 600k Hash Iterations. |
| **Compromised Device** | Keylogger on user laptop. | Attacker steals password as it is typed. | **Scope Limitation.** We cannot protect against an already infected OS. |
| **Data Tampering** | Malicious node changes IPFS data. | Decryption will fail (GCM Auth Tag) and Blockchain Hash won't match. | Data is lost, but confidentiality is preserved. |

### D. Development Roadmap

1.  **Phase 1: Core Crypto (Completed)** - Implement `deriveKey`, `encrypt`, `decrypt` in isolation.
2.  **Phase 2: Local Simulation (Completed)** - Build UI and mock storage to prove UX flow.
3.  **Phase 3: Smart Contract (Completed)** - Write Solidity contract.
4.  **Phase 4: IPFS Integration** - Replace `mockStorageService` with `ipfs-http-client`.
5.  **Phase 5: Blockchain Integration** - Replace `mockBlockchain` with `ethers.js` and connect to Mumbai Testnet.

### H. Viva-Ready Explanations

**Q: Why AES-GCM?**
A: We use AES-GCM (Galois/Counter Mode) because it provides both confidentiality (encryption) and integrity (authentication). If the encrypted data is tampered with on IPFS, the decryption step will throw an error automatically.

**Q: Why 600,000 Iterations?**
A: PBKDF2 allows us to stretch the key generation process. 600,000 iterations of SHA-256 is the 2024 OWASP recommendation to ensure that even with powerful GPU clusters, brute-forcing a strong password would take decades.

**Q: Where is the key stored?**
A: The key is **never** stored. It is derived on-the-fly from the password every time. Only the *Salt* and *IV* (which are public parameters) are stored.

### I. Future Upgrade Path (Startup)

1.  **Key Management:** Implement Shamir's Secret Sharing to allow social recovery of passwords.
2.  **Performance:** Use WebAssembly (WASM) for faster encryption of 4K video.
3.  **Relayer Service:** Implement a "Gas Station" so users don't need MATIC tokens to upload; the platform pays the gas fees (Freemium model).