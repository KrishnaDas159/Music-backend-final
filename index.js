// backend/index.js
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

// Import existing routes
import userRoutes from "./routes/user.js";
import songsRoutes from "./routes/songsRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import listenerRoutes from "./routes/listenerRoutes.js";
import curveRoutes from "./routes/curve.js";

// ✅ Import the updated creator routes with tokenisation API
import creatorRoutes from "./routes/creatorRoutes.js"; // make sure this file has tokeniseSong

import trackRoutes from "./routes/trackRoutes.js";

// ✅ Import updated vault routes with yield protocol staking support
import vaultRoutes from "./routes/vaultRoutes.js";

import govRoutes from "./routes/governanceRoutes.js";
import notificationRoutes from "./routes/notifications.js";
import web3Routes from "./routes/web3setting.js";
import privacyRoutes from "./routes/privacyRoutes.js";
import allnotificationRoutes from "./routes/allnotification.js";
import accountRoutes from "./routes/account.js";
import profileRoutes from "./routes/profileRoutes.js";
import curveGovRoutes from "./routes/curve_governance.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "assets")));

// API routes
app.use("/api/auth", userRoutes);
app.use("/api/songs", songsRoutes);
app.use("/api/buy", purchaseRoutes);
app.use("/api/listener", listenerRoutes);
app.use("/api/creator", creatorRoutes); // ✅ Creator routes now include tokenise API
app.use("/api/music", trackRoutes);
app.use("/api/vaults", vaultRoutes); // ✅ Vault routes now support staking + filtering
app.use("/api/proposals", govRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/web3", web3Routes);
app.use("/api/privacy", privacyRoutes);
app.use("/api/allnotifications", allnotificationRoutes);
app.use("/api/user", accountRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/curve", curveRoutes);
app.use("/api/curve-governance", curveGovRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Backend server is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
