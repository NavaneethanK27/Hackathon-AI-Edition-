import React from 'react';
import { Cpu, User as UserIcon } from 'lucide-react';

const ChatBubble = ({ sender, text, timestamp }) => {
  const isAI = sender === 'ai';
  const time = timestamp ? new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex items-start gap-2.5 max-w-[85%] ${isAI ? 'self-start' : 'self-end flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border shadow-sm ${
        isAI 
          ? 'bg-brand-100 dark:bg-brand-950/50 border-brand-500/10 text-brand-500 animate-pulse-subtle' 
          : 'bg-slate-200 dark:bg-[#1a2035] border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400'
      }`}>
        {isAI ? <Cpu className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
      </div>

      {/* Bubble text */}
      <div className="space-y-1">
        <div className={`px-4 py-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
          isAI
            ? 'bg-white dark:bg-[#121624]/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-800/40'
            : 'bg-brand-600 text-white rounded-tr-none shadow-brand-600/10'
        }`}>
          {text}
        </div>
        <p className={`text-[9px] font-bold uppercase tracking-wider text-slate-400 ${isAI ? 'text-left pl-1' : 'text-right pr-1'}`}>
          {isAI ? 'StudyFlow AI' : 'You'} • {time}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;
