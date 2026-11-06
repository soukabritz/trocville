import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEY = 'trocville_session';

export async function saveSession(session) {
  const value = JSON.stringify(session);
  if (Platform.OS === 'web') {
    localStorage.setItem(KEY, value);
    return;
  }
  await SecureStore.setItemAsync(KEY, value);
}

export async function loadSession() {
  try {
    const value =
      Platform.OS === 'web' ? localStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
    return value ? JSON.parse(value) : null;
  } catch (_error) {
    return null;
  }
}

export async function clearSession() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}
