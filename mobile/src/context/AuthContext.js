import React, { createContext, useEffect, useMemo, useState } from 'react';

import { authApi, userApi } from '../services/api';
import { setAuthToken } from '../services/apiClient';
import { clearSession, loadSession, saveSession } from '../services/session';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUserState] = useState(null);
  const [hydrating, setHydrating] = useState(true);

  const applySession = async (session) => {
    setAuthToken(session.token);
    setToken(session.token);
    setCurrentUserState(session.user);
    await saveSession(session);
  };

  const setCurrentUser = (user) => {
    setCurrentUserState(user);
    if (token && user) {
      saveSession({ token, user });
    }
  };

  useEffect(() => {
    const restore = async () => {
      const saved = await loadSession();
      if (saved?.token) {
        setAuthToken(saved.token);
        try {
          const user = await userApi.me();
          setToken(saved.token);
          setCurrentUserState(user);
          await saveSession({ token: saved.token, user });
        } catch (_error) {
          setAuthToken(null);
          await clearSession();
        }
      }
      setHydrating(false);
    };

    restore();
  }, []);

  const value = useMemo(
    () => ({
      token,
      currentUser,
      hydrating,
      signIn: applySession,
      signOut: async () => {
        setAuthToken(null);
        setToken(null);
        setCurrentUserState(null);
        await clearSession();
      },
      login: async (email, password) => {
        const session = await authApi.login({ email, password });
        await applySession(session);
      },
      loginWithGoogle: async ({ idToken, accessToken, acceptTerms }) => {
        const session = await authApi.loginWithGoogle({ idToken, accessToken, acceptTerms });
        await applySession(session);
      },
      register: async (payload) => {
        const result = await authApi.register(payload);
        if (result?.token) {
          await applySession(result);
        }
        return result;
      },
      verifyEmail: async (email, code) => {
        const session = await authApi.verifyEmail({ email, code });
        await applySession(session);
      },
      resendVerification: (email) => authApi.resendVerification({ email }),
      forgotPassword: (email) => authApi.forgotPassword({ email }),
      resetPassword: async (email, code, password) => {
        const session = await authApi.resetPassword({ email, code, password });
        await applySession(session);
      },
      updateProfile: async (payload) => {
        const user = await userApi.update(payload);
        setCurrentUser(user);
        return user;
      },
      setCurrentUser
    }),
    [token, currentUser, hydrating]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
