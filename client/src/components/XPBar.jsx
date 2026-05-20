import React from 'react';
import { Award, Trophy } from 'lucide-react';

const XPBar = ({ level, xp }) => {
  const currentLevel = level || 1;
  const currentXP = xp || 0;
  
  // Experience leveling formula: level * 500 XP required to level up
  const xpNeeded = currentLevel * 500;
  const percentage = Math.min(Math.round((currentXP / xpNeeded) * 100), 100);

  return (
    <div className="glass-card p-4 space-y-3.5 bg-gradient-to-br from-brand-500/5 to-indigo-500/5 border-brand-500/10">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/40 text-brand-500 flex items-center justify-center">
            <Trophy className="w-5.5 h-5.5 fill-current/10" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Rank Status</p>
            <h4 className="text-sm font-black text-slate-800 dark:text-brand-300 mt-1">
              Level {currentLevel} Scholar
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-xl">
          <Award className="w-4 h-4" />
          <span>{currentXP} / {xpNeeded} XP</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-900 border border-slate-300/30 dark:border-slate-800/40 overflow-hidden p-0.5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-500 transition-all duration-700" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
          <span>{percentage}% complete</span>
          <span>{xpNeeded - currentXP} XP to Level {currentLevel + 1}</span>
        </div>
      </div>

    </div>
  );
};

export default XPBar;
