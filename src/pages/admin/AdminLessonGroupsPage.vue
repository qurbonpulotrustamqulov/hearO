<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Lesson Groups Management
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          Manage lesson groups for the learning platform
        </p>
      </div>
      <div class="flex items-center gap-3">
        <Button @click="loadLessonGroups" variant="outline" :disabled="loading">
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
          Add Lesson Group
        </Button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <div class="relative">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
            />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search lesson groups by name..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              @input="handleSearch"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <select
            v-model="sortBy"
            class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            @change="handleSort"
          >
            <option value="">Sort by...</option>
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
            <option value="order">Order</option>
            <option value="-order">Order (Desc)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Loading State -->
      <div v-if="loading && !lessonGroups.length" class="p-12 text-center">
        <div
          class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4"
        >
          <ArrowPathIcon class="h-6 w-6 text-indigo-600 animate-spin" />
        </div>
        <p class="text-gray-500">Loading lesson groups...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-12 text-center">
        <div
          class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4"
        >
          <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Failed to load lesson groups
        </h3>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <Button @click="loadLessonGroups" variant="outline">
          <ArrowPathIcon class="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!loading && !filteredLessonGroups.length"
        class="p-12 text-center"
      >
        <div
          class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4"
        >
          <AcademicCapIcon class="h-6 w-6 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No lesson groups found
        </h3>
        <p class="text-gray-500 mb-4">
          {{
            searchTerm
              ? 'Try adjusting your search terms'
              : 'Get started by adding your first lesson group'
          }}
        </p>
        <Button
          v-if="!searchTerm"
          @click="showCreateModal = true"
          class="bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Lesson Group
        </Button>
      </div>

      <!-- Lesson Groups List -->
      <div v-else class="divide-y divide-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              Lesson Groups ({{ filteredLessonGroups.length }})
            </h3>
            <div class="text-sm text-gray-500">
              Showing {{ filteredLessonGroups.length }} of
              {{ lessonGroups.length }} lesson groups
            </div>
          </div>
        </div>

        <div
          v-for="lessonGroup in filteredLessonGroups"
          :key="lessonGroup.id"
          class="px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <div
                  class="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center"
                >
                  <AcademicCapIcon class="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ lessonGroup.name }}
                  </h4>
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    ID: {{ lessonGroup.id }}
                  </span>
                </div>
                <div
                  class="mt-1 flex items-center space-x-4 text-sm text-gray-500"
                >
                  <span class="flex items-center">
                    <TagIcon class="h-4 w-4 mr-1" />
                    {{ lessonGroup.slug }}
                  </span>
                  <span class="flex items-center">
                    <ListBulletIcon class="h-4 w-4 mr-1" />
                    {{ lessonGroup.lessons_count }} lessons
                  </span>
                  <span class="flex items-center">
                    <DocumentTextIcon class="h-4 w-4 mr-1" />
                    {{ lessonGroup.total_items_count }} total items
                  </span>
                  <span v-if="lessonGroup.order" class="flex items-center">
                    <HashtagIcon class="h-4 w-4 mr-1" />
                    Order: {{ lessonGroup.order }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Button
                @click="editLessonGroup(lessonGroup)"
                size="sm"
                variant="outline"
                class="text-indigo-600 hover:text-indigo-900"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                @click="deleteLessonGroup(lessonGroup)"
                size="sm"
                variant="outline"
                class="text-red-600 hover:text-red-900"
              >
                <TrashIcon class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Lesson Group Modal -->
    <UniversalFormModal
      v-if="showCreateModal"
      :show="showCreateModal"
      :item-type="'Lesson Group'"
      :initial-data="
        (selectedLessonGroup as unknown as Record<string, unknown>) || undefined
      "
      :is-editing="!!selectedLessonGroup"
      :is-submitting="isSubmitting"
      :errors="formErrors"
      @close="closeModal"
      @submit="onLessonGroupSubmit"
    >
      <template #default="{ formData, updateField, errors, isSubmitting }">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Name</label
            >
            <input
              :value="formData.name || ''"
              @input="
                updateField('name', ($event.target as HTMLInputElement).value)
              "
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">
              {{ errors.name[0] }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Slug</label
            >
            <input
              :value="formData.slug || ''"
              @input="
                updateField('slug', ($event.target as HTMLInputElement).value)
              "
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            />
            <p v-if="errors.slug" class="mt-1 text-sm text-red-600">
              {{ errors.slug[0] }}
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
        </div>
      </template>
    </UniversalFormModal>

    <!-- Delete Lesson Group Modal -->
    <UniversalDeleteModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      :item-type="'Lesson Group'"
      :item-name="selectedLessonGroup?.name || ''"
      :item-description="`Slug: ${selectedLessonGroup?.slug}`"
      :warning-message="'This will also delete all lessons and lesson items in this group.'"
      :is-deleting="isDeleting"
      @close="showDeleteModal = false"
      @confirm="onLessonGroupDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import {
  useAdminLessonGroups,
  useCreateAdminLessonGroup,
  useUpdateAdminLessonGroup,
  useDeleteAdminLessonGroup,
} from './queries/useAdminContent'
import UniversalFormModal from './components/UniversalFormModal.vue'
import UniversalDeleteModal from './components/UniversalDeleteModal.vue'
import {
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  TagIcon,
  ListBulletIcon,
  DocumentTextIcon,
  HashtagIcon,
} from '@heroicons/vue/24/outline'
import type { AdminLessonGroup } from './types'

// State
const searchTerm = ref('')
const sortBy = ref('')

// Modal states
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const selectedLessonGroup = ref<AdminLessonGroup | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const formErrors = ref<Record<string, string[]>>({})

// Query
const lessonGroupsQuery = useAdminLessonGroups()

// Mutations
const createLessonGroupMutation = useCreateAdminLessonGroup()
const updateLessonGroupMutation = useUpdateAdminLessonGroup()
const deleteLessonGroupMutation = useDeleteAdminLessonGroup()

// Computed
const lessonGroups = computed(() => lessonGroupsQuery.data.value?.results || [])
const loading = computed(() => lessonGroupsQuery.isLoading.value)
const error = computed(() => lessonGroupsQuery.error.value?.message || '')

const filteredLessonGroups = computed(() => {
  let filtered = [...lessonGroups.value]

  // Apply search filter
  if (searchTerm.value) {
    filtered = filtered.filter(
      (lessonGroup) =>
        lessonGroup.name
          .toLowerCase()
          .includes(searchTerm.value.toLowerCase()) ||
        lessonGroup.slug.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  // Apply sorting
  if (sortBy.value) {
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'name':
          return a.name.localeCompare(b.name)
        case '-name':
          return b.name.localeCompare(a.name)
        case 'order':
          return (a.order || 0) - (b.order || 0)
        case '-order':
          return (b.order || 0) - (a.order || 0)
        default:
          return 0
      }
    })
  }

  return filtered
})

