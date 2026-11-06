import { Platform } from 'react-native';

const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:4000/api'
    : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

export function mediaUrl(imageUrl) {
  if (!imageUrl) {
    return null;
  }
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  return `${API_ORIGIN}${imageUrl}`;
}

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const error = new Error(body.message || 'Erreur API');
      error.code = body.code;
      error.fields = body.fields;
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('L’API ne répond pas. Vérifie Docker et le Wi-Fi (même réseau que le PC).');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestForm(path, { method, body }) {
  const headers = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body,
      signal: controller.signal
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const error = new Error(payload.message || 'Erreur API');
      error.code = payload.code;
      error.fields = payload.fields;
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('L’envoi de la photo a échoué. Réessaie.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default request;
