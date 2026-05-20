const mongoose = require('mongoose');

const studyBlockSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    index: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    index: true
  },
  title: {
    type: String,
    required: [true, 'Study block title is required'],
    trim: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'skipped'],
    default: 'scheduled'
  },
  focusScore: {
    type: Number,
    min: 0,
    max: 100
  },
  distractionCount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  isBreak: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudyBlock', studyBlockSchema);
