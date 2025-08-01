// models/privacy.js
import mongoose from "mongoose";

const privacySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
    unique: true
  },
  publicProfile: { type: Boolean, default: true },
  anonymousAnalytics: { type: Boolean, default: true }
});

export default mongoose.model("Privacy", privacySchema);
