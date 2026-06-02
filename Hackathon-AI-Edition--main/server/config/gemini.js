const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

// Initialize the Google Generative AI client
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    genAI = new GoogleGenerativeAI({ apiKey });
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
      let result;
      if (typeof model.generateText === 'function') {
        result = await model.generateText({ prompt, temperature: 0.4, candidateCount: 1 });
      } else if (typeof model.generateContent === 'function') {
        result = await model.generateContent(prompt, { temperature: 0.4, candidateCount: 1 });
      } else {
        throw new Error('Gemini model does not support generateText or generateContent.');
      }

      const response = result.response || result;
      if (response) {
        if (typeof response.text === 'function') {
          return response.text();
        }
        if (typeof result.text === 'function') {
          return result.text();
        }
        if (typeof response === 'string') {
          return response;
        }
        if (response.output && Array.isArray(response.output) && response.output.length > 0) {
          const textContent = response.output
            .map(item => item?.content?.map(c => c.text || '').join('') || '')
            .join('');
          if (textContent.trim()) return textContent.trim();
        }
        if (response.candidates && Array.isArray(response.candidates) && response.candidates[0]?.content) {
          return response.candidates[0].content
            .map(c => c.text || '')
            .join('')
            .trim();
        }
      }

      return JSON.stringify(result);
    } catch (error) {
      console.error('Gemini API call failed, invoking mock fallback:', error.message);
      return getMockFallback(fallbackType, prompt);
    }
  } else {
    // Artificial delay to mimic realistic latency
    await new Promise(resolve => setTimeout(resolve, 800));
    return getMockFallback(fallbackType, prompt);
  }
}

/**
 * Supplies premium mock JSON structures for development testing
 */
function getMockFallback(type, prompt = '') {
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
    default: {
      const lowerPrompt = prompt.toLowerCase();
      const studyResponses = [
        'You are doing great. Focus on one task at a time, and if your workload feels heavy, we can build a quick mini-plan together.',
        'Try breaking your next study block into smaller 25-minute sessions, then add a 5-minute review after each step.',
        'If you feel overwhelmed, start with the easiest task first to gain momentum and reduce stress.',
        'Your study rhythm improves when you alternate focused learning with active recall and short breaks.',
        'Let me know your subject and I can suggest a tailored study strategy or quiz outline.'
      ];

      if (lowerPrompt.includes('burnout') || lowerPrompt.includes('stress') || lowerPrompt.includes('overwhelmed')) {
        return 'It sounds like you are under a lot of pressure. Pause, breathe, and let me help you rearrange your day so the workload becomes manageable again.';
      }

      if (lowerPrompt.includes('quiz') || lowerPrompt.includes('questions') || lowerPrompt.includes('practice')) {
        return 'I can generate a set of practice questions for your topic. Send me your course name or the key concepts you want to review.';
      }

      if (lowerPrompt.includes('schedule') || lowerPrompt.includes('plan') || lowerPrompt.includes('calendar')) {
        return 'Let’s optimize your study schedule. Share your current task list and preferred study hours, and I’ll suggest a better weekly flow.';
      }

      return studyResponses[Math.floor(Math.random() * studyResponses.length)];
    }
  }
}

module.exports = {
  getGeminiModel,
  callGemini
};
