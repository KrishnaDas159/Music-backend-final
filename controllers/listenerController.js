import User from "../models/user.js";

export const getListenerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: "accounts",
        select: "displayName avatar walletAddress bio", 
      })
      .populate({
        path: "nfts",
        select: "title artist cover owned earnings daoVoting",
      })
      .populate({
        path: "vaults",
        select: "title invested tvl apr withdrawable",
      })
      .populate({
        path: "likedSongs",
        populate: {
          path: "songs",
          model: "Song",
          select: "title artist cover",
        },
      })
      .populate({
        path: "followers",
        populate: {
          path: "accounts",
          select: "displayName avatar",
        },
      })
      .populate({
        path: "followings",
        populate: {
          path: "accounts",
          select: "displayName avatar",
        },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Flatten account info so frontend can use directly
    const account = user.accounts?.[0] || {};
    const response = {
      ...user.toObject(),
      displayName: account.displayName || "",
      avatar: account.avatar || "",
      walletAddress: account.walletAddress || "",
      bio: account.bio || "",
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


