const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#6366f1', // Indigo hex
    match: [/^#([0-9a-fA-F]{3}){1,2}$/, 'Please fill a valid hex color code']
  },
  description: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
