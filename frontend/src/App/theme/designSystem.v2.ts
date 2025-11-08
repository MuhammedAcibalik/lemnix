export const spacing = {
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '6': 24,
  '8': 32,
  '12': 48,
  '16': 64,
  '24': 96,
  '32': 128
} as const;
export const spacingLegacy = {
  xs: spacing['2'],
  sm: spacing['4'],
  md: spacing['6'],
  lg: spacing['8'],
  xl: spacing['12'],
  xxl: spacing['16']
} as const;
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    main: '#1e40af',
    light: '#3b82f6',
    dark: '#1e3a8a',
    contrast: '#ffffff'
  },
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#059669',
    900: '#166534',
    main: '#059669',
    light: '#22c55e',
    dark: '#15803d',
    contrast: '#ffffff'
  },
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    main: '#7c3aed',
    light: '#a855f7',
    dark: '#6b21a8',
    contrast: '#ffffff'
  },
  support: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    contrast: '#ffffff'
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  surface: {
    base: '#ffffff',
    elevated1: '#f8fafc',
    elevated2: '#f1f5f9',
    elevated3: '#e2e8f0',
    overlay: 'rgba(15, 23, 42, 0.5)'
  },
  status: {
    optimal: {
      50: '#f0fdf4',
      500: '#059669',
      700: '#15803d',
      main: '#059669'
    },
    efficient: {
      50: '#eff6ff',
      500: '#3b82f6',
      700: '#1d4ed8',
      main: '#3b82f6'
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      700: '#d97706',
      main: '#f59e0b'
    },
    critical: {
      50: '#fef2f2',
      500: '#ef4444',
      700: '#dc2626',
      main: '#ef4444'
    }
  },
  success: {
    50: '#f0fdf4',
    300: '#86efac',
    500: '#059669',
    700: '#15803d',
    main: '#059669'
  },
  warning: {
    50: '#fffbeb',
    300: '#fcd34d',
    500: '#f59e0b',
    700: '#d97706',
    main: '#f59e0b'
  },
  error: {
    50: '#fef2f2',
    300: '#fca5a5',
    500: '#ef4444',
    700: '#dc2626',
    main: '#ef4444'
  },
  info: {
    50: '#eff6ff',
    300: '#93c5fd',
    500: '#1e40af',
    700: '#1e3a8a',
    main: '#1e40af'
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff'
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    disabled: '#94a3b8',
    inverse: '#ffffff'
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  }
} as const;
export const typography = {
  fontFamily: {
    primary: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    mono: '"Fira Code", "Consolas", "Monaco", monospace',
    display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    heading: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
  },
  display: {
    large: {
      fontSize: '4.5rem',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.03em'
    },
    medium: {
      fontSize: '3.75rem',
      fontWeight: 800,
      lineHeight: 1.15,
      letterSpacing: '-0.02em'
    },
    small: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em'
    }
  },
  heading: {
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0em'
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0em'
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0em'
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0em'
    }
  },
  body: {
    large: {
      fontSize: '1.125rem',
      fontWeight: 400,
      lineHeight: 1.7,
      letterSpacing: '0em'
    },
    base: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0em'
    },
    small: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0em'
    }
  },
  label: {
    prominent: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'uppercase' as const
    },
    default: {
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as const
    }
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem'
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },
  h1: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.025em' },
  h2: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.025em' },
  h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0em' },
  h4: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0em' },
  h5: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0em' },
  h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0em' },
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
  body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
  button: { fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.02857em' },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66 },
  overline: { fontSize: '0.75rem', fontWeight: 400, textTransform: 'uppercase' as const, letterSpacing: '0.08333em' }
} as const;
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
  button: 8,
  card: 12,
  input: 8,
  modal: 16,
  chip: 16
} as const;
export const shadows = {
  none: 'none',
  soft: {
    sm: '0 1px 2px rgba(30, 64, 175, 0.04)',
    md: '0 4px 8px rgba(30, 64, 175, 0.08)',
    lg: '0 8px 16px rgba(30, 64, 175, 0.12)',
    xl: '0 16px 32px rgba(30, 64, 175, 0.16)',
    '2xl': '0 24px 48px rgba(30, 64, 175, 0.20)'
  },
  crisp: {
    sm: '0 1px 3px rgba(15, 23, 42, 0.1)',
    md: '0 2px 6px rgba(15, 23, 42, 0.15)',
    lg: '0 4px 12px rgba(15, 23, 42, 0.2)',
    xl: '0 8px 24px rgba(15, 23, 42, 0.25)',
    '2xl': '0 12px 32px rgba(15, 23, 42, 0.3)'
  },
  glow: {
    primary: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)',
    success: '0 0 20px rgba(5, 150, 105, 0.3), 0 0 40px rgba(5, 150, 105, 0.1)',
    warning: '0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.1)',
    error: '0 0 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1)',
    accent: '0 0 20px rgba(124, 58, 237, 0.3), 0 0 40px rgba(124, 58, 237, 0.1)'
  },
  inner: {
    sm: 'inset 0 1px 2px rgba(15, 23, 42, 0.1)',
    md: 'inset 0 2px 4px rgba(15, 23, 42, 0.15)'
  },
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  button: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
} as const;
export const transitions = {
  duration: {
    instant: '100ms',
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    slower: '500ms'
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  },
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  all: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  colors: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), color 200ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)'
} as const;
export const componentSizes = {
  button: {
    small: { height: 28, padding: '4px 10px', fontSize: '0.75rem', gap: spacing['1'] },
    medium: { height: 36, padding: '6px 14px', fontSize: '0.8125rem', gap: spacing['2'] },
    large: { height: 42, padding: '8px 18px', fontSize: '0.875rem', gap: spacing['2'] }
  },
  input: {
    small: { height: 28, padding: '4px 10px', fontSize: '0.75rem' },
    medium: { height: 36, padding: '6px 12px', fontSize: '0.8125rem' },
    large: { height: 42, padding: '8px 14px', fontSize: '0.875rem' }
  },
  avatar: {
    small: { width: 28, height: 28 },
    medium: { width: 36, height: 36 },
    large: { width: 48, height: 48 },
    xlarge: { width: 56, height: 56 }
  },
  icon: {
    xs: 12,
    small: 14,
    sm: 16,
    medium: 18,
    large: 22,
    xlarge: 28
  }
} as const;
export const gradients = {
  primary: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
  primaryReverse: 'linear-gradient(135deg, #7c3aed 0%, #1e40af 100%)',
  primaryHover: 'linear-gradient(135deg, #1e3a8a 0%, #6b21a8 100%)',
  primarySoft: 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
  secondary: 'linear-gradient(135deg, #059669 0%, #22c55e 100%)',
  secondaryReverse: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)',
  secondarySoft: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
  accent: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  accentReverse: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
  support: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  supportReverse: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  neutral: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  card: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  premium: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
  industrial: 'linear-gradient(135deg, #059669 0%, #1e40af 100%)',
  efficiency: 'linear-gradient(135deg, #f59e0b 0%, #059669 100%)',
  mesh: {
    primary: `
      radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(5, 150, 105, 0.1) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(124, 58, 237, 0.1) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(245, 158, 11, 0.1) 0px, transparent 50%)
    `,
    subtle: `
      radial-gradient(at 0% 0%, rgba(30, 64, 175, 0.05) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(5, 150, 105, 0.05) 0px, transparent 50%)
    `
  }
} as const;
export const glass = {
  background: 'rgba(255, 255, 255, 0.8)',
  backgroundDark: 'rgba(15, 23, 42, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderDark: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px) saturate(180%)',
  boxShadow: '0 8px 32px rgba(30, 64, 175, 0.12)'
} as const;
export const focus = {
  ring: '0 0 0 3px rgba(59, 130, 246, 0.3)',
  ringOffset: '0 0 0 1px white',
  ringError: '0 0 0 3px rgba(239, 68, 68, 0.3)',
  ringSuccess: '0 0 0 3px rgba(5, 150, 105, 0.3)'
} as const;
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
} as const;
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
} as const;
export const responsiveSpacing = {
  page: { xs: spacing['4'], md: spacing['6'], lg: spacing['8'] },
  section: { xs: spacing['6'], md: spacing['8'], lg: spacing['12'] },
  card: { xs: spacing['4'], md: spacing['6'] },
  component: spacing['4']
} as const;
export const withOpacity = (color: string, opacity: number): string => {
  const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${color}${opacityHex}`;
};
export const responsive = {
  spacing: (xs: keyof typeof spacing, md?: keyof typeof spacing, lg?: keyof typeof spacing) => ({
    xs: spacing[xs],
    ...(md && { md: spacing[md] }),
    ...(lg && { lg: spacing[lg] })
  }),
  fontSize: (xs: string, md?: string, lg?: string) => ({
    xs,
    ...(md && { md }),
    ...(lg && { lg })
  })
};
export const createGradient = (color1: string, color2: string, angle: number = 135): string => {
  return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
};
export const createGlow = (color: string, intensity: number = 0.3): string => {
  return `0 0 20px ${withOpacity(color, intensity)}, 0 0 40px ${withOpacity(color, intensity * 0.5)}`;
};

