import React, { useCallback, useState } from 'react';
import { SafeAreaView, } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/Icon';

import { conversationApi } from '../../services/api';
import { mediaUrl } from '../../services/apiClient';
import EmptyState from '../../components/EmptyState';
import BrandBar from '../../components/BrandBar';
import { avatarColor, colors, fonts, initials } from '../../theme';

const conversationDate = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const today = new Date();
  const start = (day) => new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const diff = Math.round((start(today) - start(date)) / 86400000);
  if (diff === 0) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  if (diff === 1) {
    return 'Hier';
  }
  const options = { day: 'numeric', month: 'short' };
  if (date.getFullYear() !== today.getFullYear()) {
    options.year = 'numeric';
  }
  return date.toLocaleDateString('fr-FR', options);
};

export default function MessagesScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async ({ silent } = {}) => {
    if (!silent) {
      setError('');
      setLoading(true);
    }
    try {
      const data = await conversationApi.listMine();
      setConversations(data);
    } catch (err) {
      if (!silent) {
        setError(err.message);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      const timer = setInterval(() => load({ silent: true }), 5000);
      return () => clearInterval(timer);
    }, [load])
  );

  const filtered = conversations.filter((item) => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return true;
    }
    return `${item.item_title} ${item.other_first_name} ${item.other_last_name} ${item.last_message || ''}`
      .toLowerCase()
      .includes(needle);
  });

  return (
  
    <View style={styles.screen}>
      <BrandBar />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.orange} accessibilityLabel="Chargement des discussions" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={load} accessibilityRole="button" accessibilityLabel="Réessayer">
            <Text style={styles.link}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <Text style={styles.eyebrow}>MESSAGES</Text>
              <Text style={styles.headline} accessibilityRole="header">
                Les bonnes idées commencent par un message.
              </Text>
              <View style={styles.searchBox}>
                <Icon name="search" size={18} color={colors.muted} />
                <TextInput
                  style={styles.searchInput}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Rechercher une conversation"
                  placeholderTextColor={colors.muted}
                  accessibilityLabel="Rechercher une conversation"
                />
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title="Aucun message"
              subtitle="Contacte un vendeur depuis une annonce : la discussion s’ouvre ici pour organiser la remise."
            />
          }
          ListFooterComponent={
            <Text style={styles.hint}>
              Une conversation s’ouvre quand tu contactes le vendeur, avant même d’utiliser tes crédits.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() =>
                navigation.navigate('Chat', {
                  conversationId: item.id,
                  title: item.item_title
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Discussion ${item.item_title}${item.last_message ? `, ${item.last_message_mine ? 'envoyé' : 'reçu'} : ${item.last_message}` : ''}`}
            >
              {item.item_image_url ? (
                <Image
                  source={{ uri: mediaUrl(item.item_image_url) }}
                  style={styles.thumb}
                  accessibilityLabel={`Photo de ${item.item_title}`}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: avatarColor(item.other_user_id || item.id) }]}>
                  <Text style={styles.avatarText}>
                    {initials(item.other_first_name, item.other_last_name)}
                  </Text>
                </View>
              )}
              <View style={styles.cardText}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.item_title}
                </Text>
                {item.last_message ? (
                  <Text
                    style={[styles.preview, Number(item.unread_count) > 0 && styles.previewUnread]}
                    numberOfLines={1}
                  >
                    {item.last_message_mine ? `Toi : ${item.last_message}` : item.last_message}
                  </Text>
                ) : null}
                <Text style={styles.muted} numberOfLines={1}>
                  {item.other_first_name} {item.other_last_name}
                  {' · '}
                  {conversationDate(item.last_message_at || item.created_at)}
                </Text>
              </View>
              {Number(item.unread_count) > 0 ? (
                <View style={styles.badge} accessibilityLabel={`${item.unread_count} messages non lus`}>
                  <Text style={styles.badgeText}>{item.unread_count}</Text>
                </View>
              ) : null}
            </Pressable>
          )}
        />
      )}
    </View>
 
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
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
    marginBottom: 16
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 8
  },
  searchInput: { flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  thumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: colors.line },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { fontFamily: fonts.sansBold, color: colors.ink },
  cardText: { flex: 1 },
  cardTitle: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.ink, marginBottom: 2 },
  muted: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13 },
  preview: { color: colors.ink, fontFamily: fonts.sans, fontSize: 14, marginBottom: 2 },
  previewUnread: { fontFamily: fonts.sansBold },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  badgeText: { color: colors.white, fontFamily: fonts.sansBold, fontSize: 12 },
  hint: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12, marginTop: 20, lineHeight: 18 },
  error: { color: colors.orange, textAlign: 'center', fontFamily: fonts.sans },
  link: { color: colors.green, marginTop: 12, fontFamily: fonts.sansMed }
});
