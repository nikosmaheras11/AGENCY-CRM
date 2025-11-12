<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <!-- Logo/Branding -->
        <div class="logo-section">
          <div class="logo">
            <UIcon name="i-heroicons-building-office-2" class="logo-icon" />
          </div>
          <h1 class="app-title">Agency Dashboard OS</h1>
          <p class="app-subtitle">Sign in to access your dashboard</p>
        </div>

        <!-- Error Message -->
        <UAlert
          v-if="errorMessage"
          color="red"
          variant="soft"
          :title="errorMessage"
          :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'red', variant: 'link' }"
          @close="errorMessage = ''"
          class="error-alert"
        />

        <!-- Slack SSO Button -->
        <div class="auth-section">
          <UButton
            @click="signInWithSlack"
            :loading="isLoading"
            size="xl"
            block
            class="slack-button"
          >
            <template #leading>
              <svg viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg" class="slack-logo">
                <g fill="none" fill-rule="evenodd">
                  <path d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386" fill="#36C5F0"/>
                  <path d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387" fill="#2EB67D"/>
                  <path d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386" fill="#ECB22E"/>
                  <path d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336 0v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387V34.25a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387" fill="#E01E5A"/>
                </g>
              </svg>
            </template>
            Sign in with Slack
          </UButton>

          <div class="divider">
            <span>or</span>
          </div>

          <!-- Email Login (Optional - if you want to support it) -->
          <UButton
            variant="outline"
            size="xl"
            block
            @click="navigateTo('/login/email')"
            disabled
            class="email-button"
          >
            <template #leading>
              <UIcon name="i-heroicons-envelope" />
            </template>
            Sign in with Email
            <UBadge color="gray" variant="soft" size="xs" class="ml-2">Coming Soon</UBadge>
          </UButton>
        </div>

        <!-- Footer Links -->
        <div class="footer-links">
          <p class="help-text">
            Need help? <a href="mailto:support@yourcompany.com" class="link">Contact Support</a>
          </p>
          <p class="privacy-text">
            By signing in, you agree to our
            <a href="/privacy" class="link">Privacy Policy</a> and
            <a href="/terms" class="link">Terms of Service</a>
          </p>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section">
        <h3 class="features-title">Why use Agency Dashboard OS?</h3>
        <div class="features-grid">
          <div class="feature">
            <UIcon name="i-heroicons-lightning-bolt" class="feature-icon" />
            <h4>Real-time Collaboration</h4>
            <p>Stay synced with your team through Slack integration</p>
          </div>
          <div class="feature">
            <UIcon name="i-heroicons-chart-bar" class="feature-icon" />
            <h4>Performance Tracking</h4>
            <p>Monitor campaign metrics and analytics in one place</p>
          </div>
          <div class="feature">
            <UIcon name="i-heroicons-folder" class="feature-icon" />
            <h4>Asset Management</h4>
            <p>Organize and version control all your creative assets</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()
const { supabase } = useSupabase()
const isLoading = ref(false)
const errorMessage = ref('')

// Check for error in query params
onMounted(() => {
  const error = route.query.error as string
  if (error) {
    const errorMessages: Record<string, string> = {
      'slack_auth_failed': 'Slack authentication failed. Please try again.',
      'no_code': 'No authorization code received from Slack.',
      'token_exchange_failed': 'Failed to exchange authorization code. Please try again.',
      'user_info_failed': 'Failed to retrieve your Slack profile. Please try again.',
      'user_creation_failed': 'Failed to create your account. Please contact support.',
      'session_creation_failed': 'Failed to create session. Please try again.',
      'unexpected_error': 'An unexpected error occurred. Please try again.'
    }
    
    errorMessage.value = errorMessages[error] || 'An error occurred during sign in.'
  }
})

const signInWithSlack = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'slack_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('Slack OAuth error:', error)
      errorMessage.value = error.message || 'Failed to initiate Slack sign in'
      isLoading.value = false
    }
    // If successful, user will be redirected to Slack
  } catch (error: any) {
    console.error('Sign in error:', error)
    errorMessage.value = error.message || 'An error occurred during sign in'
    isLoading.value = false
  }
}

// Guest middleware will handle redirect if already logged in

definePageMeta({
  layout: false, // Don't use any layout for login page
  middleware: ['guest'] // Redirect to dashboard if already logged in
})
</script>

<style scoped>
.login-page {
  @apply min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4;
}

.login-container {
  @apply max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center;
}

.login-card {
  @apply bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12;
}

.logo-section {
  @apply text-center mb-8;
}

.logo {
  @apply inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4;
}

.logo-icon {
  @apply text-3xl text-white;
}

.app-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white mb-2;
}

.app-subtitle {
  @apply text-gray-600 dark:text-gray-400;
}

.error-alert {
  @apply mb-6;
}

.auth-section {
  @apply space-y-4;
}

.slack-button {
  @apply bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700;
}

.slack-logo {
  @apply w-5 h-5;
}

.divider {
  @apply relative my-6;
}

.divider::before {
  @apply absolute inset-0 flex items-center;
  content: '';
  border-top: 1px solid rgb(229 231 235);
}

.divider span {
  @apply relative flex justify-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2;
}

.email-button {
  @apply opacity-60 cursor-not-allowed;
}

.footer-links {
  @apply mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2 text-center;
}

.help-text,
.privacy-text {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.link {
  @apply text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline;
}

.features-section {
  @apply hidden lg:block;
}

.features-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-6;
}

.features-grid {
  @apply space-y-6;
}

.feature {
  @apply flex gap-4;
}

.feature-icon {
  @apply text-2xl text-blue-600 flex-shrink-0;
}

.feature h4 {
  @apply font-semibold text-gray-900 dark:text-white mb-1;
}

.feature p {
  @apply text-sm text-gray-600 dark:text-gray-400;
}
</style>
