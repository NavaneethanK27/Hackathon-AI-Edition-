import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Heart, Sparkles, ArrowRight } from 'lucide-react';
import API from '../api/axios';

const BurnoutAlert = ({ score, level, analysis, recommendations, onRescheduled }) => {
  const [loading, setLoading] = useState(false);
  const [rescheduleResult, setRescheduleResult] = useState(null);

  const handleCrisisReschedule = async () => {
    setLoading(true);
    try {
      const response = await API.post('/ai/reschedule');
      if (response.data && response.data.success) {
        setRescheduleResult(response.data.message);
        if (onRescheduled) onRescheduled();
      }
    } catch (err) {
      console.error(err);
      alert('Reschedule call failed. Consider manually postponing a task.');
    } finally {
      setLoading(false);
    }
  };

  const isHighBurnout = level === 'High' || level === 'Critical' || score > 0.65;

  return (
    <div className={`glass-card p-5 relative overflow-hidden border-l-4.5 ${
      isHighBurnout
        ? 'border-l-danger bg-danger-light/20 dark:bg-danger/5 shadow-danger/5'
        : 'border-l-success bg-success-light/20 dark:bg-success/5'
    }`}>
      
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
          isHighBurnout 
            ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-500' 
            : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500'
        }`}>
          {isHighBurnout ? <AlertTriangle className="w-5.5 h-5.5" /> : <ShieldCheck className="w-5.5 h-5.5" />}
        </div>

        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Academic Fatigue Meter</p>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                Stress Level: 
                <span className={isHighBurnout ? 'text-rose-500' : 'text-emerald-500'}>
                  {level || 'Low'} ({Math.round((score || 0.15) * 100)}%)
                </span>
              </h4>
            </div>

            {/* Micro visual scorebar */}
            <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isHighBurnout ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                style={{ width: `${(score || 0.15) * 100}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {analysis || 'Your scheduling pacing is well balanced! No warning factors identified.'}
          </p>

          {/* Recommendations checklist */}
          {recommendations && recommendations.length > 0 && (
            <div className="pt-2 space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Wellness Action Plan:</p>
              <div className="grid gap-1.5">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Heart className="w-3.5 h-3.5 text-rose-500/80 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crisis Reschedule Button if High Burnout */}
          {isHighBurnout && !rescheduleResult && (
            <div className="pt-3.5">
              <button
                onClick={handleCrisisReschedule}
                disabled={loading}
                className="glass-btn bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 px-4 shadow-md shadow-rose-600/10 hover:shadow-rose-500/25 flex items-center gap-2 active:scale-95"
              >
                {loading ? 'Rescheduling deadlines...' : 'Proactive AI Crisis Relief (Shift Due Dates)'}
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
              </button>
              <p className="text-[9px] text-slate-400 font-semibold mt-1.5">
                Shifts tasks due in the next 72 hours by 48 hours to grant you breathing room.
              </p>
            </div>
          )}

          {rescheduleResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-semibold animate-fade-in mt-3">
              🎉 {rescheduleResult} Calendar stress adjusted.
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default BurnoutAlert;
