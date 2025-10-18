<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import {
  TrashIcon,
  PencilIcon,
  ArrowPathIcon,
  PlusIcon,
  CalendarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'
import useToasts from '@/lib/toast.ts'
import {
  getAssignments,
  deleteAssignment,
  createAssignment,
  updateAssignment,
  type AssignmentRes,
  type AssignmentReq,
} from './api/assignments'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getStudents, type StudentRes } from './api/students'
import { getLessons } from './api/lessons'
import type { ILesson } from '@/pages/lessons/types'

const toast = useToasts()
const { t } = useI18n()

// State
const assignments = ref<AssignmentRes[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const limit = ref(20)
const offset = ref(0)
const totalCount = ref(0)

// Modal state
const showAssignmentModal = ref(false)
const isSubmitting = ref(false)
const editingAssignment = ref<AssignmentRes | null>(null)

// Form data
const formData = ref<AssignmentReq>({
  student: 0,
  lesson: 0,
  begin_time: '',
  end_time: '',
  passing_score: 70,
})

// Students and Lessons
const students = ref<StudentRes[]>([])
const lessons = ref<ILesson[]>([])
const loadingStudents = ref(false)
const loadingLessons = ref(false)

// Load students
const loadStudents = async () => {
  loadingStudents.value = true
  try {
    const response = await getStudents({ limit: 100, offset: 0 })
    students.value = response.results
  } catch {
    toast.error('Failed to load students')
  } finally {
    loadingStudents.value = false
  }
}

// Load lessons
const loadLessons = async () => {
  loadingLessons.value = true
  try {
    const response = await getLessons({ limit: 100, offset: 0 })
    lessons.value = response.results
  } catch {
    toast.error('Failed to load lessons')
  } finally {
    loadingLessons.value = false
  }
}

// Open create modal
const openCreateModal = () => {
  editingAssignment.value = null
  formData.value = {
    student: 0,
    lesson: 0,
    begin_time: '',
    end_time: '',
    passing_score: 70,
  }
  showAssignmentModal.value = true
}

// Open edit modal
const openEditModal = (assignment: AssignmentRes) => {
  editingAssignment.value = assignment
  formData.value = {
    student: assignment.student,
    lesson: assignment.lesson,
    begin_time: assignment.begin_time,
    end_time: assignment.end_time,
    passing_score: assignment.passing_score,
  }
  showAssignmentModal.value = true
}

// Close modal
const closeModal = () => {
  showAssignmentModal.value = false
  editingAssignment.value = null
}

// Submit form
const submitForm = async () => {
  // Validate
  if (!formData.value.student || !formData.value.lesson) {
    toast.error('Please select student and lesson')
    return
  }
  if (!formData.value.begin_time || !formData.value.end_time) {
    toast.error('Please select begin and end time')
    return
  }

  isSubmitting.value = true
  try {
    if (editingAssignment.value) {
      await updateAssignment(editingAssignment.value.id, formData.value)
      toast.success('Assignment updated successfully')
    } else {
      await createAssignment(formData.value)
      toast.success('Assignment created successfully')
    }
    closeModal()
    await loadAssignments()
  } catch {
    toast.error(
      editingAssignment.value
        ? 'Failed to update assignment'
        : 'Failed to create assignment'
    )
  } finally {
    isSubmitting.value = false
  }
}

// Load assignments
const loadAssignments = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await getAssignments({
      limit: limit.value,
      offset: offset.value,
    })
    assignments.value = response.data.results
    totalCount.value = response.data.count
  } catch (err: unknown) {
    error.value =
      err instanceof Error ? err.message : 'Failed to load assignments'
    toast.error('Failed to load assignments')
  } finally {
    isLoading.value = false
  }
}

// Delete assignment
const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this assignment?')) return

  try {
    await deleteAssignment(id)
    toast.success('Assignment deleted successfully')
    await loadAssignments()
  } catch {
    toast.error('Failed to delete assignment')
  }
}

// Format date
const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// Get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'FAILED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  }
}

// Get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return CheckCircleIcon
    case 'FAILED':
      return XCircleIcon
    default:
      return ClockIcon
  }
}

// Pagination
const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
const totalPages = computed(() => Math.ceil(totalCount.value / limit.value))

