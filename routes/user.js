//routes/user.js

import express from 'express';
import { signup, signin } from '../controllers/user.js';
import upload from '../middleware/upload.js';



const router = express.Router();

router.post(
  '/signup',
  upload.fields([
    { name: 'govtId', maxCount: 1 },
    { name: 'livePhoto', maxCount: 1 },
  ]),
  signup
);

router.post('/login', signin);

export default router;
