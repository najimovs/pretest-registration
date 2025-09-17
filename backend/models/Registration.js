import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const registrationSchema = new mongoose.Schema({
  user: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
  },
  schedule: {
    date: { type: String, required: false, default: null },
    time: { type: String, required: false, default: null }
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled', 'paid'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'prepared', 'completed', 'failed'],
    default: 'pending'
  },
  paymentInfo: {
    clickTransId: String,
    merchantPrepareId: String,
    merchantConfirmId: String,
    amount: Number,
    preparedAt: Date,
    completedAt: Date,
    expiresAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
registrationSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('user.password')) return next();

  try {
    const saltRounds = 10;
    this.user.password = await bcrypt.hash(this.user.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
registrationSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.user.password);
  } catch (error) {
    throw error;
  }
};

export default mongoose.model('Registration', registrationSchema);