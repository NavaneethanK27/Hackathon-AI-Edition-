const Task = require('../models/Task');
const User = require('../models/User');
const Course = require('../models/Course');
const StudyBlock = require('../models/StudyBlock');
const { callGemini } = require('../config/gemini');

/**
 * Automatically creates an optimized, adaptive weekly study schedule for a user.
 * Combines task urgency, task difficulty, user preferred hours, and spacing patterns.
 * @param {string} userId - Mongo ID of the target user
 * @returns {Promise<Array>} - Saved study blocks
 */
async function generateSchedule(userId) {
  try {
    // 1. Fetch User Data
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Fetch Tasks (Uncompleted only, or in progress)
    const tasks = await Task.find({
      user: userId,
      status: { $ne: 'completed' }
    }).populate('course').lean();

    // 3. Fetch all active Courses
    const courses = await Course.find({ user: userId }).lean();

    // 4. Construct prompt for Gemini
    const now = new Date();
    const peakHoursStr = user.peakHours.join(', ');
    
    let taskListString = '';
    if (tasks.length === 0) {
      taskListString = 'No current pending tasks. Please schedule generic course reviews.';
    } else {
      taskListString = tasks.map((t, idx) => {
        const cName = t.course ? t.course.name : 'General/No Course';
        return `[Task #${idx}] Title: "${t.title}", Course: "${cName}", Priority: "${t.priority}", Difficulty: "${t.difficulty}", Estimated Hours: ${t.estimatedHours}, Due Date: ${t.dueDate.toISOString()}`;
      }).join('\n');
    }

    const aiPrompt = `
You are StudyFlow AI, an expert academic planner. Optimize a 7-day study schedule for a student based on these inputs:
- User Peak Study Efficiency Hours: ${peakHoursStr}
- Target Daily Study Goal: ${user.dailyStudyGoalHours} hours per day
- Current Date/Time: ${now.toISOString()}
- Student Tasks:
${taskListString}

Your goal is to distribute these study tasks across the next 7 days in highly effective study blocks (usually 30 to 120 minutes each).
Important Constraints:
1. Prioritize tasks with higher "priority" (high > medium > low) and closest "dueDate".
2. Match study sessions to the student's Peak Study Hours (${peakHoursStr}) where possible.
3. Every 2 hours of heavy study must be followed by a 15-minute wellness break (isBreak: true).
4. Do not exceed a student's daily cognitive capability.
5. Provide the output in a strict JSON array. Each element in the array MUST represent a study session or break, matching this exact schema:
[
  {
    "title": "Study Block Title",
    "startTime": "ISO8601 Date String",
    "endTime": "ISO8601 Date String",
    "notes": "Short focus instructions or motivational tip for this session",
    "isBreak": false,
    "taskIndex": 0 // Integer matching the index of the task in the input list, OR null if generic course review or break
  }
]

Respond ONLY with the JSON array. Do not include markdown code block syntax (like \`\`\`json) or any conversational text. Return only the raw JSON string.
`;

    // 5. Query Gemini or invoke mock scheduling system
    const rawResponse = await callGemini(aiPrompt.trim(), 'schedule');
    
    // Clean potential markdown blocks if AI returned them despite constraints
    let cleanJson = rawResponse.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    let generatedBlocks;
    try {
      generatedBlocks = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('Failed to parse AI schedule JSON response, attempting regex recovery:', parseErr.message);
      // Attempt clean regex fallback or default mock scheduler
      const mockString = getMockSchedulerResult(tasks, user, now);
      generatedBlocks = JSON.parse(mockString);
    }

    // 6. Sync blocks to database
    // We clear future "scheduled" blocks first to prevent calendar spam
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await StudyBlock.deleteMany({
      user: userId,
      startTime: { $gte: startOfToday },
      status: 'scheduled'
    });

    const blocksToSave = generatedBlocks.map((block) => {
      let taskRef = null;
      let courseRef = null;

      if (block.taskIndex !== undefined && block.taskIndex !== null && tasks[block.taskIndex]) {
        taskRef = tasks[block.taskIndex]._id;
        courseRef = tasks[block.taskIndex].course ? tasks[block.taskIndex].course._id : null;
      }

      return {
        user: userId,
        task: taskRef,
        course: courseRef,
        title: block.title,
        startTime: new Date(block.startTime),
        endTime: new Date(block.endTime),
        status: 'scheduled',
        isBreak: block.isBreak || false,
        notes: block.notes || ''
      };
    });

    const savedBlocks = await StudyBlock.insertMany(blocksToSave);
    console.log(`Saved ${savedBlocks.length} scheduled study blocks to DB for user: ${userId}`);
    return savedBlocks;

  } catch (error) {
    console.error('Error generating AI schedule:', error);
    throw error;
  }
}

// Robust fallback generator if parse failed or API keys are broken
function getMockSchedulerResult(tasks, user, now) {
  const resultBlocks = [];
  const studySessionLen = user.preferredStudySessionLength || 25;

  // Let's create blocks starting tomorrow morning at 09:00 AM
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  if (tasks.length > 0) {
    tasks.forEach((t, idx) => {
      // Create a study block
      const start = new Date(tomorrow);
      start.setHours(9 + idx * 2, 0, 0, 0);
      
      const end = new Date(start);
      end.setMinutes(start.getMinutes() + studySessionLen * 2); // 50 mins

      resultBlocks.push({
        title: `📖 Study Session: ${t.title}`,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        notes: `AI generated study block focused on: ${t.title}. Priority ${t.priority.toUpperCase()}.`,
        isBreak: false,
        taskIndex: idx
      });

      // Inject a quick wellness break after the task block
      const breakStart = new Date(end);
      const breakEnd = new Date(breakStart);
      breakEnd.setMinutes(breakStart.getMinutes() + 15);

      resultBlocks.push({
        title: '🌸 Rest & Relax',
        startTime: breakStart.toISOString(),
        endTime: breakEnd.toISOString(),
        notes: 'Stretch, drink some water, and relax.',
        isBreak: true,
        taskIndex: null
      });
    });
  } else {
    // Generate a default schedule
    const start = new Date(tomorrow);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start);
    end.setHours(12, 0, 0, 0);

    resultBlocks.push({
      title: '📚 General Subject Review',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      notes: 'No tasks scheduled. Use this block to review past notes or read textbooks.',
      isBreak: false,
      taskIndex: null
    });
  }

  return JSON.stringify(resultBlocks);
}

module.exports = {
  generateSchedule
};
