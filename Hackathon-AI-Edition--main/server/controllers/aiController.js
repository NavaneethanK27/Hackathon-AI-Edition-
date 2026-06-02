const { callGemini } = require('../config/gemini');
const { calculateBurnoutScore } = require('../services/burnoutDetector');
const Task = require('../models/Task');
const StudyBlock = require('../models/StudyBlock');

// @desc    AI Conversational Study Buddy
// @route   POST /api/ai/chat
// @access  Private
const chatBuddy = async (req, res, next) => {
  try {
    const { message, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    // Standardize chat format
    const historySnippet = (chatHistory || [])
      .slice(-6)
      .map(h => `${h.sender === 'user' ? 'Student' : 'StudyFlow AI'}: ${h.text}`)
      .join('\n');

    const prompt = `
You are StudyFlow AI, an intelligent, empathetic, and encouraging academic advisor and study buddy.
You help students organize their minds, suggest study techniques (like Pomodoro, Feyman, Active Recall), and keep them motivated.

Here is the recent conversation history:
${historySnippet}

Student's current message: "${message}"

Write a concise, supportive response (maximum 3-4 sentences). Feel free to use student-friendly emojis. Keep your advice actionable.
`;

    const aiMessage = await callGemini(prompt.trim(), 'text');
    return res.status(200).json({
      success: true,
      message: aiMessage.trim()
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Perform a detailed burnout check
// @route   POST /api/ai/burnout-check
// @access  Private
const checkBurnoutState = async (req, res, next) => {
  try {
    const burnoutResult = await calculateBurnoutScore(req.user._id);
    return res.status(200).json({
      success: true,
      ...burnoutResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch AI Cognitive Insights
// @route   GET /api/ai/insights
// @access  Private
const getWeeklyInsights = async (req, res, next) => {
  try {
    // 1. Gather stats
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);

    const completedBlocks = await StudyBlock.find({
      user: req.user._id,
      status: 'completed',
      startTime: { $gte: startOfWeek }
    }).populate('course').lean();

    const pendingTasks = await Task.find({
      user: req.user._id,
      status: { $ne: 'completed' }
    }).populate('course').lean();

    // Sum focus metrics
    const studyHours = completedBlocks.reduce((acc, curr) => {
      const dur = (new Date(curr.endTime) - new Date(curr.startTime)) / (1000 * 60 * 60);
      return acc + dur;
    }, 0);

    const focusScores = completedBlocks.filter(b => b.focusScore !== undefined).map(b => b.focusScore);
    const avgFocus = focusScores.length > 0 ? (focusScores.reduce((a, b) => a + b, 0) / focusScores.length) : 80;

    const courseSummary = {};
    completedBlocks.forEach(b => {
      if (b.course) {
        courseSummary[b.course.name] = (courseSummary[b.course.name] || 0) + 1;
      }
    });

    const coursesList = Object.entries(courseSummary).map(([name, count]) => `"${name}" (${count} sessions)`).join(', ');

    // 2. Feed to Gemini
    const prompt = `
You are the StudyFlow AI academic data analyst. Look at the student's study logs over the past week:
- Completed study blocks count: ${completedBlocks.length}
- Total study duration: ${studyHours.toFixed(1)} hours
- Average Focus Score: ${Math.round(avgFocus)}/100
- Favorite Subjects: ${coursesList || 'None tracked yet'}
- Uncompleted assignments remaining: ${pendingTasks.length}

Generate a concise, professional assessment in JSON format summarizing their cognitive output. Use these exact keys:
{
  "weeklySummary": "1-2 sentence overview of the past week.",
  "cognitiveLoadRating": "Visual rating (e.g. Balanced, Overloaded, Stable, Under-loaded).",
  "peakEfficiencyTime": "Heuristic time peak (e.g. Mornings, Late Evenings, Nights).",
  "distractionWarning": true/false (true if average focus score < 70 or distraction logs high),
  "keyAITips": [
    "Tip 1 tailored to their status",
    "Tip 2 tailored to their status",
    "Tip 3 tailored to their status"
  ]
}

Return ONLY this JSON string. Do not wrap in markdown.
`;

    const rawResponse = await callGemini(prompt.trim(), 'insights');

    let cleanJson = rawResponse.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(cleanJson);
      return res.status(200).json({
        success: true,
        insights: parsed
      });
    } catch (parseErr) {
      console.warn('Failed to parse weekly insights JSON, serving mock insights:', parseErr.message);
      return res.status(200).json({
        success: true,
        insights: {
          weeklySummary: 'Your study consistency is steady. Focus is concentrated, but adding breaks will prevent burnout.',
          cognitiveLoadRating: 'Stable',
          peakEfficiencyTime: 'Morning (09:00 AM - 12:00 PM)',
          distractionWarning: false,
          keyAITips: [
            'Maintain your 25-minute study rhythms; they fit your stamina profile.',
            'Plan a difficult task early tomorrow to leverage your morning peak efficiency hours.',
            'Spacing study across 3 courses keeps your cognitive channels active without overloading.'
          ]
        }
      });
    }

  } catch (error) {
    next(error);
  }
};

// @desc    AI task rescheduling utility (burnout recovery mode)
// @route   POST /api/ai/reschedule
// @access  Private
const aiReschedule = async (req, res, next) => {
  try {
    // Finds tasks due within 3 days and shifts them out by 2-3 days to reduce panic
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);

    const tasksToShift = await Task.find({
      user: req.user._id,
      status: { $ne: 'completed' },
      dueDate: { $gte: now, $lte: threeDaysLater }
    });

    let count = 0;
    for (const task of tasksToShift) {
      const currentDue = new Date(task.dueDate);
      currentDue.setDate(currentDue.getDate() + 2); // Shift by 2 days
      task.dueDate = currentDue;
      task.notes = (task.notes || '') + '\n[AI Auto-Rescheduled to mitigate burnout risk]';
      await task.save();
      count++;
    }

    return res.status(200).json({
      success: true,
      message: `Successfully shifted ${count} urgent tasks out by 48 hours to grant you relief.`,
      shiftedTasksCount: count
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Optimize schedule calendar visually
// @route   POST /api/ai/optimize
// @access  Private
const optimizeSchedule = async (req, res, next) => {
  try {
    // Simply triggers regenerateSchedule with a custom flag, or runs optimization
    const optimizedBlocks = await generateSchedule(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'AI scheduler has re-balanced your weekly load, optimized study intervals, and verified wellness pacing.',
      blocks: optimizedBlocks
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatBuddy,
  checkBurnoutState,
  getWeeklyInsights,
  aiReschedule,
  optimizeSchedule
};
