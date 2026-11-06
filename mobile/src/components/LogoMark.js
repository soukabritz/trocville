import React from 'react';
import { View, StyleSheet } from 'react-native';

import { colors } from '../theme';

export default function LogoMark({ size = 32 }) {
  const arrowW = Math.round(size * 0.42);
  const arrowH = Math.max(3, Math.round(size * 0.1));
  const head = Math.max(5, Math.round(size * 0.18));

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32)
        }
      ]}
      accessibilityRole="image"
      accessibilityLabel="Logo TrocVille"
    >
      <View style={[styles.row, { marginBottom: Math.round(size * 0.08) }]}>
        <View style={[styles.shaft, { width: arrowW, height: arrowH, backgroundColor: colors.white }]} />
        <View
          style={[
            styles.headRight,
            {
              borderTopWidth: head / 2,
              borderBottomWidth: head / 2,
              borderLeftWidth: head,
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: colors.white,
              marginLeft: 1
            }
          ]}
        />
      </View>
      <View style={styles.row}>
        <View
          style={[
            styles.headLeft,
            {
              borderTopWidth: head / 2,
              borderBottomWidth: head / 2,
              borderRightWidth: head,
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              borderRightColor: colors.cream,
              marginRight: 1
            }
          ]}
        />
        <View style={[styles.shaft, { width: arrowW, height: arrowH, backgroundColor: colors.cream }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  shaft: {
    borderRadius: 2
  },
  headRight: {
    width: 0,
    height: 0
  },
  headLeft: {
    width: 0,
    height: 0
  }
});
