// models/Profile.js
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  walletAddress: { type: String },
  avatar: { type: String },
  followers: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  isWalletConnected: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Profile", profileSchema);
