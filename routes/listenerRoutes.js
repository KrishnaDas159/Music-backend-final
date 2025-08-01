import express from "express";
import { getListenerProfile } from "../controllers/listenerController.js";

const router = express.Router();

// GET /api/listener/:id → Get full profile with populated data
router.get("/:userId", getListenerProfile);

export default router;




// // backend/routes/listenerRoutes.js
// import express from "express";
// import {
//   getListenerProfile,
//   getListenerNFTs,
//   getListenerVaults,
//   getLikedSongs,
//   getFollowing,
// } from "../controllers/listenerController.js";

// const router = express.Router();

// router.get("/:userId", getListenerProfile);
// router.get("/:userId/nfts", getListenerNFTs);
// router.get("/:userId/vaults", getListenerVaults);
// router.get("/:userId/liked-songs", getLikedSongs);
// router.get("/:userId/following", getFollowing);

// export default router;
