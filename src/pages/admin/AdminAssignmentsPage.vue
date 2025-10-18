<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Assignments</h1>
      <Button @click="openCreate" size="sm">Create</Button>
    </div>

    <div class="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Search"
        class="px-3 py-2 border rounded-md"
      />
      <select v-model="ordering" class="px-3 py-2 border rounded-md">
        <option value="-created_at">Newest</option>
        <option value="created_at">Oldest</option>
        <option value="title">Title A-Z</option>
        <option value="-title">Title Z-A</option>
      </select>
    </div>

    <div v-if="isLoading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">Failed to load assignments</div>

    <div
      v-else
      class="bg-white shadow-sm border border-gray-200 rounded-lg divide-y"
    >
      <div
        v-for="item in assignments"
        :key="item.id"
        class="p-4 flex items-center justify-between"
      >
        <div>
          <div class="font-medium text-gray-900">Assignment #{{ item.id }}</div>
          <div class="text-sm text-gray-500">
            Student ID: {{ item.student }} · Lesson ID: {{ item.lesson }}
          </div>
          <div class="text-xs text-gray-400 mt-1">
            <span
              >{{ formatDate(item.begin_time) }} -
              {{ formatDate(item.end_time) }}</span
            >
            · Passing: {{ item.passing_score }}%
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="openEdit(item)"
            >Edit</Button
          >
          <Button variant="destructive" size="sm" @click="remove(item.id)"
            >Delete</Button
          >
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Dialog v-model:open="modalOpen">
      <DialogContent class="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            >{{ editingItem ? 'Edit' : 'Create' }} Assignment</DialogTitle
          >
        </DialogHeader>

        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Student *
            </label>
            <select
              v-model.number="form.student"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select student</option>
              <option
                v-for="student in students"
                :key="student.id"
                :value="student.id"
              >
                {{ student.first_name }} {{ student.last_name }} (@{{
                  student.username
                }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Teacher *
            </label>
            <select
              v-model.number="form.teacher_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select teacher</option>
              <option
                v-for="teacher in teachers"
                :key="teacher.id"
                :value="teacher.id"
              >
                {{ teacher.first_name }} {{ teacher.last_name }} (@{{
                  teacher.username
                }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Lesson *
            </label>
            <select
              v-model.number="selectedLesson"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="null">Select a lesson</option>
              <option
                v-for="lesson in lessons"
                :key="lesson.id"
                :value="lesson.id"
              >
                {{ lesson.title }} ({{ lesson.group_name }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Begin Time *
              </label>
              <input
                v-model="form.begin_time"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                v-model="form.end_time"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Passing Score (0-100) *
            </label>
            <input
              v-model.number="form.passing_score"
              type="number"
              min="0"
              max="100"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeModal">
              Cancel
            </Button>
            <Button type="submit" :disabled="isSubmitting">
              {{
                isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Create'
              }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import {
  useAdminAssignments,
  useCreateAdminAssignment,
  useUpdateAdminAssignment,
  useDeleteAdminAssignment,
  useAdminLessons,
  useAdminTeachers,
} from './queries/useAdminContent'
import { useAdminStudents } from './queries/useAdminStudents'
import type { AdminAssignment, AdminAssignmentCreate } from './types'
import { toast } from 'vue-sonner'

const search = ref('')
const ordering = ref('-created_at')

const params = computed(() => ({
  search: search.value || undefined,
  ordering: ordering.value || undefined,
}))

const { data, isLoading, error, refetch } = useAdminAssignments(params.value)

watch(
  params,
  useDebounceFn(() => {
    refetch()
  }, 300)
)

const assignments = computed<AdminAssignment[]>(() => {
  const value = data?.value
  if (!value) return []
  // Support both array and paginated response
  return Array.isArray(value) ? value : value.results
})

// Fetch students, teachers, and lessons for dropdowns
const studentsQuery = useAdminStudents(computed(() => ({ limit: 100 })))
const students = computed(() => studentsQuery.data.value?.results || [])

const teachersQuery = useAdminTeachers()
const teachers = computed(() => teachersQuery.data?.value || [])

const lessonsQuery = useAdminLessons({ limit: 100 })
const lessons = computed(() => {
  const value = lessonsQuery.data?.value
  if (!value) return []
  return Array.isArray(value) ? value : value.results
})

// Mutations
const createMutation = useCreateAdminAssignment()
const updateMutation = useUpdateAdminAssignment()
const delMutation = useDeleteAdminAssignment()

// Modal state
const modalOpen = ref(false)
const editingItem = ref<AdminAssignment | null>(null)
const isSubmitting = ref(false)
const selectedLesson = ref<number | null>(null)

const form = ref<AdminAssignmentCreate>({
  student: 0,
  teacher_id: 0,
  lesson: 0,
  begin_time: '',
  end_time: '',
  passing_score: 70,
})

function formatDate(date?: string) {
  if (!date) return ''
  try {
    return new Date(date).toLocaleString()
  } catch {
    return date
  }
}

function formatDateTimeLocal(date: string): string {
  try {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ''
  }
}

function openCreate() {
  editingItem.value = null
  selectedLesson.value = null
  form.value = {
    student: 0,
    teacher_id: 0,
    lesson: 0,
    begin_time: '',
    end_time: '',
    passing_score: 70,
  }
  modalOpen.value = true
}

function openEdit(item: AdminAssignment) {
  editingItem.value = item
  selectedLesson.value = item.lesson || null
  form.value = {
    student: item.student,
    teacher_id: item.teacher_id,
    lesson: item.lesson || 0,
    begin_time: formatDateTimeLocal(item.begin_time),
    end_time: formatDateTimeLocal(item.end_time),
    passing_score: item.passing_score,
  }
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingItem.value = null
}

async function submitForm() {
  if (!form.value.student || !form.value.teacher_id) {
    toast.error('Please select student and teacher')
    return
  }

  if (!selectedLesson.value) {
    toast.error('Please select a lesson')
    return
  }

  if (!form.value.begin_time || !form.value.end_time) {
    toast.error('Please select begin and end time')
    return
  }

  if (new Date(form.value.end_time) <= new Date(form.value.begin_time)) {
    toast.error('End time must be after begin time')
    return
  }

  if (form.value.passing_score < 0 || form.value.passing_score > 100) {
    toast.error('Passing score must be between 0 and 100')
    return
  }

  isSubmitting.value = true

  try {
    // Set lesson field with selected lesson
    form.value.lesson = selectedLesson.value

    if (editingItem.value) {
      const updateData = {
        ...form.value,
        id: editingItem.value.id,
      }
      await updateMutation.mutateAsync({
        id: editingItem.value.id,
        data: updateData,
      })
      toast.success('Assignment updated successfully')
    } else {
      await createMutation.mutateAsync(form.value)
      toast.success('Assignment created successfully')
    }
    closeModal()
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          `Failed to ${editingItem.value ? 'update' : 'create'} assignment`
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

function remove(id: number) {
  if (confirm('Are you sure you want to delete this assignment?')) {
    delMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Assignment deleted successfully')
      },
      onError: (err: unknown) => {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || 'Failed to delete assignment'
        toast.error(errorMessage)
      },
    })
  }
}
</script>
