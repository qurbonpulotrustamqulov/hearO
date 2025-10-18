<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-900 dark:to-purple-900 p-6"
  >
    <div
      class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-10 flex flex-col items-center max-w-lg w-full"
    >
      <ExclamationTriangleIcon
        class="w-20 h-20 text-yellow-400 mb-6 animate-bounce"
      />
      <h1
        class="text-5xl font-extrabold text-blue-700 dark:text-yellow-200 mb-4"
      >
        404
      </h1>
      <p class="text-2xl font-semibold text-blue-800 dark:text-yellow-100 mb-2">
        Page Not Found
      </p>
      <p class="text-lg text-gray-500 dark:text-gray-300 mb-8 text-center">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <button
        @click="goHome"
        class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-2xl shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200"
      >
        Go to Home
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'

const router = useRouter()
function goHome() {
  router.push('/')
}
</script>
