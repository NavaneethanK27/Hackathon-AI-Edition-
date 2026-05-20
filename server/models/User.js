const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  peakHours: {
    type: [String],
    enum: ['morning', 'afternoon', 'evening', 'night'],
    default: ['morning', 'afternoon']
  },
  preferredStudySessionLength: {
    type: Number,
    default: 25, // Pomodoro duration in minutes
    min: [5, 'Study sessions must be at least 5 minutes'],
    max: [180, 'Study sessions cannot exceed 180 minutes']
  },
  dailyStudyGoalHours: {
    type: Number,
    default: 2,
    min: [0.5, 'Goal must be at least 30 minutes'],
    max: [24, 'Goal cannot exceed 24 hours']
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date
  },
  totalXP: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save password hashing hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password helper method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
