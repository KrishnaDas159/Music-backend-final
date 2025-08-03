// controllers/songController.js
import Song from "../models/songs.js";

export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find();

    const songsWithUrls = songs.map(song => {
      return {
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
        audio: song.url?.data
          ? `data:${song.url.contentType};base64,${song.url.data.toString("base64")}`
          : null
      };
    });

    res.json(songsWithUrls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
