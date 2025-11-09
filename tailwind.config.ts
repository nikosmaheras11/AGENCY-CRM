import type { Config } from 'tailwindcss'

export default {
  content: [
    './frontend/components/**/*.{js,vue,ts}',
    './frontend/layouts/**/*.vue',
    './frontend/pages/**/*.vue',
    './frontend/plugins/**/*.{js,ts}',
    './frontend/app.vue'
  ],
  theme: {
    extend: {
      colors: {
        creative: '#8B5CF6',
        performance: '#10B981',
        design: '#F59E0B',
        resources: '#3B82F6'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
} satisfies Config
