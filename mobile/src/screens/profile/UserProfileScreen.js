import React, { useCallback, useContext, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  useWindowDimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { FavoriteContext } from '../../context/FavoriteContext';
import { itemApi, userApi } from '../../services/api';
import { mediaUrl } from '../../services/apiClient';
import EmptyState from '../../components/EmptyState';
import BrandBar from '../../components/BrandBar';
import FabButton from '../../components/FabButton';
import useStackHeaderInset from '../../components/useStackHeaderInset';
import { avatarColor, colors, fonts, initials } from '../../theme';

export default function UserProfileScreen({ navigation, route }) {
  const topInset = useStackHeaderInset();
  const { currentUser, signOut } = useContext(AuthContext);
  const favoriteState = useContext(FavoriteContext);
  const favoriteItems = favoriteState?.items || [];
  const refreshFavorites = favoriteState?.refresh;
  const paramUserId = route.params?.userId;
  const profileId = paramUserId || currentUser?.id;
  const isMe = currentUser && Number(profileId) === Number(currentUser.id);
  const { width } = useWindowDimensions();
  const tile = Math.floor((Math.min(width, 720) - 48) / 2);

  const [profile, setProfile] = useState(isMe ? currentUser : null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!profileId) {
      return;
    }
    setError('');
    setLoading(true);
    try {
      const [user, list] = await Promise.all([
        isMe ? Promise.resolve(currentUser) : userApi.get(profileId),
        itemApi.list(`?userId=${profileId}`)
      ]);
      setProfile(user);
      setItems(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profileId, isMe, currentUser]);

  useFocusEffect(
    useCallback(() => {
      load();
      if (isMe && refreshFavorites) {
        refreshFavorites();
      }
    }, [load, isMe, refreshFavorites])
  );

  const firstName = profile?.firstName || profile?.first_name || '';
  const lastName = profile?.lastName || profile?.last_name || '';
  const city = profile?.mainCity || profile?.main_city || '';
  const credits = profile?.credits ?? 0;
  const available = items.filter((item) => item.status === 'available').length;

  if (loading && !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.orange} accessibilityLabel="Chargement du profil" />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: topInset }]}>
      {isMe && !paramUserId ? <BrandBar /> : null}
      <FlatList
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        data={items}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            {isMe && !paramUserId ? (
              <>
                <Text style={styles.eyebrow}>TON PROFIL</Text>
                <Text style={styles.headline} accessibilityRole="header">
                  Ton petit coin à toi.
                </Text>
              </>
            ) : (
              <Text style={styles.headline} accessibilityRole="header">
                {firstName} {lastName}
              </Text>
            )}

            <View style={styles.identity}>
              <View style={[styles.avatar, { backgroundColor: avatarColor(profileId) }]}>
                <Text style={styles.avatarText}>{initials(firstName, lastName)}</Text>
                {isMe ? (
                  <View style={styles.plus}>
                    <Text style={styles.plusText}>+</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.identityText}>
                <Text style={styles.name}>
                  {firstName} {lastName}
                </Text>
                <Text style={styles.meta}>
                  {city}
                  {isMe ? ` · ${credits} crédits` : ''}
                </Text>
              </View>
              {isMe ? (
                <Pressable
                  onPress={() => navigation.navigate('EditProfile')}
                  accessibilityRole="button"
                  accessibilityLabel="Modifier le profil"
                  style={styles.gear}
                >
                  <Text style={styles.gearGlyph}>⚙</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{items.length}</Text>
                <Text style={styles.statLabel}>Objets déposés</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{available}</Text>
                <Text style={styles.statLabel}>Disponibles</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{credits}</Text>
                <Text style={styles.statLabel}>Crédits</Text>
              </View>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {isMe ? (
              <View style={styles.favBlock}>
                <View style={styles.sectionRow}>
                  <Text style={styles.section}>Mes favoris</Text>
                  <Pressable
                    onPress={() => navigation.navigate('Favorites')}
                    accessibilityRole="link"
                    accessibilityLabel="Voir tous les favoris"
                  >
                    <Text style={styles.seeAll}>Tout voir →</Text>
                  </Pressable>
                </View>
                {favoriteItems.length === 0 ? (
                  <Text style={styles.favEmpty}>
                    Touche le cœur sur une annonce pour la retrouver ici.
                  </Text>
                ) : (
                  favoriteItems.slice(0, 4).map((fav) => (
                    <Pressable
                      key={fav.id}
                      style={styles.favRow}
                      onPress={() => navigation.navigate('ItemDetail', { itemId: fav.id })}
                      accessibilityRole="button"
                      accessibilityLabel={fav.title}
                    >
                      {fav.image_url ? (
                        <Image source={{ uri: mediaUrl(fav.image_url) }} style={styles.favThumb} />
                      ) : (
                        <View style={[styles.favThumb, styles.favThumbEmpty]} />
                      )}
                      <View style={styles.favText}>
                        <Text style={styles.favTitle} numberOfLines={1}>
                          {fav.title}
                        </Text>
                        <Text style={styles.favMeta}>
                          {fav.city} · {fav.credit_price} crédits
                        </Text>
                      </View>
                      <Text style={styles.heartOn}>♥</Text>
                    </Pressable>
                  ))
                )}
              </View>
            ) : null}

            <View style={styles.sectionRow}>
              <Text style={styles.section}>{isMe ? 'Mes annonces' : 'Annonces'}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.orange} />
          ) : (
            <EmptyState title="Aucune annonce" subtitle="Pas encore d’objet publié." />
          )
        }
        ListFooterComponent={
          isMe ? (
            <View style={styles.footer}>
              <Pressable onPress={() => navigation.navigate('Legal', { kind: 'terms' })} accessibilityRole="link">
                <Text style={styles.legalLink}>Conditions d’utilisation</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('Legal', { kind: 'privacy' })} accessibilityRole="link">
                <Text style={styles.legalLink}>Politique de confidentialité</Text>
              </Pressable>
              <Pressable
                style={styles.logout}
                onPress={signOut}
                accessibilityRole="button"
                accessibilityLabel="Se déconnecter"
              >
                <Text style={styles.logoutText}>Se déconnecter</Text>
              </Pressable>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            style={[styles.tile, { width: tile }]}
          >
            {item.image_url ? (
              <Image source={{ uri: mediaUrl(item.image_url) }} style={styles.tileImage} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>{item.title}</Text>
              </View>
            )}
            <View style={styles.tileBody}>
              <Text style={styles.tileTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={[styles.status, item.status !== 'available' && styles.statusBusy]}>
                <Text style={styles.statusText}>
                  {item.status === 'available' ? 'DISPONIBLE' : String(item.status).toUpperCase()}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
      {isMe ? (
        <FabButton onPress={() => navigation.navigate('Annonces', { screen: 'CreateItem' })} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  list: { paddingHorizontal: 16, paddingBottom: 96 },
  row: { gap: 10 },
  header: { paddingBottom: 12 },
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
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.orange,
    padding: 14,
    gap: 12,
    marginBottom: 16
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { fontFamily: fonts.sansBold, fontSize: 18, color: colors.ink },
  plus: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center'
  },
  plusText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  identityText: { flex: 1 },
  name: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  meta: { fontFamily: fonts.sans, color: colors.ink, marginTop: 2, fontSize: 13 },
  gear: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  gearGlyph: { fontSize: 16, color: colors.ink },
  stats: { flexDirection: 'row', marginBottom: 20 },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink },
  statLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, textAlign: 'center' },
  sectionRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  section: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  seeAll: { fontFamily: fonts.sansMed, color: colors.ink },
  favBlock: { marginBottom: 20 },
  favEmpty: { fontFamily: fonts.sans, color: colors.muted, marginBottom: 8, lineHeight: 20 },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 8,
    marginBottom: 8
  },
  favThumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#EEE8DC' },
  favThumbEmpty: {},
  favText: { flex: 1 },
  favTitle: { fontFamily: fonts.sansBold, color: colors.ink },
  favMeta: { fontFamily: fonts.sans, color: colors.muted, fontSize: 12, marginTop: 2 },
  heartOn: { color: colors.orange, fontSize: 16 },
  error: { color: colors.orange, fontFamily: fonts.sans, marginBottom: 8 },
  tile: {
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line
  },
  tileImage: { width: '100%', height: 110, backgroundColor: '#EEE8DC' },
  placeholder: { height: 110, alignItems: 'center', justifyContent: 'center', padding: 6 },
  placeholderText: { fontSize: 11, textAlign: 'center', fontFamily: fonts.sans },
  tileBody: { padding: 10 },
  tileTitle: { fontFamily: fonts.sansBold, color: colors.ink, marginBottom: 6 },
  status: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mint,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  statusBusy: { backgroundColor: colors.yellow },
  statusText: { fontFamily: fonts.sansBold, fontSize: 10, letterSpacing: 0.4 },
  footer: { marginTop: 8, gap: 8 },
  legalLink: { fontFamily: fonts.sansMed, color: colors.ink, textAlign: 'center', marginTop: 8 },
  logout: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ink
  },
  logoutText: { fontFamily: fonts.sansBold, color: colors.ink }
});
