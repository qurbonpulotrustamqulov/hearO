<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGetProfile } from '@/pages/profile/queries/useGetProfile'
import { useUpdateProfile } from '@/pages/profile/queries/useUpdateProfile'
import { useUpdateProfilePhoto } from '@/pages/profile/queries/useUpdateProfilePhoto'
import { useAuthStore } from '@/store/auth.store'
import TelegramLogin from '@/components/common/TelegramLogin.vue'
import TelegramIcon from '@/components/ui/icons/TelegramIcon.vue'
import type { TelegramUser } from '@/pages/auth/types.ts'
import { format } from 'date-fns'
import { useAttachTelegram } from '@/pages/profile/queries/useAttachTelegram.ts'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  UserIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import { ArrowPathIcon as ArrowPathIconSolid } from '@heroicons/vue/24/solid'

const { data: profile, isLoading, error, refetch } = useGetProfile()
const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
const { mutate: updateProfilePhoto, isPending: isUpdatingPhoto } =
  useUpdateProfilePhoto()
const { mutate: attachTelegramMutation } = useAttachTelegram()
const authStore = useAuthStore()
const { t } = useI18n()

// Edit mode state
const isEditing = ref(false)
const isEditFormExpanded = ref(false)
const editForm = ref({
  first_name: '',
  last_name: '',
  gender: null as 'male' | 'female' | null,
})

// Photo upload state
const fileInputRef = ref<HTMLInputElement>()
const selectedPhoto = ref<File | null>(null)
const previewUrl = ref<string>('')

// Initialize edit form when profile data loads
const initializeEditForm = () => {
  if (profile.value) {
    editForm.value = {
      first_name: profile.value.first_name || '',
      last_name: profile.value.last_name || '',
      gender: profile.value.gender || null,
    }
  }
}

const handleTelegramLogin = (user: TelegramUser) => {
  attachTelegramMutation(user, {
    onSuccess: () => {
      // Optionally refetch profile to update UI
      refetch()
    },
    onError: (error) => {
      console.error('Error attaching Telegram account:', error)
    },
  })
}

// Watch for profile data changes
watch(
  profile,
  () => {
    if (profile.value) {
      initializeEditForm()
    }
  },
  { immediate: true }
)

// Computed properties
const fullName = computed(() => {
  if (!profile.value) return ''
  return `${profile.value.first_name || ''} ${profile.value.last_name || ''}`.trim()
})

const avatarUrl = computed(() => {
  return profile.value?.image || '/default-avatar.png'
})

const joinDate = computed(() => {
  if (!profile.value?.date_joined) return ''
  return format(new Date(profile.value.date_joined), 'dd.MM.yyyy')
})

const genderDisplay = computed(() => {
  if (!profile.value?.gender) return t('profile.notSpecified')
  return profile.value.gender === 'male'
    ? t('profile.male')
    : t('profile.female')
})

// Methods
const toggleEdit = () => {
  if (!isEditing.value) {
    isEditing.value = true
    isEditFormExpanded.value = true
    initializeEditForm()
  } else {
    isEditFormExpanded.value = false
    // Delay hiding isEditing to allow animation to complete
    setTimeout(() => {
      isEditing.value = false
    }, 300)
  }
}

const saveProfile = async () => {
  try {
    updateProfile(
      {
        first_name: editForm.value.first_name,
        last_name: editForm.value.last_name,
        gender: editForm.value.gender,
      },
      {
        onSuccess: () => {
          isEditFormExpanded.value = false
          // Delay hiding isEditing to allow animation to complete
          setTimeout(() => {
            isEditing.value = false
          }, 300)
        },
        onError: (error) => {
          console.error('Error saving profile:', error)
        },
      }
    )
  } catch (error) {
    console.error('Error saving profile:', error)
  }
}

const cancelEdit = () => {
  isEditFormExpanded.value = false
  // Delay hiding isEditing to allow animation to complete
  setTimeout(() => {
    isEditing.value = false
    initializeEditForm()
  }, 300)
}

const logout = () => {
  authStore.logout()
  // Redirect to login page
  window.location.href = '/login'
}

// Photo upload methods
const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedPhoto.value = file
    previewUrl.value = URL.createObjectURL(file)
    // Auto-upload immediately
    uploadPhoto()
  }
}

