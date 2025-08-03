
import express from "express";

import {getSongs} from "../controllers/songsController.js";

const router = express.Router();

router.get("/", getSongs);


export default router;
