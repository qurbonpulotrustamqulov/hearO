<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Practice Items Management
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          Manage practice items for speech and listening exercises
        </p>
      </div>
      <div class="flex items-center gap-3">
        <Button
          @click="loadPracticeItems"
          variant="outline"
          :disabled="loading"
        >
          <ArrowPathIcon
            class="h-4 w-4 mr-2"
            :class="{ 'animate-spin': loading }"
          />
          Refresh
        </Button>
        <Button
          @click="showCreateModal = true"
          class="bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Practice Item
        </Button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="lg:col-span-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search practice items..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @input="debouncedSearch"
          />
        </div>
        <div>
          <select
            v-model="typeFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="tts">TTS</option>
            <option value="stt">STT</option>
          </select>
        </div>
        <div>
          <select
            v-model="difficultyFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Difficulties</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>
        </div>
        <div>
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Additional Filters -->
      <div class="mt-4 flex items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-700">Min Difficulty:</label>
          <input
            v-model="minDifficulty"
            type="number"
            min="1"
            max="5"
            class="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-700">Max Difficulty:</label>
          <input
            v-model="maxDifficulty"
            type="number"
            min="1"
            max="5"
            class="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <label class="flex items-center">
          <input
            v-model="hasAudioFilter"
            type="checkbox"
            class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span class="ml-2 text-sm text-gray-700">Has Audio</span>
        </label>
        <label class="flex items-center">
          <input
            v-model="hasImageFilter"
            type="checkbox"
            class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span class="ml-2 text-sm text-gray-700">Has Image</span>
        </label>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <DocumentTextIcon class="h-8 w-8 text-indigo-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Total Items</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ practiceItemsData?.count || 0 }}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <CheckCircleIcon class="h-8 w-8 text-green-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Active Items</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ activeItemsCount }}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <SpeakerWaveIcon class="h-8 w-8 text-blue-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">TTS Items</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ ttsItemsCount }}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <MicrophoneIcon class="h-8 w-8 text-purple-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">STT Items</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ sttItemsCount }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Practice Items Table -->
    <div class="bg-white shadow-sm rounded-lg border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Word/Content
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Difficulty
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Media
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Created
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                Loading practice items...
              </td>
            </tr>
            <tr
              v-else-if="!practiceItemsData?.results?.length"
              class="text-center"
            >
              <td colspan="8" class="px-6 py-4 text-gray-500">
                No practice items found
              </td>
            </tr>
            <tr
              v-else
              v-for="item in practiceItemsData.results"
              :key="item.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ item.word }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="
                    item.type === 'tts'
                      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                  "
                >
                  {{ item.type.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex">
                    <span
                      v-for="i in 5"
                      :key="i"
                      :class="
                        i <= item.difficulty
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      "
                      class="text-sm"
                    >
                      ★
                    </span>
                  </div>
                  <span class="ml-2 text-sm text-gray-500"
                    >({{ item.difficulty }})</span
                  >
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span
                    v-if="item.audio"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    <SpeakerWaveIcon class="h-3 w-3 mr-1" />
                    Audio
                  </span>
                  <span
                    v-if="item.image"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <PhotoIcon class="h-3 w-3 mr-1" />
                    Image
                  </span>
                  <span
                    v-if="!item.audio && !item.image"
                    class="text-xs text-gray-500"
                  >
                    No media
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.order }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="
                    item.is_active
                      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
                  "
                >
                  {{ item.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(item.created_at) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex items-center justify-end gap-2">
                  <Button
                    @click="playAudio(item)"
                    v-if="item.audio"
                    variant="outline"
                    size="sm"
                  >
                    <PlayIcon class="h-4 w-4" />
                  </Button>
                  <Button
                    @click="editPracticeItem(item)"
                    variant="outline"
                    size="sm"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </Button>
                  <Button
                    @click="deletePracticeItem(item)"
                    variant="outline"
                    size="sm"
                    class="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="practiceItemsData && practiceItemsData.count > 0"
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <Button
            @click="currentPage--"
            :disabled="!practiceItemsData.previous"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            @click="currentPage++"
            :disabled="!practiceItemsData.next"
            variant="outline"
          >
            Next
          </Button>
        </div>
        <div
          class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{{ (currentPage - 1) * 10 + 1 }}</span>
              to
              <span class="font-medium">{{
                Math.min(currentPage * 10, practiceItemsData.count)
              }}</span>
              of
              <span class="font-medium">{{ practiceItemsData.count }}</span>
              results
            </p>
          </div>
          <div>
            <nav
              class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            >
              <Button
                @click="currentPage--"
                :disabled="!practiceItemsData.previous"
                variant="outline"
                size="sm"
                class="rounded-l-md"
              >
                Previous
              </Button>
              <Button
                @click="currentPage++"
                :disabled="!practiceItemsData.next"
                variant="outline"
                size="sm"
                class="rounded-r-md"
              >
                Next
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Practice Item Modal -->
    <UniversalFormModal
      v-if="showCreateModal"
      :show="showCreateModal"
      :item-type="'Practice Item'"
      :initial-data="editingPracticeItem || undefined"
      :is-editing="!!editingPracticeItem"
      :is-submitting="isSubmitting"
      :errors="formErrors"
      @close="closeModal"
      @submit="onPracticeItemSubmit"
    >
      <template #default="{ formData, updateField, errors, isSubmitting }">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Word</label
            >
            <input
              :value="formData.word || ''"
              @input="
                updateField('word', ($event.target as HTMLInputElement).value)
              "
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            />
            <p v-if="errors.word" class="mt-1 text-sm text-red-600">
              {{ errors.word[0] }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Type</label
            >
            <select
              :value="formData.type || 'tts'"
              @change="
                updateField('type', ($event.target as HTMLSelectElement).value)
              "
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            >
              <option value="tts">TTS (Text-to-Speech)</option>
              <option value="stt">STT (Speech-to-Text)</option>
            </select>
            <p v-if="errors.type" class="mt-1 text-sm text-red-600">
              {{ errors.type[0] }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Difficulty (1-5)</label
            >
            <input
              :value="formData.difficulty || 1"
              @input="
                updateField(
                  'difficulty',
                  parseInt(($event.target as HTMLInputElement).value) || 1
                )
              "
              type="number"
              min="1"
              max="5"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            />
            <p v-if="errors.difficulty" class="mt-1 text-sm text-red-600">
              {{ errors.difficulty[0] }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Order</label
            >
            <input
              :value="formData.order || ''"
              @input="
                updateField(
                  'order',
                  parseInt(($event.target as HTMLInputElement).value) || 0
                )
              "
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            />
            <p v-if="errors.order" class="mt-1 text-sm text-red-600">
              {{ errors.order[0] }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Audio File</label
            >
            <input
              @change="
                updateField(
                  'audio',
                  ($event.target as HTMLInputElement).files?.[0] || null
                )
              "
              type="file"
              accept="audio/*"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            />
            <p v-if="errors.audio" class="mt-1 text-sm text-red-600">
              {{ errors.audio[0] }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Image File</label
            >
            <input
              @change="
                updateField(
                  'image',
                  ($event.target as HTMLInputElement).files?.[0] || null
                )
              "
              type="file"
              accept="image/*"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            />
            <p v-if="errors.image" class="mt-1 text-sm text-red-600">
              {{ errors.image[0] }}
            </p>
          </div>

          <div class="flex items-center">
            <input
              :checked="formData.is_active !== false"
              @change="
                updateField(
                  'is_active',
                  ($event.target as HTMLInputElement).checked
                )
              "
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              :disabled="isSubmitting"
            />
            <label class="ml-2 text-sm text-gray-700">Active</label>
          </div>
        </div>
      </template>
    </UniversalFormModal>

    <!-- Delete Practice Item Modal -->
    <UniversalDeleteModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      :item-type="'Practice Item'"
      :item-name="deletingPracticeItem?.word || ''"
      :warning-message="'This action cannot be undone.'"
      :is-deleting="isDeleting"
      @close="showDeleteModal = false"
      @confirm="onPracticeItemDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  ArrowPathIcon,
  PlusIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  PhotoIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import {
  useAdminPracticeItems,
  useCreateAdminPracticeItem,
  useUpdateAdminPracticeItem,
  useDeleteAdminPracticeItem,
} from './queries/useAdminContent'
import UniversalFormModal from './components/UniversalFormModal.vue'
import UniversalDeleteModal from './components/UniversalDeleteModal.vue'
import type {
  AdminPracticeItem,
  AdminPracticeItemCreate,
  AdminPracticeItemUpdate,
} from './types'
import { format } from 'date-fns'

// Reactive data
const searchQuery = ref('')
const typeFilter = ref<'tts' | 'stt' | ''>('')
const difficultyFilter = ref<number | ''>('')
const statusFilter = ref('')
const minDifficulty = ref<number | ''>('')
const maxDifficulty = ref<number | ''>('')
const hasAudioFilter = ref(false)
const hasImageFilter = ref(false)
const currentPage = ref(1)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingPracticeItem = ref<AdminPracticeItem | null>(null)
const deletingPracticeItem = ref<AdminPracticeItem | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const formErrors = ref<Record<string, string[]>>({})

const queryParams = computed(() => ({
  page: currentPage.value,
  search: searchQuery.value || undefined,
  type: (typeFilter.value as 'tts' | 'stt' | undefined) || undefined,
  difficulty: difficultyFilter.value
    ? String(difficultyFilter.value)
    : undefined,
  is_active: statusFilter.value ? statusFilter.value === 'true' : undefined,
  difficulty_min: minDifficulty.value || undefined,
  difficulty_max: maxDifficulty.value || undefined,
  has_audio: hasAudioFilter.value || undefined,
  has_image: hasImageFilter.value || undefined,
}))

const {
  data: practiceItemsData,
  isLoading: loading,
  refetch: loadPracticeItems,
} = useAdminPracticeItems(queryParams.value)

// Computed properties
const activeItemsCount = computed(() => {
  return (
    practiceItemsData.value?.results?.filter((item) => item.is_active).length ||
    0
  )
})

const ttsItemsCount = computed(() => {
  return (
    practiceItemsData.value?.results?.filter((item) => item.type === 'tts')
      .length || 0
  )
})

const sttItemsCount = computed(() => {
  return (
    practiceItemsData.value?.results?.filter((item) => item.type === 'stt')
      .length || 0
  )
})

// Mutations
const createPracticeItemMutation = useCreateAdminPracticeItem()
const updatePracticeItemMutation = useUpdateAdminPracticeItem()
const deletePracticeItemMutation = useDeleteAdminPracticeItem()

// Methods
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy')
}

const debouncedSearch = (() => {
  let timeout: ReturnType<typeof setTimeout>
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      currentPage.value = 1
      loadPracticeItems()
    }, 300)
  }
})()

const playAudio = (item: AdminPracticeItem) => {
  if (item.audio) {
    const audio = new Audio(item.audio)
    audio.play().catch(console.error)
  }
}

const editPracticeItem = (item: AdminPracticeItem) => {
  editingPracticeItem.value = item
  showCreateModal.value = true
}

const deletePracticeItem = (item: AdminPracticeItem) => {
  deletingPracticeItem.value = item
  showDeleteModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingPracticeItem.value = null
}

const onPracticeItemSubmit = async (
  data: AdminPracticeItemCreate | AdminPracticeItemUpdate
) => {
  isSubmitting.value = true
  formErrors.value = {}

  try {
    if (editingPracticeItem.value) {
      await updatePracticeItemMutation.mutateAsync({
        id: editingPracticeItem.value.id,
        data: data as AdminPracticeItemUpdate,
      })
    } else {
      await createPracticeItemMutation.mutateAsync(
        data as AdminPracticeItemCreate
      )
    }
    closeModal()
    loadPracticeItems()
  } catch (err: unknown) {
    const e = err as {
      response?: { data?: { errors?: Record<string, string[]> } }
    }
    if (e.response?.data?.errors) {
      formErrors.value = e.response.data.errors
    }
  } finally {
    isSubmitting.value = false
  }
}

const onPracticeItemDeleted = async () => {
  if (!deletingPracticeItem.value) return

  isDeleting.value = true
  try {
    await deletePracticeItemMutation.mutateAsync(deletingPracticeItem.value.id)
    showDeleteModal.value = false
    deletingPracticeItem.value = null
    loadPracticeItems()
  } catch (error) {
    console.error('Failed to delete practice item:', error)
  } finally {
    isDeleting.value = false
  }
}

// Watchers
watch(
  [
    typeFilter,
    difficultyFilter,
    statusFilter,
    minDifficulty,
    maxDifficulty,
    hasAudioFilter,
    hasImageFilter,
  ],
  () => {
    currentPage.value = 1
    loadPracticeItems()
  }
)

// Lifecycle
onMounted(() => {
  loadPracticeItems()
})
</script>
