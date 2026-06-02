import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically append JWT Bearer tokens
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch expired tokens and auto-refresh sessions
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we have not retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Attempt silent session refresh
          const refreshRes = await axios.post(
            `${apiBaseUrl}/auth/refresh`,
            { token }
          );

          if (refreshRes.data && refreshRes.data.token) {
            const newToken = refreshRes.data.token;
            localStorage.setItem('token', newToken);

            // Overwrite authorization headers and retry request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return API(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Session expired, logging out user:', refreshError.message);

        // Wipe storage and redirect to login page
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
