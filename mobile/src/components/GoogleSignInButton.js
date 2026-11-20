import React, { useEffect, useRef } from 'react';
import { Platform, Pressable, Text, StyleSheet } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { colors, fonts } from '../theme';
import GoogleMark from './GoogleMark';

WebBrowser.maybeCompleteAuthSession();

const TERMS_KEY = 'trocville.google.terms';
const STATE_KEY = 'trocville.google.state';

export function takePendingGoogleTerms() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  try {
    const pending = window.sessionStorage.getItem(TERMS_KEY) === '1';
    if (pending) window.sessionStorage.removeItem(TERMS_KEY);
    return pending;
  } catch (_error) {
    return false;
  }
}

const clientId = (value) => {
  const trimmed = String(value || '').trim();
  return trimmed || undefined;
};

const webClientId = clientId(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
const iosClientId = clientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) || webClientId;
const androidClientId = clientId(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID) || webClientId;

const platformClientId = Platform.select({
  ios: iosClientId,
  android: androidClientId,
  default: webClientId
});

function GooglePrompt({ disabled, accepted, onSession, onError }) {
  const onSessionRef = useRef(onSession);
  const onErrorRef = useRef(onError);
  onSessionRef.current = onSession;
  onErrorRef.current = onError;

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    iosClientId,
    androidClientId,
    selectAccount: true
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash.includes('access_token=') && !hash.includes('error=')) return;

    const params = Object.fromEntries(new URLSearchParams(hash));
    let expected = '';
    try {
      expected = window.sessionStorage.getItem(STATE_KEY) || '';
      window.sessionStorage.removeItem(STATE_KEY);
    } catch (_error) {
      expected = '';
    }
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);

    if (params.error) {
      if (params.error !== 'access_denied') onErrorRef.current('Connexion Google interrompue.');
      return;
    }
    if (!params.access_token || !expected || params.state !== expected) {
      onErrorRef.current('Connexion Google interrompue.');
      return;
    }
    onSessionRef.current({ accessToken: params.access_token, idToken: params.id_token });
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!response || response.type === 'cancel' || response.type === 'dismiss') {
      return;
    }
    if (response.type !== 'success') {
      onErrorRef.current('Connexion Google interrompue.');
      return;
    }
    const idToken = response.authentication?.idToken || response.params?.id_token;
    const accessToken = response.authentication?.accessToken || response.params?.access_token;
    if (!idToken && !accessToken) {
      onErrorRef.current('Google n’a pas renvoyé de jeton.');
      return;
    }
    onSessionRef.current({ idToken, accessToken });
  }, [response]);

  const start = () => {
    if (accepted === false) {
      onErrorRef.current('Tu dois accepter les conditions.');
      return;
    }
    if (Platform.OS === 'web') {
      try {
        const state = new URL(request.url).searchParams.get('state') || '';
        window.sessionStorage.setItem(STATE_KEY, state);
        window.sessionStorage.setItem(TERMS_KEY, '1');
      } catch (_error) {
        onErrorRef.current('Connexion Google interrompue.');
        return;
      }
      window.location.assign(request.url);
      return;
    }
    promptAsync();
  };

  return (
    <Pressable
      style={[styles.button, (!request || disabled) && styles.disabled]}
      onPress={start}
      disabled={!request || disabled}
      accessibilityRole="button"
      accessibilityLabel="Continuer avec Gmail"
    >
      <GoogleMark size={20} />
      <Text style={styles.label}>Continuer avec Gmail</Text>
    </Pressable>
  );
}

export default function GoogleSignInButton({ disabled, accepted, onSession, onError }) {
  if (!platformClientId) {
    return (
      <Pressable
        style={styles.button}
        onPress={() =>
          onError('La connexion Google n’est pas disponible pour le moment.')
        }
        accessibilityRole="button"
        accessibilityLabel="Continuer avec Gmail"
      >
        <GoogleMark size={20} />
        <Text style={styles.label}>Continuer avec Gmail</Text>
      </Pressable>
    );
  }

  return (
    <GooglePrompt
      disabled={disabled}
      accepted={accepted}
      onSession={onSession}
      onError={onError}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  disabled: { opacity: 0.6 },
  label: { fontFamily: fonts.sansBold, color: colors.ink, fontSize: 16 }
});
