const StudyBlock = require('../models/StudyBlock');
const ProductivityLog = require('../models/ProductivityLog');
const User = require('../models/User');
const { generateSchedule } = require('../services/aiScheduler');

// @desc    Get all study blocks for the user (within date range)
// @route   GET /api/schedule/weekly
// @access  Private
const getWeeklySchedule = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const query = { user: req.user._id };

    if (start && end) {
      query.startTime = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    } else {
      // Default to 7 days starting from start of today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const sevenDaysLater = new Date(todayStart);
      sevenDaysLater.setDate(todayStart.getDate() + 7);

      query.startTime = {
        $gte: todayStart,
        $lte: sevenDaysLater
      };
    }

    const blocks = await StudyBlock.find(query)
      .populate('task')
      .populate('course')
      .sort({ startTime: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      blocks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger AI automatic calendar block generation
// @route   POST /api/schedule/generate
// @access  Private
const generateAISchedule = async (req, res, next) => {
  try {
    const generatedBlocks = await generateSchedule(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'AI Study calendar successfully optimized!',
      blocks: generatedBlocks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a study block manually
// @route   POST /api/schedule/blocks
// @access  Private
const createStudyBlock = async (req, res, next) => {
  try {
    const { title, startTime, endTime, task, course, notes, isBreak } = req.body;

    const block = await StudyBlock.create({
      user: req.user._id,
      title,
      startTime,
      endTime,
      task: task || undefined,
      course: course || undefined,
      notes,
      isBreak: isBreak || false
    });

    return res.status(201).json({
      success: true,
      block
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a study block
// @route   PUT /api/schedule/blocks/:id
// @access  Private
const updateStudyBlock = async (req, res, next) => {
  try {
    const block = await StudyBlock.findOne({ _id: req.params.id, user: req.user._id });
    if (!block) {
      return res.status(404).json({ success: false, message: 'Study block not found' });
    }

    const { title, startTime, endTime, status, notes, focusScore, distractionCount, isBreak } = req.body;
    block.title = title || block.title;
    block.startTime = startTime || block.startTime;
    block.endTime = endTime || block.endTime;
    block.status = status || block.status;
    block.notes = notes !== undefined ? notes : block.notes;
    block.focusScore = focusScore !== undefined ? focusScore : block.focusScore;
    block.distractionCount = distractionCount !== undefined ? distractionCount : block.distractionCount;
    block.isBreak = isBreak !== undefined ? isBreak : block.isBreak;

    const updatedBlock = await block.save();
    return res.status(200).json({
      success: true,
      block: updatedBlock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a study block
// @route   DELETE /api/schedule/blocks/:id
// @access  Private
const deleteStudyBlock = async (req, res, next) => {
  try {
    const block = await StudyBlock.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!block) {
      return res.status(404).json({ success: false, message: 'Study block not found or unauthorized' });
    }
    return res.status(200).json({
      success: true,
      message: 'Study block deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log focus score and sync with ProductivityLog
// @route   POST /api/schedule/blocks/:id/focus
// @access  Private
const logFocusScore = async (req, res, next) => {
  try {
    const { focusScore, distractionCount, studyDurationMinutes } = req.body;
    const block = await StudyBlock.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!block) {
      return res.status(404).json({ success: false, message: 'Study block not found' });
    }

    block.focusScore = focusScore;
    block.distractionCount = distractionCount || 0;
    block.status = 'completed';
    await block.save();

    // 1. Calculate study time from timestamps if studyDurationMinutes was not passed
    let finalDuration = studyDurationMinutes;
    if (!finalDuration) {
      const diffMs = new Date(block.endTime) - new Date(block.startTime);
      finalDuration = Math.round(diffMs / (1000 * 60)); // convert to minutes
    }
    
    // Safety boundaries
    if (finalDuration < 0 || finalDuration > 240) finalDuration = 25;

    // 2. Fetch or create the Daily Productivity Log
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let log = await ProductivityLog.findOne({ user: req.user._id, date: today });
    if (!log) {
      log = new ProductivityLog({
        user: req.user._id,
        date: today,
        studyDurationMinutes: 0,
        focusScoreAverage: 0,
        tasksCompleted: 0
      });
    }

    // Update study durations
    log.studyDurationMinutes += finalDuration;

    // Calculate new average focus score
    const completedBlocksToday = await StudyBlock.find({
      user: req.user._id,
      status: 'completed',
      startTime: { $gte: today },
      focusScore: { $exists: true }
    });

    const sumFocus = completedBlocksToday.reduce((acc, curr) => acc + curr.focusScore, 0) + focusScore;
    const countFocus = completedBlocksToday.length + 1;
    log.focusScoreAverage = Math.round(sumFocus / countFocus);

    // If associated to a task, increment tasks completed if task was marked complete
    if (block.task) {
      const task = await block.task;
      if (task && task.status === 'completed') {
        log.tasksCompleted += 1;
      }
    }

    await log.save();

    // 3. Reward User XP!
    // Base Pomodoro reward: 25 XP. Bonus + (focusScore / 2) XP for staying concentrated.
    const user = await User.findById(req.user._id);
    if (user) {
      const focusBonus = Math.round(focusScore / 2);
      const xpEarned = 25 + focusBonus;
      user.totalXP += xpEarned;

      // Level up checks
      if (user.totalXP >= user.level * 500) {
        user.level += 1;
      }
      await user.save();
    }

    return res.status(200).json({
      success: true,
      block,
      log,
      xpGained: 25 + Math.round(focusScore / 2)
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeeklySchedule,
  generateAISchedule,
  createStudyBlock,
  updateStudyBlock,
  deleteStudyBlock,
  logFocusScore
};
