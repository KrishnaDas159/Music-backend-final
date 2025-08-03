// backend/controllers/curveController.js
import {
    initializeCurve,
    updateCurveParams
} from "../services/suiService.js";

import { TransactionBlock } from "@mysten/sui.js/transactions";
import { provider, signer } from "../services/suiService.js";

const PACKAGE_ID = process.env.SUI_PACKAGE_ID;

// ✅ Initialize bonding curve when vault is created
export const initCurveForVault = async (req, res) => {
    try {
        const { slope, basePrice, vaultId } = req.body;

        const result = await initializeCurve({
            slope,
            basePrice,
            vaultId
        });

        res.json({ success: true, tx: result });
    } catch (err) {
        console.error("Failed to init curve:", err);
        res.status(500).json({ error: "Failed to init curve" });
    }
};

// ✅ Get current price for buying tokens (read-only)
export const getCurrentCurvePrice = async (req, res) => {
    try {
        const { curveId, amount } = req.params;

        // Read directly from Move module via `devInspectTransactionBlock`
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${PACKAGE_ID}::curve::get_curve_price`,
            arguments: [
                tx.object(curveId),
                tx.pure.u64(amount)
            ]
        });

        const result = await provider.devInspectTransactionBlock({
            transactionBlock: tx,
            sender: await signer.getAddress()
        });

        const price = result.results?.[0]?.returnValues?.[0]?.[0];
        res.json({ curveId, amount, price });
    } catch (err) {
        console.error("Failed to get curve price:", err);
        res.status(500).json({ error: "Failed to get curve price" });
    }
};

// ✅ Update curve parameters via governance
export const changeCurveParams = async (req, res) => {
    try {
        const { governanceId, trackIdHex, basePrice, slope, curveType } = req.body;

        const result = await updateCurveParams({
            governanceId,
            trackIdHex,
            basePrice,
            slope,
            curveType
        });

        res.json({ success: true, tx: result });
    } catch (err) {
        console.error("Failed to update curve params:", err);
        res.status(500).json({ error: "Failed to update curve params" });
    }
};
