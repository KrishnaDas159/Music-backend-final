import mongoose from 'mongoose';

const claimableRewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id: { type: String, required: true },
  songTitle: { type: String, required: true },
  artist: { type: String, required: true },
  claimableAmount: { type: String, required: true }, // e.g., "$485.20"
  yieldType: { type: String, required: true },
  daysAccrued: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['ready', 'pending'], required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

claimableRewardSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('ClaimableReward', claimableRewardSchema);