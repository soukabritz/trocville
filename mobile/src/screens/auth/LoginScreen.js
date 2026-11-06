import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthContext } from '../../context/AuthContext';
import { colors, fonts } from '../../theme';
import LogoMark from '../../components/LogoMark';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import FieldError from '../../components/FieldError';
import TermsConsent from '../../components/TermsConsent';
import PasswordInput from '../../components/PasswordInput';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login, loginWithGoogle } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearField = (name) => {
    setFields((current) => ({ ...current, [name]: undefined }));
  };

  const onGoogle = async (tokens) => {
    setError('');
    if (!accepted) {
      setFields((current) => ({ ...current, acceptTerms: 'Tu dois accepter les conditions.' }));
      return;
    }
    setLoading(true);
    try {
      await loginWithGoogle({ ...tokens, acceptTerms: true });
    } catch (err) {
      setFields(err.fields || {});
      setError(err.fields ? '' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    setError('');
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Email invalide.';
    if (!password) next.password = 'Le mot de passe est obligatoire.';
    setFields(next);
    if (Object.keys(next).length) {
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        navigation.navigate('VerifyEmail', { email: email.trim().toLowerCase() });
        return;
      }
      setFields(err.fields || {});
      setError(err.fields ? '' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <LogoMark size={44} />
      <Text style={styles.brand}>TrocVille</Text>
      <Text style={styles.eyebrow}>CONNEXION</Text>
      <Text style={styles.title} accessibilityRole="header">
        Reprends tes crédits là où tu les as laissés.
      </Text>

      <Text nativeID="emailLabel" style={styles.label}>
        Email
      </Text>
      <TextInput
        style={[styles.input, fields.email && styles.inputError]}
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          clearField('email');
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="Email"
        accessibilityLabelledBy="emailLabel"
      />
      <FieldError message={fields.email} />

      <Text nativeID="passwordLabel" style={styles.label}>
        Mot de passe
      </Text>
      <PasswordInput
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          clearField('password');
        }}
        error={Boolean(fields.password)}
        accessibilityLabel="Mot de passe"
        accessibilityLabelledBy="passwordLabel"
      />
      <FieldError message={fields.password} />

      <Pressable
        onPress={() => navigation.navigate('ForgotPassword', { email: email.trim() })}
        accessibilityRole="link"
        accessibilityLabel="Mot de passe oublié"
      >
        <Text style={styles.forgot}>Mot de passe oublié</Text>
      </Pressable>

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator color={colors.orange} accessibilityLabel="Chargement" />
      ) : (
        <Pressable
          style={styles.button}
          onPress={onSubmit}
          accessibilityRole="button"
          accessibilityLabel="Se connecter"
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>
      )}

      <Text style={styles.or}>ou</Text>
      <TermsConsent
        accepted={accepted}
        onToggle={() => {
          setAccepted((value) => !value);
          clearField('acceptTerms');
        }}
        onOpen={(kind) => navigation.navigate('Legal', { kind })}
        error={fields.acceptTerms}
      />
      <GoogleSignInButton disabled={loading} onSession={onGoogle} onError={setError} />

      <Pressable
        onPress={() => navigation.navigate('Register')}
        accessibilityRole="link"
        accessibilityLabel="Aller à l'inscription"
      >
        <Text style={styles.link}>Créer un compte</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 8,
    backgroundColor: colors.bg,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center'
  },
  brand: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink, marginTop: 8 },
  eyebrow: {
    marginTop: 20,
    color: colors.orange,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2
  },
  title: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 32, color: colors.ink, marginBottom: 12 },
  label: { fontFamily: fonts.sansMed, color: colors.ink, marginTop: 8 },
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
    marginTop: 12
  },
  buttonText: { color: colors.white, fontFamily: fonts.sansBold, fontSize: 16 },
  or: { textAlign: 'center', color: colors.muted, fontFamily: fonts.sans, marginTop: 8 },
  forgot: { color: colors.muted, marginTop: 4, fontFamily: fonts.sansMed },
  link: { color: colors.ink, marginTop: 16, textAlign: 'center', fontFamily: fonts.sansMed },
  error: { color: colors.orange, fontFamily: fonts.sans }
});
