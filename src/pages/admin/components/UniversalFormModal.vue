<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="closeModal"
  >
    <div
      class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white"
      @click.stop
    >
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEditing ? `Edit ${itemType}` : `Create ${itemType}` }}
          </h3>
          <Button @click="closeModal" variant="outline" size="sm">
            <XMarkIcon class="h-4 w-4" />
          </Button>
        </div>

        <!-- Form Content -->
        <div class="mb-6">
          <slot
            :form-data="formData"
            :update-field="updateField"
            :errors="errors"
            :is-submitting="isSubmitting"
          />
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
          <Button
            @click="closeModal"
            variant="outline"
            :disabled="isSubmitting"
          >
            Cancel
          </Button>
          <Button
            @click="submitForm"
            class="bg-indigo-600 hover:bg-indigo-700 text-white"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <ArrowPathIcon class="h-4 w-4 mr-2 animate-spin" />
              {{ isEditing ? 'Updating...' : 'Creating...' }}
            </span>
            <span v-else
              >{{ isEditing ? 'Update' : 'Create' }} {{ itemType }}</span
            >
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { XMarkIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

interface Props {
  show: boolean
  itemType: string
  initialData?: T
  isEditing?: boolean
  isSubmitting?: boolean
  errors?: Record<string, string[]>
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: T): void
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  isSubmitting: false,
  errors: () => ({}),
})

const emit = defineEmits<Emits>()

const formData = ref<T>({} as T)

// Initialize form data
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = { ...newData }
    } else {
      formData.value = {} as T
    }
  },
  { immediate: true }
)

const updateField = (field: string, value: unknown) => {
  formData.value = { ...formData.value, [field]: value }
}

const closeModal = () => {
  if (!props.isSubmitting) {
    emit('close')
  }
}

const submitForm = () => {
  emit('submit', formData.value)
}
</script>
