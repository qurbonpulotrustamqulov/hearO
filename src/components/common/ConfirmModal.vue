<template>
  <transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 relative flex flex-col items-center"
      >
        <ExclamationTriangleIcon class="w-12 h-12 text-yellow-500 mb-3" />
        <h2
          class="text-xl font-bold text-blue-800 dark:text-yellow-100 mb-2 text-center"
        >
          {{ title }}
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-6 text-center">
          {{ message }}
        </p>
        <div class="flex gap-3 w-full">
          <button
            @click="$emit('cancel')"
            class="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {{ cancelText || 'Cancel' }}
          </button>
          <button
            @click="$emit('confirm')"
            class="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            {{ confirmText || 'Confirm' }}
          </button>
        </div>
        <button
          @click="$emit('cancel')"
          class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <span class="sr-only">Close</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

defineProps<{
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
}>()

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
