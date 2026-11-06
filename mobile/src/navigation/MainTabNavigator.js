import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UnreadContext } from '../context/UnreadContext';
import { colors, fonts } from '../theme';

import HomeScreen from '../screens/home/HomeScreen';
import ItemsStack from './ItemsStack';
import TradesScreen from '../screens/trades/TradesScreen';
import MessagesStack from './MessagesStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

const ICONS = {
  Accueil: ['home', 'home-outline'],
  Annonces: ['grid', 'grid-outline'],
  Échanges: ['swap-horizontal', 'swap-horizontal-outline'],
  Messages: ['chatbubble', 'chatbubble-outline'],
  Profil: ['person', 'person-outline']
};

export default function MainTabNavigator() {
  const { unreadCount } = useContext(UnreadContext) || { unreadCount: 0 };
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.tabIdle,
        tabBarLabelStyle: { fontFamily: fonts.sansMed, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.cream,
          borderTopColor: colors.line,
          height: 52 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
          paddingHorizontal: 10
        },
        tabBarIcon: ({ focused, color, size }) => {
          const pair = ICONS[route.name] || ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? pair[0] : pair[1]} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Annonces" component={ItemsStack} />
      <Tab.Screen name="Échanges" component={TradesScreen} />
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.orange, color: colors.white, fontFamily: fonts.sansBold }
        }}
      />
      <Tab.Screen name="Profil" component={ProfileStack} />
    </Tab.Navigator>
  );
}
