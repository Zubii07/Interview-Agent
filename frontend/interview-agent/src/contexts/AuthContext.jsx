import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import authService from '../services/authService';
import storage from '../utils/storage';

const AuthContext = createContext(null);

const initialState = {
  user: storage.getUser?.() || null,
  accessToken: storage.getAccessToken?.() || null,
  isAuthenticated: !!(storage.getUser?.() && storage.getAccessToken?.()),
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'BOOTSTRAP_START':
      return { ...state, loading: true, error: null };
    case 'BOOTSTRAP_SUCCESS': {
      const { user, accessToken } = action.payload || {};
      return { user: user || null, accessToken: accessToken || null, isAuthenticated: !!(user && accessToken), loading: false, error: null };
    }
    case 'LOGIN_SUCCESS': {
      const { user, accessToken } = action.payload;
      return { user, accessToken, isAuthenticated: true, loading: false, error: null };
    }
    case 'LOGOUT':
      return { user: null, accessToken: null, isAuthenticated: false, loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let cancelled = false;
    
    async function bootstrap() {
      dispatch({ type: 'BOOTSTRAP_START' });
      
      try {
        const user = await authService.fetchSession();
        const accessToken = storage.getAccessToken?.() || null;
        if (!cancelled) dispatch({ type: 'BOOTSTRAP_SUCCESS', payload: { user, accessToken } });
      } catch (error) {
        // Session invalid or no cookies; mark unauthenticated
        if (!cancelled) {
          dispatch({ type: 'BOOTSTRAP_SUCCESS', payload: { user: null, accessToken: null } });
        }
      }
    }
    
    bootstrap();
    
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login: async (credentials) => {
        try {
          const user = await authService.login(credentials);
          const accessToken = storage.getAccessToken?.() || null;
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken } });
          return user;
        } catch (error) {
          dispatch({ type: 'ERROR', payload: error.message });
          throw error;
        }
      },
      signup: async (payload) => {
        try {
          await authService.signup(payload);
          // Do not log in here; UI should redirect to login page
          return true;
        } catch (error) {
          dispatch({ type: 'ERROR', payload: error.message });
          throw error;
        }
      },
      logout: async () => {
        try {
          await authService.logout();
          dispatch({ type: 'LOGOUT' });
        } catch (error) {
          // Even if logout fails on server, clear local state
          dispatch({ type: 'LOGOUT' });
        }
      },
      refreshSession: async () => {
        try {
          const user = await authService.fetchSession();
          const accessToken = storage.getAccessToken?.() || null;
          dispatch({ type: 'BOOTSTRAP_SUCCESS', payload: { user, accessToken } });
          return user;
        } catch (error) {
          dispatch({ type: 'ERROR', payload: error.message });
          throw error;
        }
      },
      clearError: () => {
        dispatch({ type: 'ERROR', payload: null });
      }
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export default AuthContext;
