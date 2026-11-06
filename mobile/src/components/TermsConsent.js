import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { colors, fonts } from '../theme';
import FieldError from './FieldError';

export default function TermsConsent({ accepted, onToggle, onOpen, error }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: accepted }}
          accessibilityLabel="Accepter les conditions et la politique de confidentialité"
        >
          <View style={[styles.box, accepted && styles.boxOn]}>
            {accepted ? <Text style={styles.tick}>✓</Text> : null}
          </View>
        </Pressable>
        <Text style={styles.text}>
          J’accepte les{' '}
          <Text style={styles.link} onPress={() => onOpen('terms')}>
            conditions d’utilisation
          </Text>{' '}
          et la{' '}
          <Text style={styles.link} onPress={() => onOpen('privacy')}>
            politique de confidentialité
          </Text>
          .
        </Text>
      </View>
      <FieldError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  boxOn: { backgroundColor: colors.orange, borderColor: colors.orange },
  tick: { color: colors.white, fontFamily: fonts.sansBold, fontSize: 14 },
  text: { flex: 1, fontFamily: fonts.sans, color: colors.ink, lineHeight: 20 },
  link: { fontFamily: fonts.sansBold, textDecorationLine: 'underline' }
});
