import express from 'express';
import { getUserNFTs, getRevenueVaults, getClaimableRewards } from '../controllers/vaultController.js';

const router = express.Router();

router.get('/:userId/nfts', getUserNFTs);
router.get('/:userId/revenue', getRevenueVaults);
router.get('/:userId/claimable', getClaimableRewards);

export default router;