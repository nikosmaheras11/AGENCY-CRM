// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt'
  ],

  runtimeConfig: {
    // Private keys (server-side only - never exposed to client)
    slackBotToken: process.env.SLACK_BOT_TOKEN,
    slackClientSecret: process.env.SLACK_CLIENT_SECRET,
    slackSigningSecret: process.env.SLACK_SIGNING_SECRET,
    slackChannelCreative: process.env.SLACK_CHANNEL_CREATIVE,
    slackChannelPerformance: process.env.SLACK_CHANNEL_PERFORMANCE,
    slackChannelRequests: process.env.SLACK_CHANNEL_REQUESTS,
    slackChannelUgc: process.env.SLACK_CHANNEL_UGC,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    figmaAccessToken: process.env.FIGMA_ACCESS_TOKEN,
    
    // Public keys (exposed to client - safe for browser)
    public: {
      siteUrl: process.env.PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      slackClientId: process.env.SLACK_CLIENT_ID || ''
    }
  },

  typescript: {
    strict: false,
    typeCheck: false,
    tsConfig: {
      compilerOptions: {
        noImplicitAny: false,
        strictNullChecks: false
      }
    }
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts'
  }
})
