const mongoose = require('mongoose');

const productivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  date: {
    type: Date, // Normalized date (set hours to 00:00:00)
    required: [true, 'Log date is required'],
    index: true
  },
  studyDurationMinutes: {
    type: Number,
    default: 0
  },
  focusScoreAverage: {
    type: Number,
    default: 0
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  burnoutScore: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure a single log per user per day
productivityLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ProductivityLog', productivityLogSchema);
