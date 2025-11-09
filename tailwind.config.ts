import type { Config } from 'tailwindcss'

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
          primary: '#0A0A0A',
          secondary: '#4A4A4A',
          tertiary: '#8A8A8A',
          disabled: '#BCBCBC',
        },
        // Legacy colors for backward compatibility
        creative: '#8B5CF6',
        performance: '#10B981',
        design: '#F59E0B',
        resources: '#3B82F6'
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
        'focus-lime': '0 0 0 3px rgba(232, 255, 0, 0.3)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      fontFamily: {
        display: ['Inter Tight', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
} satisfies Config
