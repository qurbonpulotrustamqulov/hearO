<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import LangSelect from '@/components/common/LangSelect.vue'
import {
  useSendOtp,
  useVerifyOtp,
  useRegister,
  useCheckEmail,
} from '@/pages/auth/queries'
import { useAuthStore } from '@/store/auth.store'
import type { APIError } from './types'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

// Stepper state
const step = ref(1)
const successMessage = ref('')
const errorMessage = ref('')

// Step 1: Email
const email = ref('')

// Step 2: OTP
const otp = ref('')
const session = ref('')

// Step 3: Registration fields
const firstName = ref('')
const lastName = ref('')
const password = ref('')
const confirmPassword = ref('')

// Validation errors
const errors = ref<{ [key: string]: string }>({})

// --- useCheckEmail hook ---
const { mutate: checkEmailMutation, isPending: isCheckingEmail } =
  useCheckEmail()

// --- useSendOtp hook ---
const { mutate: sendOtp, isPending: isSendingOtp } = useSendOtp()

// --- useVerifyOtp hook ---
const { mutate: verifyOtpMutation, isPending: isVerifyingOtp } = useVerifyOtp()

// --- useRegister hook ---
const { mutate: registerMutation, isPending: isRegistering } = useRegister()

// Step 1: Send OTP (with email availability check)
const handleSendOTP = () => {
  errorMessage.value = ''
  successMessage.value = ''
  errors.value = {}

  if (!email.value) {
    errors.value.email = t('auth.emailRequired') || 'Email is required'
    return
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errors.value.email = t('auth.invalidEmail') || 'Invalid email'
    return
  }

  // First check if email is available
  checkEmailMutation(
    { email: email.value },
    {
      onSuccess: (data) => {
        if (!data.is_available) {
          // Email is already taken
          errors.value.email =
            t('auth.emailTaken') || 'This email is already registered'
          return
        }

        // Email is available, proceed to send OTP
        sendOtp(
          { email: email.value },
          {
            onSuccess: (otpData) => {
              session.value = otpData.session
              step.value = 2
              successMessage.value =
                t('auth.otpSent') || 'OTP sent to your email.'
            },
            onError: (err: APIError) => {
              errorMessage.value =
                err.response?.data?.error ||
                t('auth.otpSendFailed') ||
                'Failed to send OTP.'
            },
          }
        )
      },
    }
  )
}

// Step 2: Verify OTP
const handleVerifyOTP = () => {
  errorMessage.value = ''
  successMessage.value = ''
  errors.value = {}
  if (!otp.value) {
    errors.value.otp = t('auth.otpRequired') || 'OTP is required'
    return
  }

  verifyOtpMutation(
    { session: session.value, code: otp.value },
    {
      onSuccess: () => {
        step.value = 3
        successMessage.value =
          t('auth.otpVerified') || 'OTP verified. Continue registration.'
      },
      onError: (err: APIError) => {
        errorMessage.value =
          err.response?.data?.error ||
          t('auth.otpVerifyFailed') ||
          'OTP verification failed.'
      },
    }
  )
}

// Step 3: Register
const handleRegister = () => {
  errorMessage.value = ''
  successMessage.value = ''
  errors.value = {}
  // Validate fields
  if (!firstName.value) {
    errors.value.firstName = t('auth.nameRequired') || 'Name is required'
  }
  if (!lastName.value) {
    errors.value.lastName =
      t('auth.lastNameRequired') || 'Last name is required'
  }
  if (!password.value) {
    errors.value.password = t('auth.passwordRequired') || 'Password is required'
  } else if (password.value.length < 8) {
    errors.value.password =
      t('auth.passwordMin') || 'Password must be at least 8 characters'
  }
  if (!confirmPassword.value) {
    errors.value.confirmPassword =
      t('auth.confirmPasswordRequired') || 'Please confirm your password'
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword =
      t('auth.passwordMatch') || 'Passwords must match'
  }
  if (Object.keys(errors.value).length > 0) {
    return
  }

  registerMutation(
    {
      email: email.value,
      password: password.value,
      first_name: firstName.value,
      last_name: lastName.value,
      session: session.value,
    },
    {
      onSuccess: (data) => {
        // Set tokens in auth store
        auth.setTokens(data.access, data.refresh)
        auth.setUser({
          id: 1,
          email: email.value,
          firstName: firstName.value,
        })

        successMessage.value =
          t('auth.registerSuccess') || 'Account created successfully!'
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      },
      onError: (err: APIError) => {
        errorMessage.value =
          err.response?.data?.error ||
          t('auth.registerFailed') ||
          'Registration failed. Please try again.'
      },
    }
  )
}

