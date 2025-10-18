<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-4">{{ t('letters.title') }}</h1>
    <p class="text-gray-700">
      {{ t('letters.description') }}
    </p>
    <!-- Add your content here -->
  </div>
</template>

<style scoped></style>
