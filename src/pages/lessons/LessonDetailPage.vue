<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header with back button and title -->
    <div class="mb-6 flex items-center">
      <button
        @click="goBack"
        class="mr-4 bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors"
      >
        <ArrowLeftIcon class="h-5 w-5 text-gray-600" />
      </button>
      <h1 class="text-2xl font-bold text-gray-800">
        {{ currentLesson?.title || t('lessons.lessonDetail', 'Lesson Detail') }}
      </h1>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center">
        <ArrowPathIcon class="animate-spin h-12 w-12 text-blue-500 mb-4" />
        <p class="text-gray-500">
          {{ t('lessons.loading', 'Loading lesson...') }}
        </p>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error || !currentLesson"
      class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
    >
      <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 class="text-lg font-semibold text-gray-800 mb-2">
        {{ t('lessons.lessonNotFound', 'Lesson not found') }}
      </h2>
      <p class="text-gray-600">
        {{ t('lessons.returnToLessons', 'Please return to the lessons page') }}
      </p>
      <Button @click="goBack" class="mt-4 bg-blue-500 hover:bg-blue-600">
        {{ t('lessons.backToLessons', 'Back to Lessons') }}
      </Button>
    </div>

    <!-- Completed lesson state -->

    <!-- Lesson content -->
    <div v-else class="mb-12">
      <!-- Progress bar -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">
            {{ t('lessons.progress', 'Progress') }}: {{ progress }}%
          </span>
          <span class="text-sm text-gray-500">
            {{ activeItemIndex + 1 }}/{{ currentLesson.items.length }}
            {{ t('lessons.items', 'items') }}
          </span>
        </div>
        <div class="w-full h-2 bg-gray-200 rounded-full">
          <div
            class="h-2 bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
            :style="`width: ${progress}%`"
          ></div>
        </div>
      </div>

      <!-- Active lesson item -->
      <div v-if="activeItem" class="mb-8">
        <LessonItem
          :item="activeItem"
          :isLast="isLastItem"
          @item-completed="handleItemCompleted"
          @next-item="goToNextItem"
          @back-to-lessons="handleBackToLessons"
          @start-from-beginning="startFromBeginning"
        />
      </div>

      <!-- Navigation buttons -->
      <div class="flex justify-between">
        <Button
          @click="goToPreviousItem"
          class="bg-gray-500 hover:bg-gray-600"
          :disabled="activeItemIndex === 0"
        >
          <ChevronLeftIcon class="h-5 w-5 mr-2" />
          {{ t('lessons.previous', 'Previous') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import LessonItem from './components/LessonItem.vue'
import type { ILessonItem } from './types'
import { useGetLessonById } from '@/pages/lessons/queries'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/solid'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const lessonId = computed(() => Number(route.params.id))

const {
  data: currentLesson,
  isLoading,
  error,
} = useGetLessonById(lessonId.value)

const activeItemIndex = ref(0)
const isCompleted = ref(false)

// Find first uncompleted item index
const findFirstUncompletedIndex = () => {
  if (!currentLesson.value || !currentLesson.value.items.length) {
    return 0
  }

  const firstUncompletedIndex = currentLesson.value.items.findIndex((item) => {
    const isCompleted = item.state && item.state.state === 'correct'
    return !isCompleted
  })

  return firstUncompletedIndex === -1 ? 0 : firstUncompletedIndex
}

// Initialize activeItemIndex based on lesson data and URL
const initializeActiveItemIndex = () => {
  if (!currentLesson.value || !currentLesson.value.items.length) {
    activeItemIndex.value = 0
    return
  }

  // If there's a specific item in URL, use it
  if (route.query.item !== undefined) {
    const urlIndex = Number(route.query.item)
    activeItemIndex.value = Math.max(
      0,
      Math.min(urlIndex, currentLesson.value.items.length - 1)
    )
  } else {
    // Find first uncompleted item
    activeItemIndex.value = findFirstUncompletedIndex()
  }
}
const handleBackToLessons = () => {
  router.push('/dashboard/lesson-groups')
}

// Watch for lesson data changes
watch(
  currentLesson,
  (lesson) => {
    if (lesson && lesson.items.length > 0) {
      initializeActiveItemIndex()
    }
  },
  { immediate: true }
)

// Watch for route changes (but only if lesson is already loaded)
watch(
  () => route.query.item,
  (newItemQuery) => {
    if (currentLesson.value && currentLesson.value.items.length > 0) {
      if (newItemQuery !== undefined) {
        const urlIndex = Number(newItemQuery)
        activeItemIndex.value = Math.max(
          0,
          Math.min(urlIndex, currentLesson.value.items.length - 1)
        )
      } else {
        // If no queries, find first uncompleted
        activeItemIndex.value = findFirstUncompletedIndex()
      }
    }
  }
)
// Navigation functions
const goBack = () => {
  router.back()
}

const goToNextItem = () => {
  if (
    !currentLesson.value ||
    activeItemIndex.value >= currentLesson.value.items.length - 1
  ) {
    // Only complete lesson if all items are correctly completed
    if (isLessonCompleted.value) {
      completeLesson()
    } else {
      // If not all items completed, don't advance beyond the last item
      // User must complete all items first
      return
    }
    return
  }

  const nextIndex = activeItemIndex.value + 1
  // Update URL to include item index as queries parameter
  router.push({
    path: `/dashboard/lessons/${lessonId.value}`,
    query: { item: nextIndex.toString() },
  })
  scrollToTop()
}

const goToPreviousItem = () => {
  if (activeItemIndex.value > 0) {
    const prevIndex = activeItemIndex.value - 1
    // Update URL to include item index as queries parameter
    router.push({
      path: `/dashboard/lessons/${lessonId.value}`,
      query: { item: prevIndex.toString() },
    })
    scrollToTop()
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const completeLesson = () => {
  isCompleted.value = true
  // Here you would typically send a request to update the user's progress
}

// Handle item completion from child component
const handleItemCompleted = (itemId: number, state: 'correct' | 'wrong') => {
  if (!currentLesson.value) return

  // Update the item's state in the current lesson data
  const item = currentLesson.value.items.find((item) => item.id === itemId)
  if (item) {
    // Update the LessonItemState object
    if (item.state) {
      item.state.state = state
      item.state.last_submit_at = new Date().toISOString()
      if (state === 'wrong') {
        item.state.wrong_count += 1
      }
    } else {
      // Create new state object if it doesn't exist
      item.state = {
        id: itemId,
        state: state,
        wrong_count: state === 'wrong' ? 1 : 0,
        created_at: new Date().toISOString(),
        last_submit_at: new Date().toISOString(),
      }
    }
  }

  // Don't auto-advance anymore - let user decide when to move on
}

const activeItem = computed<ILessonItem | null>(() => {
  if (!currentLesson.value || !currentLesson.value.items.length) return null
  return currentLesson.value.items[activeItemIndex.value]
})
// Calculate progress based on completed items (items with state 'correct')
const progress = computed(() => {
  if (!currentLesson.value || !currentLesson.value.items.length) return 0

  const completedItems = currentLesson.value.items.filter(
    (item) => item.state?.state === 'correct'
  ).length
  return Math.round((completedItems / currentLesson.value.items.length) * 100)
})

// Check if lesson is fully completed
const isLessonCompleted = computed(() => {
  if (!currentLesson.value || !currentLesson.value.items.length) return false
  return currentLesson.value.items.every(
    (item) => item.state?.state === 'correct'
  )
})

// Update the completed state when all items are correct
watch(isLessonCompleted, (newValue) => {
  if (newValue) {
    isCompleted.value = true
  }
})

const isLastItem = computed(() => {
  if (!currentLesson.value) return true
  return activeItemIndex.value === currentLesson.value.items.length - 1
})

// Start the lesson from the beginning
const startFromBeginning = () => {
  isCompleted.value = false
  activeItemIndex.value = 0
  // Reset the state of all items in the lesson
  if (currentLesson.value && currentLesson.value.items.length) {
    currentLesson.value.items.forEach((item) => {
      item.state = null
    })
  }
  // Navigate to the first item
  router.push({
    path: `/dashboard/lessons/${lessonId.value}`,
    query: { item: '0' },
  })
  scrollToTop()
}
</script>

<style scoped>
/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
