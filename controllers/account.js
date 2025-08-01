import mongoose from 'mongoose';
import User from '../models/user.js';
import Account from '../models/account.js';

// Get account settings
// export const getAccountSettings = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     // Validate userId
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: 'Invalid user ID' });
//     }

//     // Check if user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Fetch account document
//     const account = await Account.findOne({ userId });
//     if (!account) {
//       return res.json({ displayName: '', email: '', bio: '' });
//     }

//     res.json({
//       displayName: account.displayName,
//       email: account.email,
//       bio: account.bio,
//     });
//   } catch (err) {
//     console.error('Failed to fetch account:', err);
//     res.status(500).json({ error: 'Failed to fetch account' });
//   }
// };

// Update account settings
export const updateAccountSettings = async (req, res) => {
  const { userId } = req.params;
  const { displayName, email, bio } = req.body;

  try {
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate input
    if (typeof displayName !== 'string' || typeof email !== 'string' || typeof bio !== 'string') {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Update or create account document
    const account = await Account.findOneAndUpdate(
      { userId },
      { displayName, email, bio },
      { new: true, upsert: true }
    );

    res.json({
      displayName: account.displayName,
      email: account.email,
      bio: account.bio,
    });
  } catch (err) {
    console.error('Failed to update account:', err);
    res.status(500).json({ error: 'Failed to update account' });
  }
};