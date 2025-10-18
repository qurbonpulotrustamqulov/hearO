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
            class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
          >
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
          </div>
          <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
            <DialogTitle class="text-lg font-medium text-gray-900">
              Delete Lesson Group
            </DialogTitle>
            <DialogClose
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="h-6 w-6" />
            </DialogClose>
          </div>
        </div>

        <div class="mt-6">
          <div class="text-sm text-gray-500 mb-6">
            <p class="mb-4">
              Are you sure you want to delete the lesson group
              <span class="font-semibold text-gray-900">{{
                lessonGroup?.name
              }}</span
              >?
            </p>
            <div class="bg-red-50 border border-red-200 rounded-md p-4">
              <div class="flex">
                <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">
                    This action cannot be undone
                  </h3>
                  <div class="mt-2 text-sm text-red-700">
                    <ul class="list-disc list-inside space-y-1">
                      <li>This lesson group will be permanently deleted</li>
                      <li>All associated lessons and items will be affected</li>
                      <li>This may impact user progress and learning data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-600 text-sm mb-4">
            {{ errorMessage }}
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3">
            <DialogClose as-child>
              <Button type="button" variant="outline" :disabled="isDeleting">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              :disabled="isDeleting"
              @click="handleDelete"
            >
              <ArrowPathIcon
                v-if="isDeleting"
                class="animate-spin h-4 w-4 mr-2"
              />
              {{ isDeleting ? 'Deleting...' : 'Delete Lesson Group' }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { useDeleteAdminLessonGroup } from '../queries/useAdminContent'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import type { AdminLessonGroup } from '../types'

interface Props {
  isOpen: boolean
  lessonGroup: AdminLessonGroup | null
}

interface Emits {
  (e: 'close'): void
  (e: 'deleted', lessonGroupId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const deleteLessonGroup = useDeleteAdminLessonGroup()

// Computed properties for proper reactivity
const isDeleting = computed(() => deleteLessonGroup.isPending.value)

const errorMessage = ref('')

// Methods
const handleDelete = async () => {
  if (!props.lessonGroup) {
    return
  }

  try {
    await deleteLessonGroup.mutateAsync(props.lessonGroup.id)
    emit('deleted', props.lessonGroup.id)
    emit('close')
  } catch (error) {
    console.error('Failed to delete lesson group:', error)
    errorMessage.value = 'Failed to delete lesson group. Please try again.'
  }
}
</script>
