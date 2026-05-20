import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/courses');
      if (response.data && response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve academic courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addCourse = async (courseData) => {
    setError(null);
    try {
      const response = await API.post('/courses', courseData);
      if (response.data && response.data.success) {
        setCourses((prev) => [...prev, response.data.course]);
        return { success: true, course: response.data.course };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create academic course.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const updateCourse = async (courseId, courseData) => {
    setError(null);
    try {
      const response = await API.put(`/courses/${courseId}`, courseData);
      if (response.data && response.data.success) {
        setCourses((prev) =>
          prev.map((c) => (c._id === courseId ? response.data.course : c))
        );
        return { success: true, course: response.data.course };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to edit academic course.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const deleteCourse = async (courseId) => {
    setError(null);
    try {
      const response = await API.delete(`/courses/${courseId}`);
      if (response.data && response.data.success) {
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove academic course.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    refreshCourses: fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse
  };
};

export default useCourses;
