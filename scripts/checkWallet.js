
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (one level up from scripts)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkWallet() {
    const privateKey = process.env.VITE_ADMIN_PRIVATE_KEY;
    const rpcUrl = process.env.VITE_RPC_URL;

    console.log("--- Wallet Diagnostic ---");

    if (!privateKey) {
        console.error("ERROR: VITE_ADMIN_PRIVATE_KEY is missing in .env");
        return;
    }
    if (!rpcUrl) {
        console.error("ERROR: VITE_RPC_URL is missing in .env");
        return;
    }

    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const address = await wallet.getAddress();
        const balanceWei = await provider.getBalance(address);
        const balancePol = ethers.formatEther(balanceWei);

        console.log(`\n🔑 Private Key (Configured in .env): ${privateKey.substring(0, 6)}...${privateKey.substring(62)}`);
        console.log(`👛 Wallet Address: ${address}`);
        console.log(`💰 Balance: ${balancePol} POL`);
        console.log(`\n-------------------------`);

        const costEstimate = 0.015;
        if (parseFloat(balancePol) < costEstimate) {
            console.log(`❌ INSUFFICIENT FUNDS!`);
            console.log(`You have ${balancePol} POL.`);
            console.log(`You need approx ${costEstimate} POL.`);
            console.log(`\n👉 This is different from your Remix/Metamask wallet.`);
            console.log(`👉 Please send POL to: ${address}`);
        } else {
            console.log(`✅ Funds look OK (${balancePol} > ${costEstimate}).`);
        }

    } catch (err) {
        console.error("Connection Error:", err.message);
    }
}

checkWallet();
