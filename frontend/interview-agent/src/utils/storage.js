const USER_STORAGE_KEY = 'ia_user';
const ACCESS_TOKEN_KEY = 'ia_access_token';
const REFRESH_TOKEN_KEY = 'ia_refresh_token';

export const saveUser = (user) => {
  if (!user || typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn('Failed to save user to localStorage:', error);
  }
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to get user from localStorage:', error);
    localStorage.removeItem(USER_STORAGE_KEY); // Clean up corrupted data
    return null;
  }
};

export const clearUser = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear user from localStorage:', error);
  }
};

export const saveTokens = ({ accessToken, refreshToken }) => {
  if (typeof window === 'undefined') return;

  try {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.warn('Failed to save tokens to localStorage:', error);
  }
};

export const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to get access token from localStorage:', error);
    return null;
  }
};

export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to get refresh token from localStorage:', error);
    return null;
  }
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to clear tokens from localStorage:', error);
  }
};

export default { saveUser, getUser, clearUser, saveTokens, getAccessToken, getRefreshToken, clearTokens };
