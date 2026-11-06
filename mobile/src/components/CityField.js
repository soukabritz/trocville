import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Pressable, Text, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

import { colors, fonts } from '../theme';

const searchCommunes = async (name, signal) => {
  const url =
    `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(name)}` +
    '&fields=nom,departement,region&boost=population&limit=12';
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error('Villes indisponibles.');
  }
  return response.json();
};

const placeLabel = (commune) =>
  [commune.departement?.nom, commune.region?.nom].filter(Boolean).join(' · ');

export default function CityField({
  value,
  onChangeText,
  confirmed,
  onConfirmedChange,
  error,
  accessibilityLabel,
  placeholder = 'Commence à taper une ville'
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState('');
  const [place, setPlace] = useState('');
  const requestId = useRef(0);

  useEffect(() => {
    const name = value.trim();
    if (confirmed || name.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setHint('');
      return undefined;
    }

    const controller = new AbortController();
    const current = requestId.current + 1;
    requestId.current = current;
    const timer = setTimeout(async () => {
      setLoading(true);
      setHint('');
      try {
        const rows = await searchCommunes(name, controller.signal);
        if (requestId.current !== current) {
          return;
        }
        setSuggestions(rows);
        if (!rows.length) {
          setHint('Aucune commune trouvée.');
        }
      } catch (err) {
        if (err.name === 'AbortError' || requestId.current !== current) {
          return;
        }
        setSuggestions([]);
        setHint('Impossible de vérifier les villes.');
      } finally {
        if (requestId.current === current) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, confirmed]);

  const pick = (commune) => {
    setSuggestions([]);
    setHint('');
    setPlace(placeLabel(commune));
    onChangeText(commune.nom);
    onConfirmedChange(true);
  };

  return (
    <View>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={(text) => {
          setPlace('');
          onChangeText(text);
          onConfirmedChange(text.trim() === '');
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        accessibilityLabel={accessibilityLabel}
        autoCorrect={false}
      />
      {loading ? <ActivityIndicator style={styles.loader} color={colors.orange} /> : null}
      {place ? <Text style={styles.place}>{place}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {suggestions.length > 0 ? (
        <ScrollView
          style={styles.list}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {suggestions.map((commune) => (
            <Pressable
              key={commune.code}
              style={styles.row}
              onPress={() => pick(commune)}
              accessibilityRole="button"
              accessibilityLabel={`${commune.nom}, ${placeLabel(commune)}`}
            >
              <Text style={styles.name}>{commune.nom}</Text>
              <Text style={styles.region}>{placeLabel(commune)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    fontFamily: fonts.sans,
    color: colors.ink
  },
  inputError: { borderColor: colors.orange },
  loader: { marginTop: 8 },
  place: { marginTop: 6, color: colors.green, fontFamily: fonts.sansMed, fontSize: 13 },
  hint: { marginTop: 6, color: colors.orange, fontFamily: fonts.sans, fontSize: 13 },
  list: {
    marginTop: 6,
    maxHeight: 208,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12
  },
  row: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  name: { fontFamily: fonts.sansBold, color: colors.ink },
  region: { fontFamily: fonts.sans, color: colors.muted, fontSize: 13, marginTop: 2 }
});
