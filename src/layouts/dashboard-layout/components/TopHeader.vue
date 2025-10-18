<template>
  <header
    class="w-full flex items-center justify-between px-6 py-2 bg-white shadow-md z-50 text-gray-900 border-b border-gray-200"
  >
    <div></div>
    <div class="flex items-center gap-4">
      <button
        class="relative p-2.5 rounded-full hover:bg-sky-900/10 transition"
        @click="notify"
        :aria-label="t('header.notifications')"
      >
        <BellIcon class="w-8 h-8 text-sky-400" />
        <span
          v-if="hasNotifications"
          class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"
        ></span>
      </button>
      <button
        @click="goProfile"
        class="flex items-center cursor-pointer gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
      >
        <img
          :src="avatarUrl"
          :alt="fullName"
          class="w-10 h-10 rounded-full object-cover border border-[#58cc02]"
        />
        <span
          class="hidden sm:block text-lg font-semibold text-gray-900 max-w-[160px] truncate"
          >{{ fullName }}</span
        >
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { BellIcon } from '@heroicons/vue/24/outline'
import { useGetProfile } from '@/pages/profile/queries/useGetProfile'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const hasNotifications = ref(false) // Replace with real notification logic if needed
const router = useRouter()

const { data: profile } = useGetProfile()

const fullName = computed(() => {
  if (!profile.value) return ''
  return `${profile.value.first_name || ''} ${profile.value.last_name || ''}`.trim()
})
const avatarUrl = computed(() => profile.value?.image || '/default-avatar.png')

function notify() {
  // Placeholder for notification logic
  alert(t('header.noNotifications'))
}

function goProfile() {
  router.push('/dashboard/profile')
}
</script>

<style scoped></style>
