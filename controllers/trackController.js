import Music from "../models/music.js"; 
import Song from "../models/songs.js";   
export const uploadMusic = async (req, res) => {
  try {
    

    const creatorId = req.params.creatorId || req.user?._id;

    if (!req.files?.musicFile || !req.files?.thumbnailFile) {
      return res.status(400).json({ error: "Missing music or thumbnail file" });
    }

    if (!creatorId) {
      return res.status(401).json({ error: "Unauthorized: Creator not found" });
    }

    let revenueSplitObj = {};
    try {
      if (req.body.revenueSplit) {
        revenueSplitObj = JSON.parse(req.body.revenueSplit);
      }
    } catch {
      return res.status(400).json({ error: "Invalid revenueSplit format" });
    }

    const music = new Music({
      title: req.body.title,
      description: req.body.description,
      genre: req.body.genre,
      musicFile: req.files["musicFile"]?.[0]?.buffer,
      musicFileType: req.files["musicFile"]?.[0]?.mimetype,
      thumbnailFile: req.files["thumbnailFile"]?.[0]?.buffer,
      thumbnailFileType: req.files["thumbnailFile"]?.[0]?.mimetype,
      tokenized: req.body.tokenized === "true",
      tokenAddress: req.body.tokenAddress,
      tokenSupply: parseInt(req.body.tokenSupply),
      creatorAddress: req.body.creatorAddress,
      revenueSplit: revenueSplitObj,
      transactionHash: req.body.transactionHash,
      mintedAt: new Date(),
      creator: creatorId,
    });

    const savedMusic = await music.save();
    
    const song = new Song({
      title: savedMusic.title,
      artist: req.body.artist || "Unknown",
      album: req.body.album || "",
      price: req.body.price || "",
      cover: {
        data: savedMusic.thumbnailFile,
        contentType: savedMusic.thumbnailFileType,
      },
      url: {
        data: savedMusic.musicFile,
        contentType: savedMusic.musicFileType,
      },
      verified: false,
      stats: {
        tokenPrice: req.body.tokenPrice || "",
        vaultYield: req.body.vaultYield || "",
        holders: req.body.holders || "",
        creatorRevenue: req.body.creatorRevenue || "",
      },
      music: savedMusic._id,
    });

    const savedSong = await song.save();
    

    res.status(201).json({
      success: true,
      music: savedMusic,
      song: savedSong,
    });
  } catch (err) {
    
    res.status(500).json({ error: err.message });
  }
};
