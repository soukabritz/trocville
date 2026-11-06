import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';

import { AuthContext } from '../../context/AuthContext';
import { colors, fonts } from '../../theme';
import StackScrollGuard from '../../components/StackScrollGuard';
import useStackHeaderInset from '../../components/useStackHeaderInset';

export default function VerifyEmailScreen({ route }) {
  const topInset = useStackHeaderInset();
  const { verifyEmail, resendVerification } = useContext(AuthContext);
  const email = route.params?.email || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await verifyEmail(email, code.trim());
    } catch (err) {
      if (err.code === 'CODE_EXPIRED') {
        setCode('');
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await resendVerification(email);
      setInfo('Un nouveau code a été envoyé.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: topInset }]}>
      <StackScrollGuard />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>CONFIRMATION</Text>
        <Text style={styles.title} accessibilityRole="header">
          Entre le code reçu par email.
        </Text>
        <Text style={styles.hint}>Il a été envoyé à {email}. Il reste valable 15 minutes.</Text>

        <Text style={styles.label}>Code</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          accessibilityLabel="Code de confirmation"
        />

        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        {loading ? (
          <ActivityIndicator accessibilityLabel="Chargement" />
        ) : (
          <>
            <Pressable
              style={styles.button}
              onPress={onSubmit}
              accessibilityRole="button"
              accessibilityLabel="Confirmer l'email"
            >
              <Text style={styles.buttonText}>Confirmer</Text>
            </Pressable>
            <Pressable onPress={onResend} accessibilityRole="button" accessibilityLabel="Renvoyer le code">
              <Text style={styles.link}>Renvoyer le code</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    padding: 24,
    gap: 8,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center'
  },
  eyebrow: {
    color: colors.orange,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2
  },
  title: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 32, color: colors.ink, marginBottom: 8 },
  hint: { fontFamily: fonts.sans, color: colors.muted, marginBottom: 8 },
  label: { fontFamily: fonts.sansMed, color: colors.ink, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    fontFamily: fonts.sans,
    letterSpacing: 4
  },
  button: {
    backgroundColor: colors.orange,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: { color: colors.white, fontFamily: fonts.sansBold },
  link: { color: colors.ink, marginTop: 16, textAlign: 'center', fontFamily: fonts.sansMed },
  error: { color: colors.orange, fontFamily: fonts.sans },
  info: { color: colors.green, fontFamily: fonts.sans }
});
