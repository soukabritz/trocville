import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { itemApi } from '../../services/api';
import { mediaUrl } from '../../services/apiClient';
import EmptyState from '../../components/EmptyState';
import BrandBar from '../../components/BrandBar';
import { colors, fonts } from '../../theme';

const formatDate = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function TradesScreen() {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const data = await itemApi.listExchanges();
      setExchanges(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        <BrandBar />
        <View style={styles.center}>
          <ActivityIndicator color={colors.orange} accessibilityLabel="Chargement de l’historique" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <BrandBar />
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <BrandBar />
      <FlatList
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        data={exchanges}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>TES ÉCHANGES</Text>
            <Text style={styles.headline} accessibilityRole="header">
              L’historique de ce qui a abouti.
            </Text>
            <Text style={styles.lead}>
              Uniquement les objets obtenus ou cédés contre des crédits. Les discussions restent dans Messages.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Aucun échange abouti"
            subtitle="Dès que tu obtiens un objet (ou que quelqu’un obtient le tien) contre des crédits, ça s’affiche ici."
          />
        }
        renderItem={({ item }) => {
          const sold = item.role === 'sold';
          const otherFirst = sold ? item.buyer_first_name : item.seller_first_name;
          const otherLast = sold ? item.buyer_last_name : item.seller_last_name;
          return (
            <View style={styles.card}>
              <View style={styles.statusRow}>
                <View style={styles.dot} />
                <Text style={styles.status}>{sold ? 'CÉDÉ' : 'OBTENU'} · TERMINÉ</Text>
              </View>
              <View style={styles.bodyRow}>
                {item.image_url ? (
                  <Image source={{ uri: mediaUrl(item.image_url) }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbEmpty]}>
                    <Text style={styles.thumbMark}>▢</Text>
                  </View>
                )}
                <View style={styles.bodyText}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.muted}>
                    {sold ? 'Reçu par' : 'Chez'} {otherFirst} {otherLast}
                  </Text>
                  <Text style={styles.price}>
                    {sold ? '+' : '−'}
                    {item.credit_price} crédits
                  </Text>
                  <Text style={styles.muted}>
                    {[item.city, formatDate(item.acquired_at)].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  eyebrow: {
    marginTop: 8,
    color: colors.orange,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 30,
    lineHeight: 34,
    color: colors.ink,
    marginTop: 6,
    marginBottom: 10
  },
  lead: { fontFamily: fonts.sans, color: colors.muted, marginBottom: 18, lineHeight: 20 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.mint,
    padding: 16,
    marginBottom: 12
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  status: { fontFamily: fonts.sansBold, fontSize: 11, letterSpacing: 0.8, color: colors.ink },
  bodyRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#EEE8DC' },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  thumbMark: { color: colors.muted, fontSize: 20 },
  bodyText: { flex: 1 },
  cardTitle: { fontFamily: fonts.serifMed, fontSize: 18, color: colors.ink, marginBottom: 4 },
  price: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.orange, marginTop: 4 },
  muted: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13 },
  error: { color: colors.orange, textAlign: 'center', fontFamily: fonts.sans }
});
