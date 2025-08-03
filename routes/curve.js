// backend/routes/curveRoutes.js
import express from "express";
import {
    initCurveForVault,
    getCurrentCurvePrice,
    changeCurveParams
} from "../controllers/curveController.js";

const router = express.Router();

router.post("/init", initCurveForVault);
router.get("/:curveId/price/:amount", getCurrentCurvePrice);
router.post("/update", changeCurveParams);

export default router;
