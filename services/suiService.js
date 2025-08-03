import axios from "axios";
import nacl from "tweetnacl";
import { fromB64, toB64 } from "@mysten/bcs";
import dotenv from "dotenv";
dotenv.config();

/* -------------------------
   1️⃣ Setup Sui RPC
-------------------------- */
const SUI_RPC_URL = process.env.SUI_RPC_URL;
const PACKAGE_ID = process.env.SUI_PACKAGE_ID;
const TREASURY_CAP_ID = process.env.TREASURY_CAP_ID;
const TRACK_SUPPLY_REGISTRY_ID = process.env.TRACK_SUPPLY_REGISTRY_ID;
const VAULT_REGISTRY_ID = process.env.VAULT_REGISTRY_ID;
const YIELD_PROTOCOL_ID = process.env.YIELD_PROTOCOL_ID;

/* -------------------------
   2️⃣ Load Keypair from .env
-------------------------- */
if (!process.env.SUI_PRIVATE_KEY) {
    throw new Error("Missing SUI_PRIVATE_KEY in .env");
}

// Decode from Base64
let raw = fromB64(process.env.SUI_PRIVATE_KEY);

// If includes 0x00 Ed25519 flag → remove first byte
if (raw.length === 33) {
    raw = raw.slice(1);
}

let secretKey;
if (raw.length === 32) {
    // Expand seed → full 64-byte secret key
    const kp = nacl.sign.keyPair.fromSeed(raw);
    secretKey = kp.secretKey;
} else if (raw.length === 64) {
    secretKey = raw;
} else {
    throw new Error(`Unexpected private key length: ${raw.length} bytes`);
}

const keypair = nacl.sign.keyPair.fromSecretKey(secretKey);
const publicKey = keypair.publicKey;

/* -------------------------
   Helper: Send RPC request
-------------------------- */
async function rpc(method, params) {
    try {
        const { data } = await axios.post(SUI_RPC_URL, {
            jsonrpc: "2.0",
            id: 1,
            method,
            params
        });
        if (data.error) {
            throw new Error(`RPC error: ${data.error.message}`);
        }
        return data.result;
    } catch (error) {
        console.error(`RPC call failed for method ${method}:`, error);
        throw error;
    }
}

/* -------------------------
   Helper: Sign & Execute Transaction
-------------------------- */
async function signAndExecuteTransactionBlock(txBytes) {
    const signature = nacl.sign.detached(txBytes, keypair.secretKey);
    return rpc("sui_executeTransactionBlock", [
        toB64(txBytes),
        [toB64(signature)],
        { showEffects: true, showEvents: true }
    ]);
}

/* -------------------------
   3️⃣ YIELD STATS
-------------------------- */
export async function getYieldStats({ protocolId, vaultId, userAddress }) {
    try {
        if (!protocolId || !vaultId || !userAddress) {
            throw new Error("Missing required parameters: protocolId, vaultId, or userAddress");
        }

        console.log(`Fetching yield stats for vault ${vaultId} in protocol ${protocolId} for user ${userAddress}`);

        // Simulate querying yield stats via a Move call (assuming yield_protocol module has get_yield_stats)
        const result = await rpc("sui_call", [
            {
                package: PACKAGE_ID,
                module: "yield_protocol",
                function: "get_yield_stats",
                arguments: [
                    { Object: protocolId },
                    { Object: vaultId },
                    { Pure: userAddress }
                ]
            }
        ]);

        // Parse result (assuming it returns yieldEarned and stakeAmount in SUI)
        const yieldStats = {
            yieldEarned: result?.yieldEarned || "0",
            stakeAmount: result?.stakeAmount || "0"
        };

        console.log(`Yield stats retrieved:`, yieldStats);
        return yieldStats;
    } catch (error) {
        console.error("Failed to fetch yield stats:", error);
        throw new Error(`Failed to fetch yield stats: ${error.message}`);
    }
}

/* -------------------------
   4️⃣ TRANSFER TOKENS
-------------------------- */
export async function transferTokens({ toAddress, amount, creatorAddress, trackIdHex }) {
    try {
        if (!toAddress || !amount || !creatorAddress || !trackIdHex) {
            throw new Error("Missing required parameters: toAddress, amount, creatorAddress, or trackIdHex");
        }

        console.log(`Transferring ${amount} tokens for track ${trackIdHex} to ${toAddress}`);

        const tx = {
            kind: "ProgrammableTransaction",
            transactions: [
                {
                    MoveCall: {
                        package: PACKAGE_ID,
                        module: "content_token",
                        function: "transfer_tokens",
                        arguments: [
                            { Object: TRACK_SUPPLY_REGISTRY_ID },
                            { Pure: toAddress },
                            { Pure: amount },
                            { Pure: creatorAddress },
                            { Pure: Array.from(Buffer.from(trackIdHex, "hex")) }
                        ]
                    }
                }
            ]
        };

        const txBytes = Buffer.from(JSON.stringify(tx));
        const result = await signAndExecuteTransactionBlock(txBytes);
        console.log(`Tokens transferred:`, result);
        return result;
    } catch (error) {
        console.error("Failed to transfer tokens:", error);
        throw new Error(`Failed to transfer tokens: ${error.message}`);
    }
}

