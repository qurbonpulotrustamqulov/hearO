<script setup lang="ts">
import {
  ItalicIcon,
  UserCircleIcon,
  AcademicCapIcon,
  SparklesIcon,
  MicrophoneIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/vue/24/solid'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Component } from 'vue'
import LangSelect from '@/components/common/LangSelect.vue'
import { useAuthStore } from '@/store/auth.store'
import { GraduationCapIcon, UsersRoundIcon } from 'lucide-vue-next'
import { computed } from 'vue'

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()

interface NavItem {
  to: string
  icon: Component
  label: string
  activePattern: string
  iconColor: string
  borderColor: string
}

// Centralized navigation configuration - now reactive with computed
// Adding locale.value as a dependency ensures reactivity
const navItems = computed<NavItem[]>(() => {
  // Force reactivity by accessing locale.value
  return [
    {
      to: '/dashboard/lesson-groups',
      icon: AcademicCapIcon,
      label: t('nav.lessons'),
      activePattern: '/dashboard/lessons',
      iconColor: 'text-yellow-200',
      borderColor: 'border-yellow-300',
    },
    {
      to: '/dashboard/assignments',
      icon: ClipboardDocumentListIcon,
      label: t('nav.assignments'),
      activePattern: '/dashboard/assignments',
      iconColor: 'text-cyan-200',
      borderColor: 'border-cyan-300',
    },
    {
      to: '/dashboard/letters',
      icon: ItalicIcon,
      label: t('nav.letters'),
      activePattern: '/letters',
      iconColor: 'text-pink-200',
      borderColor: 'border-pink-300',
    },
    {
      to: '/dashboard/practice',
      icon: MicrophoneIcon,
      label: t('nav.practice'),
      activePattern: '/practice',
      iconColor: 'text-green-200',
      borderColor: 'border-green-300',
    },
    {
      to: '/dashboard/random-cartoon',
      icon: SparklesIcon,
      label: t('nav.randomCartoon'),
      activePattern: '/dashboard/random-cartoon',
      iconColor: 'text-orange-200',
      borderColor: 'border-orange-300',
    },
    {
      to: '/dashboard/profile',
      icon: UserCircleIcon,
      label: t('nav.profile'),
      activePattern: '/profile',
      iconColor: 'text-purple-200',
      borderColor: 'border-purple-300',
    },
  ]
})

// Teacher navigation items - now reactive with computed
const teacherNavItems = computed<NavItem[]>(() => {
  // Force reactivity by accessing locale.value
  return [
    {
      to: '/dashboard/teacher/lesson-groups',
      icon: GraduationCapIcon,
      label: t('nav.myLessons'),
      activePattern: '/dashboard/teacher/lesson-groups',
      iconColor: 'text-red-200',
      borderColor: 'border-red-300',
    },
    {
      to: '/dashboard/teacher/students',
      icon: UsersRoundIcon,
      label: t('nav.myStudents'),
      activePattern: '/dashboard/teacher/students',
      iconColor: 'text-blue-200',
      borderColor: 'border-blue-300',
    },
    {
      to: '/dashboard/teacher/assignments',
      icon: ClipboardDocumentListIcon,
      label: t('nav.myAssignments'),
      activePattern: '/dashboard/teacher/assignments',
      iconColor: 'text-green-200',
      borderColor: 'border-green-300',
    },
  ]
})

// Helper function to check if route is active
const isRouteActive = (pattern: string): boolean => {
  return route.path.includes(pattern)
}
</script>

<template>
  <!-- Fancy, child-friendly sidebar -->
  <nav
    class="w-72 h-full bg-gradient-to-b from-blue-500 to-purple-600 dark:from-blue-900 dark:via-purple-900 dark:to-yellow-900 shadow-2xl flex flex-col items-center"
  >
    <!-- Logo - Fixed at top -->
    <div class="flex-shrink-0 p-4">
      <img src="@/assets/logo.png" alt="Logo" class="w-32" />
    </div>

    <!-- Scrollable navigation area -->
    <div
      class="flex-1 overflow-y-auto w-full px-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30"
    >
      <ul class="space-y-6 w-full pb-4">
        <li v-for="item in navItems" :key="item.to">
          <router-link
            :to="item.to"
            class="flex items-center p-3 rounded-xl transition-all duration-300 hover:bg-white/10 hover:transform hover:translate-x-1"
            :class="{
              'bg-white/20 shadow-inner border-l-4': isRouteActive(
                item.activePattern
              ),
              [item.borderColor]: isRouteActive(item.activePattern),
            }"
          >
            <component
              :is="item.icon"
              class="inline-block size-6 mr-2 drop-shadow"
              :class="item.iconColor"
            />
            <span class="text-2xl text-white font-bold">{{ item.label }}</span>
          </router-link>
        </li>

        <!-- Teacher navigation items - only show for teacher users -->
        <template v-if="authStore.isTeacher()">
          <li v-for="item in teacherNavItems" :key="item.to">
            <router-link
              :to="item.to"
              class="flex items-center p-3 rounded-xl transition-all duration-300 hover:bg-white/10 hover:transform hover:translate-x-1"
              :class="{
                'bg-white/20 shadow-inner border-l-4': isRouteActive(
                  item.activePattern
                ),
                [item.borderColor]: isRouteActive(item.activePattern),
              }"
            >
              <component
                :is="item.icon"
                class="inline-block size-6 mr-2 drop-shadow"
                :class="item.iconColor"
              />
              <span class="text-2xl text-white font-bold">{{
                item.label
              }}</span>
            </router-link>
          </li>
        </template>
      </ul>
    </div>

    <!-- Language selector - Fixed at bottom -->
    <div class="flex-shrink-0 w-full p-4">
      <LangSelect class="z-50 w-full" />
    </div>
  </nav>
</template>

<style scoped>
/* Custom scrollbar styles */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* For Firefox */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

/* Add a subtle scale animation for the active link icons */
.router-link-active svg {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
