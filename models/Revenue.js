// models/Revenue.js
import mongoose from "mongoose";

const revenueSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    vaultRevenue: {
      type: String, 
      required: true,
    },
    yieldEarned: {
      type: String, 
      required: true,
    },
    daoSupport: {
      type: String, 
      required: true,
    },
    protocol: {
      type: String, 
      required: true,
    },
    withdrawable: {
      type: String, 
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Revenue", revenueSchema);
