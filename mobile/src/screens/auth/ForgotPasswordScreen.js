import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';

import { AuthContext } from '../../context/AuthContext';
import { colors, fonts } from '../../theme';
import StackScrollGuard from '../../components/StackScrollGuard';
import useStackHeaderInset from '../../components/useStackHeaderInset';
import FieldError from '../../components/FieldError';
import PasswordInput from '../../components/PasswordInput';

export default function ForgotPasswordScreen({ route }) {
  const topInset = useStackHeaderInset();
  const { forgotPassword, resetPassword } = useContext(AuthContext);
  const [email, setEmail] = useState(route.params?.email || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    setError('');
    setInfo('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFields({ email: 'Email invalide.' });
      return;
    }
    setFields({});
    setLoading(true);
    try {
      const result = await forgotPassword(email.trim());
      setEmail(result.email || email.trim());
      setSent(true);
      setInfo('Un code a été envoyé. Il reste valable 15 minutes.');
    } catch (err) {
      setFields(err.fields || {});
      setError(err.fields ? '' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const onReset = async () => {
    setError('');
    setInfo('');
    const next = {};
    if (code.trim().length !== 6) next.code = 'Le code doit faire 6 chiffres.';
    if (password.length < 8) next.password = 'Le mot de passe doit faire au moins 8 caractères.';
    setFields(next);
    if (Object.keys(next).length) {
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim(), code.trim(), password);
    } catch (err) {
      setFields(err.fields || {});
      setError(err.fields ? '' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: topInset }]}>
      <StackScrollGuard />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>MOT DE PASSE</Text>
        <Text style={styles.title} accessibilityRole="header">
          Choisis un nouveau mot de passe.
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, fields.email && styles.inputError]}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="Email"
        />
        <FieldError message={fields.email} />

        {sent ? (
          <>
            <Text style={styles.label}>Code reçu par email</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              accessibilityLabel="Code reçu par email"
            />
            <FieldError message={fields.code} />
            <Text style={styles.label}>Nouveau mot de passe</Text>
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              error={Boolean(fields.password)}
              accessibilityLabel="Nouveau mot de passe"
            />
            <FieldError message={fields.password} />
          </>
        ) : null}

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
              onPress={sent ? onReset : onSend}
              accessibilityRole="button"
              accessibilityLabel={sent ? 'Enregistrer le mot de passe' : 'Envoyer le code'}
            >
              <Text style={styles.buttonText}>{sent ? 'Enregistrer' : 'Envoyer le code'}</Text>
            </Pressable>
            {sent ? (
              <Pressable onPress={onSend} accessibilityRole="button" accessibilityLabel="Renvoyer le code">
                <Text style={styles.link}>Renvoyer le code</Text>
              </Pressable>
            ) : null}
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
  label: { fontFamily: fonts.sansMed, color: colors.ink, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    fontFamily: fonts.sans
  },
  inputError: { borderColor: colors.orange },
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
