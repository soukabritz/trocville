import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { stackScreenOptions } from '../theme';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import ItemDetailScreen from '../screens/items/ItemDetailScreen';
import CreateItemScreen from '../screens/items/CreateItemScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import FavoritesScreen from '../screens/profile/FavoritesScreen';
import LegalScreen from '../screens/legal/LegalScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ProfileHome" component={UserProfileScreen} options={{ headerShown: false, headerTransparent: true }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Modifier' }} />
      <Stack.Screen name="Legal" component={LegalScreen} options={{ title: 'Informations' }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoris' }} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Détail' }} />
      <Stack.Screen name="EditItem" component={CreateItemScreen} options={{ title: 'Modifier' }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profil' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Discussion' }} />
    </Stack.Navigator>
  );
}
