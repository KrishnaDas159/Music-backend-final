import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.js";
import Vault from "../models/nftSchema.js";
import RevenueVault from "../models/vaultRevenue.js";
import ClaimableReward from "../models/claimableReward.js";

// Sui blockchain service imports
import { stakeInVault, provider } from "../services/suiService.js";

dotenv.config();

// Fixed Yield Protocol ID (from .env)
const YIELD_PROTOCOL_ID = process.env.YIELD_PROTOCOL_ID;

/**
 * Check if a user holds any fungible tokens for a given track
 */
async function userHoldsTrackTokens(userAddress, trackCoinType) {
  try {
    const coins = await provider.getCoins({
      owner: userAddress,
      coinType: trackCoinType,
    });
    return coins.data.length > 0;
  } catch (err) {
    console.error("Error checking token holdings:", err);
    return false;
  }
}

/**
 * Get user-owned NFTs/tokens (Vaults where user holds fungible tokens)
 */
export const getUserNFTs = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const allVaults = await Vault.find({}).lean();
    const filteredVaults = [];

    for (const vault of allVaults) {
      // Assume vault has a `coinType` field representing the fungible token type
      if (!vault.coinType) continue;

      const holdsTokens = await userHoldsTrackTokens(user.walletAddress, vault.coinType);
      if (holdsTokens) {
        filteredVaults.push(vault);
      }
    }

    res.json({ [userId]: filteredVaults });
  } catch (err) {
    console.error("Failed to fetch NFTs:", err);
    res.status(500).json({ error: "Failed to fetch NFTs" });
  }
};

/**
 * Auto-stake a vault into yield protocol when created
 */
export const autoStakeVault = async (vaultId) => {
  try {
    if (!YIELD_PROTOCOL_ID) {
      console.error("❌ YIELD_PROTOCOL_ID is missing in .env");
      return;
    }

    console.log(`🚀 Auto-staking vault ${vaultId} into yield protocol ${YIELD_PROTOCOL_ID}`);

    await stakeInVault({
      protocolId: YIELD_PROTOCOL_ID,
      suiCoinId: vaultId, // Assuming vaultId is the object ID used for staking
    });

    console.log(`✅ Vault ${vaultId} staked successfully`);
  } catch (err) {
    console.error(`❌ Failed to auto-stake vault ${vaultId}:`, err);
  }
};

/**
 * Get revenue vaults
 */
export const getRevenueVaults = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const revenueVaults = await RevenueVault.find({ userId }).lean();
    res.json(revenueVaults);
  } catch (err) {
    console.error("Failed to fetch revenue vaults:", err);
    res.status(500).json({ error: "Failed to fetch revenue vaults" });
  }
};

/**
 * Get claimable rewards
 */
export const getClaimableRewards = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const claimableRewards = await ClaimableReward.find({ userId }).lean();
    res.json(claimableRewards);
  } catch (err) {
    console.error("Failed to fetch claimable rewards:", err);
    res.status(500).json({ error: "Failed to fetch claimable rewards" });
  }
};
