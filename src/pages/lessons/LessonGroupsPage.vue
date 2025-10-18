<script setup lang="ts">
import { useGetLessonGroups } from '@/pages/lessons/queries'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  BookOpenIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  InboxIcon,
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const router = useRouter()
const { data: lessonGroups, error, isLoading } = useGetLessonGroups()

const openLessonGroup = (groupId: number) => {
  router.push(`/dashboard/lesson-groups/${groupId}`)
}

function getGradientColor(id: number) {
  // Create different color gradients based on id
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-teal-600',
    'from-amber-500 to-red-600',
    'from-emerald-500 to-cyan-600',
  ]
  return colors[id % colors.length]
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">
      {{ t('lessonGroups.title', 'Lesson Groups') }}
    </h1>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center">
        <BookOpenIcon class="animate-spin h-12 w-12 text-blue-500 mb-4" />
        <p class="text-gray-500">
          {{ t('lessonGroups.loading', 'Loading lesson groups...') }}
        </p>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
    >
      <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 class="text-lg font-semibold text-gray-800 mb-2">
        {{ t('lessonGroups.errorLoading', 'Error loading lesson groups') }}
      </h2>
      <p class="text-gray-600">
        {{ t('lessonGroups.tryAgain', 'Please try again later') }}
      </p>
    </div>

    <!-- Lesson Groups grid -->
    <div
      v-else-if="lessonGroups && lessonGroups.length"
      class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="group in lessonGroups"
        :key="group.id"
        class="lesson-group-card bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
        @click="openLessonGroup(group.id)"
      >
        <!-- Card header with colored background based on group id -->
        <div
          class="p-6"
          :class="`bg-gradient-to-r ${getGradientColor(group.id)}`"
        >
          <div class="flex justify-between items-start">
            <div class="flex items-center">
              <div class="bg-white/20 p-3 rounded-full">
                <BookOpenIcon class="h-6 w-6 text-white" />
              </div>
              <h2 class="text-xl font-bold text-white ml-4">
                {{ group.name }}
              </h2>
            </div>
          </div>
        </div>

        <!-- Card content -->
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm text-gray-600">
              {{ group.total_items_count }}
              {{ t('lessonGroups.items', 'items') }}
            </div>
          </div>

          <!-- Progress bar -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">Progress</span>
              <span class="text-sm text-gray-700 font-semibold">
                {{ group.completed_items_count }}/{{ group.total_items_count }}
              </span>
            </div>
            <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                :style="{
                  width:
                    group.total_items_count > 0
                      ? (group.completed_items_count /
                          group.total_items_count) *
                          100 +
                        '%'
                      : '0%',
                }"
              ></div>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <!-- Group info -->
            <div class="text-xs text-gray-500">Group ID: {{ group.id }}</div>

            <!-- Start button -->
            <button
              class="flex items-center text-blue-500 hover:text-blue-700 transition-colors text-sm font-medium"
            >
              {{ t('lessonGroups.startGroup', 'Start Group') }}
              <ArrowRightIcon class="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center"
    >
      <InboxIcon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h2 class="text-lg font-semibold text-gray-800 mb-2">
        {{ t('lessonGroups.noGroups', 'No lesson groups available') }}
      </h2>
      <p class="text-gray-600">
        {{
          t('lessonGroups.checkBack', 'Check back later for new lesson groups!')
        }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Card hover effect */
.lesson-group-card {
  transform: translateY(0);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.lesson-group-card:hover {
  transform: translateY(-5px);
}

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
