import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { stackScreenOptions } from '../theme';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ChatScreen from '../screens/messages/ChatScreen';

const Stack = createNativeStackNavigator();

export default function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ConversationList" component={MessagesScreen} options={{ headerShown: false, headerTransparent: true }} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({ title: route.params?.title || 'Discussion' })}
      />
    </Stack.Navigator>
  );
}
