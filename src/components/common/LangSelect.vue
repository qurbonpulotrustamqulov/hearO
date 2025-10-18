<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, watch, onMounted } from 'vue'
import { localeOptions } from '@/service/locale/locales'

const { locale } = useI18n()
const selectedLocale = ref(locale.value)

// Update the app locale when selection changes
watch(selectedLocale, (newLocale) => {
  locale.value = newLocale
  // Store the selected locale in localStorage
  localStorage.setItem('user-locale', newLocale)
})

// Initialize from localStorage if available
onMounted(() => {
  const savedLocale = localStorage.getItem('user-locale')
  if (
    savedLocale &&
    localeOptions.value.some((option) => option.value === savedLocale)
  ) {
    selectedLocale.value = savedLocale
  }
})
</script>

<template>
  <div class="lang-select">
    <select
      v-model="selectedLocale"
      class="bg-white/10 border border-white/20 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40"
      aria-label="Select language"
    >
      <option
        v-for="option in localeOptions"
        :key="option.id"
        :value="option.value"
        class="text-gray-800"
      >
        {{ option.name }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.lang-select select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  transition: all 0.2s;
}

.lang-select select:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
