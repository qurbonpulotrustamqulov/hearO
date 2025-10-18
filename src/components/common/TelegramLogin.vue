<template>
  <div class="flex flex-col items-center justify-center">
    <div ref="telegramButton"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

// Define the Telegram user interface
interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

// Extend the Window interface to include our callback
declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void
  }
}

const emit = defineEmits(['login-success', 'login-error'])
const telegramButton = ref<HTMLElement | null>(null)
const error = ref<string>('')

onMounted(() => {
  try {
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', 'farxodReminder_bot')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-lang', 'en')
    script.setAttribute('data-radius', '8')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.async = true

    window.onTelegramAuth = function (user: TelegramUser) {
      if (user) {
        error.value = ''
        console.log(user)
        emit('login-success', user)
      } else {
        error.value = 'Authentication failed. Please try again.'
        emit('login-error', 'Authentication failed')
      }
    }

    // Add error handling for script loading
    script.onerror = () => {
      error.value =
        'Failed to load Telegram login widget. Please check your domain configuration.'
      emit('login-error', 'Widget load failed')
    }

    if (telegramButton.value) {
      telegramButton.value.innerHTML = ''
      telegramButton.value.appendChild(script)
    }
  } catch (e) {
    error.value = 'An error occurred while initializing Telegram login.'
    emit('login-error', e)
  }
})
</script>

<style scoped>
/* Hide iframe border if present */
:deep(iframe) {
  border: none !important;
}
</style>
