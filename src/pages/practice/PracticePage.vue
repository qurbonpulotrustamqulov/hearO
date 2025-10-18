<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header with title and easy mode toggle -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ t('practice.title', 'Speech Practice') }}
        </h1>
      </div>

      <!-- Easy Mode Toggle -->
      <label
        class="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 border border-gray-200"
      >
        <input
          v-model="easyMode"
          type="checkbox"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span class="text-sm font-medium text-gray-700">
          {{ t('practice.easyMode', 'Easy Mode (Difficulty ≤ 2)') }}
        </span>
      </label>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center">
        <ArrowPathIcon class="animate-spin h-12 w-12 text-blue-500 mb-4" />
        <p class="text-gray-500">
          {{ t('practice.loading', 'Loading practice item...') }}
        </p>
      </div>
    </div>

    <!-- No data state (when no practice items available) -->
    <div
      v-else-if="!currentItem && !error"
      class="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center"
    >
      <div
        class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <MicrophoneIcon class="h-8 w-8 text-gray-400" />
      </div>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">
        {{ t('practice.noItems', 'No practice items available') }}
      </h2>
      <p class="text-gray-600 mb-6">
        {{
          t(
            'practice.noItemsDesc',
            'Try changing the difficulty setting or check back later.'
          )
        }}
      </p>
      <Button @click="refetch" class="bg-blue-500 hover:bg-blue-600">
        {{ t('practice.refresh', 'Refresh') }}
      </Button>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
    >
      <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 class="text-lg font-semibold text-gray-800 mb-2">
        {{ t('practice.error', 'Error loading practice item') }}
      </h2>
      <p class="text-gray-600">
        {{
          t('practice.errorDesc', 'Please try again or check your connection')
        }}
      </p>
      <Button @click="refetch" class="mt-4 bg-blue-500 hover:bg-blue-600">
        {{ t('practice.retry', 'Try Again') }}
      </Button>
    </div>

    <!-- Practice item content -->
    <div v-else-if="currentItem" class="mb-12">
      <!-- Current practice item -->
      <div class="mb-8">
        <PracticeItem
          :item="currentItem"
          @item-completed="handleItemCompleted"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import PracticeItem from './components/PracticeItem.vue'
import { useNextPracticeItem } from './queries'
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  MicrophoneIcon,
} from '@heroicons/vue/24/solid'

const { t } = useI18n()

// State
const easyMode = ref(false)
const currentItemId = ref<number | undefined>(undefined)

const {
  data: currentItem,
  isLoading,
  error,
  refetch,
} = useNextPracticeItem(easyMode, currentItemId)

// Watch for easy mode changes - reset current item
watch(easyMode, () => {
  currentItemId.value = undefined
})

// Handle item completion from child component
const handleItemCompleted = (itemId: number, state: 'correct' | 'wrong') => {
  // Item completion is handled locally in the PracticeItem component
  // No need to update any session state here
  console.log('itemId', itemId)
  console.log('state', state)
}
</script>
