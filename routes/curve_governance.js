// backend/routes/curveGovRoutes.js
import express from "express";
import { updateCurveParamsViaGovernance, voteForCurveChange } from "../controllers/curveGovController.js";

const router = express.Router();

// Governance admin sets curve parameters
router.post("/update-curve", updateCurveParamsViaGovernance);

// Users vote on curve changes (off-chain for now)
router.post("/vote", voteForCurveChange);

export default router;
