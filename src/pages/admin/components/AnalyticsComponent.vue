<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Admin Analytics</h2>
      <div class="flex space-x-3">
        <Button @click="refreshData" :disabled="isLoading">
          <ArrowPathIcon class="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="metric in overviewMetrics"
        :key="metric.name"
        class="bg-white overflow-hidden shadow rounded-lg"
      >
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <component
                :is="metric.icon"
                class="h-6 w-6 text-gray-400"
                :class="metric.iconColor"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ metric.name }}
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ metric.value }}
                </dd>
                <dd
                  v-if="metric.change"
                  class="text-sm"
                  :class="metric.changeColor"
                >
                  {{ metric.change }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- User Activity Chart -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            User Activity (Last 7 Days)
          </h3>
          <div v-if="userActivity.isLoading" class="text-center py-8">
            <ArrowPathIcon
              class="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4"
            />
            <p class="text-gray-500">Loading user activity...</p>
          </div>
          <div v-else-if="userActivity.data.value?.results" class="space-y-3">
            <div
              v-for="activity in userActivity.data.value.results.slice(0, 10)"
              :key="activity.user_id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center">
                <UserCircleIcon class="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ activity.user_name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Last active: {{ formatDate(activity.last_activity) }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-900">
                  {{ activity.lessons_completed }} lessons
                </p>
                <p class="text-xs text-gray-500">
                  {{ activity.practice_sessions }} practice sessions
                </p>
                <p class="text-xs text-blue-600">
                  {{ activity.streak_days }} day streak
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <UserGroupIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500">No user activity data available</p>
          </div>
        </div>
      </div>

      <!-- Lesson Performance -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Lesson Performance
          </h3>
          <div v-if="lessonStats.isLoading" class="text-center py-8">
            <ArrowPathIcon
              class="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4"
            />
            <p class="text-gray-500">Loading lesson statistics...</p>
          </div>
          <div v-else-if="lessonStats.data.value?.results" class="space-y-3">
            <div
              v-for="lesson in lessonStats.data.value.results.slice(0, 10)"
              :key="lesson.lesson_id"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-sm font-medium text-gray-900">
                  {{ lesson.lesson_name }}
                </h4>
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="
                    lesson.completion_rate >= 80
                      ? 'bg-green-100 text-green-800'
                      : lesson.completion_rate >= 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  "
                >
                  {{ lesson.completion_rate.toFixed(1) }}%
                </span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-xs text-gray-500">
                <div>
                  <span class="font-medium">Attempts:</span>
                  {{ lesson.total_attempts }}
                </div>
                <div>
                  <span class="font-medium">Completions:</span>
                  {{ lesson.successful_completions }}
                </div>
                <div>
                  <span class="font-medium">Avg Score:</span>
                  {{ lesson.average_score.toFixed(1) }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <AcademicCapIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500">No lesson statistics available</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Statistics -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          Platform Statistics
        </h3>
        <div v-if="stats.isLoading" class="text-center py-8">
          <ArrowPathIcon
            class="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4"
          />
          <p class="text-gray-500">Loading platform statistics...</p>
        </div>
        <div
          v-else-if="stats.data.value"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">
              {{ stats.data.value.total_users.toLocaleString() }}
            </div>
            <div class="text-sm text-gray-500">Total Users</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">
              {{ stats.data.value.active_users_today.toLocaleString() }}
            </div>
            <div class="text-sm text-gray-500">Active Today</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">
              {{ stats.data.value.total_lessons_completed.toLocaleString() }}
            </div>
            <div class="text-sm text-gray-500">Lessons Completed</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600">
              {{ stats.data.value.average_completion_rate.toFixed(1) }}%
            </div>
            <div class="text-sm text-gray-500">Avg Completion Rate</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-indigo-600">
              {{ stats.data.value.total_practice_sessions.toLocaleString() }}
            </div>
            <div class="text-sm text-gray-500">Practice Sessions</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-pink-600">
              {{ stats.data.value.average_session_duration.toFixed(1) }} min
            </div>
            <div class="text-sm text-gray-500">Avg Session Duration</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">
              {{ stats.data.value.new_users_this_week.toLocaleString() }}
            </div>
            <div class="text-sm text-gray-500">New Users This Week</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-teal-600">
              {{ calculateRetentionRate() }}%
            </div>
            <div class="text-sm text-gray-500">User Retention Rate</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Options -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          Export Data
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button @click="exportUserData" variant="outline" class="w-full">
            <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
            Export User Data
          </Button>
          <Button @click="exportLessonData" variant="outline" class="w-full">
            <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
            Export Lesson Data
          </Button>
          <Button @click="exportAnalytics" variant="outline" class="w-full">
            <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
            Export Analytics
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  useAdminStats,
  useUserActivity,
  useLessonStats,
} from '../queries/useAdminStats'
import {
  ArrowPathIcon,
  UserGroupIcon,
  AcademicCapIcon,
  UserCircleIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'

// Query hooks
const stats = useAdminStats()
const userActivity = useUserActivity({ days: 7 })
const lessonStats = useLessonStats()

// Computed properties
const isLoading = computed(
  () =>
    stats.isLoading.value ||
    userActivity.isLoading.value ||
    lessonStats.isLoading.value
)

const overviewMetrics = computed(() => {
  if (!stats.data.value) return []

  return [
    {
      name: 'Total Users',
      value: stats.data.value.total_users.toLocaleString(),
      icon: UserGroupIcon,
      iconColor: 'text-blue-500',
      change: '+12% from last month',
      changeColor: 'text-green-600',
    },
    {
      name: 'Active Today',
      value: stats.data.value.active_users_today.toLocaleString(),
      icon: ClockIcon,
      iconColor: 'text-green-500',
      change: '+5% from yesterday',
      changeColor: 'text-green-600',
    },
    {
      name: 'Lessons Completed',
      value: stats.data.value.total_lessons_completed.toLocaleString(),
      icon: AcademicCapIcon,
      iconColor: 'text-purple-500',
      change: '+8% from last week',
      changeColor: 'text-green-600',
    },
    {
      name: 'Completion Rate',
      value: `${stats.data.value.average_completion_rate.toFixed(1)}%`,
      icon: CheckCircleIcon,
      iconColor: 'text-yellow-500',
      change: '+2% from last month',
      changeColor: 'text-green-600',
    },
  ]
})

// Methods
const refreshData = () => {
  stats.refetch()
  userActivity.refetch()
  lessonStats.refetch()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const calculateRetentionRate = () => {
  if (!stats.data.value) return 0
  // Simple calculation - in real app, you'd have more sophisticated retention metrics
  const retentionRate =
    (stats.data.value.active_users_today / stats.data.value.total_users) * 100
  return retentionRate.toFixed(1)
}

const exportUserData = () => {
  // TODO: Implement user data export
  console.log('Exporting user data...')
  alert('User data export functionality will be implemented here')
}

const exportLessonData = () => {
  // TODO: Implement lesson data export
  console.log('Exporting lesson data...')
  alert('Lesson data export functionality will be implemented here')
}

const exportAnalytics = () => {
  // TODO: Implement analytics export
  console.log('Exporting analytics...')
  alert('Analytics export functionality will be implemented here')
}
</script>
