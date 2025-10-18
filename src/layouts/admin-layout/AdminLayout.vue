<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Fixed Top Navigation -->
    <nav
      class="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <ShieldCheckIcon class="h-8 w-8 text-indigo-600" />
              <span class="ml-2 text-xl font-bold text-gray-900"
                >Admin Panel</span
              >
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <Button @click="goToDashboard" variant="outline" size="sm">
              <ArrowLeftIcon class="h-4 w-4 mr-2" />
              Back to App
            </Button>
            <div class="flex items-center space-x-2">
              <UserCircleIcon class="h-6 w-6 text-gray-400" />
              <span class="text-sm text-gray-700">{{
                authStore.user.value?.firstName || 'Admin'
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex pt-16">
      <!-- Fixed Sidebar -->
      <div
        class="fixed left-0 top-16 w-64 bg-white shadow-sm border-r border-gray-200 h-screen z-40"
      >
        <nav class="mt-8">
          <div class="px-4 space-y-1">
            <router-link
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.href"
              :class="[
                $route.path === item.href
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group border-l-4 py-2 px-3 flex items-center text-sm font-medium',
              ]"
            >
              <component
                :is="item.icon"
                :class="[
                  $route.path === item.href
                    ? 'text-indigo-500'
                    : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 h-5 w-5',
                ]"
              />
              {{ item.name }}
            </router-link>
          </div>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="flex-1 ml-64">
        <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import {
  ShieldCheckIcon,
  UsersIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  PlayIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: ChartBarIcon,
  },
  {
    name: 'Students',
    href: '/admin/students',
    icon: UsersIcon,
  },
  {
    name: 'Teachers',
    href: '/admin/teachers',
    icon: AcademicCapIcon,
  },
  {
    name: 'Lesson Groups',
    href: '/admin/lesson-groups',
    icon: DocumentTextIcon,
  },
  {
    name: 'Lessons',
    href: '/admin/lessons',
    icon: DocumentTextIcon,
  },
  {
    name: 'Cartoons',
    href: '/admin/cartoons',
    icon: PlayIcon,
  },
  {
    name: 'Practice Items',
    href: '/admin/practice-items',
    icon: DocumentTextIcon,
  },
  {
    name: 'Assignments',
    href: '/admin/assignments',
    icon: ClipboardDocumentListIcon,
  },
]

function goToDashboard() {
  router.push('/dashboard')
}
</script>
