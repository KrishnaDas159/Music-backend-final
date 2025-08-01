// controllers/songController.js
import Song from "../models/songs.js";

export const addSong = async (req, res) => {
  try {
    const { title, artist, album, price, verified, tokenPrice, vaultYield, holders, creatorRevenue } = req.body;

    const song = new Song({
      title,
      artist,
      album,
      price,
      cover: {
        data: req.files.cover[0].buffer,
        contentType: req.files.cover[0].mimetype
      },
      url: {
        data: req.files.url[0].buffer,
        contentType: req.files.url[0].mimetype
      },
      verified: verified === "true",
      stats: {
        tokenPrice,
        vaultYield,
        holders,
        creatorRevenue
      }
    });

    await song.save();
    res.status(201).json({ message: "Song added successfully", songId: song._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find(); // no .select()

    const formattedSongs = songs.map(song => ({
      _id: song._id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      price: song.price,
      verified: song.verified,
      stats: song.stats,
      cover: song.cover?.data
        ? `data:${song.cover.contentType};base64,${song.cover.data.toString("base64")}`
        : null,
      url: song.url?.data
        ? `data:${song.url.contentType};base64,${song.url.data.toString("base64")}`
        : null
    }));

    res.json(formattedSongs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// export const getSongAudio = async (req, res) => {
//   try {
//     const song = await Song.findById(req.params.id);
//     if (!song || !song.url) return res.status(404).send("Song not found");

//     res.set("Content-Type", song.url.contentType);
//     res.send(song.url.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getSongCover = async (req, res) => {
//   try {
//     const song = await Song.findById(req.params.id);
//     if (!song || !song.cover) return res.status(404).send("Cover not found");

//     res.set("Content-Type", song.cover.contentType);
//     res.send(song.cover.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
