
import mongoose from 'mongoose';

const  nftSchema  = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id: { type: String, required: true }, // NFT/token ID
  title: { type: String, required: true },
  artist: { type: String, required: true },
  cover: { type: String, required: true },
  owned: { type: Number, required: true, min: 0 }, // Tokens owned
  earnings: { type: String, required: true }, // Current value (e.g., "$100.50")
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

nftSchema .pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('NFT',  nftSchema );