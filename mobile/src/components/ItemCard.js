import React, { useContext } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Alert } from 'react-native';

import { CARD_BORDERS, colors, fonts } from '../theme';
import { mediaUrl } from '../services/apiClient';
import { FavoriteContext } from '../context/FavoriteContext';
import { AuthContext } from '../context/AuthContext';

export default function ItemCard({ item, onPress, compact = false }) {
  const border = CARD_BORDERS[Number(item.id) % CARD_BORDERS.length];
  const { currentUser } = useContext(AuthContext);
  const favorites = useContext(FavoriteContext);
  const isMine = currentUser && Number(item.user_id) === Number(currentUser.id);
  const liked = favorites?.isFavorite(item.id);

  const onHeart = async (event) => {
    event?.stopPropagation?.();
    if (isMine) {
      Alert.alert('Favoris', 'Tu ne peux pas mettre tes propres annonces en favori.');
      return;
    }
    try {
      await favorites.toggle(item.id);
    } catch (err) {
      Alert.alert('Favoris', err.message);
    }
  };

  return (
    <Pressable
      style={[styles.card, { borderColor: border }, compact && styles.compact]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Voir ${item.title}`}
    >
      <View style={styles.imageWrap}>
        {item.image_url ? (
          <Image source={{ uri: mediaUrl(item.image_url) }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderMark}>▢</Text>
          </View>
        )}
        <Pressable
          style={styles.heart}
          onPress={onHeart}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Text style={[styles.heartGlyph, liked && styles.heartOn]}>{liked ? '♥' : '♡'}</Text>
        </Pressable>
        {item.category_name ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{String(item.category_name).toUpperCase()}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.meta} numberOfLines={1}>
          {item.city}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.price}>{item.credit_price} crédits</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 12
  },
  compact: { maxWidth: 220, marginRight: 12 },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 140, backgroundColor: '#EEE8DC' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderMark: { color: colors.muted, fontSize: 22 },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heartGlyph: { fontSize: 16, color: colors.ink },
  heartOn: { color: colors.orange },
  tag: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: colors.orange,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  tagText: { color: colors.white, fontFamily: fonts.sansBold, fontSize: 9, letterSpacing: 0.4 },
  body: { padding: 10, gap: 2 },
  meta: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12 },
  title: { fontFamily: fonts.serifMed, fontSize: 15, color: colors.ink },
  price: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.orange, marginTop: 2 }
});
