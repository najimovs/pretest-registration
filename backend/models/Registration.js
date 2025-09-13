import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  user: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  schedule: {
    mainTest: {
      date: { type: String, required: false, default: null },
      time: { type: String, required: false, default: null }
    },
    speakingTest: {
      date: { type: String, required: false, default: null },
      time: { type: String, required: false, default: null }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
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

export default mongoose.model('Registration', registrationSchema);