import axios from 'axios';
import storage from '../utils/storage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request: attach Authorization header when access token exists
api.interceptors.request.use((config) => {
  const token = storage.getAccessToken?.();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      resolve(api(config));
    }
  });
  pendingQueue = [];
}

function isAuthPath(url = '') {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  );
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const url = originalRequest.url || '';

    // Do not try to refresh for auth endpoints themselves
    if (status === 401 && !originalRequest._retry && !isAuthPath(url)) {
      originalRequest._retry = true;

      const refreshToken = storage.getRefreshToken?.();
      if (!refreshToken) {
        // No refresh token; clear and redirect
        storage.clearTokens?.();
        storage.clearUser?.();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;
      try {
        // Call refresh explicitly; avoid adding Authorization since backend expects refresh token
          const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken });
          const newAccessToken = data?.access_token;
          const newRefreshToken = data?.refresh_token || refreshToken;
        if (newAccessToken) {
          storage.saveTokens?.({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        }

        isRefreshing = false;
        processQueue(null, newAccessToken);

  // Retry the original request with the new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        storage.clearTokens?.();
        storage.clearUser?.();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