/* -------------------------
   5️⃣ CONTENT TOKEN
-------------------------- */
export async function mintContentTokens({ toAddress, amount, creatorAddress, trackIdHex }) {
    const tx = {
        kind: "ProgrammableTransaction",
        transactions: [
            {
                MoveCall: {
                    package: PACKAGE_ID,
                    module: "content_token",
                    function: "mint_content_tokens",
                    arguments: [
                        { Object: TRACK_SUPPLY_REGISTRY_ID },
                        { Object: TREASURY_CAP_ID },
                        { Pure: toAddress },
                        { Pure: amount },
                        { Pure: creatorAddress },
                        { Pure: Array.from(Buffer.from(trackIdHex, "hex")) }
                    ]
                }
            }
        ]
    };

    const txBytes = Buffer.from(JSON.stringify(tx));
    return signAndExecuteTransactionBlock(txBytes);
}

/* -------------------------
   6️⃣ VAULT
-------------------------- */
export async function createVault({ trackIdHex, creatorAddress }) {
    const tx = {
        kind: "ProgrammableTransaction",
        transactions: [
            {
                MoveCall: {
                    package: PACKAGE_ID,
                    module: "vault",
                    function: "create_vault",
                    arguments: [
                        { Object: VAULT_REGISTRY_ID },
                        { Pure: Array.from(Buffer.from(trackIdHex, "hex")) },
                        { Pure: creatorAddress }
                    ]
                }
            }
        ]
    };

    const txBytes = Buffer.from(JSON.stringify(tx));
    return signAndExecuteTransactionBlock(txBytes);
}

/* -------------------------
   7️⃣ CURVE
-------------------------- */
export async function initializeCurve({ slope, basePrice, vaultId }) {
    const tx = {
        kind: "ProgrammableTransaction",
        transactions: [
            {
                MoveCall: {
                    package: PACKAGE_ID,
                    module: "curve",
                    function: "initialize",
                    arguments: [
                        { Pure: slope },
                        { Pure: basePrice },
                        { Object: vaultId }
                    ]
                }
            }
        ]
    };

    const txBytes = Buffer.from(JSON.stringify(tx));
    return signAndExecuteTransactionBlock(txBytes);
}

/* -------------------------
   8️⃣ YIELD PROTOCOL
-------------------------- */
export async function stakeInVault({ protocolId, suiCoinId }) {
    const tx = {
        kind: "ProgrammableTransaction",
        transactions: [
            {
                MoveCall: {
                    package: PACKAGE_ID,
                    module: "yield_protocol",
                    function: "stake",
                    arguments: [
                        { Object: protocolId },
                        { Object: suiCoinId },
                        { Object: "0x6" } // Clock object, standard in Sui
                    ]
                }
            }
        ]
    };

    const txBytes = Buffer.from(JSON.stringify(tx));
    return signAndExecuteTransactionBlock(txBytes);
}

/* -------------------------
   9️⃣ GOVERNANCE
-------------------------- */
export async function updateCurveParams({ governanceId, trackIdHex, basePrice, slope, curveType }) {
    const tx = {
        kind: "ProgrammableTransaction",
        transactions: [
            {
                MoveCall: {
                    package: PACKAGE_ID,
                    module: "curve_governance",
                    function: "update_curve_params",
                    arguments: [
                        { Object: governanceId },
                        { Pure: Array.from(Buffer.from(trackIdHex, "hex")) },
                        { Pure: basePrice },
                        { Pure: slope },
                        { Pure: curveType }
                    ]
                }
            }
        ]
    };

    const txBytes = Buffer.from(JSON.stringify(tx));
    return signAndExecuteTransactionBlock(txBytes);
}

/* -------------------------
   10️⃣ UNSTAKE FROM VAULT
-------------------------- */
export async function unstakeFromVault({ protocolId, vaultId }) {
    try {
        const tx = {
            kind: "ProgrammableTransaction",
            transactions: [
                {
                    MoveCall: {
                        package: PACKAGE_ID,
                        module: "yield_protocol",
                        function: "unstake",
                        arguments: [
                            { Object: protocolId },
                            { Object: vaultId },
                            { Object: "0x6" } // Clock object, standard in Sui
                        ]
                    }
                }
            ]
        };

        const txBytes = Buffer.from(JSON.stringify(tx));
        return signAndExecuteTransactionBlock(txBytes);
    } catch (error) {
        console.error("Failed to unstake from vault:", error);
        throw new Error(`Failed to unstake from vault: ${error.message}`);
    }
}

/* -------------------------
   11️⃣ Export signer-like objects
-------------------------- */
export const signer = { publicKey };
export const provider = { rpc };
export const myKeypair = keypair;