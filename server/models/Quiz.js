const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    validate: [arr => arr.length >= 2, 'A question must have at least 2 options']
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0
  },
  explanation: {
    type: String
  }
});

const quizAttemptSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  attemptedAt: {
    type: Date,
    default: Date.now
  }
});

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    index: true
  },
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  questions: [quizQuestionSchema],
  sourceMaterial: {
    type: String
  },
  attempts: [quizAttemptSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
