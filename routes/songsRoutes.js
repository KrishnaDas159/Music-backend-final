// routes/songsRoutes.js
import express from "express";
import multer from "multer";
import { addSong, getSongs} from "../controllers/songsController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.fields([{ name: "cover", maxCount: 1 }, { name: "url", maxCount: 1 }]), addSong);
router.get("/", getSongs);


export default router;
