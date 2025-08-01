import mongoose from 'mongoose';
import User from '../models/user.js';
import Vault from '../models/nftSchema.js';
import RevenueVault from '../models/vaultRevenue.js';
import ClaimableReward from '../models/claimableReward.js';

// Get user-owned NFTs/tokens
export const getUserNFTs = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const vaults = await Vault.find({ userId }).lean();
    res.json({ [userId]: vaults }); // Format to match frontend expectation
  } catch (err) {
    console.error('Failed to fetch NFTs:', err);
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
};

// Get revenue vaults
export const getRevenueVaults = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const revenueVaults = await RevenueVault.find({ userId }).lean();
    res.json(revenueVaults);
  } catch (err) {
    console.error('Failed to fetch revenue vaults:', err);
    res.status(500).json({ error: 'Failed to fetch revenue vaults' });
  }
};

// Get claimable rewards
export const getClaimableRewards = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const claimableRewards = await ClaimableReward.find({ userId }).lean();
    res.json(claimableRewards);
  } catch (err) {
    console.error('Failed to fetch claimable rewards:', err);
    res.status(500).json({ error: 'Failed to fetch claimable rewards' });
  }
};