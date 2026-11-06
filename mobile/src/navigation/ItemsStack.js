import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { stackScreenOptions } from '../theme';
import ItemsScreen from '../screens/items/ItemsScreen';
import CreateItemScreen from '../screens/items/CreateItemScreen';
import ItemDetailScreen from '../screens/items/ItemDetailScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import ChatScreen from '../screens/messages/ChatScreen';

const Stack = createNativeStackNavigator();

export default function ItemsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ItemsList" component={ItemsScreen} options={{ headerShown: false, headerTransparent: true }} />
      <Stack.Screen name="CreateItem" component={CreateItemScreen} options={{ title: 'Publier' }} />
      <Stack.Screen name="EditItem" component={CreateItemScreen} options={{ title: 'Modifier' }} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Détail' }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profil' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Discussion' }} />
    </Stack.Navigator>
  );
}
