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
          <h3 class="text-lg font-medium text-gray-900">Create Lesson Group</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Enter lesson group name..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <!-- Slug -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              v-model="form.slug"
              type="text"
              placeholder="enter-lesson-group-slug"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <p class="text-xs text-gray-500 mt-1">
              URL-friendly identifier (lowercase, hyphens only)
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Enter description..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          <!-- Active Status -->
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
              :disabled="isCreating"
            >
              Cancel
            </Button>
            <Button type="submit" :disabled="isCreating">
              <ArrowPathIcon
                v-if="isCreating"
                class="animate-spin h-4 w-4 mr-2"
              />
              {{ isCreating ? 'Creating...' : 'Create Group' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useCreateAdminLessonGroup } from '../queries/useAdminContent'
import { XMarkIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

interface Emits {
  (e: 'close'): void
  (e: 'created'): void
}

const emit = defineEmits<Emits>()

// Form state
const form = ref({
  name: '',
  slug: '',
  description: '',
  is_active: true,
})

const errorMessage = ref('')
const createLessonGroupMutation = useCreateAdminLessonGroup()

// Computed
const isCreating = computed(() => createLessonGroupMutation.isPending.value)

// Methods
interface CreateLessonGroupPayload {
  name: string
  slug: string
  description?: string
  is_active: boolean
}

const handleSubmit = async () => {
  errorMessage.value = ''

  try {
    const payload: CreateLessonGroupPayload = {
      name: form.value.name,
      slug: form.value.slug,
      description: form.value.description || undefined,
      is_active: form.value.is_active,
    }
    await createLessonGroupMutation.mutateAsync(payload)
    emit('created')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    errorMessage.value =
      e.response?.data?.message || 'Failed to create lesson group'
  }
}
</script>
