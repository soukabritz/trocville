import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

import { FavoriteContext } from '../../context/FavoriteContext';
import EmptyState from '../../components/EmptyState';
import ItemCard from '../../components/ItemCard';
import StackScrollGuard from '../../components/StackScrollGuard';
import useStackHeaderInset from '../../components/useStackHeaderInset';
import { colors, fonts } from '../../theme';

export default function FavoritesScreen({ navigation }) {
  const topInset = useStackHeaderInset();
  const { items } = useContext(FavoriteContext) || { items: [] };

  return (
    <View style={[styles.screen, { paddingTop: topInset }]}>
      <StackScrollGuard />
      <FlatList
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        data={items}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={items.length ? styles.row : undefined}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>FAVORIS</Text>
            <Text style={styles.headline} accessibilityRole="header">
              Tes coups de cœur.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Aucun favori"
            subtitle="Touche le cœur sur une annonce pour la retrouver ici."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.col}>
            <ItemCard
              item={item}
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  row: { gap: 10 },
  col: { flex: 1 },
  eyebrow: {
    color: colors.orange,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 8
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.ink,
    marginTop: 6,
    marginBottom: 16
  }
});
