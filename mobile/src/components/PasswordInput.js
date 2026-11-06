import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts } from '../theme';

export default function PasswordInput({
  value,
  onChangeText,
  error,
  accessibilityLabel,
  accessibilityLabelledBy
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.wrap, error && styles.wrapError]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={accessibilityLabel}
        accessibilityLabelledBy={accessibilityLabelledBy}
      />
      <Pressable
        onPress={() => setVisible((current) => !current)}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        hitSlop={8}
      >
        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingRight: 12
  },
  wrapError: { borderColor: colors.orange },
  input: {
    flex: 1,
    padding: 12,
    fontFamily: fonts.sans,
    color: colors.ink
  }
});
