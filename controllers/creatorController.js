import {
  creators,
  nftData,
  revenueData,
  likedSongs,
  followingData,
  vaultStats,
} from "../data/creatorData.js";
import { initCurveForVault, getCurrentCurvePrice } from "./curveController.js"; // Import curve functions
import { mintContentTokens, createVault, transferTokens } from "../services/suiService.js";
import { autoStakeVault } from "./vaultController.js";

export const getCreatorProfile = (req, res) => {
  const { creatorId } = req.params;
  const data = creators[creatorId];
  if (!data) return res.status(404).json({ error: "Creator not found" });
  res.json(data);
};

export const getCreatorNFTs = (req, res) => {
  const { creatorId } = req.params;
  res.json(nftData[creatorId] || []);
};

export const getCreatorRevenue = (req, res) => {
  const { creatorId } = req.params;
  res.json(revenueData[creatorId] || []);
};

export const getLikedSongs = (req, res) => {
  const { creatorId } = req.params;
  res.json(likedSongs[creatorId] || []);
};

export const getFollowing = (req, res) => {
  const { creatorId } = req.params;
  res.json(followingData[creatorId] || []);
};

export const getVaults = (req, res) => {
  const { creatorId } = req.params;
  res.json(vaultStats[creatorId] || []);
};

export const tokeniseSong = async (req, res) => {
  try {
    const { toAddress, amount, creatorAddress, trackIdHex, tokenPrice } = req.body;

    if (!toAddress || !amount || !creatorAddress || !trackIdHex || !tokenPrice) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    console.log(`🚀 Starting tokenisation for creator ${creatorAddress}`);

    // Create a vault for the song
    const vaultTx = await createVault({
      trackIdHex,
      creatorAddress,
    });
    console.log("✅ Vault created:", vaultTx);

    // Initialize bonding curve for the vault
    const curveResult = await initCurveForVault({
      slope: 0.01,
      basePrice: tokenPrice,
      vaultId: vaultTx,
    });
    console.log("✅ Curve initialized:", curveResult.tx);

    // Mint content tokens
    const mintTx = await mintContentTokens({
      toAddress,
      amount,
      creatorAddress,
      trackIdHex,
    });
    console.log("✅ Tokens minted:", mintTx);

    // Auto-stake the vault (includes curve initialization in vaultController)
    await autoStakeVault(vaultTx);

    // Update nftData
    const creatorNfts = nftData[creatorAddress] || [];
    const song = creatorNfts.find((nft) => nft.trackIdHex === trackIdHex);
    if (song) {
      song.tokenized = true;
      song.tokenPrice = tokenPrice;
      song.tokensAvailable = amount;
      song.holders = 1;
      song.curveId = curveResult.tx; // Store curveId
    } else {
      nftData[creatorAddress] = [
        ...creatorNfts,
        {
          id: trackIdHex,
          title: `Song ${trackIdHex.slice(0, 8)}`,
          artist: creators[creatorAddress]?.name || "Unknown Artist",
          cover: "/fallback-cover.png",
          tokenized: true,
          tokenPrice,
          tokensAvailable: amount,
          holders: 1,
          trackIdHex,
          curveId: curveResult.tx,
        },
      ];
    }

    res.json({
      success: true,
      vaultTransaction: vaultTx,
      mintTransaction: mintTx,
      curveTransaction: curveResult.tx,
    });
  } catch (error) {
    console.error("❌ Error tokenising song:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const buyTokens = async (req, res) => {
  try {
    const { songId, quantity, buyerAddress, creatorAddress } = req.body;

    if (!songId || !quantity || !buyerAddress || !creatorAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be positive",
      });
    }

    console.log(`🚀 Processing token purchase for song ${songId} by ${buyerAddress}`);

    const creatorNfts = nftData[creatorAddress] || [];
    const song = creatorNfts.find((nft) => nft.id === songId);
    if (!song || !song.tokenized) {
      return res.status(404).json({
        success: false,
        error: "Song not found or not tokenized",
      });
    }
    if (song.tokensAvailable < quantity) {
      return res.status(400).json({
        success: false,
        error: "Insufficient tokens available",
      });
    }

    // Get current price from bonding curve
    const curvePriceRes = await getCurrentCurvePrice({ curveId: song.curveId, amount: quantity });
    const tokenPrice = curvePriceRes.price || song.tokenPrice;

    const transaction = await transferTokens({
      songId,
      quantity,
      buyerAddress,
      creatorAddress,
    });

    // Update nftData
    song.tokensAvailable -= quantity;
    song.holders = (song.holders || 1) + 1;
    song.earnings = (parseFloat(song.earnings || "0") + quantity * parseFloat(tokenPrice)).toFixed(2);

    // Update revenueData
    revenueData[creatorAddress] = revenueData[creatorAddress] || [];
    revenueData[creatorAddress].push({
      title: song.title,
      vaultRevenue: (quantity * parseFloat(tokenPrice)).toFixed(2),
      yieldEarned: "0",
      daoSupport: "0",
      protocol: "Sui Yield Protocol",
    });

    res.json({
      success: true,
      transactionId: transaction,
      tokenPrice,
    });
  } catch (error) {
    console.error("❌ Error buying tokens:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getSong = async (req, res) => {
  try {
    const { songId } = req.params;

    let song = null;
    let creatorId = null;
    for (const [cid, nfts] of Object.entries(nftData)) {
      const foundSong = nfts.find((nft) => nft.id === songId);
      if (foundSong) {
        song = foundSong;
        creatorId = cid;
        break;
      }
    }

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Get current price from bonding curve
    const curvePriceRes = await getCurrentCurvePrice({ curveId: song.curveId, amount: 1 });
    const tokenPrice = curvePriceRes.price || song.tokenPrice;

    res.json({
      id: song.id,
      title: song.title,
      artist: creators[creatorId]?.name || "Unknown Artist",
      cover: song.cover || "/fallback-cover.png",
      verified: creators[creatorId]?.verified || false,
      stats: {
        tokenPrice,
        vaultYield: vaultStats[creatorId]?.find((v) => v.trackIdHex === song.trackIdHex)?.yieldEarned || "0",
        holders: song.holders || 0,
        creatorRevenue: song.earnings || "0",
      },
    });
  } catch (error) {
    console.error("❌ Error fetching song:", error);
    res.status(500).json({ error: "Failed to fetch song" });
  }
};