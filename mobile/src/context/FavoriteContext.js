import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { favoriteApi } from '../services/api';
import { AuthContext } from './AuthContext';

export const FavoriteContext = createContext(null);

export function FavoriteProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [ids, setIds] = useState([]);
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!token) {
      setIds([]);
      setItems([]);
      return;
    }
    try {
      const [idPayload, list] = await Promise.all([favoriteApi.ids(), favoriteApi.list()]);
      setIds((idPayload.ids || []).map(Number));
      setItems(list);
    } catch (_error) {
      // ignore: next focus/toggle will retry
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFavorite = useCallback((itemId) => ids.includes(Number(itemId)), [ids]);

  const toggle = useCallback(
    async (itemId) => {
      const numericId = Number(itemId);
      const wasFav = ids.includes(numericId);
      setIds((current) =>
        wasFav ? current.filter((id) => id !== numericId) : [...current, numericId]
      );
      try {
        const result = await favoriteApi.toggle(numericId);
        setIds((current) => {
          const without = current.filter((id) => id !== numericId);
          return result.favorited ? [...without, numericId] : without;
        });
        await refresh();
        return result.favorited;
      } catch (error) {
        setIds((current) => {
          const without = current.filter((id) => id !== numericId);
          return wasFav ? [...without, numericId] : without;
        });
        throw error;
      }
    },
    [ids, refresh]
  );

  const value = useMemo(
    () => ({ ids, items, isFavorite, toggle, refresh }),
    [ids, items, isFavorite, toggle, refresh]
  );

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
}
