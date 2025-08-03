// backend/controllers/curveGovController.js
import { updateCurveParams } from "../services/suiService.js";

/**
 * Update curve parameters for a track via governance.
 * This should be called by an ADMIN wallet (or after DAO voting approval).
 */
export const updateCurveParamsViaGovernance = async (req, res) => {
    try {
        const { governanceId, trackIdHex, basePrice, slope, curveType } = req.body;

        if (!governanceId || !trackIdHex || basePrice == null || slope == null || curveType == null) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        // Call Sui Move governance update
        const result = await updateCurveParams({
            governanceId,
            trackIdHex,
            basePrice,
            slope,
            curveType,
        });

        res.json({
            success: true,
            message: "Curve parameters updated successfully via governance",
            transaction: result,
        });
    } catch (err) {
        console.error("❌ Failed to update curve params:", err);
        res.status(500).json({ error: "Failed to update curve parameters" });
    }
};

/**
 * Simulated voting endpoint (off-chain for now).
 * Later: integrate DAO smart contract voting.
 */
export const voteForCurveChange = async (req, res) => {
    try {
        const { proposalId, voter, vote } = req.body; // vote: "yes" | "no"

        if (!proposalId || !voter || !vote) {
            return res.status(400).json({ error: "Missing required voting parameters" });
        }

        // For now: just log the vote (off-chain storage or DB)
        // Later: write this to a governance contract or MongoDB
        console.log(`🗳 Vote recorded: proposal=${proposalId} voter=${voter} vote=${vote}`);

        res.json({ success: true, message: "Vote recorded successfully" });
    } catch (err) {
        console.error("❌ Failed to record vote:", err);
        res.status(500).json({ error: "Failed to record vote" });
    }
};
