const useSchedule = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addExperiencePoints } = useAuth();

  const fetchSchedule = useCallback(async (start, end) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (start) params.start = start.toISOString();
      if (end) params.end = end.toISOString();

      const response = await API.get('/schedule/weekly', { params });
      if (response.data && response.data.success) {
        setBlocks(response.data.blocks);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve study schedule.');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateAISchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/schedule/generate');
      if (response.data && response.data.success) {
        setBlocks(response.data.blocks);
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'AI Scheduler failed to optimize schedule.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const addStudyBlock = async (blockData) => {
    setError(null);
    try {
      const response = await API.post('/schedule/blocks', blockData);
      if (response.data && response.data.success) {
        setBlocks((prev) => [...prev, response.data.block]);
        return { success: true, block: response.data.block };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create calendar study block.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const updateStudyBlock = async (blockId, blockData) => {
    setError(null);
    try {
      const response = await API.put(`/schedule/blocks/${blockId}`, blockData);
      if (response.data && response.data.success) {
        setBlocks((prev) =>
          prev.map((b) => (b._id === blockId ? response.data.block : b))
        );
        return { success: true, block: response.data.block };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to edit calendar study block.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const deleteStudyBlock = async (blockId) => {
    setError(null);
    try {
      const response = await API.delete(`/schedule/blocks/${blockId}`);
      if (response.data && response.data.success) {
        setBlocks((prev) => prev.filter((b) => b._id !== blockId));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete study block.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logFocusSession = async (blockId, focusData) => {
    setError(null);
    try {
      const response = await API.post(`/schedule/blocks/${blockId}/focus`, focusData);
      if (response.data && response.data.success) {
        // Sync new block state locally
        setBlocks((prev) =>
          prev.map((b) => (b._id === blockId ? response.data.block : b))
        );
        
        // Award XP visually to the user state immediately!
        if (response.data.xpGained) {
          addExperiencePoints(response.data.xpGained);
        }
        
        return { 
          success: true, 
          block: response.data.block, 
          xpGained: response.data.xpGained 
        };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to log focus score details.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return {
    blocks,
    loading,
    error,
    refreshSchedule: fetchSchedule,
    generateAISchedule,
    addStudyBlock,
    updateStudyBlock,
    deleteStudyBlock,
    logFocusSession
  };
};

import { useState, useCallback, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default useSchedule;
