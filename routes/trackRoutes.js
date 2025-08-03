import express from "express";
import multer from "multer";
import { uploadMusic } from "../controllers/trackController.js";

const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload/:creatorId", 
  upload.fields([
    { name: "musicFile", maxCount: 1 },
    { name: "thumbnailFile", maxCount: 1 },
  ]),
  uploadMusic
);

export default router;
