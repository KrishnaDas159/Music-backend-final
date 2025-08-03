// backend/routes/Routes.js
import express from "express";
import {
    getCreatorProfile,
    getCreatorNFTs,
    getCreatorRevenue,
    getLikedSongs,
    getFollowing,
    getVaults,
    tokeniseSong // ✅ new function from controller
} from "../controllers/creatorController.js";

const router = express.Router();

// Creator profile & data routes
router.get("/:creatorId", getCreatorProfile);
router.get("/:creatorId/nfts", getCreatorNFTs);
router.get("/:creatorId/revenue", getCreatorRevenue);
router.get("/:creatorId/liked-songs", getLikedSongs);
router.get("/:creatorId/following", getFollowing);
router.get("/:creatorId/vaults", getVaults);

// ✅ New POST route for tokenising a song
router.post("/:creatorId/tokenise", tokeniseSong);

export default router;
