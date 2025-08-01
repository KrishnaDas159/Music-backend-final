import mongoose from "mongoose";

const vaultStatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true }, 
  invested: { type: Number, default: 0 }, 
  tvl: { type: Number, default: 0 }, 
  apr: { type: Number, default: 0 }, 
  withdrawable: { type: Number, default: 0 } 
}, { timestamps: true });

export default mongoose.model("VaultStat", vaultStatSchema);
