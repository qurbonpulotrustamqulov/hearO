<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Lesson Items Management
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          Manage individual lesson items with audio and visual content
        </p>
      </div>
      <div class="flex items-center gap-3">
        <Button @click="loadLessonItems" variant="outline" :disabled="loading">
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
          Add Lesson Item
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
            placeholder="Search lesson items..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @input="debouncedSearch"
          />
        </div>
        <div>
          <select
            v-model="selectedLessonId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Lessons</option>
            <option
              v-for="lesson in lessons"
              :key="lesson.id"
              :value="lesson.id"
            >
              {{ lesson.title }}
            </option>
          </select>
        </div>
        <div>
          <select
            v-model="selectedGroupId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Groups</option>
            <option
              v-for="group in lessonGroups"
              :key="group.id"
              :value="group.id"
            >
              {{ group.name }}
            </option>
          </select>
        </div>
        <div>
          <select
            v-model="typeFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="tts">TTS</option>
            <option value="tutorial">Tutorial</option>
          </select>
        </div>
      </div>

      <!-- Additional Filters -->
      <div class="mt-4 flex items-center gap-4">
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
              {{ lessonItemsData?.count || 0 }}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <SpeakerWaveIcon class="h-8 w-8 text-green-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">With Audio</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ itemsWithAudioCount }}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <PhotoIcon class="h-8 w-8 text-blue-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">With Images</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ itemsWithImageCount }}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <ChartBarIcon class="h-8 w-8 text-purple-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">TTS Items</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ ttsItemsCount }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lesson Items Table -->
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
                Lesson
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
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
              <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                Loading lesson items...
              </td>
            </tr>
            <tr
              v-else-if="!lessonItemsData?.results?.length"
              class="text-center"
            >
              <td colspan="7" class="px-6 py-4 text-gray-500">
                No lesson items found
              </td>
            </tr>
            <tr
              v-else
              v-for="item in lessonItemsData.results"
              :key="item.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ item.word }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ item.lesson_title }}</div>
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
                    @click="editLessonItem(item)"
                    variant="outline"
                    size="sm"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </Button>
                  <Button
                    @click="deleteLessonItem(item)"
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
        v-if="lessonItemsData && lessonItemsData.count > 0"
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <Button
            @click="currentPage--"
            :disabled="!lessonItemsData.previous"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            @click="currentPage++"
            :disabled="!lessonItemsData.next"
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
                Math.min(currentPage * 10, lessonItemsData.count)
              }}</span>
              of
              <span class="font-medium">{{ lessonItemsData.count }}</span>
              results
            </p>
          </div>
          <div>
            <nav
              class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            >
              <Button
                @click="currentPage--"
                :disabled="!lessonItemsData.previous"
                variant="outline"
                size="sm"
                class="rounded-l-md"
              >
                Previous
              </Button>
              <Button
                @click="currentPage++"
                :disabled="!lessonItemsData.next"
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

    <!-- Create/Edit Lesson Item Modal -->
    <UniversalFormModal
      v-if="showCreateModal"
      :show="showCreateModal"
      :item-type="'Lesson Item'"
      :initial-data="editingLessonItem || undefined"
      :is-editing="!!editingLessonItem"
      :is-submitting="isSubmitting"
      :errors="formErrors"
      @close="closeModal"
      @submit="onLessonItemSubmit"
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
              >Lesson</label
            >
            <select
              :value="formData.lesson_id || ''"
              @change="
                updateField(
                  'lesson_id',
                  parseInt(($event.target as HTMLSelectElement).value)
                )
              "
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            >
              <option value="">Select a lesson</option>
              <option
                v-for="lesson in lessons"
                :key="lesson.id"
                :value="lesson.id"
              >
                {{ lesson.title }}
              </option>
            </select>
            <p v-if="errors.lesson_id" class="mt-1 text-sm text-red-600">
              {{ errors.lesson_id[0] }}
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
              <option value="tutorial">Tutorial</option>
            </select>
            <p v-if="errors.type" class="mt-1 text-sm text-red-600">
              {{ errors.type[0] }}
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

    <!-- Delete Lesson Item Modal -->
    <UniversalDeleteModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      :item-type="'Lesson Item'"
      :item-name="deletingLessonItem?.word || ''"
      :warning-message="'This action cannot be undone.'"
      :is-deleting="isDeleting"
      @close="showDeleteModal = false"
      @confirm="onLessonItemDeleted"
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
  SpeakerWaveIcon,
  PhotoIcon,
  ChartBarIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import {
  useAdminLessonItems,
  useAdminLessons,
  useAdminLessonGroups,
  useCreateAdminLessonItem,
  useUpdateAdminLessonItem,
  useDeleteAdminLessonItem,
} from './queries/useAdminContent'
import UniversalFormModal from './components/UniversalFormModal.vue'
import UniversalDeleteModal from './components/UniversalDeleteModal.vue'
import type {
  AdminLessonItem,
  AdminLessonItemCreate,
  AdminLessonItemUpdate,
} from './types'
import { format } from 'date-fns'

