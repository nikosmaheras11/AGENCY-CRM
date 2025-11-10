import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './utils/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        // Elevated Design System Colors
        primary: {
          500: '#4318FF',
          400: '#7551FF',
        },
        success: '#01B574',
        error: '#E31A1A',
        teal: {
          300: '#4FD1C5',
        },
        blue: {
          400: '#4299E1',
        },
        orange: {
          300: '#F6AD55',
        },
        gray: {
          300: '#CBD5E0',
          400: '#A0AEC0',
          500: '#718096',
          700: '#2D3748',
        },
        // Dark mode backgrounds - Deep navy/blue from Figma
        dark: {
          primary: '#0B0F29',    // Main background - darker
          secondary: '#111C44',  // Card background
          tertiary: '#1A2849',   // Elevated card
        },
        // Legacy colors for backward compatibility
        surface: {
          cream: '#F5F5F0',
          mint: '#E8F5E3',
          lavender: '#E8E3F5',
          peach: '#F0EDE8',
        },
        accent: {
          lime: '#E8FF00',
          coral: '#FF8B7B',
          sage: '#A8C5A0',
          periwinkle: '#C5B8E8',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0AEC0',
          tertiary: '#718096',
          disabled: '#BCBCBC',
        },
        creative: '#8B5CF6',
        performance: '#10B981',
        design: '#F59E0B',
        resources: '#3B82F6'
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4318FF, #7551FF)',
        'gradient-dark': 'linear-gradient(159deg, #0B0F29 0%, #0D1333 100%)',
        'gradient-teal': 'linear-gradient(90deg, #4318FF, #4FD1C5)',
        'gradient-card': 'linear-gradient(127deg, rgba(6, 11, 38, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)',
        'gradient-sidebar': 'linear-gradient(111.84deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0) 100%)',
        'pattern': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NGgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEg0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')",
      },
      backdropBlur: {
        'xl': '40px',
      },
      boxShadow: {
        'elevated': '0 20px 27px rgba(0, 0, 0, 0.05)',
        'primary': '0 4px 12px rgba(67, 24, 255, 0.3)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
        'focus-lime': '0 0 0 3px rgba(232, 255, 0, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      fontFamily: {
        display: ['Helvetica Neue', 'Inter Tight', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['Helvetica Neue', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    }
  },
  plugins: [
    forms,
    typography
  ]
} satisfies Config
