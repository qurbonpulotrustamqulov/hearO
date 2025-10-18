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
          <h3 class="text-lg font-medium text-gray-900">Create Lesson</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Enter lesson title..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Enter lesson description..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          <!-- Lesson Group -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Lesson Group *
            </label>
            <select
              v-model="form.group_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a lesson group</option>
              <option
                v-for="group in lessonGroups.data.value?.results"
                :key="group.id"
                :value="group.id"
              >
                {{ group.name }}
              </option>
            </select>
          </div>

          <!-- Order -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              v-model.number="form.order"
              type="number"
              min="1"
              placeholder="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p class="text-xs text-gray-500 mt-1">
              Display order within the lesson group
            </p>
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
              {{ isCreating ? 'Creating...' : 'Create Lesson' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useCreateAdminLesson } from '../queries/useAdminContent'
import { useAdminLessonGroups } from '../queries/useAdminContent'
import { XMarkIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

interface Emits {
  (e: 'close'): void
  (e: 'created'): void
}

const emit = defineEmits<Emits>()

// Form state
const form = ref({
  title: '',
  description: '',
  group_id: '',
  order: 1,
  is_active: true,
})

const errorMessage = ref('')
const createLessonMutation = useCreateAdminLesson()
const lessonGroups = useAdminLessonGroups()

// Computed
const isCreating = computed(() => createLessonMutation.isPending.value)

// Methods
interface CreateLessonPayload {
  title: string
  description?: string
  group_id: number
  order?: number
  is_active: boolean
}

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!form.value.group_id) {
    errorMessage.value = 'Please select a lesson group'
    return
  }

  try {
    const payload: CreateLessonPayload = {
      title: form.value.title,
      description: form.value.description || undefined,
      group_id: parseInt(form.value.group_id),
      order: form.value.order || undefined,
      is_active: form.value.is_active,
    }
    await createLessonMutation.mutateAsync(payload)
    emit('created')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    errorMessage.value = e.response?.data?.message || 'Failed to create lesson'
  }
}

onMounted(() => {
  lessonGroups.refetch()
})
</script>