const goToPage = (page: number) => {
  offset.value = (page - 1) * limit.value
  loadAssignments()
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

onMounted(() => {
  loadAssignments()
  loadStudents()
  loadLessons()
})
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">
        {{ t('teacher.assignments.title', 'My Assignments') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        {{
          t(
            'teacher.assignments.description',
            'Manage assignments for your students'
          )
        }}
      </p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <!-- Header -->
      <div
        class="flex justify-between items-center p-6 border-b dark:border-gray-700"
      >
        <h2 class="text-xl font-semibold">
          {{ t('teacher.assignments.list', 'Assignments List') }}
          <span
            v-if="totalCount > 0"
            class="text-sm font-normal text-gray-500 ml-2"
          >
            ({{ totalCount }} total)
          </span>
        </h2>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="loadAssignments"
            :disabled="isLoading"
          >
            <ArrowPathIcon
              class="w-4 h-4 mr-2"
              :class="{ 'animate-spin': isLoading }"
            />
            {{ t('common.refresh', 'Refresh') }}
          </Button>
          <Button size="sm" @click="openCreateModal">
            <PlusIcon class="w-4 h-4 mr-2" />
            {{ t('teacher.assignments.create', 'Create Assignment') }}
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading && assignments.length === 0"
        class="p-12 text-center"
      >
        <ArrowPathIcon
          class="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400"
        />
        <p class="text-gray-500 dark:text-gray-400">
          {{ t('common.loading', 'Loading...') }}
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-12 text-center">
        <XCircleIcon class="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
        <Button variant="outline" class="mt-4" @click="loadAssignments">
          {{ t('common.tryAgain', 'Try Again') }}
        </Button>
      </div>

      <!-- Empty State -->
      <div v-else-if="assignments.length === 0" class="p-12 text-center">
        <AcademicCapIcon class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p class="text-gray-500 dark:text-gray-400 mb-2">
          {{
            t(
              'teacher.assignments.empty',
              'No assignments yet. Create your first assignment!'
            )
          }}
        </p>
        <Button class="mt-4" @click="openCreateModal">
          <PlusIcon class="w-4 h-4 mr-2" />
          {{ t('teacher.assignments.create', 'Create Assignment') }}
        </Button>
      </div>

      <!-- Assignments List -->
      <div v-else class="divide-y dark:divide-gray-700">
        <div
          v-for="assignment in assignments"
          :key="assignment.id"
          class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{
                    assignment.lesson_full?.title ||
                    'Lesson #' + assignment.lesson
                  }}
                </h3>
                <span
                  :class="getStatusColor(assignment.status)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  <component
                    :is="getStatusIcon(assignment.status)"
                    class="w-4 h-4 mr-1"
                  />
                  {{ assignment.status }}
                </span>
              </div>

              <!-- Student Info -->
              <div
                v-if="assignment.student_full"
                class="flex items-center gap-2 mb-3 text-sm text-gray-700 dark:text-gray-300"
              >
                <UserIcon class="w-4 h-4" />
                <span class="font-medium">
                  {{ assignment.student_full.first_name }}
                  {{ assignment.student_full.last_name }}
                </span>
                <span class="text-gray-500 dark:text-gray-400">
                  (@{{ assignment.student_full.username }})
                </span>
              </div>

              <div
                class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400"
              >
                <div class="flex items-center gap-2">
                  <CalendarIcon class="w-4 h-4" />
                  <span>Start: {{ formatDate(assignment.begin_time) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <CalendarIcon class="w-4 h-4" />
                  <span>End: {{ formatDate(assignment.end_time) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <AcademicCapIcon class="w-4 h-4" />
                  <span>Passing Score: {{ assignment.passing_score }}%</span>
                </div>
                <div
                  v-if="assignment.lesson_full?.group_name"
                  class="flex items-center gap-2"
                >
                  <AcademicCapIcon class="w-4 h-4" />
                  <span>Group: {{ assignment.lesson_full.group_name }}</span>
                </div>
              </div>
            </div>

            <div class="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                @click="openEditModal(assignment)"
              >
                <PencilIcon class="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="handleDelete(assignment.id)"
              >
                <TrashIcon class="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-6 py-4 border-t dark:border-gray-700"
      >
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="prevPage"
            :disabled="currentPage === 1"
          >
            {{ t('common.previous', 'Previous') }}
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="nextPage"
            :disabled="currentPage === totalPages"
          >
            {{ t('common.next', 'Next') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Assignment Modal -->
    <Dialog :open="showAssignmentModal" @update:open="closeModal">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{
              editingAssignment
                ? t('teacher.assignments.edit', 'Edit Assignment')
                : t('teacher.assignments.create', 'Create Assignment')
            }}
          </DialogTitle>
          <DialogDescription>
            {{
              editingAssignment
                ? t(
                    'teacher.assignments.editDescription',
                    'Update assignment details'
                  )
                : t(
                    'teacher.assignments.createDescription',
                    'Create a new assignment for a student'
                  )
            }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <!-- Student Select -->
          <div>
            <label class="block text-sm font-medium mb-2">
              {{ t('teacher.assignments.student', 'Student') }} *
            </label>
            <select
              v-model="formData.student"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              :disabled="loadingStudents"
            >
              <option :value="0">
                {{ t('teacher.assignments.selectStudent', 'Select a student') }}
              </option>
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

          <!-- Lesson Select -->
          <div>
            <label class="block text-sm font-medium mb-2">
              {{ t('teacher.assignments.lesson', 'Lesson') }} *
            </label>
            <select
              v-model="formData.lesson"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              :disabled="loadingLessons"
            >
              <option :value="0">
                {{ t('teacher.assignments.selectLesson', 'Select a lesson') }}
              </option>
              <option
                v-for="lesson in lessons"
                :key="lesson.id"
                :value="lesson.id"
              >
                {{ lesson.title }}
              </option>
            </select>
          </div>

          <!-- Begin Time -->
          <div>
            <label class="block text-sm font-medium mb-2">
              {{ t('teacher.assignments.beginTime', 'Begin Time') }} *
            </label>
            <input
              type="datetime-local"
              v-model="formData.begin_time"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <!-- End Time -->
          <div>
            <label class="block text-sm font-medium mb-2">
              {{ t('teacher.assignments.endTime', 'End Time') }} *
            </label>
            <input
              type="datetime-local"
              v-model="formData.end_time"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <!-- Passing Score -->
          <div>
            <label class="block text-sm font-medium mb-2">
              {{ t('teacher.assignments.passingScore', 'Passing Score') }} (%)
            </label>
            <input
              type="number"
              v-model="formData.passing_score"
              min="0"
              max="100"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="closeModal"
            :disabled="isSubmitting"
          >
            {{ t('common.cancel', 'Cancel') }}
          </Button>
          <Button @click="submitForm" :disabled="isSubmitting">
            {{
              isSubmitting
                ? t('common.saving', 'Saving...')
                : t('common.save', 'Save')
            }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
