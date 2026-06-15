import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically inject JWT Token
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Axios response interceptor for refreshing token
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
        if (!refToken) return Promise.reject(error);

        const response = await axios.post('http://localhost:5000/api/auth/refresh', {
          refreshToken: refToken,
        });

        const { token } = response.data;
        if (sessionStorage.getItem('token')) {
          sessionStorage.setItem('token', token);
        } else {
          localStorage.setItem('token', token);
        }

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return API(originalRequest);
      } catch (err) {
        // Clear auth details if refresh token is expired or invalid
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
