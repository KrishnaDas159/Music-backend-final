import mongoose from "mongoose";

const likedSongSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }] 
}, { timestamps: true });

export default mongoose.model("LikedSong", likedSongSchema);
