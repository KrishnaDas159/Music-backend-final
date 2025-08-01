// routes/privacyRoutes.js
import express from "express";
import {
  updatePrivacySettings,
  exportUserData,
  deleteAccount
} from "../controllers/privacyController.js";

const router = express.Router();

router.put("/:userId", updatePrivacySettings);
router.get("/export/:userId", exportUserData);
router.delete("/:userId", deleteAccount);

export default router;
