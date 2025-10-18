<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="closeModal"
  >
    <div
      class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
      @click.stop
    >
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Confirm Deletion</h3>
          <Button @click="closeModal" variant="outline" size="sm">
            <XMarkIcon class="h-4 w-4" />
          </Button>
        </div>

        <!-- Content -->
        <div class="mb-6">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <ExclamationTriangleIcon class="h-8 w-8 text-red-600" />
            </div>
            <div class="ml-3">
              <h4 class="text-sm font-medium text-gray-900">
                Are you sure you want to delete this {{ itemType }}?
              </h4>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-2">
              <strong>{{ itemType }}:</strong> {{ itemName }}
            </p>
            <p v-if="itemDescription" class="text-sm text-gray-600">
              <strong>Description:</strong> {{ itemDescription }}
            </p>
            <p v-if="additionalInfo" class="text-sm text-gray-600">
              {{ additionalInfo }}
            </p>
          </div>

          <div
            v-if="warningMessage"
            class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
          >
            <div class="flex">
              <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" />
              <div class="ml-3">
                <p class="text-sm text-yellow-800">{{ warningMessage }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
          <Button @click="closeModal" variant="outline" :disabled="isDeleting">
            Cancel
          </Button>
          <Button
            @click="confirmDelete"
            class="bg-red-600 hover:bg-red-700 text-white"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting" class="flex items-center">
              <ArrowPathIcon class="h-4 w-4 mr-2 animate-spin" />
              Deleting...
            </span>
            <span v-else>Delete {{ itemType }}</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

interface Props {
  show: boolean
  itemType: string
  itemName: string
  itemDescription?: string
  additionalInfo?: string
  warningMessage?: string
  isDeleting?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
  isDeleting: false,
})

const emit = defineEmits<Emits>()

const closeModal = () => {
  if (!props.isDeleting) {
    emit('close')
  }
}

const confirmDelete = () => {
  emit('confirm')
}
</script>
