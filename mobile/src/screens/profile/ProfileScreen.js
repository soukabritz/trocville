import React, { useContext } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { AuthContext } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { currentUser, signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Profil
      </Text>
      {currentUser ? (
        <>
          <Text>{currentUser.firstName} {currentUser.lastName}</Text>
          <Text>{currentUser.email}</Text>
          <Text>{currentUser.mainCity}</Text>
          <Text style={styles.credits}>{currentUser.credits} crédits</Text>
        </>
      ) : null}
      <Pressable
        style={styles.button}
        onPress={signOut}
        accessibilityRole="button"
        accessibilityLabel="Se déconnecter"
      >
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8, maxWidth: 480, width: '100%', alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  credits: { fontSize: 18, fontWeight: '700', color: '#1f6f4a', marginTop: 8 },
  button: { backgroundColor: '#333', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: '600' }
});
