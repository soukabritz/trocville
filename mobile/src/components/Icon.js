import React from 'react';
import { Text, StyleSheet } from 'react-native';

const GLYPHS = {
  home: '⌂',
  'home-outline': '⌂',
  cube: '▣',
  'cube-outline': '▢',
  'swap-horizontal': '⇄',
  'swap-horizontal-outline': '⇄',
  chatbubble: '●',
  'chatbubble-outline': '○',
  person: '☺',
  'person-outline': '☺',
  add: '+',
  search: '⌕',
  'arrow-forward': '→',
  'notifications-outline': '◉',
  'heart-outline': '♡',
  'image-outline': '▢',
  'sparkles-outline': '✦',
  'settings-outline': '⚙'
};

export default function Icon({ name, size = 22, color = '#1C1917', style }) {
  return (
    <Text
      style={[styles.icon, { fontSize: size, color, lineHeight: size + 2, width: size, height: size + 2 }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {GLYPHS[name] || '•'}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: { textAlign: 'center', fontWeight: '600' }
});