const removePhoto = () => {
  selectedPhoto.value = null
  previewUrl.value = ''
  // Clear the file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const uploadPhoto = async () => {
  if (!selectedPhoto.value) return

  try {
    updateProfilePhoto(selectedPhoto.value, {
      onSuccess: () => {
        // Reset photo upload state
        removePhoto()
      },
      onError: (error) => {
        console.error('Error uploading photo:', error)
        // Reset on error too
        removePhoto()
      },
    })
  } catch (error) {
    console.error('Error uploading photo:', error)
    // Reset on error
    removePhoto()
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header Section -->
      <div class="text-center mb-12">
        <h1
          class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          {{ t('profile.title') }}
        </h1>
        <p class="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          {{ t('profile.subtitle') }}
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center py-20"
      >
        <div class="relative">
          <div
            class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
          ></div>
          <div
            class="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"
            style="animation-delay: -0.5s"
          ></div>
        </div>
        <p class="mt-4 text-gray-600 font-medium">
          {{ t('profile.loadingProfile') }}
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-2xl mx-auto">
        <div
          class="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ExclamationTriangleIcon class="h-8 w-8 text-red-400" />
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-red-800">
                {{ t('profile.errorTitle') }}
              </h3>
              <p class="mt-1 text-red-700">{{ error.message }}</p>
            </div>
          </div>
          <div class="mt-6">
            <button
              @click="() => refetch()"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" />
              {{ t('profile.tryAgain') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else-if="profile" class="space-y-8">
        <!-- Main Profile Card -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <!-- Profile Header -->
          <div
            class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 relative"
          >
            <div class="absolute inset-0 bg-black opacity-30"></div>
            <div class="relative flex items-center space-x-8">
              <!-- Profile Info (Name first) -->
              <div class="flex-1 text-white">
                <h2 class="text-3xl font-bold mb-2">
                  {{ fullName || t('profile.completeProfile') }}
                </h2>
                <p class="text-blue-100 text-lg">{{ profile.email }}</p>
                <div class="flex items-center mt-3 space-x-6 text-blue-100">
                  <div class="flex items-center">
                    <CalendarDaysIcon class="w-5 h-5 mr-2" />
                    <span>{{
                      t('profile.memberSince', { date: joinDate })
                    }}</span>
                  </div>
                  <div v-if="profile.gender" class="flex items-center">
                    <UserIcon class="w-5 h-5 mr-2" />
                    <span>{{ genderDisplay }}</span>
                  </div>
                </div>
              </div>
              <!-- Avatar -->
              <div class="relative group">
                <div
                  class="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden cursor-pointer transition-all duration-200 group-hover:border-blue-200"
                  @click="fileInputRef?.click()"
                >
                  <img
                    :src="previewUrl || avatarUrl"
                    :alt="fullName"
                    class="w-full h-full object-cover transition-all duration-200 group-hover:brightness-75"
                  />
                  <!-- Camera overlay -->
                  <div
                    class="absolute inset-0 bg-transparent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <CameraIcon
                      v-if="!isUpdatingPhoto"
                      class="w-6 h-6 text-white"
                    />
                    <!-- Loading spinner during upload -->
                    <ArrowPathIconSolid
                      v-else
                      class="w-6 h-6 text-white animate-spin"
                    />
                  </div>
                </div>
                <!-- Hidden file input -->
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  @change="handleFileChange"
                  class="hidden"
                />
              </div>

              <!-- Edit Button -->
              <div class="flex-shrink-0">
                <button
                  v-if="!isEditing"
                  @click="toggleEdit"
                  class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <PencilIcon class="w-5 h-5 mr-2" />
                  {{ t('profile.editProfile') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Profile Form -->
          <Transition
            name="expand"
            enter-active-class="transition-all duration-500 ease-out"
            leave-active-class="transition-all duration-300 ease-in"
            enter-from-class="opacity-0 max-h-0 overflow-hidden transform scale-y-95"
            enter-to-class="opacity-100 max-h-[800px] overflow-hidden transform scale-y-100"
            leave-from-class="opacity-100 max-h-[800px] overflow-hidden transform scale-y-100"
            leave-to-class="opacity-0 max-h-0 overflow-hidden transform scale-y-95"
          >
            <div v-if="isEditFormExpanded" class="border-t border-gray-200">
              <div class="p-8 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2 transform transition-all duration-300">
                    <label class="block text-sm font-semibold text-gray-700">
                      {{ t('profile.firstName') }}
                    </label>
                    <input
                      v-model="editForm.first_name"
                      type="text"
                      :placeholder="t('profile.firstNamePlaceholder')"
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 transform hover:scale-[1.02] focus:scale-[1.02]"
                    />
                  </div>
                  <div class="space-y-2 transform transition-all duration-300">
                    <label class="block text-sm font-semibold text-gray-700">
                      {{ t('profile.lastName') }}
                    </label>
                    <input
                      v-model="editForm.last_name"
                      type="text"
                      :placeholder="t('profile.lastNamePlaceholder')"
                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 transform hover:scale-[1.02] focus:scale-[1.02]"
                    />
                  </div>
                </div>
                <div class="space-y-2 transform transition-all duration-300">
                  <label class="block text-sm font-semibold text-gray-700">
                    {{ t('profile.gender') }}
                  </label>
                  <select
                    v-model="editForm.gender"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 transform hover:scale-[1.02] focus:scale-[1.02]"
                  >
                    <option :value="null">
                      {{ t('profile.preferNotToSay') }}
                    </option>
                    <option value="male">{{ t('profile.male') }}</option>
                    <option value="female">{{ t('profile.female') }}</option>
                  </select>
                </div>

                <!-- Action Buttons -->
                <div
                  class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 transform transition-all duration-300"
                >
                  <button
                    @click="cancelEdit"
                    class="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    {{ t('profile.cancel') }}
                  </button>
                  <button
                    @click="saveProfile"
                    :disabled="isUpdating"
                    class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    <ArrowPathIconSolid
                      v-if="isUpdating"
                      class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    />
                    <CheckIcon v-else class="w-5 h-5 mr-2" />
                    {{
                      isUpdating
                        ? t('profile.saving')
                        : t('profile.saveChanges')
                    }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Account Information Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Account Details -->
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="flex items-center mb-6">
              <div
                class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4"
              >
                <UserIcon class="w-6 h-6 text-blue-600" />
              </div>
              <h3 class="text-xl font-bold text-gray-900">
                {{ t('profile.accountDetails') }}
              </h3>
            </div>

            <div class="space-y-4">
              <div
                class="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <span class="text-gray-600 font-medium">{{
                  t('profile.userId')
                }}</span>
                <span class="text-gray-900 font-semibold"
                  >#{{ profile.id }}</span
                >
              </div>
              <div
                class="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <span class="text-gray-600 font-medium">{{
                  t('profile.email')
                }}</span>
                <span class="text-gray-900 font-semibold">{{
                  profile.email
                }}</span>
              </div>
              <div
                class="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <span class="text-gray-600 font-medium">{{
                  t('profile.gender')
                }}</span>
                <span class="text-gray-900 font-semibold">{{
                  genderDisplay
                }}</span>
              </div>
              <div
                class="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <span class="text-gray-600 font-medium">{{
                  t('profile.created')
                }}</span>
                <span class="text-gray-900 font-semibold">{{ joinDate }}</span>
              </div>
            </div>
          </div>

          <!-- Connected Services -->
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="flex items-center mb-6">
              <div
                class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4"
              >
                <TelegramIcon class="w-6 h-6 text-blue-500" />
              </div>
              <h3 class="text-xl font-bold text-gray-900">
                {{ t('profile.connectedServices') }}
              </h3>
            </div>
            <div class="space-y-4">
              <div
                class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200"
              >
                <div class="flex items-center">
                  <div
                    class="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl flex items-center justify-center mr-3 text-white shadow-lg"
                  >
                    <TelegramIcon class="w-6 h-6" />
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <p class="font-semibold text-gray-900">
                        {{ t('profile.telegram') }}
                      </p>
                      <div
                        v-if="profile.telegram_id"
                        class="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1"
                      >
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        Connected
                      </div>
                    </div>
                    <p
                      v-if="!profile.telegram_id"
                      class="text-sm text-gray-500 mt-1"
                    >
                      {{ t('profile.notConnected') }}
                    </p>
                  </div>
                  <TelegramLogin
                    v-if="!profile.telegram_id"
                    @login-success="handleTelegramLogin"
                    class="ml-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Actions -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="flex items-center mb-6">
            <div
              class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-4"
            >
              <ArrowRightOnRectangleIcon class="w-6 h-6 text-red-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900">
              {{ t('profile.accountActions') }}
            </h3>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-900 font-medium">
                {{ t('profile.signOutTitle') }}
              </p>
              <p class="text-gray-500 text-sm">
                {{ t('profile.signOutDescription') }}
              </p>
            </div>
            <button
              @click="logout"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ArrowRightOnRectangleIcon class="w-5 h-5 mr-2" />
              {{ t('profile.signOut') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations and transitions */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
