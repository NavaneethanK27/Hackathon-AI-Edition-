import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

const StreakBadge = ({ streak }) => {
  const finalStreak = streak || 0;

  const getStreakMessage = () => {
    if (finalStreak >= 10) return 'Academic Elite Status! 👑';
    if (finalStreak >= 5) return 'Unstoppable Momentum! 🚀';
    if (finalStreak >= 3) return 'Solid Rhythm! Keep going 🔥';
    if (finalStreak > 0) return 'Streak started! Day 1 is done 👏';
    return 'Log a study session to start a streak!';
  };

  return (
    <div className="glass-card p-4 flex items-center gap-3.5 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-orange-500/10">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
        finalStreak > 0
          ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-500 animate-pulse'
          : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
      }`}>
        <Flame className={`w-7 h-7 ${finalStreak > 0 ? 'fill-current' : ''}`} />
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black text-slate-800 dark:text-orange-400 leading-none">
            {finalStreak} Days
          </span>
          {finalStreak >= 3 && (
            <span className="bg-orange-500 text-white font-extrabold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> HOT
            </span>
          )}
        </div>
        <p className="text-xs font-semibold text-slate-400 leading-relaxed">
          {getStreakMessage()}
        </p>
      </div>
    </div>
  );
};

export default StreakBadge;
