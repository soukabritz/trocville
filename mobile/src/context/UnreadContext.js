import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { conversationApi } from '../services/api';
import { AuthContext } from './AuthContext';

export const UnreadContext = createContext(null);

export function UnreadProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await conversationApi.unreadCount();
      setUnreadCount(Number(data.count) || 0);
    } catch (_error) {
      // Le compteur réessaie au prochain passage.
    }
  }, [token]);

  useEffect(() => {
    refreshUnread();
    if (!token) {
      return undefined;
    }
    const timer = setInterval(refreshUnread, 5000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshUnread();
      }
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [token, refreshUnread]);

  const value = useMemo(
    () => ({ unreadCount, refreshUnread }),
    [unreadCount, refreshUnread]
  );

  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>;
}
