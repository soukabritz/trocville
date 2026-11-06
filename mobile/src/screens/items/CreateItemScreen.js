import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { AuthContext } from '../../context/AuthContext';
import { categoryApi, itemApi } from '../../services/api';
import { mediaUrl } from '../../services/apiClient';
import { colors, fonts } from '../../theme';
import StackScrollGuard from '../../components/StackScrollGuard';
import useStackHeaderInset from '../../components/useStackHeaderInset';
import FieldError from '../../components/FieldError';
import CityField from '../../components/CityField';

const CONDITIONS = [
  { value: 'new', label: 'Neuf' },
  { value: 'good', label: 'Bon état' },
  { value: 'fair', label: 'Correct' }
];

export default function CreateItemScreen({ navigation, route }) {
  const topInset = useStackHeaderInset();
  const itemId = route.params?.itemId;
  const isEdit = Boolean(itemId);
  const { currentUser } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(currentUser?.mainCity || '');
  const [cityConfirmed, setCityConfirmed] = useState(Boolean(currentUser?.mainCity));
  const [categoryId, setCategoryId] = useState(null);
  const [conditionState, setConditionState] = useState('good');
  const [creditPrice, setCreditPrice] = useState('50');
  const [photoUri, setPhotoUri] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await categoryApi.list();
        if (cancelled) {
          return;
        }
        setCategories(data);

        if (itemId) {
          const item = await itemApi.get(itemId);
          if (cancelled) {
            return;
          }
          setTitle(item.title);
          setDescription(item.description);
          setCity(item.city);
          setCityConfirmed(true);
          setCategoryId(item.category_id);
          setConditionState(item.condition_state);
          setCreditPrice(String(item.credit_price));
          setExistingImageUrl(item.image_url || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoadingForm(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  const takePhoto = async () => {
    setError('');
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Autorise l’appareil photo pour publier un objet.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1]
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    setError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Autorise l’accès aux photos pour choisir une image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1]
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const onSubmit = async () => {
    setError('');

    const price = Number(creditPrice);
    const next = {};
    if (!title.trim()) next.title = 'Le titre est obligatoire.';
    if (description.trim().length < 10) next.description = 'La description doit contenir au moins 10 caractères.';
    if (!city.trim()) next.city = 'La ville est obligatoire.';
    else if (!cityConfirmed) next.city = 'Choisis une ville dans la liste.';
    if (!Number.isInteger(price) || price < 10 || price > 500) {
      next.creditPrice = 'Le prix doit être entre 10 et 500 crédits.';
    }
    if (!categoryId) next.categoryId = 'La catégorie est obligatoire.';
    if (!isEdit && !photoUri) next.photo = 'Une photo de l’objet est obligatoire.';
    setFields(next);
    if (Object.keys(next).length) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        city: city.trim(),
        categoryId,
        conditionState,
        creditPrice: price
      };
      await itemApi.save(payload, photoUri, isEdit ? itemId : null);
      navigation.goBack();
    } catch (err) {
      setFields(err.fields || {});
      setError(err.fields ? '' : err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingForm) {
    return (
      <View style={styles.center}>
        <ActivityIndicator accessibilityLabel="Chargement du formulaire" />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: topInset }]}>
      <StackScrollGuard />
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustContentInsets={false}
    >
      <Text style={styles.title} accessibilityRole="header">
        {isEdit ? 'Modifier l’annonce' : 'Publier un objet'}
      </Text>

      <Text>Photo de l’objet (obligatoire)</Text>
      {photoUri || existingImageUrl ? (
        <Image
          source={{ uri: photoUri || mediaUrl(existingImageUrl) }}
          style={styles.preview}
          accessibilityLabel="Aperçu de la photo"
        />
      ) : (
        <View style={styles.previewPlaceholder}>
          <Text>Aucune photo</Text>
        </View>
      )}
      <Pressable
        style={styles.secondaryButton}
        onPress={takePhoto}
        accessibilityRole="button"
        accessibilityLabel="Prendre une photo avec l'appareil photo"
      >
        <Text style={styles.secondaryText}>Appareil photo</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={pickFromLibrary}
        accessibilityRole="button"
        accessibilityLabel="Choisir une photo dans la pellicule"
      >
        <Text style={styles.secondaryText}>Pellicule</Text>
      </Pressable>
      <FieldError message={fields.photo} />

      <Text>Titre</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        accessibilityLabel="Titre de l'annonce"
      />
      <FieldError message={fields.title} />

      <Text>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        multiline
        accessibilityLabel="Description"
      />
      <FieldError message={fields.description} />

      <Text>Ville</Text>
      <CityField
        value={city}
        onChangeText={(text) => {
          setCity(text);
          setFields((current) => ({ ...current, city: undefined }));
        }}
        confirmed={cityConfirmed}
        onConfirmedChange={setCityConfirmed}
        error={Boolean(fields.city)}
        accessibilityLabel="Ville"
      />
      <FieldError message={fields.city} />

      <Text>Prix en crédits (10 à 500)</Text>
      <TextInput
        style={styles.input}
        value={creditPrice}
        onChangeText={setCreditPrice}
        keyboardType="number-pad"
        accessibilityLabel="Prix en crédits"
      />
      <FieldError message={fields.creditPrice} />

      <Text>Catégorie</Text>
      <View style={styles.chips}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[styles.chip, categoryId === category.id && styles.chipActive]}
            onPress={() => setCategoryId(category.id)}
            accessibilityRole="button"
            accessibilityLabel={category.name}
            accessibilityState={{ selected: categoryId === category.id }}
          >
            <Text style={categoryId === category.id ? styles.chipTextActive : styles.chipText}>
              {category.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <FieldError message={fields.categoryId} />

      <Text>État</Text>
      <View style={styles.chips}>
        {CONDITIONS.map((condition) => (
          <Pressable
            key={condition.value}
            style={[styles.chip, conditionState === condition.value && styles.chipActive]}
            onPress={() => setConditionState(condition.value)}
            accessibilityRole="button"
            accessibilityLabel={condition.label}
            accessibilityState={{ selected: conditionState === condition.value }}
          >
            <Text style={conditionState === condition.value ? styles.chipTextActive : styles.chipText}>
              {condition.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator accessibilityLabel="Publication en cours" />
      ) : (
        <Pressable
          style={styles.button}
          onPress={onSubmit}
          accessibilityRole="button"
          accessibilityLabel={isEdit ? "Enregistrer l'annonce" : "Publier l'annonce"}
        >
          <Text style={styles.buttonText}>{isEdit ? 'Enregistrer' : 'Publier'}</Text>
        </Pressable>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 8,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.bg
  },
  title: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    fontFamily: fonts.sans
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  chipActive: { backgroundColor: colors.yellow, borderColor: colors.yellow },
  chipText: { color: colors.ink, fontFamily: fonts.sansMed },
  chipTextActive: { color: colors.ink, fontFamily: fonts.sansBold },
  button: { backgroundColor: colors.orange, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: colors.white, fontFamily: fonts.sansBold },
  error: { color: colors.orange, fontFamily: fonts.sans },
  preview: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#EEE8DC' },
  previewPlaceholder: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white
  },
  secondaryButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ink
  },
  secondaryText: { color: colors.ink, fontFamily: fonts.sansBold }
});
