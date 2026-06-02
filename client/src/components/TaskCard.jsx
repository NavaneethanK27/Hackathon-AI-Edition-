import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Clock, 
  AlertCircle,
  Cpu
} from 'lucide-react';

const TaskCard = ({ 
  task, 
  onToggleComplete, 
  onToggleSubtask, 
  onBreakdownAI, 
  onDelete 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIBreakdown = async (e) => {
    e.stopPropagation();
    setAiLoading(true);
    setExpanded(true);
    await onBreakdownAI(task._id);
    setAiLoading(false);
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'high':
        return 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/10';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/10';
      case 'low':
      default:
        return 'bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-slate-400';
    }
  };

  const getDifficultyBadge = (d) => {
    switch (d) {
      case 'hard':
        return '🚨 Hard';
      case 'medium':
        return '⚡ Medium';
      case 'easy':
      default:
        return '🌱 Easy';
    }
  };

  const formatDueDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks = hasSubtasks ? task.subtasks.filter(s => s.completed).length : 0;
  const percentSubtasks = hasSubtasks ? Math.round((completedSubtasks / task.subtasks.length) * 100) : 0;

  const courseColor = task.course ? task.course.color : '#94a3b8'; // Slate default
  const courseCode = task.course ? task.course.code : 'GEN';

  return (
    <div 
      className={`glass-card p-4 transition-all duration-300 border-l-4.5 ${
        task.status === 'completed'
          ? 'opacity-65 bg-slate-100/50 dark:bg-slate-900/30'
          : 'glass-card-hover'
      }`}
      style={{ borderLeftColor: courseColor }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Toggle completion Checkbox */}
        <button
          onClick={() => onToggleComplete(task)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 active:scale-90 transition-transform duration-200 ${
            task.status === 'completed'
              ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-600/15'
              : 'border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-white dark:bg-slate-950 text-transparent'
          }`}
        >
          <CheckSquare className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>

        {/* Core content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400">
              {courseCode}
            </span>
            <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${getPriorityBadge(task.priority)}`}>
              {task.priority} Priority
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              {getDifficultyBadge(task.difficulty)}
            </span>
          </div>

          <h4 className={`font-bold text-sm text-slate-800 dark:text-white truncate ${task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Inline info grid */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Due: {formatDueDate(task.dueDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {task.estimatedHours}h Est
            </span>
            {hasSubtasks && (
              <span className="text-brand-500 text-[10px] bg-brand-500/10 px-2 py-0.5 rounded-lg">
                {completedSubtasks}/{task.subtasks.length} Subtasks ({percentSubtasks}%)
              </span>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex flex-col items-end justify-between self-stretch shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this task?')) onDelete(task._id);
            }}
            className="text-slate-300 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-900/80 p-1.5 rounded-lg active:scale-95 transition-all"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Collapse toggler */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* EXPANDED AREA FOR SUBTASKS & AI ACTIONS */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 mt-3 pt-3 space-y-3 animate-fade-in">
          
          {/* Subtask progress bar */}
          {hasSubtasks && (
            <div className="w-full bg-slate-150 dark:bg-slate-900 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-brand-500 h-full transition-all duration-300" 
                style={{ width: `${percentSubtasks}%` }}
              />
            </div>
          )}

          {/* Subtask checklist */}
          {hasSubtasks ? (
            <div className="space-y-2 pl-7.5">
              {task.subtasks.map((sub) => (
                <div 
                  key={sub._id} 
                  onClick={() => onToggleSubtask && onToggleSubtask(task._id, sub._id)}
                  className="flex items-center gap-2.5 cursor-pointer group select-none text-xs leading-none"
                >
                  <button className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    sub.completed 
                      ? 'bg-brand-500 border-brand-500 text-white' 
                      : 'border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-950 text-transparent group-hover:border-brand-500'
                  }`}>
                    <CheckSquare className="w-3 h-3 stroke-[2.5]" />
                  </button>
                  <span className={`font-medium ${
                    sub.completed 
                      ? 'line-through text-slate-400 dark:text-slate-500' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2.5 px-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl text-center text-xs">
              <p className="text-slate-400 font-semibold mb-2">No subtasks created for this task yet</p>
              
              <button
                onClick={handleAIBreakdown}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md shadow-brand-600/10 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" />
                {aiLoading ? 'Decomposing task with AI...' : 'AI Subtasks Breakdown (+15 XP)'}
              </button>
            </div>
          )}

          {/* Regenerate AI Breakdown if already has subtasks */}
          {hasSubtasks && (
            <div className="flex justify-end pt-1">
              <button
                onClick={handleAIBreakdown}
                disabled={aiLoading}
                className="text-[10px] font-bold text-slate-400 hover:text-brand-500 flex items-center gap-1 transition-colors"
              >
                <Cpu className="w-3 h-3 animate-pulse" />
                {aiLoading ? 'Re-optimizing...' : 'Regenerate Breakdown with AI'}
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default TaskCard;
