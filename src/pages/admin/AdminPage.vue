<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total Users
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.data?.value?.total_users || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ClockIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Active Today
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.data?.value?.active_users_today || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <AcademicCapIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Lessons Completed
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.data?.value?.total_lessons_completed || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ChartBarIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Practice Sessions
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ stats.data?.value?.total_practice_sessions || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <router-link
            to="/admin/users"
            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UsersIcon class="h-6 w-6 text-indigo-600 mr-3" />
            <span class="font-medium text-gray-900">Manage Users</span>
          </router-link>

          <router-link
            to="/admin/lesson-groups"
            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon class="h-6 w-6 text-indigo-600 mr-3" />
            <span class="font-medium text-gray-900">Lesson Groups</span>
          </router-link>

          <router-link
            to="/admin/lessons"
            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AcademicCapIcon class="h-6 w-6 text-indigo-600 mr-3" />
            <span class="font-medium text-gray-900">Lessons</span>
          </router-link>

          <router-link
            to="/admin/lesson-items"
            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon class="h-6 w-6 text-indigo-600 mr-3" />
            <span class="font-medium text-gray-900">Lesson Items</span>
          </router-link>

          <router-link
            to="/admin/practice-items"
            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MicrophoneIcon class="h-6 w-6 text-indigo-600 mr-3" />
            <span class="font-medium text-gray-900">Practice Items</span>
          </router-link>

          <router-link
            to="/admin/cartoons"
            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PlayIcon class="h-6 w-6 text-indigo-600 mr-3" />
            <span class="font-medium text-gray-900">Cartoons</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminStats } from './queries/useAdminStats'
import {
  UsersIcon,
  DocumentTextIcon,
  PlayIcon,
  ChartBarIcon,
  ClockIcon,
  AcademicCapIcon,
  MicrophoneIcon,
} from '@heroicons/vue/24/outline'

const stats = useAdminStats()
</script>
