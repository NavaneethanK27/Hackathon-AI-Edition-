import React from 'react';
import { Clock, Play, BookOpen, AlertCircle, Smile } from 'lucide-react';

const StudyBlockCard = ({ block, onStartTimer }) => {
  if (!block) {
    return (
      <div className="glass-card p-5 text-center flex flex-col justify-center items-center h-full min-h-[140px]">
        <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">No active session next up</h4>
        <p className="text-slate-400 text-xs mt-0.5">Ready to relax, or generate an AI schedule!</p>
      </div>
    );
  }

  const courseColor = block.course ? block.course.color : '#6366f1'; // brand indigo
  const courseCode = block.course ? block.course.code : 'GEN';
  
  const startTime = new Date(block.startTime);
  const endTime = new Date(block.endTime);
  const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

  const formatClockTime = (date) => {
    let hrs = date.getHours();
    const mins = date.getMinutes().toString().padStart(2, '0');
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12;
    return `${hrs}:${mins} ${ampm}`;
  };

  return (
    <div 
      className="glass-card p-5 relative overflow-hidden border-l-4.5 flex flex-col justify-between h-full min-h-[140px]"
      style={{ borderLeftColor: block.isBreak ? '#10b981' : courseColor }}
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded ${
            block.isBreak 
              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
          }`}>
            {block.isBreak ? 'Wellness Break' : `Course: ${courseCode}`}
          </span>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {durationMinutes} mins
          </span>
        </div>

        <h4 className="font-black text-sm text-slate-800 dark:text-white truncate">
          {block.title}
        </h4>

        {block.notes && (
          <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">
            {block.notes}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-3">
        <div className="text-[10px] font-bold text-slate-400">
          TIME: {formatClockTime(startTime)} - {formatClockTime(endTime)}
        </div>

        {!block.isBreak && block.status === 'scheduled' && onStartTimer && (
          <button
            onClick={() => onStartTimer(block)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] shadow-sm hover:shadow-brand-500/25 active:scale-95 transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            Study Now
          </button>
        )}

        {block.status === 'completed' && (
          <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 fill-current/15 animate-bounce" />
            Completed
          </span>
        )}
      </div>

    </div>
  );
};

export default StudyBlockCard;
