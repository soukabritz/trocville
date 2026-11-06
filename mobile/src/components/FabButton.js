import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

import { colors, fonts } from '../theme';

export default function FabButton({ onPress, label = 'Publier un objet' }) {
  return (
    <Pressable
      style={styles.fab}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.plus}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  plus: { color: colors.white, fontSize: 32, lineHeight: 34, fontFamily: fonts.sansBold }
});
