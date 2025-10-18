<template>
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
  >
    <div
      class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
    >
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Edit User</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- First Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              v-model="form.first_name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <!-- Last Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              v-model="form.last_name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              v-model="form.is_active"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>

          <!-- Staff Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Staff Status
            </label>
            <select
              v-model="form.is_staff"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option :value="false">Regular User</option>
              <option :value="true">Staff Member</option>
            </select>
          </div>

          <!-- Superuser Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Superuser Status
            </label>
            <select
              v-model="form.is_superuser"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option :value="false">Regular User</option>
              <option :value="true">Super Admin</option>
            </select>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-600 text-sm">
            {{ errorMessage }}
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              @click="$emit('close')"
              :disabled="isUpdating"
            >
              Cancel
            </Button>
            <Button type="submit" :disabled="isUpdating">
              <ArrowPathIcon
                v-if="isUpdating"
                class="animate-spin h-4 w-4 mr-2"
              />
              {{ isUpdating ? 'Updating...' : 'Update User' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useUpdateAdminUser } from '../queries/useAdminUsers'
import type { AdminUser } from '../types'
import { XMarkIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

interface Props {
  user: AdminUser | null
}

interface Emits {
  (e: 'close'): void
  (e: 'updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form state
const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  is_active: true,
  is_staff: false,
  is_superuser: false,
})

const errorMessage = ref('')
const updateUserMutation = useUpdateAdminUser()

// Computed
const isUpdating = computed(() => updateUserMutation.isPending.value)

// Watch for user changes and populate form
watch(
  () => props.user,
  (user) => {
    if (user) {
      form.value = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        is_active: user.is_active,
        is_staff: user.is_staff,
        is_superuser: user.is_superuser,
      }
    }
  },
  { immediate: true }
)

// Methods
const handleSubmit = async () => {
  if (!props.user) return

  errorMessage.value = ''

  try {
    await updateUserMutation.mutateAsync({
      id: props.user.id,
      data: form.value,
    })

    emit('updated')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    errorMessage.value = e.response?.data?.message || 'Failed to update user'
  }
}
</script>
