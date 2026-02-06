import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const PRIVATE_KEY = import.meta.env.VITE_ADMIN_PRIVATE_KEY;
const RPC_URL = import.meta.env.VITE_RPC_URL;

const ABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_cid",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_fileHash",
                "type": "string"
            }
        ],
        "name": "addFile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMyFiles",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "cid",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "fileHash",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct SecureVault.FileData[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Initialize Wallet once
let wallet: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

const getContract = () => {
    if (contract) return contract;

    if (!PRIVATE_KEY || !RPC_URL || !CONTRACT_ADDRESS) {
        console.error("Missing Web3 Config", { PRIVATE_KEY: !!PRIVATE_KEY, RPC_URL, CONTRACT_ADDRESS });
        throw new Error("Blockchain configuration missing");
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    return contract;
};

export const addToBlockchain = async (cid: string, fileHash: string) => {
    const contract = getContract();

    // Debugging: Check Wallet State
    if (wallet) {
        const address = await wallet.getAddress();
        const balance = await wallet.provider?.getBalance(address);
        console.log(`Using Wallet: ${address}`);
        console.log(`Wallet Balance: ${ethers.formatEther(balance || 0)} POL`);
    }

    console.log("Minting to blockchain...", { cid, fileHash });

    // Estimate Gas
    try {
        const gasEstimate = await contract.addFile.estimateGas(cid, fileHash);
        const feeData = await wallet?.provider?.getFeeData();
        const gasPrice = feeData?.gasPrice || 0n;

        console.log(`Estimated Gas Units: ${gasEstimate}`);
        console.log(`Current Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} Gwei`);
        console.log(`Estimated Total Cost: ${ethers.formatEther(gasEstimate * gasPrice)} POL`);

    } catch (e: any) {
        console.warn("Could not estimate gas locally:", e);
        if (e.code === 'INSUFFICIENT_FUNDS' || e.message?.includes('insufficient funds')) {
            throw new Error(`Insufficient POL (Gas). You have ${(ethers.formatEther(await wallet?.provider?.getBalance(await wallet.getAddress()) || 0)).substring(0, 6)} POL. Needed ~0.015 POL. Please use the Polygon Faucet.`);
        }
    }

    try {
        const tx = await contract.addFile(cid, fileHash);
        console.log("Transaction sent:", tx.hash);

        await tx.wait(); // Wait for confirmation
        console.log("Transaction confirmed!");
        return tx.hash;
    } catch (error: any) {
        if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
            throw new Error(`Insufficient POL. Balance: ${(ethers.formatEther(await wallet?.provider?.getBalance(await wallet.getAddress()) || 0)).substring(0, 6)} POL. Please use Faucet.`);
        }
        throw error;
    }
};

export const fetchFromBlockchain = async () => {
    const contract = getContract();
    const result = await contract.getMyFiles();

    return result.map((item: any) => ({
        cid: item.cid,
        fileHash: item.fileHash,
        timestamp: Number(item.timestamp) * 1000 // Convert BigInt to number and seconds to ms
    }));
};
