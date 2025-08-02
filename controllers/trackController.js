import Song from "../models/songs.js";
import Music from "../models/music.js";

export const uploadMusic = async (req, res) => {
  try {
    const music = new Music({
      title: req.body.title,
      description: req.body.description,
      genre: req.body.genre,
      musicFile: req.files['musicFile']?.[0]?.buffer,
      musicFileType: req.files['musicFile']?.[0]?.mimetype,
      thumbnailFile: req.files['thumbnailFile']?.[0]?.buffer,
      thumbnailFileType: req.files['thumbnailFile']?.[0]?.mimetype,
      tokenized: req.body.tokenized === 'true',
      tokenAddress: req.body.tokenAddress,
      tokenSupply: parseInt(req.body.tokenSupply),
      creatorAddress: req.body.creatorAddress,
      revenueSplit: req.body.revenueSplit ? JSON.parse(req.body.revenueSplit) : {},
      transactionHash: req.body.transactionHash,
      mintedAt: new Date(),
      creator: req.user._id
    });

    const savedMusic = await music.save();
    console.log("Saved music ID:", savedMusic._id);

    try {
      const song = new Song({
        title: savedMusic.title,
        artist: req.body.artist || "Unknown",
        album: req.body.album || "",
        price: req.body.price || "",
        cover: {
          data: savedMusic.thumbnailFile,
          contentType: savedMusic.thumbnailFileType
        },
        url: {
          data: savedMusic.musicFile,
          contentType: savedMusic.musicFileType
        },
        verified: false,
        stats: {
          tokenPrice: req.body.tokenPrice || "",
          vaultYield: req.body.vaultYield || "",
          holders: req.body.holders || "",
          creatorRevenue: req.body.creatorRevenue || ""
        },
        music: savedMusic._id // Link to Music doc
      });

      const savedSong = await song.save();
      console.log("Saved song ID:", savedSong._id);

      res.status(201).json({
        success: true,
        music: savedMusic,
        song: savedSong
      });
    } catch (err) {
      console.error("Error saving song:", err.message);
      res.status(500).json({ error: "Failed to save song" });
    }

  } catch (err) {
    console.error("Upload Error:", err.message);
    res.status(500).json({ error: "Failed to upload music" });
  }
};


// import Music from "../models/music.js";


// export const createMusic = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       genre,
//       musicFileUrl,
//       thumbnailUrl,
//       tokenized,
//       tokenAddress,
//       tokenSupply,
//       creatorAddress,
//       revenueSplit,
//       transactionHash,
//       mintedAt,
//     } = req.body;

//     // Basic validation (you can expand this)
//     if (!title || !creatorAddress || tokenized === undefined) {
//       return res.status(400).json({ error: "Required fields are missing" });
//     }

//     const newMusic = new Music({
//       title,
//       description,
//       genre,
//       musicFileUrl,
//       thumbnailUrl,
//       tokenized,
//       tokenAddress,
//       tokenSupply,
//       creatorAddress,
//       revenueSplit,
//       transactionHash,
//       mintedAt,
//     });

//     const savedMusic = await newMusic.save();

//     return res.status(201).json({
//       message: "Music track saved successfully",
//       music: savedMusic,
//     });
//   } catch (error) {
//     console.error("Error saving music:", error);
//     return res.status(500).json({ error: "Server error" });
//   }
// };
