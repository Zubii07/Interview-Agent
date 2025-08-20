import { login as apiLogin, register as apiRegister, logout as apiLogout, refresh as apiRefresh } from '../api/auth';
import { getMe } from '../api/user';
import storage from '../utils/storage';

export async function login(credentials) {
  try {
    // Validate credentials on frontend
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    const { data } = await apiLogin(credentials);
    const accessToken = data?.access_token;
    const refreshToken = data?.refresh_token;
    const user = data?.user;

    if (!accessToken) {
      throw new Error('Missing access_token in response');
    }
    if (!refreshToken) {
      throw new Error('Missing refresh_token in response');
    }

    // persist tokens
    storage.saveTokens({ accessToken, refreshToken });

    // Use user from response if provided; else fetch /auth/me
    let profile = user;
    if (!profile) {
      const me = await getMe();
      profile = me?.data?.user;
    }
    if (!profile) throw new Error('Failed to fetch user profile');
    storage.saveUser(profile);
    return profile;
  } catch (error) {
    // Handle API errors
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Login failed');
  }
}

export async function signup(payload) {
  try {
    // Validate payload on frontend
    if (!payload.name || !payload.email || !payload.password) {
      throw new Error('Name, email, and password are required');
    }
    
    if (payload.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Register does not log in; align to requirement: redirect to login
    await apiRegister(payload);
    return true;
  } catch (error) {
    // Handle API errors
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Signup failed');
  }
}

export async function fetchSession() {
  try {
  // Only call /auth/me if we have an access token
  let accessToken = storage.getAccessToken();
    if (!accessToken) {
      const refreshToken = storage.getRefreshToken();
      if (!refreshToken) {
        storage.clearUser();
        return null;
      }
      // Try single refresh
      try {
    const res = await apiRefresh({ refresh_token: refreshToken });
    accessToken = res?.data?.access_token || null;
    const newRefreshToken = res?.data?.refresh_token || refreshToken;
        if (!accessToken) {
          storage.clearTokens();
          storage.clearUser();
          return null;
        }
        storage.saveTokens({ accessToken, refreshToken: newRefreshToken });
      } catch (_) {
        storage.clearTokens();
        storage.clearUser();
        return null;
      }
    }

    // We have an access token, fetch the profile
    const { data } = await getMe();
    const user = data?.user ?? null;
    if (user) storage.saveUser(user);
    else storage.clearUser();
    return user;
  } catch (error) {
    if (error.response?.status === 401) {
      // try refresh once when 401 on me
      try {
        const refreshToken = storage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
  const res = await apiRefresh({ refresh_token: refreshToken });
  const accessToken = res?.data?.access_token;
  const newRefreshToken = res?.data?.refresh_token || refreshToken;
        if (accessToken) storage.saveTokens({ accessToken, refreshToken: newRefreshToken });
        const me = await getMe();
        const user = me?.data?.user ?? null;
        if (user) storage.saveUser(user);
        return user;
      } catch {
        storage.clearUser();
        storage.clearTokens();
        return null;
      }
    }

    // other errors
    throw error;
  }
}
export async function logout() {
  try {
    await apiLogout();
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn('Logout API call failed:', error);
  } finally {
    storage.clearUser();
    storage.clearTokens();
    // Clear all localStorage data
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }
}

export default { login, signup, fetchSession, logout };
