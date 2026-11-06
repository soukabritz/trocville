import { View } from 'react-native';

// Premier enfant natif de l'écran. S'il est absent, iOS force la liste
// à se décaler sous le bandeau : le contenu part au-dessus et rebondit.
export default function StackScrollGuard() {
  return (
    <View
      collapsable={false}
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, width: 4, height: 4, opacity: 0 }}
    />
  );
}
