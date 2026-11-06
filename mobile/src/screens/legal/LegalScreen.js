import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

import { legalTexts } from '../../content/legal';
import { colors, fonts } from '../../theme';
import StackScrollGuard from '../../components/StackScrollGuard';
import useStackHeaderInset from '../../components/useStackHeaderInset';

export default function LegalScreen({ route }) {
  const topInset = useStackHeaderInset();
  const document = legalTexts[route.params?.kind] || legalTexts.terms;

  return (
    <View style={[styles.screen, { paddingTop: topInset }]}>
      <StackScrollGuard />
      <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="never">
        <Text style={styles.title} accessibilityRole="header">
          {document.title}
        </Text>
        {document.paragraphs.map((paragraph) => (
          <Text key={paragraph} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 24, gap: 14, maxWidth: 560, width: '100%', alignSelf: 'center' },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.ink },
  paragraph: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.ink }
});
