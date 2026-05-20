const Task = require('../models/Task');
const StudyBlock = require('../models/StudyBlock');
const { callGemini } = require('../config/gemini');

/**
 * Calculates a user's academic burnout score using deadline density, overdue ratios, and logged focus hours.
 * @param {string} userId - Mongo ID of the user
 * @returns {Promise<Object>} Burnout analysis results
 */
async function calculateBurnoutScore(userId) {
  try {
    const now = new Date();
    
    // 1. Calculate Deadline Density: Tasks due within the next 3 days (72 hours)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const upcomingTasksCount = await Task.countDocuments({
      user: userId,
      status: { $ne: 'completed' },
      dueDate: { $gte: now, $lte: threeDaysFromNow }
    });

    // Normalize density: 5 tasks due in 3 days represents high stress (score 1.0)
    const deadlineDensityScore = Math.min(upcomingTasksCount / 5, 1.0);

    // 2. Calculate Overdue Ratio
    const totalPendingTasks = await Task.countDocuments({
      user: userId,
      status: { $ne: 'completed' }
    });

    const overdueTasks = await Task.countDocuments({
      user: userId,
      status: { $ne: 'completed' },
      dueDate: { $lt: now }
    });

    const overdueRatio = totalPendingTasks > 0 ? (overdueTasks / totalPendingTasks) : 0;

    // 3. Analyze Study Sessions (Consecutive hours / focus durations in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const recentCompletedBlocks = await StudyBlock.find({
      user: userId,
      status: 'completed',
      startTime: { $gte: sevenDaysAgo }
    }).lean();

    let totalDurationMinutes = 0;
    let daysWithStudy = new Set();

    recentCompletedBlocks.forEach(block => {
      const duration = (new Date(block.endTime) - new Date(block.startTime)) / (1000 * 60);
      totalDurationMinutes += duration;
      
      const dayStr = new Date(block.startTime).toDateString();
      daysWithStudy.add(dayStr);
    });

    const totalHoursStudy = totalDurationMinutes / 60;
    // Calculate average study hours on days active
    const avgDailyHours = daysWithStudy.size > 0 ? (totalHoursStudy / daysWithStudy.size) : 0;
    
    // Fatigue factor: Studying more than 4 hours/day on average or studying 6+ days a week yields high fatigue
    let fatigueFactor = 0;
    if (avgDailyHours > 4) {
      fatigueFactor += 0.5;
    } else if (avgDailyHours > 2) {
      fatigueFactor += 0.25;
    }

    if (daysWithStudy.size >= 6) {
      fatigueFactor += 0.5;
    } else if (daysWithStudy.size >= 4) {
      fatigueFactor += 0.25;
    }

    fatigueFactor = Math.min(fatigueFactor, 1.0);

    // 4. Compute Weighted Burnout Score
    // Weightings: 40% Upcoming Deadlines, 30% Overdue Tasks, 30% Recent Fatigue
    let rawScore = (deadlineDensityScore * 0.4) + (overdueRatio * 0.3) + (fatigueFactor * 0.3);
    rawScore = Math.max(0, Math.min(rawScore, 1.0)); // Clamp to [0.0, 1.0]

    // Determine warning levels
    let level = 'Low';
    if (rawScore > 0.8) {
      level = 'Critical';
    } else if (rawScore > 0.6) {
      level = 'High';
    } else if (rawScore > 0.35) {
      level = 'Moderate';
    }

    // 5. Query Gemini for custom advice or use static algorithms
    const prompt = `
You are the StudyFlow AI mental wellness engine. We have analyzed a student's workload metrics:
- Overall Burnout Rating: ${level} (Score: ${rawScore.toFixed(2)}/1.0)
- Tasks due in 3 days: ${upcomingTasksCount}
- Overdue tasks count: ${overdueTasks}
- Study duration in past week: ${totalHoursStudy.toFixed(1)} hours across ${daysWithStudy.size} active days (avg ${avgDailyHours.toFixed(1)} hrs/day)

Produce a precise response in JSON format. Provide a short, constructive paragraph analyzing their mental status and 3 tactical recommendations to reduce anxiety, spacing out study, or injecting physical exercise and sleep.

Your response MUST match this JSON structure:
{
  "burnoutScore": ${rawScore},
  "level": "${level}",
  "analysis": "A concise supportive summary here...",
  "recommendations": [
    "Advice 1",
    "Advice 2",
    "Advice 3"
  ]
}

Return ONLY the JSON string. Do not wrap in markdown tags or include other text.
`;

    const aiResponse = await callGemini(prompt.trim(), 'burnout');
    
    let cleanJson = aiResponse.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(cleanJson);
      return {
        burnoutScore: parseFloat(rawScore.toFixed(2)),
        level,
        analysis: parsed.analysis || 'Your stress levels are standard. Maintaining an organized schedule will guard you from academic fatigue.',
        recommendations: parsed.recommendations || getDefaultRecommendations(level)
      };
    } catch (parseErr) {
      return {
        burnoutScore: parseFloat(rawScore.toFixed(2)),
        level,
        analysis: `Your calculated academic stress index is ${level} (${Math.round(rawScore * 100)}%). Spacing tasks out and adding breaks will enhance performance.`,
        recommendations: getDefaultRecommendations(level)
      };
    }

  } catch (error) {
    console.error('Error calculating burnout score:', error);
    throw error;
  }
}

function getDefaultRecommendations(level) {
  if (level === 'Critical' || level === 'High') {
    return [
      'Stop cramming: Reschedule at least two non-urgent task deadlines by 48 hours.',
      'Inject immediate 15-minute breaks after every 30 minutes of study using the Pomodoro tool.',
      'Prioritize sleep tonight: research shows cognitive restoration requires at least 7.5 hours of rest.'
    ];
  }
  if (level === 'Moderate') {
    return [
      'Focus on a single course task today instead of jumping between different subjects.',
      'Go for a 10-minute walk after completing your next scheduled study block.',
      'Use the AI break assistant to review complex task lists.'
    ];
  }
  return [
    'Log your focus quality regularly to let the AI fine-tune your schedules.',
    'Create a course color code map in settings for better calendar clarity.',
    'Run a weekly cognitive audit to preview upcoming assignments early.'
  ];
}

module.exports = {
  calculateBurnoutScore
};
