<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import LangSelect from '@/components/common/LangSelect.vue'
import TelegramLogin from '@/components/common/TelegramLogin.vue'
import { useLogin } from './queries/useLogin'
import { useAuthStore } from '@/store/auth.store'
import { useTelegramLogin } from './queries/useTelegramLogin'
import type { APIError, TelegramUser } from './types'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

// Form state
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const errorMessage = ref('')

// Validation errors
const errors = ref<{ [key: string]: string }>({})

// Login mutation hook
const { mutate: loginMutation, isPending: isLoggingIn } = useLogin()
const telegramLoginMutation = useTelegramLogin()

const validateForm = () => {
  errors.value = {}

  if (!email.value) {
    errors.value.email = t('auth.emailRequired') || 'Email is required'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      errors.value.email = t('auth.invalidEmail') || 'Invalid email format'
    }
  }

  if (!password.value) {
    errors.value.password = t('auth.passwordRequired') || 'Password is required'
  }

  return Object.keys(errors.value).length === 0
}

const handleLogin = () => {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  loginMutation(
    {
      email: email.value,
      password: password.value,
    },
    {
      onSuccess: (data) => {
        // Store tokens in auth store
        auth.setTokens(data.access, data.refresh)

        if (rememberMe.value) {
          localStorage.setItem('remember_me', 'true')
        }

        // Get redirect path from queries params or default to dashboard
        const redirectPath =
          (router.currentRoute.value.query.redirect as string) || '/dashboard'
        router.push(redirectPath)
      },
      onError: (err: APIError) => {
        errorMessage.value =
          err.response?.data?.error ||
          t('auth.loginFailed') ||
          'Login failed. Please check your credentials.'
      },
    }
  )
}

const handleTelegramLogin = (user: TelegramUser) => {
  telegramLoginMutation.mutate(user)
}

const goToRegister = () => {
  router.push('/auth/register')
}

const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
  >
    <!-- Language selector -->
    <div
      class="z-50 absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md"
    >
      <LangSelect />
    </div>

    <div class="max-w-md w-full mx-auto">
      <!-- Logo/App name -->
      <div class="text-center mb-8">
        <h2
          class="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
          @click="goToHome"
          style="cursor: pointer"
        >
          Koxlear
        </h2>
        <p class="mt-2 text-gray-600">
          {{ t('auth.loginSubtitle') || 'Continue your learning journey' }}
        </p>
      </div>

      <!-- Login Form -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- Form header -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <h1 class="text-xl font-bold text-white">
            {{ t('auth.login') || 'Login' }}
          </h1>
        </div>

        <div class="p-6">
          <form @submit.prevent="handleLogin">
            <!-- Error message -->
            <div
              v-if="errorMessage"
              class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm"
            >
              {{ errorMessage }}
            </div>

            <!-- Email field -->
            <div class="mb-4">
              <label
                class="block text-gray-700 text-sm font-medium mb-2"
                for="email"
              >
                {{ t('auth.email') }}
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.email }"
                :placeholder="t('auth.emailPlaceholder')"
              />
              <p v-if="errors.email" class="mt-1 text-xs text-red-500">
                {{ errors.email }}
              </p>
            </div>

            <!-- Password field -->
            <div class="mb-4">
              <div class="flex justify-between items-center mb-2">
                <label
                  class="block text-gray-700 text-sm font-medium"
                  for="password"
                >
                  {{ t('auth.password') }}
                </label>
                <a href="#" class="text-sm text-blue-600 hover:text-blue-800">
                  {{ t('auth.forgotPassword') }}
                </a>
              </div>
              <input
                id="password"
                v-model="password"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.password }"
                :placeholder="t('auth.passwordPlaceholder')"
              />
              <p v-if="errors.password" class="mt-1 text-xs text-red-500">
                {{ errors.password }}
              </p>
            </div>

            <!-- Remember me -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  v-model="rememberMe"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  for="remember-me"
                  class="ml-2 block text-sm text-gray-700"
                >
                  {{ t('auth.rememberMe') }}
                </label>
              </div>
            </div>

            <!-- Login button -->
            <Button
              type="submit"
              class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              :disabled="isLoggingIn"
            >
              <span v-if="isLoggingIn">{{ t('auth.loggingIn') }}</span>
              <span v-else>{{ t('auth.login') }}</span>
            </Button>
          </form>
        </div>
      </div>

      <!-- Telegram login button -->
      <div class="mt-6 text-center">
        <p class="text-gray-600 mb-2">
          {{ t('auth.orLoginWith') }}
        </p>
        <TelegramLogin @login-success="handleTelegramLogin" />
      </div>

      <!-- Register link -->
      <div class="text-center mt-6">
        <p class="text-gray-600">
          {{ t('auth.noAccount') }}
          <span
            class="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            @click="goToRegister"
          >
            {{ t('auth.signUp') }}
          </span>
        </p>
      </div>

      <!-- Continue as guest -->
      <div class="text-center mt-4">
        <a
          @click="goToHome"
          class="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
        >
          {{ t('auth.continueAsGuest') }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hover animations */
button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
}

/* Focus states for better accessibility */
input:focus {
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}
</style>
