<template>
  <div class="min-h-screen bg-[#0f1117] p-8">
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="bg-[#1a1d24] rounded-xl p-6 border border-white/10">
        <h1 class="text-2xl font-bold text-white mb-4">Auth Debug</h1>
        
        <div class="space-y-4 text-white">
          <div>
            <p class="text-gray-400 mb-2">Loading:</p>
            <p class="font-mono">{{ loading }}</p>
          </div>
          
          <div>
            <p class="text-gray-400 mb-2">User:</p>
            <pre class="bg-[#0f1117] p-4 rounded-lg overflow-auto">{{ JSON.stringify(user, null, 2) }}</pre>
          </div>
          
          <div>
            <p class="text-gray-400 mb-2">Profile:</p>
            <pre class="bg-[#0f1117] p-4 rounded-lg overflow-auto">{{ JSON.stringify(profile, null, 2) }}</pre>
          </div>
          
          <div>
            <p class="text-gray-400 mb-2">Display Name:</p>
            <p class="font-mono">{{ getDisplayName }}</p>
          </div>
          
          <div v-if="!user" class="border-t border-white/10 pt-4">
            <h2 class="text-xl font-bold mb-4">Sign In</h2>
            <form @submit.prevent="handleSignIn" class="space-y-4">
              <input
                v-model="email"
                type="email"
                placeholder="Email"
                class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white"
                required
              />
              <input
                v-model="password"
                type="password"
                placeholder="Password"
                class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white"
                required
              />
              <button
                type="submit"
                class="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg font-medium"
              >
                Sign In
              </button>
              <p v-if="signInError" class="text-red-400">{{ signInError }}</p>
            </form>
            
            <div class="mt-6">
              <h3 class="text-lg font-semibold mb-2">Or Sign Up</h3>
              <form @submit.prevent="handleSignUp" class="space-y-4">
                <input
                  v-model="signUpEmail"
                  type="email"
                  placeholder="Email"
                  class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white"
                  required
                />
                <input
                  v-model="signUpPassword"
                  type="password"
                  placeholder="Password"
                  class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white"
                  required
                />
                <input
                  v-model="fullName"
                  type="text"
                  placeholder="Full Name"
                  class="w-full bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 text-white"
                />
                <button
                  type="submit"
                  class="px-6 py-3 bg-success hover:bg-success/90 rounded-lg font-medium"
                >
                  Sign Up
                </button>
                <p v-if="signUpError" class="text-red-400">{{ signUpError }}</p>
                <p v-if="signUpSuccess" class="text-green-400">{{ signUpSuccess }}</p>
              </form>
            </div>
          </div>
          
          <div v-else class="border-t border-white/10 pt-4">
            <button
              @click="handleSignOut"
              class="px-6 py-3 bg-error hover:bg-error/90 rounded-lg font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, profile, loading, signIn, signUp, signOut, getDisplayName } = useAuth()

const email = ref('')
const password = ref('')
const signInError = ref('')

const signUpEmail = ref('')
const signUpPassword = ref('')
const fullName = ref('')
const signUpError = ref('')
const signUpSuccess = ref('')

async function handleSignIn() {
  signInError.value = ''
  const { error } = await signIn(email.value, password.value)
  if (error) {
    signInError.value = error.message
  }
}

async function handleSignUp() {
  signUpError.value = ''
  signUpSuccess.value = ''
  const { error } = await signUp(signUpEmail.value, signUpPassword.value, fullName.value)
  if (error) {
    signUpError.value = error.message
  } else {
    signUpSuccess.value = 'Account created! Check your email to confirm.'
  }
}

async function handleSignOut() {
  await signOut()
}
</script>
