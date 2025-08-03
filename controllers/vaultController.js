import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.js";
import Vault from "../models/nftSchema.js";
import RevenueVault from "../models/vaultRevenue.js";
import ClaimableReward from "../models/claimableReward.js";
import { initCurveForVault } from "./curveController.js"; // Import to initialize curve

// Sui blockchain service imports
import { stakeInVault, unstakeFromVault, provider, getYieldStats } from "../services/suiService.js";

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
 * Auto-stake a vault into yield protocol and initialize bonding curve
 */
export const autoStakeVault = async (vaultId) => {
  try {
    if (!YIELD_PROTOCOL_ID) {
      console.error("❌ YIELD_PROTOCOL_ID is missing in .env");
      return;
    }

    console.log(`🚀 Auto-staking vault ${vaultId} into yield protocol ${YIELD_PROTOCOL_ID}`);

    // Stake the vault
    const stakeTx = await stakeInVault({
      protocolId: YIELD_PROTOCOL_ID,
      suiCoinId: vaultId,
    });

    // Initialize bonding curve for the vault
    const curveResult = await initCurveForVault({
      slope: 0.01, // Default slope
      basePrice: "0.1", // Default base price in SUI
      vaultId,
    });

    // Update Vault model with staking and curve data
    await Vault.findOneAndUpdate(
        { id: vaultId },
        {
          isStaked: true,
          protocol: "Sui Yield Protocol",
          curveId: curveResult.tx, // Store curveId from transaction
        },
        { new: true }
    );

    console.log(`✅ Vault ${vaultId} staked successfully: ${stakeTx}, Curve initialized: ${curveResult.tx}`);
  } catch (err) {
    console.error(`❌ Failed to auto-stake vault ${vaultId}:`, err);
    throw err;
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
    const enrichedVaults = await Promise.all(
        revenueVaults.map(async (vault) => {
          const vaultData = await Vault.findOne({ id: vault.vaultId }).lean();
          return {
            ...vault,
            yieldEarned: vaultData?.yieldEarned || "0",
            isStaked: vaultData?.isStaked || false,
            protocol: vaultData?.protocol || "Sui Yield Protocol",
            curveId: vaultData?.curveId,
          };
        })
    );

    res.json(enrichedVaults);
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
    const enrichedRewards = await Promise.all(
        claimableRewards.map(async (reward) => {
          const vaultData = await Vault.findOne({ id: reward.vaultId }).lean();
          return {
            ...reward,
            yieldEarned: vaultData?.yieldEarned || "0",
            protocol: vaultData?.protocol || "Sui Yield Protocol",
            curveId: vaultData?.curveId,
          };
        })
    );

    res.json(enrichedRewards);
  } catch (err) {
    console.error("Failed to fetch claimable rewards:", err);
    res.status(500).json({ error: "Failed to fetch claimable rewards" });
  }
};

/**
 * Get yield protocol data for a user
 */
export const getYieldProtocolData = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const allVaults = await Vault.find({ creatorAddress: user.walletAddress }).lean();
    const yieldVaults = await Promise.all(
        allVaults.map(async (vault) => {
          const yieldStats = await getYieldStats({
            protocolId: YIELD_PROTOCOL_ID,
            vaultId: vault.id,
            userAddress: user.walletAddress,
          });

          // Fetch current token price from bonding curve
          const curvePriceRes = await fetch(
              `http://localhost:3000/api/curve/price/${vault.curveId}/1`
          );
          const curvePriceData = await curvePriceRes.json();

          return {
            id: vault.id,
            title: vault.title || `Vault ${vault.id.slice(0, 8)}`,
            yieldEarned: yieldStats.yieldEarned || "0",
            stakeAmount: yieldStats.stakeAmount || "0",
            isStaked: vault.isStaked || false,
            protocol: vault.protocol || "Sui Yield Protocol",
            curveId: vault.curveId,
            tokenPrice: curvePriceData.price || vault.tokenPrice || "0",
          };
        })
    );

    res.json(yieldVaults);
  } catch (err) {
    console.error("Failed to fetch yield protocol data:", err);
    res.status(500).json({ error: "Failed to fetch yield protocol data" });
  }
};

/**
 * Stake a vault into the yield protocol
 */
export const stakeVault = async (req, res) => {
  const { userId, vaultId, walletAddress } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    if (!vaultId || !walletAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user || user.walletAddress !== walletAddress) {
      return res.status(404).json({ error: "User not found or wallet mismatch" });
    }

    const vault = await Vault.findOne({ id: vaultId });
    if (!vault) {
      return res.status(404).json({ error: "Vault not found" });
    }
    if (vault.isStaked) {
      return res.status(400).json({ error: "Vault already staked" });
    }

    const stakeTx = await stakeInVault({
      protocolId: YIELD_PROTOCOL_ID,
      suiCoinId: vaultId,
      userAddress: walletAddress,
    });

    await Vault.findOneAndUpdate(
        { id: vaultId },
        { isStaked: true, protocol: "Sui Yield Protocol", stakeAmount: "1000" },
        { new: true }
    );

    await ClaimableReward.create({
      userId,
      vaultId,
      amount: "0",
      protocol: "Sui Yield Protocol",
    });

    res.json({ success: true, transactionId: stakeTx });
  } catch (err) {
    console.error("Failed to stake vault:", err);
    res.status(500).json({ error: "Failed to stake vault" });
  }
};

/**
 * Unstake a vault from the yield protocol
 */
export const unstakeVault = async (req, res) => {
  const { userId, vaultId, walletAddress } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    if (!vaultId || !walletAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user || user.walletAddress !== walletAddress) {
      return res.status(404).json({ error: "User not found or wallet mismatch" });
    }

    const vault = await Vault.findOne({ id: vaultId });
    if (!vault) {
      return res.status(404).json({ error: "Vault not found" });
    }
    if (!vault.isStaked) {
      return res.status(400).json({ error: "Vault not staked" });
    }

    const unstakeTx = await unstakeFromVault({
      protocolId: YIELD_PROTOCOL_ID,
      suiCoinId: vaultId,
      userAddress: walletAddress,
    });

    const yieldStats = await getYieldStats({
      protocolId: YIELD_PROTOCOL_ID,
      vaultId,
      userAddress: walletAddress,
    });

    await Vault.findOneAndUpdate(
        { id: vaultId },
        { isStaked: false, stakeAmount: "0" },
        { new: true }
    );

    await ClaimableReward.findOneAndUpdate(
        { userId, vaultId },
        { amount: yieldStats.yieldEarned || "0", protocol: "Sui Yield Protocol" },
        { upsert: true, new: true }
    );

    res.json({ success: true, transactionId: unstakeTx });
  } catch (err) {
    console.error("Failed to unstake vault:", err);
    res.status(500).json({ error: "Failed to unstake vault" });
  }
};