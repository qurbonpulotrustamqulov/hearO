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
          <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <DialogTitle
              class="text-base font-semibold leading-6 text-gray-900"
            >
              Delete Cartoon
            </DialogTitle>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete the cartoon "<strong>{{
                  cartoon?.title
                }}</strong
                >"? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button
            type="button"
            @click="handleDelete"
            :disabled="isDeleting"
            class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
          >
            <ArrowPathIcon
              v-if="isDeleting"
              class="h-4 w-4 mr-2 animate-spin"
            />
            {{ isDeleting ? 'Deleting...' : 'Delete Cartoon' }}
          </Button>
          <DialogClose as-child>
            <Button
              type="button"
              variant="outline"
              :disabled="isDeleting"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Cancel
            </Button>
          </DialogClose>
        </div>

        <DialogClose
          class="absolute top-4 right-4 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Close"
        >
          <XMarkIcon class="h-6 w-6" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { useDeleteAdminCartoon } from '../queries/useAdminContent'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import type { AdminCartoon } from '../types'

interface Props {
  isOpen: boolean
  cartoon: AdminCartoon | null
}

interface Emits {
  (e: 'close'): void
  (e: 'deleted', cartoonId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const deleteCartoon = useDeleteAdminCartoon()

// Computed properties for proper reactivity
const isDeleting = computed(() => deleteCartoon.isPending.value)

const handleDelete = async () => {
  if (!props.cartoon) {
    return
  }

  try {
    await deleteCartoon.mutateAsync(props.cartoon.id)
    emit('deleted', props.cartoon.id)
    emit('close')
  } catch (error) {
    console.error('Failed to delete cartoon:', error)
  }
}
</script>
