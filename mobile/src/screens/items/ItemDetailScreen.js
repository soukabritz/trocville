import React, { useCallback, useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { FavoriteContext } from '../../context/FavoriteContext';
import { conversationApi, itemApi } from '../../services/api';
import { mediaUrl } from '../../services/apiClient';
import { colors, fonts } from '../../theme';
import StackScrollGuard from '../../components/StackScrollGuard';
import useStackHeaderInset from '../../components/useStackHeaderInset';

const CONDITION_LABELS = {
  new: 'Neuf',
  good: 'Bon état',
  fair: 'Correct'
};

const STATUS_LABELS = {
  available: 'Disponible',
  trading: 'Réservé',
  traded: 'Échangé'
};

export default function ItemDetailScreen({ route, navigation }) {
  const topInset = useStackHeaderInset();
  const { itemId } = route.params;
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const favorites = useContext(FavoriteContext);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [acquiring, setAcquiring] = useState(false);
  const [contacting, setContacting] = useState(false);

  const loadItem = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const data = await itemApi.get(itemId);
      setItem(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useFocusEffect(
    useCallback(() => {
      loadItem();
    }, [loadItem])
  );

  const isOwner = item && currentUser && Number(item.user_id) === Number(currentUser.id);
  const canAcquire = item && currentUser && !isOwner && item.status === 'available';
  const canContact = item && currentUser && !isOwner;

  const onContact = async () => {
    setContacting(true);
    setError('');
    try {
      const conversation = await conversationApi.start(item.id);
      navigation.navigate('Chat', {
        conversationId: conversation.id,
        title: item.title
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setContacting(false);
    }
  };

  const onAcquire = () => {
    Alert.alert(
      'Obtenir cet objet',
      `Tu vas dépenser ${item.credit_price} crédits. Ensuite vous vous organisez en main propre.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setAcquiring(true);
            setError('');
            try {
              const result = await itemApi.acquire(itemId);
              setCurrentUser(result.user);
              Alert.alert(
                'C’est bon',
                'Les crédits ont été transférés. Ouvre l’onglet Messages pour organiser la remise en main propre.'
              );
              await loadItem();
            } catch (err) {
              setError(err.message);
            } finally {
              setAcquiring(false);
            }
          }
        }
      ]
    );
  };

  const onDelete = () => {
    Alert.alert('Supprimer l’annonce', 'Cette action est définitive.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await itemApi.remove(itemId);
            navigation.goBack();
          } catch (err) {
            setError(err.message);
            setDeleting(false);
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator accessibilityLabel="Chargement de l'annonce" />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'Annonce introuvable.'}</Text>
        <Pressable onPress={loadItem} accessibilityRole="button" accessibilityLabel="Réessayer">
          <Text style={styles.link}>Réessayer</Text>
        </Pressable>
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
      {item.image_url ? (
        <Image source={{ uri: mediaUrl(item.image_url) }} style={styles.hero} accessibilityLabel="Photo de l'objet" />
      ) : null}
      <View style={styles.titleRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{(item.category_name || 'OBJET').toUpperCase()}</Text>
        </View>
        {!isOwner ? (
          <Pressable
            onPress={async () => {
              try {
                await favorites.toggle(item.id);
              } catch (err) {
                Alert.alert('Favoris', err.message);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={favorites?.isFavorite(item.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            style={styles.favBtn}
          >
            <Text style={styles.favGlyph}>{favorites?.isFavorite(item.id) ? '♥' : '♡'}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {item.title}
      </Text>
      <Text style={styles.meta}>
        {item.city} · {CONDITION_LABELS[item.condition_state] || item.condition_state}
        {' · '}
        {STATUS_LABELS[item.status] || item.status}
      </Text>
      <Text style={styles.price}>{item.credit_price} crédits</Text>
      {currentUser ? <Text style={styles.meta}>Ton solde : {currentUser.credits} crédits</Text> : null}
      <Text style={styles.section}>Description</Text>
      <Text style={styles.body}>{item.description}</Text>
      <Text style={styles.section}>Publié par</Text>
      <Pressable
        onPress={() => navigation.navigate('UserProfile', { userId: item.user_id })}
        accessibilityRole="link"
        accessibilityLabel={`Voir le profil de ${item.first_name}`}
      >
        <Text style={styles.link}>
          {item.first_name} {item.last_name}
        </Text>
      </Pressable>

      {canContact ? (
        <Pressable
          style={styles.editButton}
          onPress={onContact}
          disabled={contacting}
          accessibilityRole="button"
          accessibilityLabel="Contacter le vendeur"
        >
          <Text style={styles.editText}>{contacting ? 'Ouverture…' : 'Contacter le vendeur'}</Text>
        </Pressable>
      ) : null}

      {canAcquire ? (
        <Pressable
          style={[styles.editButton, canContact && styles.secondButton]}
          onPress={onAcquire}
          disabled={acquiring}
          accessibilityRole="button"
          accessibilityLabel="Obtenir contre des crédits"
        >
          <Text style={styles.editText}>
            {acquiring ? 'En cours…' : `Obtenir pour ${item.credit_price} crédits`}
          </Text>
        </Pressable>
      ) : null}

      {isOwner ? (
        <>
          <Pressable
            style={styles.editButton}
            onPress={() => navigation.navigate('EditItem', { itemId: item.id })}
            accessibilityRole="button"
            accessibilityLabel="Modifier l'annonce"
          >
            <Text style={styles.editText}>Modifier l’annonce</Text>
          </Pressable>
          <Pressable
            style={styles.deleteButton}
            onPress={onDelete}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel="Supprimer l'annonce"
          >
            <Text style={styles.deleteText}>{deleting ? 'Suppression…' : 'Supprimer l’annonce'}</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  container: { padding: 20, gap: 8, maxWidth: 720, width: '100%', alignSelf: 'center', backgroundColor: colors.bg },
  hero: { width: '100%', height: 280, borderRadius: 18, backgroundColor: '#EEE8DC', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  favBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center'
  },
  favGlyph: { fontSize: 22, color: colors.orange },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.orange,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  tagText: { color: colors.white, fontFamily: fonts.sansBold, fontSize: 10, letterSpacing: 0.5 },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.ink },
  price: { fontFamily: fonts.serif, fontSize: 22, color: colors.orange, marginTop: 8 },
  meta: { color: colors.muted, fontFamily: fonts.sans },
  section: { marginTop: 16, fontFamily: fonts.sansBold, color: colors.ink },
  body: { fontSize: 16, lineHeight: 22, fontFamily: fonts.sans, color: colors.ink },
  error: { color: colors.orange, textAlign: 'center', fontFamily: fonts.sans },
  link: { color: colors.green, marginTop: 12, fontFamily: fonts.sansMed },
  editButton: {
    marginTop: 28,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.orange
  },
  secondButton: { marginTop: 12, backgroundColor: colors.green },
  editText: { color: colors.white, fontFamily: fonts.sansBold },
  deleteButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.orange
  },
  deleteText: { color: colors.orange, fontFamily: fonts.sansBold }
});
