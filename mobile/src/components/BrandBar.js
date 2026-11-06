import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';
import LogoMark from './LogoMark';

export default function BrandBar() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { paddingTop: Math.max(insets.top, 8) }]}>
      <LogoMark size={32} />
      <Text style={styles.logoText}>TrocVille</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: colors.bg
  },
  logoText: { flex: 1, fontFamily: fonts.serif, fontSize: 22, color: colors.ink }
});
