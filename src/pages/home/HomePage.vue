<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
import LangSelect from '@/components/common/LangSelect.vue'
import { useAuthStore } from '@/store/auth.store'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlayIcon,
  MicrophoneIcon,
  ChartBarIcon,
} from '@heroicons/vue/24/outline'
import { useLessonGroups } from '@/pages/home/queries/useLessonGroups.ts'

const auth = useAuthStore()
const { t } = useI18n()
const router = useRouter()
const isLoggedIn = computed(() => auth.isAuthenticated())

// Fetch lesson groups
const {
  data: lessonGroups,
  isLoading: isLessonGroupsLoading,
  error: lessonGroupsError,
  refetch: refetchLessonGroups,
} = useLessonGroups()

const goToLessonGroup = (groupId: number) => {
  router.push(`dashboard/lesson-groups/${groupId}`)
}

const userStreak = ref(3)
const userPoints = ref(120)
const userName = ref('Alex')

const features = ref([
  {
    title: 'Interactive Learning',
    description:
      'Fun, game-like exercises designed specifically for cochlear implant users',
    icon: PlayIcon,
  },
  {
    title: 'Speech Recognition',
    description: 'Practice speaking and get instant feedback on pronunciation',
    icon: MicrophoneIcon,
  },
  {
    title: 'Progress Tracking',
    description: 'See your improvement over time with detailed statistics',
    icon: ChartBarIcon,
  },
])

const gotoNext = () => {
  if (isLoggedIn.value) {
    router.push('/dashboard/lesson-groups')
  } else {
    router.push('/auth/login')
  }
}

