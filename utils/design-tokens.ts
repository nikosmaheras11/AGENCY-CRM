/**
 * Design System Tokens
 * Production-grade design tokens for Agency Dashboard OS
 */

export const tokens = {
  colors: {
    surface: {
      cream: '#F5F5F0',
      mint: '#E8F5E3',
      lavender: '#E8E3F5',
      peach: '#F0EDE8',
      white: '#FFFFFF',
    },
    accent: {
      lime: '#E8FF00',
      coral: '#FF8B7B',
      sage: '#A8C5A0',
      periwinkle: '#C5B8E8',
    },
    text: {
      primary: '#0A0A0A',
      secondary: '#4A4A4A',
      tertiary: '#8A8A8A',
      disabled: '#BCBCBC',
    },
    interactive: {
      black: '#000000',
      hover: 'rgba(0, 0, 0, 0.05)',
      active: 'rgba(0, 0, 0, 0.1)',
      focus: 'rgba(232, 255, 0, 0.2)',
    },
    status: {
      success: '#A8C5A0',
      warning: '#FFB366',
      error: '#FF8B7B',
      info: '#7BB8FF',
    }
  },
  
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },
  
  radius: {
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    full: '9999px',
  },
  
  typography: {
    display: {
      size: '4.5rem',      // 72px
      weight: 700,
      lineHeight: 0.9,
      letterSpacing: '-0.02em',
    },
    metric: {
      size: '3.5rem',      // 56px
      weight: 700,
      lineHeight: 1,
      letterSpacing: '-0.01em',
    },
    heading: {
      size: '1.875rem',    // 30px
      weight: 500,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    body: {
      size: '0.875rem',    // 14px
      weight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
    },
    caption: {
      size: '0.75rem',     // 12px
      weight: 400,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    },
  },
  
  shadows: {
    card: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
    cardHover: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
    focus: '0 0 0 3px rgba(232, 255, 0, 0.3)',
  },
  
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const

export type DesignTokens = typeof tokens
