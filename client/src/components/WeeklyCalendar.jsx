import React, { useState } from 'react';
import { Clock, BookOpen, Flame, Smile, CheckCircle, Bell, ChevronLeft, ChevronRight } from 'lucide-react';

const WeeklyCalendar = ({ blocks, onBlockClick, onDeleteBlock }) => {
  // Setup days offset for tabs
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  // Helper to get formatted date string for tab headers (e.g., "Wed, May 21")
  const getHeaderDateString = (offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const dayStr = daysOfWeek[d.getDay()].slice(0, 3);
    const monthStr = d.toLocaleString('default', { month: 'short' });
    const dateNum = d.getDate();
    return { dayStr, monthStr, dateNum, fullDate: d };
  };

  const getBlocksForDayOffset = (offset) => {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offset);
    targetDate.setHours(0, 0, 0, 0);

    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setDate(targetDate.getDate() + 1);

    return blocks.filter((block) => {
      const blockTime = new Date(block.startTime);
      return blockTime >= targetDate && blockTime < targetDateEnd;
    });
  };

  const formatClockTime = (isoString) => {
    const date = new Date(isoString);
    let hrs = date.getHours();
    const mins = date.getMinutes().toString().padStart(2, '0');
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12; // hour 0 is 12
    return `${hrs}:${mins} ${ampm}`;
  };

  const currentDayBlocks = getBlocksForDayOffset(selectedDayOffset);

  return (
    <div className="space-y-4">
      {/* 7-DAY MOBILE SELECTOR BUTTON PILLS (optimized for 375px screens) */}
      <div className="flex items-center justify-between bg-white dark:bg-[#121624]/60 backdrop-blur-md p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 relative overflow-x-auto select-none no-scrollbar">
        <button
          onClick={() => setSelectedDayOffset(prev => Math.max(0, prev - 1))}
          disabled={selectedDayOffset === 0}
          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-400 hover:text-brand-500 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 flex justify-around gap-1 mx-2">
          {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
            const info = getHeaderDateString(offset);
            const isActive = selectedDayOffset === offset;
            const isToday = offset === 0;
            const hasBlocks = getBlocksForDayOffset(offset).length > 0;

            return (
              <button
                key={offset}
                onClick={() => setSelectedDayOffset(offset)}
                className={`flex flex-col items-center justify-center w-11 h-12 rounded-xl text-center transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-600/25 scale-105 border border-brand-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                }`}
              >
                <span className="text-[9px] uppercase font-bold tracking-wider leading-none">
                  {isToday ? 'TOD' : info.dayStr}
                </span>
                <span className="text-sm font-black mt-1 leading-none">
                  {info.dateNum}
                </span>
                {hasBlocks && (
                  <div className={`w-1 h-1 rounded-full mt-0.5 ${isActive ? 'bg-white' : 'bg-brand-500'}`} />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSelectedDayOffset(prev => Math.min(6, prev + 1))}
          disabled={selectedDayOffset === 6}
          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-400 hover:text-brand-500 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* DETAILED DAILY LISTINGS */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            {selectedDayOffset === 0 ? 'Today\'s Schedule' : `Schedule for ${getHeaderDateString(selectedDayOffset).fullDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`}
          </h3>
          <span className="text-xs text-slate-400 font-bold bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800/40">
            {currentDayBlocks.length} Blocks
          </span>
        </div>

        {currentDayBlocks.length === 0 ? (
          <div className="glass-card py-10 px-4 text-center">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-900/60 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3 border border-slate-200/50 dark:border-slate-800/40">
              <Clock className="w-6.5 h-6.5" />
            </div>
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">No scheduled blocks today</h4>
            <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">Click "Optimize Calendar" above to let our AI schedule your study sessions and breaks automatically!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {currentDayBlocks.map((block) => {
              const courseColor = block.course ? block.course.color : '#94a3b8'; // default slate-400
              const courseCode = block.course ? block.course.code : 'GEN';

              return (
                <div
                  key={block._id}
                  onClick={() => onBlockClick && onBlockClick(block)}
                  className={`glass-card glass-card-hover p-4 text-left flex items-start justify-between cursor-pointer border-l-4.5`}
                  style={{ borderLeftColor: block.isBreak ? '#10b981' : courseColor }}
                >
                  <div className="space-y-1.5 flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        block.isBreak 
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-slate-100 dark:bg-[#1f293d] text-slate-500 dark:text-slate-300'
                      }`}>
                        {block.isBreak ? 'REST' : courseCode}
                      </span>
                      
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatClockTime(block.startTime)} - {formatClockTime(block.endTime)}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                      {block.title}
                    </h4>

                    {block.notes && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate leading-relaxed">
                        {block.notes}
                      </p>
                    )}

                    {/* Show focus outcome badge if logged */}
                    {block.status === 'completed' && block.focusScore !== undefined && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                          <CheckCircle className="w-3 h-3 fill-current" />
                          Logged: {block.focusScore}% Focus
                        </span>
                        {block.distractionCount > 0 && (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/10">
                            {block.distractionCount} Distractions
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  {onDeleteBlock && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this scheduled block?')) onDeleteBlock(block._id);
                      }}
                      className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors p-1"
                    >
                      Delete
                    </button>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
