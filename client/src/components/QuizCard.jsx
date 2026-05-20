import React from 'react';
import { BookOpen, CheckCircle, ChevronRight, Play, Trash2 } from 'lucide-react';

const QuizCard = ({ quiz, onTakeQuiz, onDeleteQuiz }) => {
  const qCount = quiz.questions ? quiz.questions.length : 0;
  
  const courseCode = quiz.course ? quiz.course.code : 'GEN';
  const courseColor = quiz.course ? quiz.course.color : '#6366f1';

  // Analyze attempts
  const hasAttempts = quiz.attempts && quiz.attempts.length > 0;
  const bestAttempt = hasAttempts 
    ? Math.max(...quiz.attempts.map(a => a.percentage)) 
    : null;

  return (
    <div className="glass-card glass-card-hover p-5 relative overflow-hidden flex flex-col justify-between h-full min-h-[170px]">
      
      {/* Top course pill */}
      <div className="flex items-center justify-between gap-2">
        <span 
          className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded"
          style={{ backgroundColor: `${courseColor}15`, color: courseColor }}
        >
          {courseCode} Course
        </span>
        <span className="text-[10px] font-bold text-slate-400">
          {qCount} Questions
        </span>
      </div>

      {/* Title */}
      <div className="my-3 space-y-1">
        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white line-clamp-2">
          {quiz.title}
        </h4>
        
        {hasAttempts ? (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10 w-fit">
            <CheckCircle className="w-3.5 h-3.5 fill-current/15" />
            Best Attempt: {bestAttempt}%
          </div>
        ) : (
          <span className="text-[10px] font-bold text-slate-400">
            Unattempted
          </span>
        )}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-2">
        {onDeleteQuiz ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this AI quiz permanently?')) onDeleteQuiz(quiz._id);
            }}
            className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/50 active:scale-95 transition-all"
            title="Delete quiz"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={() => onTakeQuiz(quiz)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/10 active:scale-95 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Start Quiz
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

export default QuizCard;
