const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  estimatedHours: {
    type: Number,
    default: 1,
    min: [0.25, 'Task estimated time must be at least 15 minutes']
  },
  actualHoursSpent: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'completed'],
    default: 'todo'
  },
  subtasks: [subtaskSchema],
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Automatic sync of isCompleted when status is completed
taskSchema.pre('save', function (next) {
  if (this.status === 'completed') {
    this.isCompleted = true;
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else {
    this.isCompleted = false;
    this.completedAt = undefined;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
