import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'creator'], 
    required: true 
  },
  kyc: {
    govtId: {
      data: Buffer, 
      contentType: String 
    },
    livePhoto: {
      data: Buffer,
      contentType: String
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  }
}, { timestamps: true });


userSchema.pre('save', function(next) {
  if (this.role === 'creator') {
    if (!this.kyc || !this.kyc.govtId?.data || !this.kyc.livePhoto?.data) {
      return next(new Error('KYC documents are required for creators.'));
    }
  }
  next();
});

export default mongoose.model('User', userSchema);
