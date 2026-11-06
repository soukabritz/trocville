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
import StackScrollGuard from '../../components/StackScrollGuard';
import useStackHeaderInset from '../../components/useStackHeaderInset';
import { colors, fonts } from '../../theme';
import FieldError from '../../components/FieldError';
import CityField from '../../components/CityField';

export default function EditProfileScreen({ navigation }) {
  const topInset = useStackHeaderInset();
  const { currentUser, updateProfile } = useContext(AuthContext);
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [mainCity, setMainCity] = useState(currentUser?.mainCity || '');
  const [cityConfirmed, setCityConfirmed] = useState(true);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    const next = {};
    if (!firstName.trim()) next.firstName = 'Le prénom est obligatoire.';
    if (!lastName.trim()) next.lastName = 'Le nom est obligatoire.';
    if (!mainCity.trim()) next.mainCity = 'La ville principale est obligatoire.';
    else if (!cityConfirmed) next.mainCity = 'Choisis une ville dans la liste.';
    setFields(next);
    if (Object.keys(next).length) {
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mainCity: mainCity.trim()
      });
      navigation.goBack();
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
      <Text style={styles.title} accessibilityRole="header">
        Modifier le profil
      </Text>

      <Text>Prénom</Text>
      <TextInput
        style={[styles.input, fields.firstName && styles.inputError]}
        value={firstName}
        onChangeText={setFirstName}
        accessibilityLabel="Prénom"
      />
      <FieldError message={fields.firstName} />

      <Text>Nom</Text>
      <TextInput
        style={[styles.input, fields.lastName && styles.inputError]}
        value={lastName}
        onChangeText={setLastName}
        accessibilityLabel="Nom"
      />
      <FieldError message={fields.lastName} />

      <Text>Ville</Text>
      <CityField
        value={mainCity}
        onChangeText={setMainCity}
        confirmed={cityConfirmed}
        onConfirmedChange={setCityConfirmed}
        error={Boolean(fields.mainCity)}
        accessibilityLabel="Ville"
      />
      <FieldError message={fields.mainCity} />

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator accessibilityLabel="Enregistrement" />
      ) : (
        <Pressable
          style={styles.button}
          onPress={onSubmit}
          accessibilityRole="button"
          accessibilityLabel="Enregistrer le profil"
        >
          <Text style={styles.buttonText}>Enregistrer</Text>
        </Pressable>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 8,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.bg
  },
  title: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    fontFamily: fonts.sans
  },
  inputError: { borderColor: colors.orange },
  button: { backgroundColor: colors.orange, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: colors.white, fontFamily: fonts.sansBold },
  error: { color: colors.orange, fontFamily: fonts.sans }
});
