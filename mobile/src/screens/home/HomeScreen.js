import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import { categoryApi, itemApi } from '../../services/api';
import BrandBar from '../../components/BrandBar';
import FabButton from '../../components/FabButton';
import ItemCard from '../../components/ItemCard';
import { colors, fonts, categoryPalette } from '../../theme';

const CATEGORY_ICONS = {
  electronique: 'phone-portrait-outline',
  maison: 'home-outline',
  vetements: 'shirt-outline',
  sports: 'football-outline',
  livres: 'book-outline',
  loisirs: 'game-controller-outline'
};

const categoryIcon = (name) => {
  const key = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return CATEGORY_ICONS[key] || 'grid-outline';
};

export default function HomeScreen({ navigation }) {
  const { currentUser } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [cats, list] = await Promise.all([categoryApi.list(), itemApi.list('')]);
      setCategories(cats);
      setItems(list.slice(0, 8));
    } catch (_err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const goAnnonces = (params) => {
    navigation.navigate('Annonces', { screen: 'ItemsList', params });
  };

  const onSearch = () => {
    goAnnonces({ q: query.trim() });
  };

  return (
    <View style={styles.screen}>
      <BrandBar />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
      >
        <Text style={styles.eyebrow}>BONJOUR {(currentUser?.firstName || '').toUpperCase()}</Text>
        <Text style={styles.headline} accessibilityRole="header">
          Qu’est-ce qu’on troque aujourd’hui ?
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Un vélo, une plante, une lampe…"
              placeholderTextColor={colors.muted}
              onSubmitEditing={onSearch}
              returnKeyType="search"
              accessibilityLabel="Rechercher un objet"
            />
          </View>
          <Pressable
            style={styles.goBtn}
            onPress={onSearch}
            accessibilityRole="button"
            accessibilityLabel="Lancer la recherche"
          >
            <Ionicons name="arrow-forward" size={20} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerTag}>
            <Text style={styles.bannerTagText}>TES CRÉDITS, PAS D’ARGENT</Text>
          </View>
          <Text style={styles.bannerTitle}>Pas besoin d’argent pour se faire plaisir.</Text>
          <Text style={styles.bannerBody}>
            Tu as {currentUser?.credits ?? 0} crédits. Propose un objet, gagne des crédits, prends ce qu’il te faut. Remise
            en main propre.
          </Text>
          <Pressable onPress={() => goAnnonces({})} accessibilityRole="link">
            <Text style={styles.bannerLink}>Explorer les annonces →</Text>
          </Pressable>
        </View>

        <Text style={styles.eyebrow}>POUR COMMENCER</Text>
        <Text style={styles.sectionTitle}>Explorer par envie</Text>
        <View style={styles.catGrid}>
          {categories.slice(0, 4).map((cat, index) => {
            const palette = categoryPalette[index % categoryPalette.length];
            return (
              <Pressable
                key={cat.id}
                style={[styles.catCard, { backgroundColor: palette.bg }]}
                onPress={() => goAnnonces({ categoryId: cat.id })}
                accessibilityRole="button"
                accessibilityLabel={cat.name}
              >
                <View style={styles.catIcon}>
                  <Ionicons name={categoryIcon(cat.name)} size={18} color={colors.ink} />
                </View>
                <Text style={styles.catName}>{cat.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.eyebrow}>FRAÎCHEMENT DÉPOSÉS</Text>
            <Text style={styles.sectionTitle}>Près de chez toi</Text>
          </View>
          <Pressable onPress={() => goAnnonces({})} accessibilityRole="link">
            <Text style={styles.seeAll}>Tout voir →</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.orange} accessibilityLabel="Chargement" />
        ) : (
          <View style={styles.grid}>
            {items.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <ItemCard
                  item={item}
                  onPress={() =>
                    navigation.navigate('Annonces', {
                      screen: 'ItemDetail',
                      params: { itemId: item.id }
                    })
                  }
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <FabButton
        onPress={() => navigation.navigate('Annonces', { screen: 'CreateItem' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 96 },
  eyebrow: {
    marginTop: 12,
    color: colors.orange,
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.2
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 32,
    lineHeight: 36,
    color: colors.ink,
    marginTop: 6,
    marginBottom: 16
  },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48
  },
  searchInput: { flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  goBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center'
  },
  banner: {
    backgroundColor: colors.blue,
    borderRadius: 18,
    padding: 18,
    marginBottom: 28
  },
  bannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mint,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10
  },
  bannerTagText: { fontFamily: fonts.sansBold, fontSize: 10, letterSpacing: 0.6, color: colors.ink },
  bannerTitle: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 28, color: colors.ink, marginBottom: 8 },
  bannerBody: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.ink, marginBottom: 12 },
  bannerLink: { fontFamily: fonts.sansMed, fontSize: 14, color: colors.ink, textDecorationLine: 'underline' },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink, marginBottom: 12 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  catCard: {
    width: '47.5%',
    borderRadius: 16,
    padding: 14,
    minHeight: 78,
    justifyContent: 'space-between'
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  catName: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.ink },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8
  },
  seeAll: { fontFamily: fonts.sansMed, color: colors.ink, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  gridItem: { width: '50%', paddingHorizontal: 6 }
});
