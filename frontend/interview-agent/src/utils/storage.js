const USER_STORAGE_KEY = 'ia_user';
const ACCESS_TOKEN_KEY = 'ia_access_token';
const REFRESH_TOKEN_KEY = 'ia_refresh_token';

export const saveUser = (user) => {
  if (!user || typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
  // silent fail in production
  }
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
  // silent fail in production
    localStorage.removeItem(USER_STORAGE_KEY); // Clean up corrupted data
    return null;
  }
};

export const clearUser = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
  // silent fail in production
  }
};

export const saveTokens = ({ accessToken, refreshToken }) => {
  if (typeof window === 'undefined') return;

  try {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
  // silent fail in production
  }
};

export const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
  // silent fail in production
    return null;
  }
};

export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
  // silent fail in production
    return null;
  }
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
  // silent fail in production
  }
};

export default { saveUser, getUser, clearUser, saveTokens, getAccessToken, getRefreshToken, clearTokens };
