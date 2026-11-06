import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { colors, fonts } from '../theme';

export default function FieldError({ message }) {
  if (!message) {
    return null;
  }
  return (
    <Text style={styles.error} accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.orange, fontFamily: fonts.sans, fontSize: 13 }
});
