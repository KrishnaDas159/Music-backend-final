import mongoose from "mongoose";

const followingSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The user who follows
  followings: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Users/Artists being followed
}, { timestamps: true });

export default mongoose.model("Following", followingSchema);
