export const colors = {
  bg: '#F4EFE6',
  cream: '#FBFAF6',
  ink: '#1C1917',
  muted: '#6F6860',
  orange: '#E24B3A',
  green: '#2F7A4F',
  yellow: '#F0C43A',
  blue: '#8BB8E8',
  pink: '#F3B7C9',
  mint: '#C3E4A8',
  line: '#E6DFD4',
  white: '#FFFFFF',
  tabIdle: '#9A938A'
};

export const fonts = {
  serif: 'Fraunces_700Bold',
  serifMed: 'Fraunces_600SemiBold',
  sans: 'DMSans_400Regular',
  sansMed: 'DMSans_500Medium',
  sansBold: 'DMSans_700Bold'
};

export const CARD_BORDERS = [colors.orange, colors.yellow, colors.blue, colors.green];

export const categoryPalette = [
  { bg: colors.yellow },
  { bg: colors.blue },
  { bg: colors.pink },
  { bg: colors.mint }
];

export const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.ink,
  headerTitleStyle: { fontFamily: fonts.serif, fontSize: 18 },
  headerShadowVisible: false,
  headerTransparent: false,
  contentStyle: { backgroundColor: colors.bg }
};

export function initials(firstName, lastName) {
  const a = (firstName || '').trim().charAt(0);
  const b = (lastName || '').trim().charAt(0);
  return `${a}${b}`.toUpperCase() || '?';
}

export function avatarColor(seed) {
  const palette = [colors.blue, colors.yellow, colors.pink, colors.mint];
  const n = Number(seed) || 0;
  return palette[Math.abs(n) % palette.length];
}
