import mongoose from 'mongoose';

const revenueVaultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id: { type: String, required: true },
  songTitle: { type: String, required: true },
  artist: { type: String, required: true },
  totalInvested: { type: String, required: true },
  vaultBalance: { type: String, required: true },
  apy: { type: String, required: true }, 
  investors: { type: Number, required: true, min: 0 },
  utilization: { type: Number, required: true, min: 0, max: 100 },
  protocol: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

revenueVaultSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('RevenueVault', revenueVaultSchema);