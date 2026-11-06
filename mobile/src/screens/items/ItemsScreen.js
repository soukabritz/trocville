import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { categoryApi, itemApi } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import BrandBar from '../../components/BrandBar';
import FabButton from '../../components/FabButton';
import ItemCard from '../../components/ItemCard';
import { colors, fonts } from '../../theme';
import CityField from '../../components/CityField';
import FieldError from '../../components/FieldError';

const CONDITIONS = [
  { value: 'new', label: 'Neuf' },
  { value: 'good', label: 'Bon état' },
  { value: 'fair', label: 'Correct' }
];

export default function ItemsScreen({ navigation, route }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(route.params?.categoryId ?? null);
  const [query, setQuery] = useState(route.params?.q || '');
  const [conditionState, setConditionState] = useState(null);
  const [cities, setCities] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftCategoryId, setDraftCategoryId] = useState(null);
  const [draftCondition, setDraftCondition] = useState(null);
  const [draftCity, setDraftCity] = useState('');
  const [draftCityConfirmed, setDraftCityConfirmed] = useState(true);
  const [cityError, setCityError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (route.params?.categoryId !== undefined) {
      setCategoryId(route.params.categoryId);
    }
    if (route.params?.q !== undefined) {
      setQuery(route.params.q);
    }
  }, [route.params?.categoryId, route.params?.q]);

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {});
  }, []);

  const loadItems = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryId) {
        params.set('categoryId', String(categoryId));
      }
      if (conditionState) {
        params.set('conditionState', conditionState);
      }
      if (cities.trim()) {
        params.set('cities', cities.trim());
      }
      const qs = params.toString() ? `?${params.toString()}` : '';
      let data = await itemApi.list(qs);
      const needle = query.trim().toLowerCase();
      if (needle) {
        data = data.filter((item) =>
          `${item.title} ${item.description || ''} ${item.city || ''}`.toLowerCase().includes(needle)
        );
      }
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [categoryId, conditionState, cities, query]);

  const openFilters = () => {
    setDraftCategoryId(categoryId);
    setDraftCondition(conditionState);
    setDraftCity(cities);
    setDraftCityConfirmed(true);
    setCityError('');
    setFiltersOpen(true);
  };

  const applyFilters = () => {
    if (draftCity.trim() && !draftCityConfirmed) {
      setCityError('Choisis une ville dans la liste.');
      return;
    }
    setCityError('');
    setCategoryId(draftCategoryId);
    setConditionState(draftCondition);
    setCities(draftCity.trim());
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setDraftCategoryId(null);
    setDraftCondition(null);
    setDraftCity('');
    setDraftCityConfirmed(true);
    setCityError('');
  };

  const categoryName = categories.find((category) => category.id === categoryId)?.name;
  const conditionLabel = CONDITIONS.find((condition) => condition.value === conditionState)?.label;
  const activeFilters = [categoryName, conditionLabel, cities.trim()].filter(Boolean);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const header = (
    <View>
      <Text style={styles.eyebrow}>LES ANNONCES</Text>
      <Text style={styles.headline} accessibilityRole="header">
        Trouve ton prochain coup de cœur.
      </Text>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un objet"
          placeholderTextColor={colors.muted}
          onSubmitEditing={loadItems}
          accessibilityLabel="Rechercher un objet"
        />
        <Pressable
          style={styles.filterButton}
          onPress={openFilters}
          accessibilityRole="button"
          accessibilityLabel="Filtrer les annonces"
          hitSlop={8}
        >
          <Ionicons name="options-outline" size={22} color={colors.ink} />
          {activeFilters.length > 0 ? <View style={styles.filterDot} /> : null}
        </Pressable>
      </View>
      {activeFilters.length > 0 ? (
        <Text style={styles.activeFilters} numberOfLines={1}>
          {activeFilters.join(' · ')}
        </Text>
      ) : null}
      <Text style={styles.count}>
        {items.length} objet{items.length > 1 ? 's' : ''}
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <BrandBar />
      <FlatList
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        data={loading || error ? [] : items}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.orange} accessibilityLabel="Chargement des annonces" />
          ) : error ? (
            <View style={styles.center}>
              <Text style={styles.error}>{error}</Text>
              <Pressable onPress={loadItems} accessibilityRole="button" accessibilityLabel="Réessayer">
                <Text style={styles.link}>Réessayer</Text>
              </Pressable>
            </View>
          ) : (
            <EmptyState title="Aucune annonce" subtitle="Aucun objet ne correspond à ces filtres." />
          )
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
      <FabButton onPress={() => navigation.navigate('CreateItem')} />
      <Modal visible={filtersOpen} transparent animationType="slide" onRequestClose={() => setFiltersOpen(false)}>
        <KeyboardAvoidingView
          style={styles.backdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.backdropTap} onPress={() => setFiltersOpen(false)} accessibilityLabel="Fermer les filtres" />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Filtres</Text>

            <Text style={styles.sheetLabel}>Catégorie</Text>
            <View style={styles.chips}>
              <Pressable
                style={[styles.choice, draftCategoryId === null && styles.choiceOn]}
                onPress={() => setDraftCategoryId(null)}
                accessibilityRole="button"
                accessibilityLabel="Toutes les catégories"
              >
                <Text style={[styles.choiceText, draftCategoryId === null && styles.choiceTextOn]}>Toutes</Text>
              </Pressable>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  style={[styles.choice, draftCategoryId === category.id && styles.choiceOn]}
                  onPress={() => setDraftCategoryId(category.id)}
                  accessibilityRole="button"
                  accessibilityLabel={category.name}
                >
                  <Text style={[styles.choiceText, draftCategoryId === category.id && styles.choiceTextOn]}>
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sheetLabel}>État</Text>
            <View style={styles.chips}>
              <Pressable
                style={[styles.choice, draftCondition === null && styles.choiceOn]}
                onPress={() => setDraftCondition(null)}
                accessibilityRole="button"
                accessibilityLabel="Tous les états"
              >
                <Text style={[styles.choiceText, draftCondition === null && styles.choiceTextOn]}>Tous</Text>
              </Pressable>
              {CONDITIONS.map((condition) => (
                <Pressable
                  key={condition.value}
                  style={[styles.choice, draftCondition === condition.value && styles.choiceOn]}
                  onPress={() => setDraftCondition(condition.value)}
                  accessibilityRole="button"
                  accessibilityLabel={condition.label}
                >
                  <Text style={[styles.choiceText, draftCondition === condition.value && styles.choiceTextOn]}>
                    {condition.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sheetLabel}>Ville</Text>
            <CityField
              value={draftCity}
              onChangeText={(text) => {
                setDraftCity(text);
                setCityError('');
              }}
              confirmed={draftCityConfirmed}
              onConfirmedChange={setDraftCityConfirmed}
              error={Boolean(cityError)}
              accessibilityLabel="Filtrer par ville"
            />
            <FieldError message={cityError} />

            <View style={styles.sheetActions}>
              <Pressable style={styles.reset} onPress={resetFilters} accessibilityRole="button" accessibilityLabel="Réinitialiser les filtres">
                <Text style={styles.resetText}>Réinitialiser</Text>
              </Pressable>
              <Pressable style={styles.apply} onPress={applyFilters} accessibilityRole="button" accessibilityLabel="Appliquer les filtres">
                <Text style={styles.applyText}>Appliquer</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: 16, paddingBottom: 96 },
  row: { gap: 10 },
  col: { flex: 1 },
  center: { alignItems: 'center', padding: 20 },
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
    marginBottom: 14
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
  filterButton: { position: 'relative' },
  filterDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange
  },
  activeFilters: { fontFamily: fonts.sansMed, color: colors.ink, marginBottom: 8, fontSize: 13 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(28, 25, 23, 0.35)' },
  backdropTap: { flex: 1 },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 28,
    gap: 8
  },
  sheetTitle: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink, marginBottom: 4 },
  sheetLabel: { fontFamily: fonts.sansBold, color: colors.ink, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  choiceOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  choiceText: { fontFamily: fonts.sansMed, color: colors.ink },
  choiceTextOn: { color: colors.white },
  cityInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    fontFamily: fonts.sans
  },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  reset: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center'
  },
  resetText: { fontFamily: fonts.sansBold, color: colors.ink },
  apply: { flex: 1, backgroundColor: colors.ink, borderRadius: 12, padding: 14, alignItems: 'center' },
  applyText: { fontFamily: fonts.sansBold, color: colors.white },
  count: { fontFamily: fonts.sans, color: colors.muted, marginBottom: 12, fontSize: 13 },
  error: { color: colors.orange, textAlign: 'center', fontFamily: fonts.sans },
  link: { color: colors.green, marginTop: 12, fontFamily: fonts.sansMed }
});
