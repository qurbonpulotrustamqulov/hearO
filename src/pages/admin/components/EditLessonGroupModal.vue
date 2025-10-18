<template>
  <DialogRoot :open="isOpen" @update:open="$emit('close')">
    <DialogPortal>
      <DialogOverlay
        class="bg-black/40 data-[state=open]:animate-overlayShow fixed inset-0 z-50"
      />
      <DialogContent
        class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-xl focus:outline-none z-[100]"
      >
        <div class="flex items-start">
          <div
            class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10"
          >
            <PencilIcon class="h-6 w-6 text-indigo-600" />
          </div>
          <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
            <DialogTitle class="text-lg font-medium text-gray-900">
              Edit Lesson Group
            </DialogTitle>
            <DialogClose
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="h-6 w-6" />
            </DialogClose>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
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

          <!-- Order -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              v-model.number="form.order"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p class="text-xs text-gray-500 mt-1">Display order (optional)</p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-600 text-sm">
            {{ errorMessage }}
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <DialogClose as-child>
              <Button type="button" variant="outline" :disabled="isUpdating">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" :disabled="isUpdating">
              <ArrowPathIcon
                v-if="isUpdating"
                class="animate-spin h-4 w-4 mr-2"
              />
              {{ isUpdating ? 'Updating...' : 'Update Lesson Group' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { useUpdateAdminLessonGroup } from '../queries/useAdminContent'
import { XMarkIcon, PencilIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import type { AdminLessonGroup } from '../types'

interface Props {
  isOpen: boolean
  lessonGroup: AdminLessonGroup | null
}

interface Emits {
  (e: 'close'): void
  (e: 'updated', lessonGroup: AdminLessonGroup): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const updateLessonGroup = useUpdateAdminLessonGroup()

// Computed properties for proper reactivity
const isUpdating = computed(() => updateLessonGroup.isPending.value)

// Form state
const form = reactive({
  name: '',
  slug: '',
  order: undefined as number | undefined,
})

const errorMessage = ref('')

// Watch for changes in the lesson group prop
watch(
  () => props.lessonGroup,
  (newLessonGroup) => {
    if (newLessonGroup) {
      form.name = newLessonGroup.name
      form.slug = newLessonGroup.slug
      form.order = newLessonGroup.order
    }
  },
  { immediate: true }
)

// Methods
const validateForm = () => {
  if (!form.name.trim()) {
    errorMessage.value = 'Name is required'
    return false
  }
  if (!form.slug.trim()) {
    errorMessage.value = 'Slug is required'
    return false
  }
  if (!/^[-a-zA-Z0-9_]+$/.test(form.slug)) {
    errorMessage.value =
      'Slug can only contain letters, numbers, hyphens, and underscores'
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm() || !props.lessonGroup) {
    return
  }

  try {
    const result = await updateLessonGroup.mutateAsync({
      id: props.lessonGroup.id,
      data: {
        id: props.lessonGroup.id,
        name: form.name.trim(),
        slug: form.slug.trim(),
        order: form.order,
      },
    })

    emit('updated', result)
    emit('close')
  } catch (error) {
    console.error('Failed to update lesson group:', error)
  }
}
</script>
