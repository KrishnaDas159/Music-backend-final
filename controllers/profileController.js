import User from "../models/user.js";
import Profile from "../models/profile.js";
import Nft from "../models/nftSchema.js";
import VaultStats from "../models/vaultStats.js";
import LikedSongs from "../models/likedSong.js";
import Following from "../models/following.js";
import Revenue from "../models/Revenue.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select("-passwordHash");
    const profile = await Profile.findOne({ userId });
    const nfts = await Nft.find({ userId });
    const vaultStats = await VaultStats.find({ userId });
    const likedSongs = await LikedSongs.findOne({ userId });
    const following = await Following.findOne({ userId });
    let revenue = [];
    if (user.role === "creator") {
      revenue = await Revenue.find({ creator: userId });
    }

    res.json({
      user,
      profile,
      nfts,
      vaultStats,
      likedSongs,
      following,
      ...(user.role === "creator" && { revenue }) 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
