import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  price: String,
  cover: {
    data: Buffer,
    contentType: String
  },
  url: {
    data: Buffer,
    contentType: String
  },
  verified: Boolean,
  stats: {
    tokenPrice: String,
    vaultYield: String,
    holders: String,
    creatorRevenue: String
  }
});

const Song = mongoose.model("Song", songSchema);
export default Song; 