// Methods
const loadLessonGroups = () => {
  lessonGroupsQuery.refetch()
}

const handleSearch = () => {
  // Search is handled by computed property
}

const handleSort = () => {
  // Sorting is handled by computed property
}

const editLessonGroup = (lessonGroup: AdminLessonGroup) => {
  selectedLessonGroup.value = lessonGroup
  showCreateModal.value = true
}

const deleteLessonGroup = (lessonGroup: AdminLessonGroup) => {
  selectedLessonGroup.value = lessonGroup
  showDeleteModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  selectedLessonGroup.value = null
}

const onLessonGroupSubmit = async (data: {
  name?: string
  slug?: string
  order?: number
}) => {
  isSubmitting.value = true
  formErrors.value = {}
  try {
    if (selectedLessonGroup.value) {
      await updateLessonGroupMutation.mutateAsync({
        id: selectedLessonGroup.value.id,
        data: {
          id: selectedLessonGroup.value.id,
          name: data.name || '',
          slug: data.slug || '',
          order: data.order,
        },
      })
    } else {
      await createLessonGroupMutation.mutateAsync({
        name: data.name || '',
        slug: data.slug || '',
        order: data.order,
      })
    }
    closeModal()
    loadLessonGroups()
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

const onLessonGroupDeleted = async () => {
  if (!selectedLessonGroup.value) return
  isDeleting.value = true
  try {
    await deleteLessonGroupMutation.mutateAsync(selectedLessonGroup.value.id)
    showDeleteModal.value = false
    selectedLessonGroup.value = null
    loadLessonGroups()
  } catch (error) {
    console.error('Failed to delete lesson group:', error)
  } finally {
    isDeleting.value = false
  }
}

// Load lesson groups on mount
onMounted(() => {
  // Query will automatically load on mount
})
</script>
