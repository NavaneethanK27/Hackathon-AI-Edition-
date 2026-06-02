const Task = require('../models/Task');
const User = require('../models/User');
const { callGemini } = require('../config/gemini');

// @desc    Get all user tasks (with optional filtering)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, course, priority } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (course) query.course = course;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query).populate('course').sort({ dueDate: 1 }).lean();
    return res.status(200).json({
      success: true,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, course, dueDate, priority, difficulty, estimatedHours } = req.body;

    const task = await Task.create({
      title,
      description,
      course: course || undefined,
      dueDate,
      priority,
      difficulty,
      estimatedHours,
      user: req.user._id
    });

    return res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
    }

    const { title, description, course, dueDate, priority, difficulty, estimatedHours, actualHoursSpent, status, subtasks } = req.body;

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.course = course !== undefined ? (course || undefined) : task.course;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    task.difficulty = difficulty || task.difficulty;
    task.estimatedHours = estimatedHours || task.estimatedHours;
    task.actualHoursSpent = actualHoursSpent !== undefined ? actualHoursSpent : task.actualHoursSpent;
    task.status = status || task.status;
    if (subtasks) task.subtasks = subtasks;

    const updatedTask = await task.save();

    // Reward XP on task completion!
    if (status === 'completed' && task.isDirectModified('status')) {
      const user = await User.findById(req.user._id);
      if (user) {
        // Calculate XP reward: Base 50 XP, medium adds +20 XP, hard adds +40 XP
        let xpGained = 50;
        if (task.difficulty === 'medium') xpGained += 20;
        if (task.difficulty === 'hard') xpGained += 40;

        user.totalXP += xpGained;
        
        // Level up check
        if (user.totalXP >= user.level * 500) {
          user.level += 1;
        }
        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
    }
    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle subtask completion status
// @route   PATCH /api/tasks/:id/subtasks/:subtaskId
// @access  Private
const toggleSubtask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found' });
    }

    subtask.completed = !subtask.completed;
    
    // Reward small gamified experience (5 XP per subtask completed)
    if (subtask.completed) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.totalXP += 10;
        if (user.totalXP >= user.level * 500) user.level += 1;
        await user.save();
      }
    }

    await task.save();
    return res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate subtasks breakdown using Gemini AI
// @route   POST /api/tasks/:id/breakdown
// @access  Private
const breakdownTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id }).populate('course');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const courseName = task.course ? task.course.name : 'General Subjects';
    
    const prompt = `
You are the StudyFlow AI breakdown engine. Take this student task details:
- Title: "${task.title}"
- Description: "${task.description || 'No description provided'}"
- Course: "${courseName}"
- Difficulty: "${task.difficulty}"

Decompose this complex task into 3-5 distinct, bite-sized micro-tasks.
Each micro-task must be highly actionable, starting with a verb (e.g. "Read", "Draft", "Code", "Debug", "Review").

You MUST return a strict JSON array matching this format:
[
  { "title": "Bite-sized micro-task title", "completed": false }
]

Return ONLY this JSON string. Do not wrap in markdown or add notes.
`;

    const aiResponse = await callGemini(prompt.trim(), 'subtask');
    
    let cleanJson = aiResponse.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    let parsedSubtasks;
    try {
      parsedSubtasks = JSON.parse(cleanJson);
    } catch (err) {
      console.warn('Failed to parse AI breakdown JSON, loading mock subtasks:', err.message);
      parsedSubtasks = [
        { title: `Prepare background materials for "${task.title}"`, completed: false },
        { title: `Conduct high-level outline review`, completed: false },
        { title: `Complete first structural implementation block`, completed: false },
        { title: `Perform secondary proofreading & tests`, completed: false }
      ];
    }

    task.subtasks = parsedSubtasks;
    const updatedTask = await task.save();

    // Reward 15 XP for utilizing AI optimization!
    const user = await User.findById(req.user._id);
    if (user) {
      user.totalXP += 15;
      if (user.totalXP >= user.level * 500) user.level += 1;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      task: updatedTask
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleSubtask,
  breakdownTask
};
