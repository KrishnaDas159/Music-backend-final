import express from "express";
import {
    getUserNFTs,
    getRevenueVaults,
    getClaimableRewards
} from "../controllers/vaultController.js";
import { stakeInVault } from "../services/suiService.js";

const router = express.Router();

// ✅ Get vaults (only those where user holds fungible tokens)
router.get("/:userId/nfts", getUserNFTs);

// ✅ Get revenue vaults
router.get("/:userId/revenue", getRevenueVaults);

// ✅ Get claimable rewards
router.get("/:userId/claimable", getClaimableRewards);

// ✅ Manual stake into yield protocol (wrapper instead of missing stakeInVaultController)
router.post("/stake", async (req, res) => {
    try {
        const { protocolId, suiCoinId } = req.body;
        if (!protocolId || !suiCoinId) {
            return res.status(400).json({ error: "protocolId and suiCoinId are required" });
        }

        const result = await stakeInVault({ protocolId, suiCoinId });
        res.json({ success: true, result });
    } catch (err) {
        console.error("Manual staking failed:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
