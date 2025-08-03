// backend/controllers/creatorController.js
import {
  creators,
  nftData,
  revenueData,
  likedSongs,
  followingData,
  vaultStats,
} from "../data/creatorData.js";

// Import Sui blockchain service functions
import {
  mintContentTokens,
  createVault,
} from "../services/suiService.js";

/* -------------------------
   Existing endpoints
-------------------------- */
export const getCreatorProfile = (req, res) => {
  const { creatorId } = req.params;
  const data = creators[creatorId];
  if (!data) return res.status(404).json({ error: "Creator not found" });
  res.json(data);
};

export const getCreatorNFTs = (req, res) => {
  const { creatorId } = req.params;
  res.json(nftData[creatorId] || []);
};

export const getCreatorRevenue = (req, res) => {
  const { creatorId } = req.params;
  res.json(revenueData[creatorId] || []);
};

export const getLikedSongs = (req, res) => {
  const { creatorId } = req.params;
  res.json(likedSongs[creatorId] || []);
};

export const getFollowing = (req, res) => {
  const { creatorId } = req.params;
  res.json(followingData[creatorId] || []);
};

export const getVaults = (req, res) => {
  const { creatorId } = req.params;
  res.json(vaultStats[creatorId] || []);
};

/* -------------------------
   New endpoint:
   Tokenise a creator's song
-------------------------- */
export const tokeniseSong = async (req, res) => {
  try {
    const { toAddress, amount, creatorAddress, trackIdHex } = req.body;

    if (!toAddress || !amount || !creatorAddress || !trackIdHex) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    console.log(`🚀 Starting tokenisation for creator ${creatorAddress}`);

    // 1️⃣ Create a vault for the song
    const vaultTx = await createVault({
      trackIdHex,
      creatorAddress,
    });
    console.log("✅ Vault created:", vaultTx);

    // 2️⃣ Mint content tokens for the song
    const mintTx = await mintContentTokens({
      toAddress,
      amount,
      creatorAddress,
      trackIdHex,
    });
    console.log("✅ Tokens minted:", mintTx);

    // 3️⃣ Respond to frontend
    res.json({
      success: true,
      vaultTransaction: vaultTx,
      mintTransaction: mintTx,
    });
  } catch (error) {
    console.error("❌ Error tokenising song:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
