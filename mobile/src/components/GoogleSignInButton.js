import React, { useEffect, useRef } from 'react';
import { Platform, Pressable, Text, StyleSheet } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { colors, fonts } from '../theme';
import GoogleMark from './GoogleMark';

WebBrowser.maybeCompleteAuthSession();

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

function GooglePrompt({ disabled, onSession, onError }) {
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

  return (
    <Pressable
      style={[styles.button, (!request || disabled) && styles.disabled]}
      onPress={() => promptAsync()}
      disabled={!request || disabled}
      accessibilityRole="button"
      accessibilityLabel="Continuer avec Gmail"
    >
      <GoogleMark size={20} />
      <Text style={styles.label}>Continuer avec Gmail</Text>
    </Pressable>
  );
}

export default function GoogleSignInButton({ disabled, onSession, onError }) {
  if (!platformClientId) {
    return (
      <Pressable
        style={styles.button}
        onPress={() =>
          onError('Ajoute l’identifiant Google depuis Google Cloud Console dans mobile/.env.')
        }
        accessibilityRole="button"
        accessibilityLabel="Continuer avec Gmail"
      >
        <GoogleMark size={20} />
        <Text style={styles.label}>Continuer avec Gmail</Text>
      </Pressable>
    );
  }

  return <GooglePrompt disabled={disabled} onSession={onSession} onError={onError} />;
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
