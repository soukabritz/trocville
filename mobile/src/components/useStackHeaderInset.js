import { Platform } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';

// iOS 26 dessine l'écran sous le bandeau, même s'il est opaque.
// Sans ce décalage, le haut de la page est caché et le scroll rebondit.
export default function useStackHeaderInset() {
  const headerHeight = useHeaderHeight();
  if (Platform.OS !== 'ios') {
    return 0;
  }
  const major = parseInt(String(Platform.Version), 10);
  if (!Number.isFinite(major) || major < 26) {
    return 0;
  }
  return headerHeight || 0;
}
