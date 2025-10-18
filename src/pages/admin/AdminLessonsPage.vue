<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Lessons Management</h1>
        <p class="mt-1 text-sm text-gray-500">
          Manage lessons and their content for the learning platform
        </p>
      </div>
      <div class="flex items-center gap-3">
        <Button @click="loadLessons" variant="outline" :disabled="loading">
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
          Add Lesson
        </Button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search lessons..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @input="debouncedSearch"
          />
        </div>
        <div class="flex items-center gap-2">
          <select
            v-model="selectedGroupId"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <select
            v-model="lessonType"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="simple">Simple</option>
            <option value="tutorial">Tutorial</option>
          </select>
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <DocumentTextIcon class="h-8 w-8 text-indigo-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Total Lessons</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ lessonsData?.count || 0 }}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <CheckCircleIcon class="h-8 w-8 text-green-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Active Lessons</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ activeLessonsCount }}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <XCircleIcon class="h-8 w-8 text-red-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Inactive Lessons</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ inactiveLessonsCount }}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <ChartBarIcon class="h-8 w-8 text-blue-600" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Avg Items/Lesson</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ averageItemsPerLesson }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lessons Table -->
    <div class="bg-white shadow-sm rounded-lg border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Lesson
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Group
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Items
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Teacher
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
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                Loading lessons...
              </td>
            </tr>
            <tr v-else-if="!lessonsData?.results?.length" class="text-center">
              <td colspan="6" class="px-6 py-4 text-gray-500">
                No lessons found
              </td>
            </tr>
            <tr
              v-else
              v-for="lesson in lessonsData.results"
              :key="lesson.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ lesson.title }}
                  </div>
                  <div
                    v-if="lesson.description"
                    class="text-sm text-gray-500 truncate max-w-xs"
                  >
                    {{ lesson.description }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ lesson.group_name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="
                    lesson.lesson_type === 'tutorial'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  "
                >
                  {{ lesson.lesson_type || 'simple' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ lesson.items_count ?? lesson.total_items ?? 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ lesson.teacher_id ?? '—' }}
              </td>

              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex items-center justify-end gap-2">
                  <Button
                    @click="viewLessonStats(lesson.id)"
                    variant="outline"
                    size="sm"
                  >
                    <ChartBarIcon class="h-4 w-4" />
                  </Button>
                  <Button
                    @click="editLesson(lesson)"
                    variant="outline"
                    size="sm"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </Button>
                  <Button
                    @click="deleteLesson(lesson)"
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
        v-if="lessonsData && lessonsData.count > 0"
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <Button
            @click="currentPage--"
            :disabled="!lessonsData.previous"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            @click="currentPage++"
            :disabled="!lessonsData.next"
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
              <span class="font-medium">{{
                (currentPage - 1) * limit + 1
              }}</span>
              to
              <span class="font-medium">{{
                Math.min(currentPage * limit, lessonsData.count)
              }}</span>
              of
              <span class="font-medium">{{ lessonsData.count }}</span>
              results
            </p>
          </div>
          <div>
            <nav
              class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            >
              <Button
                @click="currentPage--"
                :disabled="!lessonsData.previous"
                variant="outline"
                size="sm"
                class="rounded-l-md"
              >
                Previous
              </Button>
              <Button
                @click="currentPage++"
                :disabled="!lessonsData.next"
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

    <!-- Create/Edit Lesson Modal -->
    <UniversalFormModal
      v-if="showCreateModal"
      :show="showCreateModal"
      :item-type="'Lesson'"
      :initial-data="editingLesson || undefined"
      :is-editing="!!editingLesson"
      :is-submitting="isSubmitting"
      :errors="formErrors"
      @close="closeModal"
      @submit="onLessonSubmit"
    >
      <template #default="{ formData, updateField, errors, isSubmitting }">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Title</label
            >
            <input
              :value="formData.title || ''"
              @input="
                updateField('title', ($event.target as HTMLInputElement).value)
              "
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            />
            <p v-if="errors.title" class="mt-1 text-sm text-red-600">
              {{ errors.title[0] }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Description</label
            >
            <textarea
              :value="String(formData.description || '')"
              @input="
                updateField(
                  'description',
                  ($event.target as HTMLTextAreaElement).value
                )
              "
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            ></textarea>
            <p v-if="errors.description" class="mt-1 text-sm text-red-600">
              {{ errors.description[0] }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Lesson Group</label
            >
            <select
              :value="formData.group_id || ''"
              @change="
                updateField(
                  'group_id',
                  parseInt(($event.target as HTMLSelectElement).value)
                )
              "
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            >
              <option value="">Select a lesson group</option>
              <option
                v-for="group in lessonGroups"
                :key="group.id"
                :value="group.id"
              >
                {{ group.name }}
              </option>
            </select>
            <p v-if="errors.group_id" class="mt-1 text-sm text-red-600">
              {{ errors.group_id[0] }}
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
              >Teacher</label
            >
            <select
              :value="formData.teacher_id ?? ''"
              @change="
                updateField(
                  'teacher_id',
                  ($event.target as HTMLSelectElement).value
                    ? parseInt(($event.target as HTMLSelectElement).value)
                    : null
                )
              "
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isSubmitting"
            >
              <option value="">No teacher</option>
              <option v-for="t in teachers" :key="t.id" :value="t.id">
                {{ t.username }}
              </option>
            </select>
            <p v-if="errors.teacher_id" class="mt-1 text-sm text-red-600">
              {{ errors.teacher_id[0] }}
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

    <!-- Delete Lesson Modal -->
    <UniversalDeleteModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      :item-type="'Lesson'"
      :item-name="deletingLesson?.title || ''"
      :item-description="deletingLesson?.description"
      :warning-message="'This will also delete all lesson items associated with this lesson.'"
      :is-deleting="isDeleting"
      @close="showDeleteModal = false"
      @confirm="onLessonDeleted"
    />

    <!-- Lesson Statistics Modal -->
    <div
      v-if="showStatsModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="showStatsModal = false"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Lesson Statistics</h3>
            <Button @click="showStatsModal = false" variant="outline" size="sm">
              <XMarkIcon class="h-4 w-4" />
            </Button>
          </div>
          <div v-if="lessonStats" class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">Total Items</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ lessonStats.total_items_count }}
              </p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">Completed Items</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ lessonStats.completed_items_count }}
              </p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">Completion Rate</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ lessonStats.completion_rate }}%
              </p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">Average Score</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ lessonStats.average_score }}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  XCircleIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import {
  useAdminLessons,
  useAdminLessonGroups,
  useAdminLessonStatistics,
  useCreateAdminLesson,
  useUpdateAdminLesson,
  useDeleteAdminLesson,
  useAdminTeachers,
} from './queries/useAdminContent'
import UniversalFormModal from './components/UniversalFormModal.vue'
import UniversalDeleteModal from './components/UniversalDeleteModal.vue'
import type {
  AdminLesson,
  AdminLessonCreate,
  AdminLessonUpdate,
  AdminTeacher,
} from './types'
import { useToasts } from '@/lib/toast'
import { formatApiErrors } from '@/lib/utils'

// Reactive data
const searchQuery = ref('')
const selectedGroupId = ref<number | ''>('')
const lessonType = ref<'' | 'simple' | 'tutorial'>('')
const statusFilter = ref('')
const currentPage = ref(1)
const limit = ref(10)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showStatsModal = ref(false)
const editingLesson = ref<AdminLesson | null>(null)
const deletingLesson = ref<AdminLesson | null>(null)
const selectedLessonId = ref<number | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const formErrors = ref<Record<string, string[]>>({})

// Queries

const {
  data: lessonsData,
  isLoading: loading,
  refetch: loadLessons,
} = useAdminLessons({
  search: searchQuery,
  group_id: computed(() =>
    selectedGroupId.value ? Number(selectedGroupId.value) : undefined
  ),
  lesson_type: lessonType,
  limit,
  offset: computed(() => (currentPage.value - 1) * limit.value),
})

const { data: lessonGroupsData } = useAdminLessonGroups()
const lessonGroups = computed(() => lessonGroupsData.value?.results || [])

// Teachers for selection
const { data: teachersData } = useAdminTeachers()
const teachers = computed(() => teachersData?.value || [])

const { data: lessonStats } = useAdminLessonStatistics(selectedLessonId)

// Computed properties
const activeLessonsCount = computed(() => {
  return (
    lessonsData.value?.results?.filter((lesson) => lesson.is_active).length || 0
  )
})

const inactiveLessonsCount = computed(() => {
  return (
    lessonsData.value?.results?.filter((lesson) => !lesson.is_active).length ||
    0
  )
})

const averageItemsPerLesson = computed(() => {
  if (!lessonsData.value?.results?.length) return 0
  const totalItems = lessonsData.value.results.reduce(
    (sum, lesson) => sum + lesson.total_items,
    0
  )
  return Math.round(totalItems / lessonsData.value.results.length)
})

// Mutations
const createLessonMutation = useCreateAdminLesson()
const updateLessonMutation = useUpdateAdminLesson()
const deleteLessonMutation = useDeleteAdminLesson()

// Methods

const debouncedSearch = (() => {
  let timeout: ReturnType<typeof setTimeout>
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      currentPage.value = 1
      loadLessons()
    }, 300)
  }
})()

