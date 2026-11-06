import { Platform } from 'react-native';
import { File } from 'expo-file-system';

import request, { requestForm } from './apiClient';

export const authApi = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  loginWithGoogle: (payload) => request('/auth/google', { method: 'POST', body: JSON.stringify(payload) }),
  verifyEmail: (payload) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify(payload) }),
  resendVerification: (payload) =>
    request('/auth/resend-verification', { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (payload) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) })
};

export const categoryApi = {
  list: () => request('/categories')
};

export const itemApi = {
  list: (query = '') => request(`/items${query}`),
  get: (id) => request(`/items/${id}`),
  save: async (payload, photoUri, itemId) => {
    const form = new FormData();
    Object.keys(payload).forEach((key) => {
      form.append(key, String(payload[key]));
    });

    if (photoUri) {
      if (Platform.OS === 'web') {
        const blob = await fetch(photoUri).then((res) => res.blob());
        form.append('photo', blob, 'article.jpg');
      } else {
        const file = new File(photoUri);
        form.append('photo', file);
      }
    }

    if (itemId) {
      return requestForm(`/items/${itemId}`, { method: 'PUT', body: form });
    }
    return requestForm('/items', { method: 'POST', body: form });
  },
  remove: (id) => request(`/items/${id}`, { method: 'DELETE' }),
  acquire: (id) => request(`/items/${id}/acquire`, { method: 'POST' }),
  listExchanges: () => request('/items/exchanges')
};

export const conversationApi = {
  start: (itemId) =>
    request('/conversations', { method: 'POST', body: JSON.stringify({ itemId }) }),
  listMine: () => request('/conversations'),
  unreadCount: () => request('/conversations/unread-count'),
  listMessages: (id) => request(`/conversations/${id}/messages`),
  sendMessage: (id, content) =>
    request(`/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
};

export const favoriteApi = {
  list: () => request('/favorites'),
  ids: () => request('/favorites/ids'),
  toggle: (itemId) => request(`/favorites/${itemId}`, { method: 'POST' })
};

export const userApi = {
  me: () => request('/users/me'),
  get: (id) => request(`/users/${id}`),
  update: (payload) => request('/users/me', { method: 'PUT', body: JSON.stringify(payload) })
};
