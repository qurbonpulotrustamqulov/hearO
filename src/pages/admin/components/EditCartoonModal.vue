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
            <DialogTitle
              class="text-base font-semibold leading-6 text-gray-900"
            >
              Edit Cartoon
            </DialogTitle>
            <div class="mt-4">
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Title Field -->
                <div>
                  <label
                    for="title"
                    class="block text-sm font-medium text-gray-700"
                    >Title</label
                  >
                  <input
                    id="title"
                    v-model="form.title"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    :class="{
                      'border-red-300 focus:border-red-500 focus:ring-red-500':
                        errors.title,
                    }"
                    placeholder="Enter cartoon title"
                  />
                  <p v-if="errors.title" class="mt-1 text-sm text-red-600">
                    {{ errors.title }}
                  </p>
                </div>

                <!-- Link Field -->
                <div>
                  <label
                    for="link"
                    class="block text-sm font-medium text-gray-700"
                    >YouTube Link</label
                  >
                  <input
                    id="link"
                    v-model="form.link"
                    type="url"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    :class="{
                      'border-red-300 focus:border-red-500 focus:ring-red-500':
                        errors.link,
                    }"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p v-if="errors.link" class="mt-1 text-sm text-red-600">
                    {{ errors.link }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500">
                    Enter a valid YouTube video URL
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button
            type="button"
            @click="handleSubmit"
            :disabled="isUpdating"
            class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
          >
            <ArrowPathIcon
              v-if="isUpdating"
              class="h-4 w-4 mr-2 animate-spin"
            />
            {{ isUpdating ? 'Updating...' : 'Update Cartoon' }}
          </Button>
          <DialogClose as-child>
            <Button
              type="button"
              variant="outline"
              :disabled="isUpdating"
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
import { reactive, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { useUpdateAdminCartoon } from '../queries/useAdminContent'
import { XMarkIcon, PencilIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import type { AdminCartoon, AdminCartoonUpdate } from '../types'

interface Props {
  isOpen: boolean
  cartoon: AdminCartoon | null
}

interface Emits {
  (e: 'close'): void
  (e: 'updated', cartoon: AdminCartoon): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const updateCartoon = useUpdateAdminCartoon()

// Computed properties for proper reactivity
const isUpdating = computed(() => updateCartoon.isPending.value)

const form = reactive<AdminCartoonUpdate>({
  id: 0,
  title: '',
  link: '',
})

const errors = reactive({
  title: '',
  link: '',
})

// Watch for cartoon changes and populate form
watch(
  () => props.cartoon,
  (newCartoon) => {
    if (newCartoon) {
      form.id = newCartoon.id
      form.title = newCartoon.title
      form.link = newCartoon.link
    }
  },
  { immediate: true }
)

const validateForm = (): boolean => {
  errors.title = ''
  errors.link = ''

  if (!form.title.trim()) {
    errors.title = 'Title is required'
    return false
  }

  if (!form.link.trim()) {
    errors.link = 'Link is required'
    return false
  }

  // Basic YouTube URL validation
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  if (!youtubeRegex.test(form.link)) {
    errors.link = 'Please enter a valid YouTube URL'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm() || !props.cartoon) {
    return
  }

  try {
    const result = await updateCartoon.mutateAsync({
      id: props.cartoon.id,
      data: {
        id: props.cartoon.id,
        title: form.title.trim(),
        link: form.link.trim(),
      },
    })

    emit('updated', result)
    emit('close')
  } catch (error) {
    console.error('Failed to update cartoon:', error)
  }
}
</script>