const editLesson = (lesson: AdminLesson) => {
  editingLesson.value = lesson
  showCreateModal.value = true
}

const deleteLesson = (lesson: AdminLesson) => {
  deletingLesson.value = lesson
  showDeleteModal.value = true
}

const viewLessonStats = (lessonId: number) => {
  selectedLessonId.value = lessonId
  showStatsModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingLesson.value = null
}

const { success: toastSuccess, error: toastError } = useToasts()

const onLessonSubmit = async (data: AdminLessonCreate | AdminLessonUpdate) => {
  isSubmitting.value = true
  formErrors.value = {}

  try {
    // Ensure teacher_id is valid or null
    const validTeacherIds = new Set(
      teachers.value.map((t: AdminTeacher) => t.id)
    )
    const payload = { ...data }
    if (
      payload.teacher_id != null &&
      !validTeacherIds.has(payload.teacher_id)
    ) {
      payload.teacher_id = null
    }

    if (editingLesson.value) {
      await updateLessonMutation.mutateAsync({
        id: editingLesson.value.id,
        data: payload as AdminLessonUpdate,
      })
      toastSuccess('Lesson updated')
    } else {
      await createLessonMutation.mutateAsync(payload as AdminLessonCreate)
      toastSuccess('Lesson created')
    }
    closeModal()
    loadLessons()
  } catch (err: unknown) {
    const apiErrors =
      (err as { response?: { data?: { errors?: Record<string, string[]> } } })
        ?.response?.data?.errors ||
      (err as { response?: { data?: Record<string, string[]> } })?.response
        ?.data
    if (apiErrors) formErrors.value = apiErrors
    toastError(formatApiErrors(apiErrors))
  } finally {
    isSubmitting.value = false
  }
}

const onLessonDeleted = async () => {
  if (!deletingLesson.value) return

  isDeleting.value = true
  try {
    await deleteLessonMutation.mutateAsync(deletingLesson.value.id)
    showDeleteModal.value = false
    deletingLesson.value = null
    loadLessons()
  } catch (error) {
    console.error('Failed to delete lesson:', error)
  } finally {
    isDeleting.value = false
  }
}

// Watchers
watch([selectedGroupId, statusFilter, lessonType], () => {
  currentPage.value = 1
  loadLessons()
})

// Lifecycle
onMounted(() => {
  loadLessons()
})
</script>
