import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, fonts } from '../theme';

export default function EmptyState({ title, subtitle }) {
  return (
    <View style={styles.container} accessibilityRole="text">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontFamily: fonts.serif, marginBottom: 8, color: colors.ink },
  subtitle: { color: colors.muted, textAlign: 'center', fontFamily: fonts.sans, lineHeight: 20 }
});
