import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  displayName: { type: String, default: '' },
  email: { type: String, default: '' },
  bio: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

accountSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Account', accountSchema);