// Reactive data
const searchQuery = ref('')
const selectedLessonId = ref<number | ''>('')
const selectedGroupId = ref<number | ''>('')
const typeFilter = ref<'tts' | 'tutorial' | ''>('')
const hasAudioFilter = ref(false)
const hasImageFilter = ref(false)
const currentPage = ref(1)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingLessonItem = ref<AdminLessonItem | null>(null)
const deletingLessonItem = ref<AdminLessonItem | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const formErrors = ref<Record<string, string[]>>({})

// Queries
const queryParams = computed(() => ({
  page: currentPage.value,
  search: searchQuery.value || undefined,
  lesson_id: selectedLessonId.value || undefined,
  group_id: selectedGroupId.value || undefined,
  type: (typeFilter.value as 'tts' | 'tutorial' | undefined) || undefined,
  has_audio: hasAudioFilter.value || undefined,
  has_image: hasImageFilter.value || undefined,
}))

const {
  data: lessonItemsData,
  isLoading: loading,
  refetch: loadLessonItems,
} = useAdminLessonItems(queryParams.value)

const { data: lessonsData } = useAdminLessons()
const lessons = computed(() => lessonsData.value?.results || [])

const { data: lessonGroupsData } = useAdminLessonGroups()
const lessonGroups = computed(() => lessonGroupsData.value?.results || [])

// Computed properties
const itemsWithAudioCount = computed(() => {
  return (
    lessonItemsData.value?.results?.filter((item) => item.audio).length || 0
  )
})

const itemsWithImageCount = computed(() => {
  return (
    lessonItemsData.value?.results?.filter((item) => item.image).length || 0
  )
})

const ttsItemsCount = computed(() => {
  return (
    lessonItemsData.value?.results?.filter((item) => item.type === 'tts')
      .length || 0
  )
})

// Mutations
const createLessonItemMutation = useCreateAdminLessonItem()
const updateLessonItemMutation = useUpdateAdminLessonItem()
const deleteLessonItemMutation = useDeleteAdminLessonItem()

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
      loadLessonItems()
    }, 300)
  }
})()

const playAudio = (item: AdminLessonItem) => {
  if (item.audio) {
    const audio = new Audio(item.audio)
    audio.play().catch(console.error)
  }
}

const editLessonItem = (item: AdminLessonItem) => {
  editingLessonItem.value = item
  showCreateModal.value = true
}

const deleteLessonItem = (item: AdminLessonItem) => {
  deletingLessonItem.value = item
  showDeleteModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingLessonItem.value = null
}

const onLessonItemSubmit = async (
  data: AdminLessonItemCreate | AdminLessonItemUpdate
) => {
  isSubmitting.value = true
  formErrors.value = {}

  try {
    if (editingLessonItem.value) {
      await updateLessonItemMutation.mutateAsync({
        id: editingLessonItem.value.id,
        data: data as AdminLessonItemUpdate,
      })
    } else {
      await createLessonItemMutation.mutateAsync(data as AdminLessonItemCreate)
    }
    closeModal()
    loadLessonItems()
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

const onLessonItemDeleted = async () => {
  if (!deletingLessonItem.value) return

  isDeleting.value = true
  try {
    await deleteLessonItemMutation.mutateAsync(deletingLessonItem.value.id)
    showDeleteModal.value = false
    deletingLessonItem.value = null
    loadLessonItems()
  } catch (error) {
    console.error('Failed to delete lesson item:', error)
  } finally {
    isDeleting.value = false
  }
}

// Watchers
watch(
  [
    selectedLessonId,
    selectedGroupId,
    typeFilter,
    hasAudioFilter,
    hasImageFilter,
  ],
  () => {
    currentPage.value = 1
    loadLessonItems()
  }
)

// Lifecycle
onMounted(() => {
  loadLessonItems()
})
</script>
