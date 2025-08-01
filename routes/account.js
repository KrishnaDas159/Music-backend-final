import express from 'express';
import { updateAccountSettings } from '../controllers/account.js';

const router = express.Router();


router.put('/accounts/:userId', updateAccountSettings);

export default router;