const goToRegister = () => {
  if (isLoggedIn.value) {
    router.push('/dashboard')
  } else {
    router.push('/auth/register')
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Hero section - Different for guest and logged-in users -->
    <div
      class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 mb-10 text-white"
    >
      <!-- Language selector in top-right corner -->
      <div class="flex justify-end mb-4">
        <LangSelect />
      </div>

      <div class="md:flex items-start">
        <div class="md:w-2/3">
          <template v-if="isLoggedIn">
            <!-- Logged in user welcome -->
            <h1 class="text-3xl md:text-4xl font-bold mb-4">
              {{ t('home.welcome', { name: userName }) }}
            </h1>
            <p class="text-xl mb-6">{{ t('home.tagline') }}</p>
            <div class="flex space-x-4 mb-6">
              <Button
                class="bg-white text-blue-600 hover:bg-blue-50"
                @click="gotoNext"
              >
                {{ t('actions.continueLearning') }}
              </Button>
              <Button
                class="bg-transparent border-2 border-white hover:bg-white/10"
              >
                {{ t('actions.learnMore') }}
              </Button>
            </div>
          </template>
          <template v-else>
            <!-- Guest user welcome -->
            <h1 class="text-3xl md:text-4xl font-bold mb-4">
              {{ t('home.welcomeGuest') || 'Welcome to Koxlear!' }}
            </h1>
            <p class="text-xl mb-6">
              {{
                t('home.guestTagline') ||
                'The fun learning platform designed for children with cochlear implants'
              }}
            </p>
            <div class="flex space-x-4 mb-6">
              <Button
                class="bg-white text-blue-600 hover:bg-blue-50"
                @click="goToRegister"
              >
                {{ t('actions.getStarted') }}
              </Button>
              <Button
                class="bg-transparent border-2 border-white hover:bg-white/10"
                @click="gotoNext"
              >
                {{ t('actions.learnMore') }}
              </Button>
            </div>
          </template>
        </div>

        <div class="md:w-1/3 flex justify-center mt-6 md:mt-0">
          <div
            v-if="isLoggedIn"
            class="bg-white/20 p-6 rounded-xl backdrop-blur-sm"
          >
            <!-- User stats for logged in users -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="text-2xl mr-2">🔥</div>
                <div>
                  <div class="text-sm">{{ t('home.streak') }}</div>
                  <div class="text-xl font-bold">
                    {{ userStreak }} {{ t('home.days') }}
                  </div>
                </div>
              </div>
              <div class="flex items-center">
                <div class="text-2xl mr-2">⭐</div>
                <div>
                  <div class="text-sm">{{ t('home.points') }}</div>
                  <div class="text-xl font-bold">{{ userPoints }} XP</div>
                </div>
              </div>
            </div>
            <Button
              class="w-full bg-yellow-400 text-gray-800 hover:bg-yellow-300"
              @click="gotoNext"
            >
              {{ t('actions.continueLearning') }}
            </Button>
          </div>
          <div v-else class="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
            <!-- Demo info for guests -->
            <div class="text-center">
              <div class="text-4xl mb-2">👋</div>
              <h3 class="text-lg font-bold mb-2">
                {{ t('home.tryForFree') || 'Try for Free' }}
              </h3>
              <p class="text-sm mb-4">
                {{
                  t('home.createAccount') ||
                  'Create an account to start your learning journey'
                }}
              </p>
              <Button
                class="w-full bg-yellow-400 text-gray-800 hover:bg-yellow-300"
                @click="goToRegister"
              >
                {{ t('actions.getStarted') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lesson Groups Section (for logged-in users) -->
    <div v-if="isLoggedIn">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Lesson Groups</h2>
      <div v-if="isLessonGroupsLoading" class="flex justify-center py-8">
        <div
          class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"
        ></div>
      </div>
      <div
        v-else-if="lessonGroupsError"
        class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Error loading lesson groups
            </h3>
            <p class="mt-1 text-sm text-red-700">
              {{ lessonGroupsError.message }}
            </p>
          </div>
        </div>
        <div class="mt-4">
          <Button
            @click="refetchLessonGroups"
            class="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200"
          >
            <ArrowPathIcon class="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div
          v-for="group in lessonGroups"
          :key="group.id"
          class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer p-6 flex flex-col"
          @click="goToLessonGroup(group.id)"
        >
          <div class="flex items-center mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 truncate">
                {{ group.name }}
              </h3>
              <p class="text-sm text-gray-500">Slug: {{ group.slug }}</p>
            </div>
            <span class="ml-2 text-xs text-gray-400">#{{ group.id }}</span>
          </div>
          <div class="flex-1 flex flex-col justify-end">
            <div class="mb-2 flex items-center justify-between">
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
        </div>
      </div>
    </div>

    <!-- Features section -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold mb-6">{{ t('home.whyKoxlear') }}</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="bg-white rounded-xl shadow-md p-6 text-center"
        >
          <component
            :is="feature.icon"
            class="w-12 h-12 mx-auto mb-4 text-blue-600"
          />
          <h3 class="text-xl font-bold mb-2">{{ feature.title }}</h3>
          <p class="text-gray-600">{{ feature.description }}</p>
        </div>
      </div>
    </div>

    <!-- For Parents section - Added for guest mode -->
    <div v-if="!isLoggedIn" class="bg-white rounded-xl shadow-md p-6 mb-12">
      <h2 class="text-2xl font-bold mb-4">
        {{ t('home.forParents') || 'For Parents and Caregivers' }}
      </h2>
      <div class="md:flex gap-8">
        <div class="md:w-2/3">
          <p class="mb-4">
            {{
              t('home.parentInfo') ||
              'Koxlear is designed specifically to help children with cochlear implants develop their listening and speaking skills through fun, engaging activities. Our app uses evidence-based methods developed with audiologists and speech therapists.'
            }}
          </p>
          <ul class="list-disc pl-5 mb-4">
            <li class="mb-2">
              {{
                t('home.parentBenefit1') ||
                'Regular practice with sounds and words tailored to cochlear implant users'
              }}
            </li>
            <li class="mb-2">
              {{
                t('home.parentBenefit2') ||
                'Progress tracking to monitor improvement over time'
              }}
            </li>
            <li class="mb-2">
              {{
                t('home.parentBenefit3') ||
                'Games designed to make learning fun and engaging'
              }}
            </li>
          </ul>
        </div>
        <div class="md:w-1/3 flex items-center justify-center mt-4 md:mt-0">
          <div class="bg-blue-100 p-6 rounded-xl text-center">
            <div class="text-4xl mb-2">👨‍👩‍👧</div>
            <p class="text-blue-800 font-medium mb-4">
              {{
                t('home.parentSupport') ||
                "Support your child's learning journey"
              }}
            </p>
            <Button class="bg-blue-600 hover:bg-blue-700 text-white">
              {{ t('home.learnMoreParents') || 'Learn More' }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to action - Different for guests -->
    <div
      class="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 text-white text-center mb-8"
    >
      <h2 class="text-2xl md:text-3xl font-bold mb-4">
        {{
          isLoggedIn
            ? t('home.readyToStart')
            : t('home.joinToday') || 'Join Koxlear Today!'
        }}
      </h2>
      <p class="md:text-lg mb-6 max-w-2xl mx-auto">
        {{
          isLoggedIn
            ? t('home.joinCommunity')
            : t('home.guestCta') ||
              'Start your learning journey and help develop essential hearing and speaking skills in a fun, supportive environment.'
        }}
      </p>
      <div class="flex flex-col md:flex-row gap-4 justify-center">
        <Button
          v-if="!isLoggedIn"
          class="bg-white text-purple-600 hover:bg-blue-50"
          @click="goToRegister"
        >
          {{ t('actions.signUpFree') || 'Sign Up Free' }}
        </Button>
        <Button
          v-if="isLoggedIn"
          class="bg-white text-purple-600 hover:bg-blue-50"
        >
          {{ t('actions.startFreeTrial') }}
        </Button>
        <Button class="bg-transparent border-2 border-white hover:bg-white/10">
          {{
            isLoggedIn
              ? t('actions.contactUs')
              : t('actions.learnMore') || 'Learn More'
          }}
        </Button>
      </div>
    </div>

    <!-- Testimonials -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold mb-6">{{ t('home.successStories') }}</h2>
      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="md:w-1/4 flex justify-center">
            <div
              class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl"
            >
              👧
            </div>
          </div>
          <div class="md:w-3/4">
            <p class="italic text-gray-700 mb-4">
              "{{ t('home.testimonialText') }}"
            </p>
            <div>
              <p class="font-bold">Sophia, 9</p>
              <p class="text-sm text-gray-600">
                {{ t('home.testimonialDetail') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}

/* Animation for button hover */
button {
  transition: transform 0.2s;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
}
</style>
