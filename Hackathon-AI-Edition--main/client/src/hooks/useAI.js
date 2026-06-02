import { useState, useCallback } from 'react';
import API from '../api/axios';

const useAI = () => {
  const [chatLogs, setChatLogs] = useState([
    { sender: 'ai', text: 'Hey there! I am your StudyFlow AI academic helper. Ask me to break down tasks, give you study tips, check your burnout state, or optimize your calendar! 🚀' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessageToBuddy = async (message) => {
    if (!message.trim()) return;

    // Add user message locally
    const updatedHistory = [...chatLogs, { sender: 'user', text: message }];
    setChatLogs(updatedHistory);
    setAiLoading(true);
    setError(null);

    try {
      const response = await API.post('/ai/chat', {
        message,
        chatHistory: updatedHistory.slice(-6) // Only send recent thread snippets
      });

      if (response.data && response.data.success) {
        const aiText = response.data.message || response.data.reply || 'Got your message, but the AI response was empty.';
        setChatLogs(prev => [...prev, { sender: 'ai', text: aiText }]);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Chat companion went offline. Check network.';
      setError(msg);
      setChatLogs(prev => [...prev, { sender: 'ai', text: 'Oops! My AI circuits are feeling a bit congested right now. Try again in a second! 🔌' }]);
      return { success: false, message: msg };
    } finally {
      setAiLoading(false);
    }
  };

  const checkBurnoutRisk = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const response = await API.post('/ai/burnout-check');
      if (response.data && response.data.success) {
        return {
          success: true,
          burnoutScore: response.data.burnoutScore,
          level: response.data.level,
          analysis: response.data.analysis,
          recommendations: response.data.recommendations
        };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete stress analysis.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setAiLoading(false);
    }
  };

  const getWeeklyInsights = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const response = await API.get('/ai/insights');
      if (response.data && response.data.success) {
        return { success: true, insights: response.data.insights };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to compile academic insights.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setAiLoading(false);
    }
  };

  const triggerCrisisReschedule = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const response = await API.post('/ai/reschedule');
      if (response.data && response.data.success) {
        return { success: true, message: response.data.message, shiftedCount: response.data.shiftedTasksCount };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to execute automatic task rescheduling.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setAiLoading(false);
    }
  };

  const triggerCalendarOptimization = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const response = await API.post('/ai/optimize');
      if (response.data && response.data.success) {
        return { success: true, message: response.data.message, blocks: response.data.blocks };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to trigger visual schedule re-balance.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setAiLoading(false);
    }
  };

  return {
    chatLogs,
    aiLoading,
    error,
    sendMessageToBuddy,
    checkBurnoutRisk,
    getWeeklyInsights,
    triggerCrisisReschedule,
    triggerCalendarOptimization,
    clearChatLogs: () => setChatLogs([{ sender: 'ai', text: 'Chat logs reset! How can I help you optimize your study calendar today?' }])
  };
};

export default useAI;