const goToLogin = () => {
  router.push('/auth/login')
}

const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <!-- Language selector -->
    <div class="absolute top-4 right-4">
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
          {{ t('auth.registerSubtitle') || 'Start your learning journey' }}
        </p>
      </div>

      <!-- Register Form -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- Form header -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <h1 class="text-xl font-bold text-white">
            {{ t('auth.register') || 'Register' }}
          </h1>
        </div>

        <div class="p-6">
          <!-- Success message -->
          <div
            v-if="successMessage"
            class="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm"
          >
            {{ successMessage }}
          </div>

          <!-- Error message -->
          <div
            v-if="errorMessage"
            class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm"
          >
            {{ errorMessage }}
          </div>

          <!-- Step 1: Email -->
          <form v-if="step === 1" @submit.prevent="handleSendOTP">
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
            <Button
              type="submit"
              class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              :disabled="isCheckingEmail || isSendingOtp"
            >
              <span v-if="isCheckingEmail">{{
                t('auth.checkingEmail') || 'Checking email...'
              }}</span>
              <span v-else-if="isSendingOtp">{{
                t('auth.sendingOtp') || 'Sending OTP...'
              }}</span>
              <span v-else>{{ t('auth.sendOtp') || 'Send OTP' }}</span>
            </Button>
          </form>

          <!-- Step 2: Verify OTP -->
          <form v-else-if="step === 2" @submit.prevent="handleVerifyOTP">
            <div class="mb-4">
              <label
                class="block text-gray-700 text-sm font-medium mb-2"
                for="otp"
              >
                {{ t('auth.otp') }}
              </label>
              <input
                id="otp"
                v-model="otp"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.otp }"
                :placeholder="t('auth.otpPlaceholder')"
              />
              <p v-if="errors.otp" class="mt-1 text-xs text-red-500">
                {{ errors.otp }}
              </p>
            </div>
            <Button
              type="submit"
              class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              :disabled="isVerifyingOtp"
            >
              <span v-if="isVerifyingOtp">{{ t('auth.verifyingOtp') }}</span>
              <span v-else>{{ t('auth.verifyOtp') }}</span>
            </Button>
          </form>

          <!-- Step 3: Register -->
          <form v-else @submit.prevent="handleRegister">
            <div class="mb-4">
              <label
                class="block text-gray-700 text-sm font-medium mb-2"
                for="firstName"
              >
                {{ t('auth.name') }}
              </label>
              <input
                id="firstName"
                v-model="firstName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.firstName }"
                :placeholder="t('auth.namePlaceholder')"
              />
              <p v-if="errors.firstName" class="mt-1 text-xs text-red-500">
                {{ errors.firstName }}
              </p>
            </div>
            <div class="mb-4">
              <label
                class="block text-gray-700 text-sm font-medium mb-2"
                for="lastName"
              >
                {{ t('auth.lastName') }}
              </label>
              <input
                id="lastName"
                v-model="lastName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.lastName }"
                :placeholder="t('auth.lastNamePlaceholder')"
              />
              <p v-if="errors.lastName" class="mt-1 text-xs text-red-500">
                {{ errors.lastName }}
              </p>
            </div>
            <div class="mb-4">
              <label
                class="block text-gray-700 text-sm font-medium mb-2"
                for="password"
              >
                {{ t('auth.password') }}
              </label>
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
            <div class="mb-4">
              <label
                class="block text-gray-700 text-sm font-medium mb-2"
                for="confirmPassword"
              >
                {{ t('auth.confirmPassword') }}
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :class="{ 'border-red-500': errors.confirmPassword }"
                :placeholder="t('auth.confirmPasswordPlaceholder')"
              />
              <p
                v-if="errors.confirmPassword"
                class="mt-1 text-xs text-red-500"
              >
                {{ errors.confirmPassword }}
              </p>
            </div>
            <Button
              type="submit"
              class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
              :disabled="isRegistering"
            >
              <span v-if="isRegistering">{{ t('auth.registering') }}</span>
              <span v-else>{{ t('auth.register') }}</span>
            </Button>
          </form>
        </div>
      </div>

      <!-- Login link -->
      <div class="text-center mt-6">
        <p class="text-gray-600">
          {{ t('auth.alreadyHaveAccount') || 'Already have an account?' }}
          <span
            class="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            @click="goToLogin"
          >
            {{ t('auth.login') || 'Login' }}
          </span>
        </p>
      </div>

      <!-- Continue as guest -->
      <div class="text-center mt-4">
        <a
          @click="goToHome"
          class="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
        >
          {{ t('auth.continueAsGuest') || 'Continue as guest' }}
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

/* Disabled button styling */
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
</style>
