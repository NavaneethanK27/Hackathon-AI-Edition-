const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

// Initialize the Google Generative AI client
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Google Gemini AI client successfully initialized.');
  } else {
    console.warn('GEMINI_API_KEY is not configured. Running in Mock/Simulated AI mode.');
  }
} catch (error) {
  console.error('Failed to initialize Google Gemini AI Client:', error.message);
}

/**
 * Returns the Gemini 1.5 Flash Model
 * @returns {Object|null} Gemini Model instance, or null if key is missing (enabling simulated fallbacks)
 */
function getGeminiModel() {
  if (!genAI) {
    return null;
  }
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

/**
 * Helper to call Gemini AI or fallback to simulated mock results if the key is absent.
 * Supports structured output parsing by wrapping prompts.
 * @param {string} prompt Prompt content
 * @param {string} fallbackType Type of simulated response needed if API is unavailable
 * @returns {Promise<string>} AI Response or fallback JSON mock string
 */
async function callGemini(prompt, fallbackType = 'text') {
  const model = getGeminiModel();
  if (model) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API call failed, invoking mock fallback:', error.message);
      return getMockFallback(fallbackType);
    }
  } else {
    // Artificial delay to mimic realistic latency
    await new Promise(resolve => setTimeout(resolve, 800));
    return getMockFallback(fallbackType);
  }
}

/**
 * Supplies premium mock JSON structures for development testing
 */
function getMockFallback(type) {
  switch (type) {
    case 'subtask':
      return JSON.stringify([
        { title: 'Read introductory chapter & take basic notes', completed: false },
        { title: 'Draft high-level conceptual outline', completed: false },
        { title: 'Write first draft of the main section', completed: false },
        { title: 'Review structural flow & proofread code snippets', completed: false }
      ]);
    
    case 'schedule':
      const today = new Date();
      const getFutureDate = (daysAhead, hour) => {
        const d = new Date(today);
        d.setDate(today.getDate() + daysAhead);
        d.setHours(hour, 0, 0, 0);
        return d.toISOString();
      };
      return JSON.stringify([
        {
          title: '📖 Deep Focused Study: Core Concepts',
          startTime: getFutureDate(1, 9),
          endTime: getFutureDate(1, 11),
          notes: 'Focusing on primary high-priority topics. Remember to take a quick water break!',
          isBreak: false
        },
        {
          title: '🌸 Rest & Walk Break',
          startTime: getFutureDate(1, 11),
          endTime: getFutureDate(1, 11.25),
          notes: 'Proactive AI Wellness Break. Stand up, stretch, and let your mind rest.',
          isBreak: true
        },
        {
          title: '💻 Practical Problem Solving & Lab Work',
          startTime: getFutureDate(1, 13),
          endTime: getFutureDate(1, 15),
          notes: 'Hands-on practice. Build small tests to apply what you have learned.',
          isBreak: false
        },
        {
          title: '📝 Quick Review & Summary Write-up',
          startTime: getFutureDate(2, 10),
          endTime: getFutureDate(2, 11.5),
          notes: 'Write down summaries of the studied concepts to improve memory retention.',
          isBreak: false
        }
      ]);

    case 'burnout':
      return JSON.stringify({
        burnoutScore: 0.42,
        level: 'Moderate',
        analysis: 'You have a steady load of tasks. Some due dates are approaching, but keeping regular pomodoro focus sessions will prevent stress buildup.',
        recommendations: [
          'Spread out your study hours instead of cramming them into a single evening.',
          'Log a focus session tomorrow to rebuild your study rhythm.',
          'Plan a 15-minute wellness break after your next long block.'
        ]
      });

    case 'insights':
      return JSON.stringify({
        weeklySummary: 'This week you focused primarily on core technical subjects. Your cognitive efficiency peaked in the morning sessions.',
        cognitiveLoadRating: 'Stable (Level 3/5)',
        peakEfficiencyTime: 'Morning (08:00 AM - 11:30 AM)',
        distractionWarning: false,
        keyAITips: [
          'Schedule your most challenging programming exercises between 9 AM and 11 AM.',
          'Your focus score increases by 15% when following a 25/5 Pomodoro rhythm.',
          'Consider reviewing your course flashcards right before sleeping for better retention.'
        ]
      });

    case 'quiz':
      return JSON.stringify({
        title: '🤖 Dynamic AI Generated Mini-Quiz',
        questions: [
          {
            questionText: 'What is the primary architectural goal of using asynchronous micro-tasks in scheduling systems?',
            options: [
              'To increase database disk space overhead',
              'To avoid blocking the main execution thread, improving performance and user experience',
              'To force all network connections to operate in synchronous serial modes',
              'To restrict users from triggering custom tasks during runtime'
            ],
            correctOptionIndex: 1,
            explanation: 'Asynchronous architectures prevent blocking of execution loops, ensuring scheduling applications remain fluid and reactive.'
          },
          {
            questionText: 'Which cognitive technique is leveraged by spacing out reviews over increasing intervals of time?',
            options: [
              'Cognitive overload manipulation',
              'Spaced Repetition System (SRS) for long-term memory integration',
              'Subconscious cramming loops',
              'Random associative guessing'
            ],
            correctOptionIndex: 1,
            explanation: 'Spaced repetition enhances retention by reviewing knowledge right as it begins to decay in memory.'
          },
          {
            questionText: 'In adaptive study systems, what is the major indicator of cognitive fatigue?',
            options: [
              'A sudden spike in XP gains',
              'A decline in logged Focus Scores alongside high consecutive study hours',
              'Logging consistent 25-minute Pomodoro periods',
              'Completing tasks ahead of scheduled deadlines'
            ],
            correctOptionIndex: 1,
            explanation: 'Declining focus scores over consecutive long study sessions are a core indicator of high cognitive fatigue and impending burnout.'
          }
        ]
      });

    case 'text':
    default:
      return 'I am StudyFlow AI Buddy, your personal academic copilot. I am here to help optimize your study calendars, create dynamic quizzes, and safeguard you against academic burnout. Let me know how I can support you today!';
  }
}

module.exports = {
  getGeminiModel,
  callGemini
};
