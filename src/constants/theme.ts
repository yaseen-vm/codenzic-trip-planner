export const COLORS = {
  background: '#F3F5F7',
  white: '#FFFFFF',
  text: '#111F2C',
  muted: '#7C8B99',
  faint: '#A9B4BE',
  placeholder: '#9CA3AF',
  border: '#E6EBEF',
  orange: '#F1521F',
  orangeDark: '#D3410F',
  paleOrange: '#FDEBE3',
  dark: '#17212F',
  banner: 'rgba(17,31,44,0.9)',
  overlay: 'rgba(17,31,44,0.55)',
  noticeBackground: '#FFF5E9',
  noticeText: '#8B4B17',
  mapBackground: '#E9E3D9',
} as const;

export const FONTS = {
  regular: 'NunitoSans_400Regular',
  semiBold: 'NunitoSans_600SemiBold',
  bold: 'NunitoSans_700Bold',
  extraBold: 'NunitoSans_800ExtraBold',
} as const;

export const RADIUS = { control: 16, card: 24, sheet: 28, notice: 12 } as const;

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;

export const SIZES = {
  button: 56,
  floatingButton: 44,
  iconSm: 16,
  iconMd: 18,
  iconLg: 24,
} as const;

// Elevation presets shared by floating controls and sheets.
export const SHADOWS = {
  floating: {
    elevation: 3,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sheet: {
    elevation: 8,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  subtle: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
} as const;
