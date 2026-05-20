import React, { useState, useEffect, useRef } from 'react';
import useAI from '../hooks/useAI';
import ChatBubble from '../components/ChatBubble';
import { 
  Sparkles, 
  Cpu, 
  Send, 
  Trash2, 
  Activity, 
  RefreshCw, 
  Lightbulb, 
  ShieldAlert, 
  Calendar, 
  ArrowRight,
  BookOpen, 
  HelpCircle,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

const AIAssistant = () => {
  const {
    chatLogs,
    aiLoading,
    error,
    sendMessageToBuddy,
    checkBurnoutRisk,
    getWeeklyInsights,
    triggerCrisisReschedule,
    triggerCalendarOptimization,
    clearChatLogs
  } = useAI();

  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // chat, burnout, insights, optimize
  
  // Custom tool output states
  const [burnoutData, setBurnoutData] = useState(null);
  const [burnoutLoading, setBurnoutLoading] = useState(false);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState(null);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  const chatEndRef = useRef(null);

  // Auto scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLogs]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || aiLoading) return;
    
    const messageText = input;
    setInput('');
    await sendMessageToBuddy(messageText);
  };

  const handleSuggestionClick = async (suggestion) => {
    if (aiLoading) return;
    setActiveTab('chat');
    await sendMessageToBuddy(suggestion);
  };

  const runBurnoutDiagnostic = async () => {
    setBurnoutLoading(true);
    setBurnoutData(null);
    setActionSuccessMessage('');
    try {
      const res = await checkBurnoutRisk();
      if (res && res.success) {
        setBurnoutData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBurnoutLoading(false);
    }
  };

  const runCalendarOptimization = async () => {
    setOptimizeLoading(true);
    setOptimizeResult(null);
    setActionSuccessMessage('');
    try {
      const res = await triggerCalendarOptimization();
      if (res && res.success) {
        setOptimizeResult(res);
        setActionSuccessMessage('Gemini has perfectly re-balanced your calendar study slots based on your current coursework load and fatigue indices!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizeLoading(false);
    }
  };

  const runWeeklyInsights = async () => {
    setInsightsLoading(true);
    setInsights([]);
    try {
      const res = await getWeeklyInsights();
      if (res && res.success) {
        setInsights(res.insights || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleCrisisReschedule = async () => {
    if (burnoutLoading) return;
    setBurnoutLoading(true);
    try {
      const res = await triggerCrisisReschedule();
      if (res && res.success) {
        setActionSuccessMessage(`Crisis averted! Shuffled ${res.shiftedCount} high-density study blocks to next week to lower stress.`);
        // Reload burnout status
        await runBurnoutDiagnostic();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBurnoutLoading(false);
    }
  };

  // Run automatically when tab changes to load initial details
  useEffect(() => {
    if (activeTab === 'burnout' && !burnoutData) {
      runBurnoutDiagnostic();
    } else if (activeTab === 'insights' && insights.length === 0) {
      runWeeklyInsights();
    } else if (activeTab === 'optimize' && !optimizeResult) {
      runCalendarOptimization();
    }
  }, [activeTab]);

  const suggestions = [
    "How do I set up a bulletproof study routine?",
    "Give me an active recall technique for biology chapters.",
    "I feel overwhelmed by my study tasks, help!",
    "Suggest a wellness break focus exercise."
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 mb-20 md:mb-0">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-5">
        <div>
          <h2 className="text-2xl md:text-3.5xl font-black text-slate-800 dark:text-white leading-tight">
            StudyFlow AI Buddy & Workspace 🧠
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed mt-1 flex items-center gap-1.5">
            <Cpu className="w-4.5 h-4.5 text-brand-500" />
            Your adaptive cognitive partner. Optimize schedule, audit burnout risks, or solve coursework challenges.
          </p>
        </div>

        <button
          onClick={clearChatLogs}
          className="glass-btn-secondary py-2 px-3.5 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:bg-rose-500/20 active:scale-95 self-start md:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          Reset Chat
        </button>
      </div>

      {/* THREE PANELS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* NAV TABS / TOOLBOX (col-span-3) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="glass-card p-4 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">
              AI System Instruments
            </span>
            
            <nav className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                  activeTab === 'chat'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/15'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <BrainCircuit className="w-4.5 h-4.5 shrink-0" />
                Study Buddy Chat
              </button>

              <button
                onClick={() => setActiveTab('burnout')}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                  activeTab === 'burnout'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/15'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Activity className="w-4.5 h-4.5 shrink-0" />
                Stress Audit Panel
              </button>

              <button
                onClick={() => setActiveTab('optimize')}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                  activeTab === 'optimize'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/15'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Calendar className="w-4.5 h-4.5 shrink-0" />
                Smart Re-balancer
              </button>

              <button
                onClick={() => setActiveTab('insights')}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                  activeTab === 'insights'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/15'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Lightbulb className="w-4.5 h-4.5 shrink-0" />
                Cognitive Insights
              </button>
            </nav>
          </div>

          {/* Quick shortcuts widget */}
          <div className="glass-card p-4 space-y-3.5 hidden lg:block">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">
              Ask your Study Buddy
            </span>
            <div className="flex flex-col gap-2">
              {suggestions.slice(0, 3).map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(sug)}
                  className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40 text-[11px] font-bold text-left leading-relaxed text-slate-500 dark:text-slate-400 hover:border-brand-500/30 hover:bg-brand-500/5 dark:hover:bg-brand-500/10 active:scale-[0.98] transition-all"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CORE WORKSPACE VIEW (col-span-9) */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: GENERAL STUDY BUDDY CHAT */}
          {activeTab === 'chat' && (
            <div className="glass-card flex flex-col h-[650px] relative overflow-hidden">
              
              {/* Chat Header Info */}
              <div className="px-5 py-3 border-b border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">StudyFlow Flash Companion v1.5</span>
                </div>
                <HelpCircle className="w-4.5 h-4.5 text-slate-400 cursor-pointer hover:text-brand-500" />
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col scroll-smooth">
                {chatLogs.map((msg, i) => (
                  <ChatBubble 
                    key={i} 
                    sender={msg.sender} 
                    text={msg.text} 
                    timestamp={msg.timestamp} 
                  />
                ))}
                
                {aiLoading && (
                  <div className="flex items-start gap-2.5 self-start">
                    <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border border-brand-500/10 bg-brand-50 dark:bg-brand-950/20 text-brand-500 animate-spin">
                      <Cpu className="w-4.5 h-4.5" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl text-xs font-bold leading-relaxed bg-white dark:bg-[#121624]/80 text-slate-400 rounded-tl-none border border-slate-200/50 dark:border-slate-800/40">
                      Formulating cognitive response... 🌌
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30 flex gap-2.5 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type anything (e.g. 'Generate active recall list for CS201', 'Optimize study routines')..."
                  className="flex-1 glass-input py-3 text-xs bg-white dark:bg-[#0c0f17] border-slate-200 dark:border-slate-800/80 focus:border-brand-500 font-semibold"
                  disabled={aiLoading}
                />
                
                <button
                  type="submit"
                  disabled={aiLoading || !input.trim()}
                  className="p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl active:scale-95 transition-all shadow-md shadow-brand-600/15 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>

            </div>
          )}

          {/* TAB 2: BURNOUT DIAGNOSTIC AND STRESS AUDIT */}
          {activeTab === 'burnout' && (
            <div className="glass-card p-6 space-y-6 min-h-[500px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-5.5 h-5.5 text-rose-500" />
                    Cognitive Burnout & Stress Audit
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">
                    Continuous workload, fatigue indicators, and AI crisis remedies.
                  </p>
                </div>

                <button
                  onClick={runBurnoutDiagnostic}
                  disabled={burnoutLoading}
                  className="glass-btn-secondary py-2 px-3 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:border-brand-500/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${burnoutLoading ? 'animate-spin' : ''}`} />
                  Re-Audit Risk
                </button>
              </div>

              {actionSuccessMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold animate-slide-up flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5" />
                  {actionSuccessMessage}
                </div>
              )}

              {burnoutLoading ? (
                <div className="py-20 text-center space-y-3 animate-pulse">
                  <Cpu className="w-8 h-8 mx-auto text-rose-500 animate-spin" />
                  <p className="text-xs text-slate-400 font-bold uppercase">Evaluating stress scores & scheduling density...</p>
                </div>
              ) : burnoutData ? (
                <div className="space-y-6">
                  {/* Stress Level Meter */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                    <div className="text-center md:text-left space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Burnout Ratio</span>
                      <div className="text-3xl font-black text-slate-800 dark:text-white">
                        {(burnoutData.burnoutScore * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Workload Status</span>
                      <div className={`text-xs font-black uppercase flex items-center gap-1.5 ${
                        burnoutData.level === 'critical' ? 'text-rose-500' :
                        burnoutData.level === 'high' ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        <ShieldAlert className="w-4 h-4" />
                        {burnoutData.level} Alert level
                      </div>
                    </div>

                    {/* Progress slider bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 relative">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          burnoutData.level === 'critical' ? 'bg-gradient-to-r from-orange-500 to-rose-600' :
                          burnoutData.level === 'high' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                          'bg-gradient-to-r from-emerald-500 to-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, burnoutData.burnoutScore * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Diagnostic details */}
                  <div className="space-y-4.5">
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Cognitive Analysis</h4>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed bg-white dark:bg-[#121624]/60 p-4 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                        {burnoutData.analysis || 'Analysis log compiled successfully.'}
                      </p>
                    </div>

                    {/* Recommendations checklist */}
                    {burnoutData.recommendations && burnoutData.recommendations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Adaptive Actions Recommendations</h4>
                        <div className="grid gap-2.5">
                          {burnoutData.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex gap-2.5 p-3.5 bg-brand-500/5 border border-brand-500/10 dark:bg-[#161329]/30 dark:border-brand-500/10 rounded-xl">
                              <Sparkles className="w-4.5 h-4.5 text-brand-500 shrink-0 mt-0.5" />
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Crisis Shift button trigger */}
                    {(burnoutData.level === 'critical' || burnoutData.level === 'high') && (
                      <div className="p-5 border border-dashed border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 rounded-2xl space-y-3">
                        <div className="flex gap-2">
                          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">Activate Crisis Shift Algorithm</h5>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Our scheduler has identified extreme task densities. Activating this shifts upcoming non-urgent homework blocks into later weeks to give you breathing room.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleCrisisReschedule}
                          className="glass-btn-danger w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-4 h-4 animate-pulse" />
                          Crisis Reschedule & Delay Pending Blocks
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400 font-bold">No active stress logs available.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SMART CALENDAR RE-BALANCER */}
          {activeTab === 'optimize' && (
            <div className="glass-card p-6 space-y-6 min-h-[500px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Calendar className="w-5.5 h-5.5 text-indigo-500" />
                    Adaptive Calendar Re-balancer
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">
                    Align academic deadlines and study blocks to your peak cognitive energy hours.
                  </p>
                </div>

                <button
                  onClick={runCalendarOptimization}
                  disabled={optimizeLoading}
                  className="glass-btn-primary py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${optimizeLoading ? 'animate-spin' : ''}`} />
                  Trigger Gemini Re-balance
                </button>
              </div>

              {actionSuccessMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold animate-slide-up flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5" />
                  {actionSuccessMessage}
                </div>
              )}

              {optimizeLoading ? (
                <div className="py-20 text-center space-y-3 animate-pulse">
                  <BrainCircuit className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
                  <p className="text-xs text-slate-400 font-bold uppercase">Aligning tasks with peak study slots...</p>
                </div>
              ) : optimizeResult ? (
                <div className="space-y-6">
                  <div className="p-4.5 bg-indigo-500/5 border border-indigo-500/10 dark:bg-[#13162b]/40 rounded-xl flex gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                      Your calendar was successfully restructured. The AI integrated your active courses, difficulty ratings, and daily study goal thresholds into a custom weekly sequence.
                    </p>
                  </div>

                  {optimizeResult.blocks && optimizeResult.blocks.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Re-Balanced Study Blocks ({optimizeResult.blocks.length})
                      </h4>
                      <div className="grid gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {optimizeResult.blocks.slice(0, 6).map((blk, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3.5 bg-white dark:bg-[#121624]/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
                            <div>
                              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">{blk.title}</h5>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
                                {new Date(blk.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {new Date(blk.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              blk.isBreak ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/10' : 'bg-brand-500/10 text-brand-500 border border-brand-500/10'
                            }`}>
                              {blk.isBreak ? 'Break' : 'Study'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-xs text-slate-400 font-bold">Successfully saved blocks. Check Planner to see details.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400 font-bold">Press 'Trigger Gemini Re-balance' to align calendar blocks automatically.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COGNITIVE WEEKLY INSIGHTS */}
          {activeTab === 'insights' && (
            <div className="glass-card p-6 space-y-6 min-h-[500px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Lightbulb className="w-5.5 h-5.5 text-amber-500" />
                    Cognitive Study Insights
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">
                    Proactive study suggestions, distraction metrics, and level performance habits.
                  </p>
                </div>

                <button
                  onClick={runWeeklyInsights}
                  disabled={insightsLoading}
                  className="glass-btn-secondary py-2 px-3 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:border-brand-500/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${insightsLoading ? 'animate-spin' : ''}`} />
                  Reload Insights
                </button>
              </div>

              {insightsLoading ? (
                <div className="py-20 text-center space-y-3 animate-pulse">
                  <TrendingUp className="w-8 h-8 mx-auto text-amber-500 animate-spin" />
                  <p className="text-xs text-slate-400 font-bold uppercase">Gathering study parameters...</p>
                </div>
              ) : insights && insights.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-3.5">
                    {insights.map((ins, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 bg-white dark:bg-[#121624]/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex gap-3.5 items-start glass-card-hover"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-extrabold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">Insight #{idx + 1}</h5>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                            {ins}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400 mb-2">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Your academic insights will appear here.</p>
                  <p className="text-[11px] text-slate-400/70 mt-1">Log at least one Pomodoro session to calculate weekly insights.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AIAssistant;
