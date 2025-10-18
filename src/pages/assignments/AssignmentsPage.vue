<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import {
  ArrowPathIcon,
  CalendarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
} from '@heroicons/vue/24/outline'
import useToasts from '@/lib/toast'
import { getAssignments, type Assignment } from './api/assignments.api'
import { useRouter } from 'vue-router'

const toast = useToasts()
const { t } = useI18n()
const router = useRouter()

// State
const assignments = ref<Assignment[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const limit = ref(20)
const offset = ref(0)
const totalCount = ref(0)
const statusFilter = ref<string>('')

// Load assignments
const loadAssignments = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await getAssignments({
      limit: limit.value,
      offset: offset.value,
      status: statusFilter.value || undefined,
    })
    assignments.value = response.data.results
    totalCount.value = response.data.count
  } catch (err: unknown) {
    error.value =
      err instanceof Error ? err.message : 'Failed to load assignments'
    toast.error('Failed to load assignments')
  } finally {
    isLoading.value = false
  }
}

// Format date
const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// Check if assignment is active
const isActive = (assignment: Assignment) => {
  const now = new Date()
  const start = new Date(assignment.begin_time)
  const end = new Date(assignment.end_time)
  return now >= start && now <= end && assignment.status === 'PENDING'
}

// Check if assignment is expired
const isExpired = (assignment: Assignment) => {
  const now = new Date()
  const end = new Date(assignment.end_time)
  return now > end && assignment.status === 'PENDING'
}

// Get status badge color
const getStatusColor = (assignment: Assignment) => {
  if (isExpired(assignment)) {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
  switch (assignment.status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'FAILED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  }
}

// Get status icon
const getStatusIcon = (assignment: Assignment) => {
  if (isExpired(assignment)) {
    return XCircleIcon
  }
  switch (assignment.status) {
    case 'COMPLETED':
      return CheckCircleIcon
    case 'FAILED':
      return XCircleIcon
    default:
      return ClockIcon
  }
}

// Get status text
const getStatusText = (assignment: Assignment) => {
  if (isExpired(assignment)) {
    return 'EXPIRED'
  }
  return assignment.status
}

// Start assignment
const startAssignment = (assignment: Assignment) => {
  // Navigate to the lesson
  router.push(`/dashboard/lessons/${assignment.lesson}`)
}

// Filter by status
const filterByStatus = (status: string) => {
  statusFilter.value = status
  offset.value = 0
  loadAssignments()
}

// Pagination
const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
const totalPages = computed(() => Math.ceil(totalCount.value / limit.value))

const goToPage = (page: number) => {
  offset.value = (page - 1) * limit.value
  loadAssignments()
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

// Computed
const pendingCount = computed(
  () =>
    assignments.value.filter((a) => a.status === 'PENDING' && !isExpired(a))
      .length
)
const completedCount = computed(
  () => assignments.value.filter((a) => a.status === 'COMPLETED').length
)

onMounted(() => {
  loadAssignments()
})
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">
        {{ t('assignments.title', 'My Assignments') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        {{ t('assignments.description', 'View and complete your assignments') }}
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ totalCount }}
            </p>
          </div>
          <AcademicCapIcon class="w-10 h-10 text-blue-500" />
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p class="text-2xl font-bold text-yellow-600">{{ pendingCount }}</p>
          </div>
          <ClockIcon class="w-10 h-10 text-yellow-500" />
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p class="text-2xl font-bold text-green-600">
              {{ completedCount }}
            </p>
          </div>
          <CheckCircleIcon class="w-10 h-10 text-green-500" />
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row md:justify-between md:items-center p-6 border-b dark:border-gray-700 gap-4"
      >
        <h2 class="text-xl font-semibold">
          {{ t('assignments.list', 'Assignments') }}
        </h2>
        <div class="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            @click="filterByStatus('')"
            :class="{ 'bg-gray-100 dark:bg-gray-700': statusFilter === '' }"
          >
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="filterByStatus('PENDING')"
            :class="{
              'bg-gray-100 dark:bg-gray-700': statusFilter === 'PENDING',
            }"
          >
            Pending
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="filterByStatus('COMPLETED')"
            :class="{
              'bg-gray-100 dark:bg-gray-700': statusFilter === 'COMPLETED',
            }"
          >
            Completed
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="loadAssignments"
            :disabled="isLoading"
          >
            <ArrowPathIcon
              class="w-4 h-4 mr-2"
              :class="{ 'animate-spin': isLoading }"
            />
            {{ t('common.refresh', 'Refresh') }}
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading && assignments.length === 0"
        class="p-12 text-center"
      >
        <ArrowPathIcon
          class="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400"
        />
        <p class="text-gray-500 dark:text-gray-400">
          {{ t('common.loading', 'Loading...') }}
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-12 text-center">
        <XCircleIcon class="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
        <Button variant="outline" class="mt-4" @click="loadAssignments">
          {{ t('common.tryAgain', 'Try Again') }}
        </Button>
      </div>

      <!-- Empty State -->
      <div v-else-if="assignments.length === 0" class="p-12 text-center">
        <AcademicCapIcon class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p class="text-gray-500 dark:text-gray-400 mb-2">
          {{ t('assignments.empty', 'No assignments found') }}
        </p>
      </div>

      <!-- Assignments List -->
      <div v-else class="divide-y dark:divide-gray-700">
        <div
          v-for="assignment in assignments"
          :key="assignment.id"
          class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ assignment.lesson_full.title }}
                </h3>
                <span
                  :class="getStatusColor(assignment)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  <component
                    :is="getStatusIcon(assignment)"
                    class="w-4 h-4 mr-1"
                  />
                  {{ getStatusText(assignment) }}
                </span>
              </div>

              <div
                class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400"
              >
                <div class="flex items-center gap-2">
                  <CalendarIcon class="w-4 h-4" />
                  <span>Start: {{ formatDate(assignment.begin_time) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <CalendarIcon class="w-4 h-4" />
                  <span>End: {{ formatDate(assignment.end_time) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <AcademicCapIcon class="w-4 h-4" />
                  <span>Passing Score: {{ assignment.passing_score }}%</span>
                </div>
                <div class="flex items-center gap-2">
                  <AcademicCapIcon class="w-4 h-4" />
                  <span>Group: {{ assignment.lesson_full.group_name }}</span>
                </div>
              </div>
            </div>

            <div v-if="isActive(assignment)">
              <Button @click="startAssignment(assignment)">
                <PlayIcon class="w-4 h-4 mr-2" />
                {{ t('assignments.start', 'Start') }}
              </Button>
            </div>
            <div v-else-if="assignment.status === 'COMPLETED'">
              <Button variant="outline" disabled>
                <CheckCircleIcon class="w-4 h-4 mr-2" />
                {{ t('assignments.completed', 'Completed') }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-6 py-4 border-t dark:border-gray-700"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="prevPage"
            :disabled="currentPage === 1"
          >
            {{ t('common.previous', 'Previous') }}
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="nextPage"
            :disabled="currentPage === totalPages"
          >
            {{ t('common.next', 'Next') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
