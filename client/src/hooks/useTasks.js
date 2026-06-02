import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/tasks', { params: filters });
      if (response.data && response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = async (taskData) => {
    setError(null);
    try {
      const response = await API.post('/tasks', taskData);
      if (response.data && response.data.success) {
        setTasks((prev) => [...prev, response.data.task]);
        return { success: true, task: response.data.task };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const updateTask = async (taskId, taskData) => {
    setError(null);
    try {
      const response = await API.put(`/tasks/${taskId}`, taskData);
      if (response.data && response.data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? response.data.task : t))
        );
        return { success: true, task: response.data.task };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to edit task.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const deleteTask = async (taskId) => {
    setError(null);
    try {
      const response = await API.delete(`/tasks/${taskId}`);
      if (response.data && response.data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete task.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    setError(null);
    try {
      const response = await API.patch(`/tasks/${taskId}/subtasks/${subtaskId}`);
      if (response.data && response.data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? response.data.task : t))
        );
        return { success: true, task: response.data.task };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update subtask.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const breakdownTaskWithAI = async (taskId) => {
    setError(null);
    setLoading(true);
    try {
      const response = await API.post(`/tasks/${taskId}/breakdown`);
      if (response.data && response.data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? response.data.task : t))
        );
        return { success: true, task: response.data.task };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'AI failed to process task breakdown.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refreshTasks: fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    breakdownTaskWithAI
  };
};

export default useTasks;
