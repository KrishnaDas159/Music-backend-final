//controllers/user.js

import User from '../models/user.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;


export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);

    let kyc = undefined;
    if (role === 'creator') {
      if (!req.files?.govtId || !req.files?.livePhoto) {
        return res.status(400).json({ message: 'KYC documents required for creators' });
      }

      kyc = {
        govtId: {
          data: req.files.govtId[0].buffer,
          contentType: req.files.govtId[0].mimetype
        },
        livePhoto: {
          data: req.files.livePhoto[0].buffer,
          contentType: req.files.livePhoto[0].mimetype
        },
        status: 'pending'
      };
    }

    const newUser = new User({
      email,
      passwordHash,
      role,
      ...(kyc && { kyc })
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    if (user.role === 'creator' && (!user.kyc )) {
      return res.status(403).json({ message: 'Creator account not KYC-verified yet' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Signin successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
