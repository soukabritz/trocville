import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';
import { colors, fonts } from '../../theme';
import StackScrollGuard from '../../components/StackScrollGuard';
import useStackHeaderInset from '../../components/useStackHeaderInset';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import FieldError from '../../components/FieldError';
import TermsConsent from '../../components/TermsConsent';
import PasswordInput from '../../components/PasswordInput';
import CityField from '../../components/CityField';

export default function RegisterScreen({ navigation }) {
  const topInset = useStackHeaderInset();
  const { register, loginWithGoogle } = useContext(AuthContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mainCity, setMainCity] = useState('');
  const [cityConfirmed, setCityConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const openLegal = (kind) => navigation.navigate('Legal', { kind });

  const clearField = (name) => {
    setFields((current) => ({ ...current, [name]: undefined }));
  };

  const localFields = () => {
    const next = {};
    if (!firstName.trim()) next.firstName = 'Le prénom est obligatoire.';
    if (!lastName.trim()) next.lastName = 'Le nom est obligatoire.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Email invalide.';
    if (password.length < 8) next.password = 'Le mot de passe doit faire au moins 8 caractères.';
    if (!confirmPassword) next.confirmPassword = 'Confirme le mot de passe.';
    else if (password !== confirmPassword) next.confirmPassword = 'Les deux mots de passe ne correspondent pas.';
    if (!mainCity.trim()) next.mainCity = 'La ville principale est obligatoire.';
    else if (!cityConfirmed) next.mainCity = 'Choisis une ville dans la liste.';
    if (!accepted) next.acceptTerms = 'Tu dois accepter les conditions.';
    return next;
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
    const next = localFields();
    setFields(next);
    if (Object.keys(next).length) {
      return;
    }
    setLoading(true);
    try {
      const result = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        mainCity: mainCity.trim(),
        acceptTerms: true
      });
      if (result?.verificationRequired) {
        navigation.navigate('VerifyEmail', { email: result.email });
      }
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
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustContentInsets={false}
    >
      <Text style={styles.eyebrow}>INSCRIPTION</Text>
      <Text style={styles.title} accessibilityRole="header">
        200 crédits pour commencer. Zéro euro.
      </Text>

      <Text style={styles.label}>Prénom</Text>
      <TextInput
        style={[styles.input, fields.firstName && styles.inputError]}
        value={firstName}
        onChangeText={(value) => {
          setFirstName(value);
          clearField('firstName');
        }}
        accessibilityLabel="Prénom"
      />
      <FieldError message={fields.firstName} />

      <Text style={styles.label}>Nom</Text>
      <TextInput
        style={[styles.input, fields.lastName && styles.inputError]}
        value={lastName}
        onChangeText={(value) => {
          setLastName(value);
          clearField('lastName');
        }}
        accessibilityLabel="Nom"
      />
      <FieldError message={fields.lastName} />

      <Text style={styles.label}>Email</Text>
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
      />
      <FieldError message={fields.email} />

      <Text style={styles.label}>Mot de passe</Text>
      <PasswordInput
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          clearField('password');
        }}
        error={Boolean(fields.password)}
        accessibilityLabel="Mot de passe"
      />
      <FieldError message={fields.password} />

      <Text style={styles.label}>Confirmer le mot de passe</Text>
      <PasswordInput
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          clearField('confirmPassword');
        }}
        error={Boolean(fields.confirmPassword)}
        accessibilityLabel="Confirmer le mot de passe"
      />
      <FieldError message={fields.confirmPassword} />

      <Text style={styles.label}>Ville</Text>
      <CityField
        value={mainCity}
        onChangeText={(text) => {
          setMainCity(text);
          clearField('mainCity');
        }}
        confirmed={cityConfirmed}
        onConfirmedChange={setCityConfirmed}
        error={Boolean(fields.mainCity)}
        accessibilityLabel="Ville"
      />
      <FieldError message={fields.mainCity} />

      <TermsConsent
        accepted={accepted}
        onToggle={() => {
          setAccepted((value) => !value);
          clearField('acceptTerms');
        }}
        onOpen={openLegal}
        error={fields.acceptTerms}
      />

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator accessibilityLabel="Chargement" />
      ) : (
        <Pressable
          style={styles.button}
          onPress={onSubmit}
          accessibilityRole="button"
          accessibilityLabel="Créer le compte"
        >
          <Text style={styles.buttonText}>Créer le compte</Text>
        </Pressable>
      )}

      <Text style={styles.or}>ou</Text>
      <GoogleSignInButton disabled={loading} onSession={onGoogle} onError={setError} />

      <Pressable onPress={() => navigation.goBack()} accessibilityRole="link" accessibilityLabel="Retour connexion">
        <Text style={styles.link}>Déjà un compte ? Connexion</Text>
      </Pressable>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 8,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.bg
  },
  eyebrow: {
    color: colors.orange,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2
  },
  title: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 32, color: colors.ink, marginBottom: 12 },
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
  or: { textAlign: 'center', color: colors.muted, fontFamily: fonts.sans, marginTop: 8 },
  link: { color: colors.ink, marginTop: 16, textAlign: 'center', fontFamily: fonts.sansMed },
  error: { color: colors.orange, fontFamily: fonts.sans }
});
