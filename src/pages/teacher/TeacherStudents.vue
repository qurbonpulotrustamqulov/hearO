<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from './queries/use-students'
import { useCreateAssignment } from './queries/use-assignments'
import { useLessons } from './queries/use-lessons'
import type {
  CreateStudentReq,
  StudentRes,
  StudentsFilter,
} from './api/students'
import type { AssignmentReq } from './api/assignments'
import Button from '@/components/ui/button/Button.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import DialogTrigger from '@/components/ui/dialog/DialogTrigger.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { PencilIcon, TrashIcon, UserPlusIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

// Filter and pagination state
const filter = reactive<StudentsFilter>({
  limit: 10,
  offset: 0,
})

// State
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isAssignModalOpen = ref(false)
const selectedStudent = ref<StudentRes | null>(null)
const selectedStudentForAssign = ref<StudentRes | null>(null)

// Form data
const createForm = ref<CreateStudentReq>({
  username: '',
  first_name: '',
  last_name: '',
  gender: '',
  password: '',
  email: '',
})

const editForm = ref<Partial<CreateStudentReq>>({})

// Assignment form data
const assignmentForm = ref<AssignmentReq>({
  student: 0,
  lesson: 0,
  begin_time: '',
  end_time: '',
  passing_score: 70,
})

// Selected lesson for single selection
const selectedLesson = ref<number | null>(null)

// Queries and mutations
const {
  data: studentsData,
  isLoading,
  error: queryError,
  refetch,
} = useStudents(filter)
const createStudentMutation = useCreateStudent()
const updateStudentMutation = useUpdateStudent()
const deleteStudentMutation = useDeleteStudent()
const createAssignmentMutation = useCreateAssignment()

// Fetch lessons for assignment with computed filter
const lessonsFilter = computed(() => ({ limit: 100, offset: 0 }))
const { data: lessonsData } = useLessons(lessonsFilter)
const lessons = computed(() => lessonsData.value?.results || [])

// Computed
const students = computed(() => studentsData.value?.results || [])
const totalCount = computed(() => studentsData.value?.count || 0)
const currentPage = computed(() => Math.floor(filter.offset / filter.limit)) // 0-based page
const totalPages = computed(() => Math.ceil(totalCount.value / filter.limit))

// Methods
const resetCreateForm = () => {
  createForm.value = {
    username: '',
    first_name: '',
    last_name: '',
    gender: '',
    password: '',
    email: '',
  }
}

const handlePageChange = (page: number) => {
  filter.offset = page * filter.limit // page is already 0-based from BasePagination
}

const openEditModal = (student: StudentRes) => {
  selectedStudent.value = student
  editForm.value = {
    username: student.username,
    first_name: student.first_name,
    last_name: student.last_name,
    gender: student.gender || '',
    email: student.email || '',
  }
  isEditModalOpen.value = true
}

const openDeleteModal = (student: StudentRes) => {
  selectedStudent.value = student
  isDeleteModalOpen.value = true
}

const openAssignModal = (student: StudentRes) => {
  selectedStudentForAssign.value = student
  selectedLesson.value = null
  assignmentForm.value = {
    student: student.id,
    lesson: 0,
    begin_time: '',
    end_time: '',
    passing_score: 70,
  }
  isAssignModalOpen.value = true
}

const handleCreateStudent = async () => {
  if (
    !createForm.value.username ||
    !createForm.value.first_name ||
    !createForm.value.last_name
  ) {
    toast.error(
      t('teacher.students.usernameRequired') +
        ', ' +
        t('teacher.students.firstNameRequired') +
        ', ' +
        t('teacher.students.lastNameRequired')
    )
    return
  }

  try {
    await createStudentMutation.mutateAsync(createForm.value)
    toast.success(t('teacher.students.createSuccess'))
    isCreateModalOpen.value = false
    resetCreateForm()
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || t('teacher.students.createSuccess')
    toast.error(errorMessage)
  }
}

const handleUpdateStudent = async () => {
  if (
    !selectedStudent.value ||
    !editForm.value.username ||
    !editForm.value.first_name ||
    !editForm.value.last_name
  ) {
    toast.error(
      t('teacher.students.usernameRequired') +
        ', ' +
        t('teacher.students.firstNameRequired') +
        ', ' +
        t('teacher.students.lastNameRequired')
    )
    return
  }

  try {
    await updateStudentMutation.mutateAsync({
      id: selectedStudent.value.id,
      data: editForm.value,
    })
    toast.success(t('teacher.students.updateSuccess'))
    isEditModalOpen.value = false
    selectedStudent.value = null
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || t('teacher.students.updateSuccess')
    toast.error(errorMessage)
  }
}

const handleDeleteStudent = async () => {
  if (!selectedStudent.value) return

  try {
    await deleteStudentMutation.mutateAsync(selectedStudent.value.id)
    toast.success(t('teacher.students.deleteSuccess'))
    isDeleteModalOpen.value = false
    selectedStudent.value = null
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || t('teacher.students.deleteSuccess')
    toast.error(errorMessage)
  }
}

const handleCreateAssignment = async () => {
  if (!selectedStudentForAssign.value) {
    toast.error(t('teacher.students.selectStudent'))
    return
  }

  if (!selectedLesson.value) {
    toast.error(t('teacher.students.selectLesson'))
    return
  }

  if (!assignmentForm.value.begin_time || !assignmentForm.value.end_time) {
    toast.error(
      t('teacher.students.beginTime') +
        ' and ' +
        t('teacher.students.endTime') +
        ' required'
    )
    return
  }

  if (
    new Date(assignmentForm.value.end_time) <=
    new Date(assignmentForm.value.begin_time)
  ) {
    toast.error('End time must be after begin time')
    return
  }

  if (
    assignmentForm.value.passing_score < 0 ||
    assignmentForm.value.passing_score > 100
  ) {
    toast.error('Passing score must be between 0 and 100')
    return
  }

  try {
    // Set lesson field with selected lesson
    assignmentForm.value.lesson = selectedLesson.value
    await createAssignmentMutation.mutateAsync(assignmentForm.value)
    toast.success(t('teacher.students.assignSuccess'))
    isAssignModalOpen.value = false
    selectedStudentForAssign.value = null
    selectedLesson.value = null
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || t('teacher.students.assignSuccess')
    toast.error(errorMessage)
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ t('teacher.students.title') }}
        </h1>
        <p class="text-sm text-gray-600 mt-1">
          {{ t('teacher.students.description') }}
        </p>
      </div>

      <Dialog v-model:open="isCreateModalOpen">
        <DialogTrigger as-child>
          <Button>{{ t('teacher.students.create') }}</Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{{
              t('teacher.students.createDescription')
            }}</DialogTitle>
          </DialogHeader>

          <form @submit.prevent="handleCreateStudent" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('teacher.students.firstName') }} *
                </label>
                <input
                  v-model="createForm.first_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('teacher.students.lastName') }} *
                </label>
                <input
                  v-model="createForm.last_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('teacher.students.username') }} *
              </label>
              <input
                v-model="createForm.username"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('teacher.students.email') }}
              </label>
              <input
                v-model="createForm.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('teacher.students.gender') }}
              </label>
              <select
                v-model="createForm.gender"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{{ t('teacher.students.gender') }}</option>
                <option value="male">{{ t('gender.male') }}</option>
                <option value="female">{{ t('gender.female') }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('teacher.students.password') }}
              </label>
              <input
                v-model="createForm.password"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                @click="isCreateModalOpen = false"
              >
                {{ t('common.cancel') }}
              </Button>
              <Button
                type="submit"
                :disabled="createStudentMutation.isPending.value"
              >
                {{
                  createStudentMutation.isPending.value
                    ? t('common.saving')
                    : t('teacher.students.create')
                }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="queryError"
      class="bg-red-50 border border-red-200 rounded-md p-4"
    >
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            {{ t('practice.error') }}
          </h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ queryError.message }}</p>
          </div>
          <div class="mt-3">
            <Button variant="outline" size="sm" @click="refetch()">
              {{ t('common.tryAgain') }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Students Table -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="students.length === 0" class="p-8 text-center">
        <p class="text-gray-500">{{ t('teacher.students.empty') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t('teacher.students.student') }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t('teacher.students.email') }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t('teacher.students.gender') }}
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ t('teacher.students.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="student in students"
              :key="student.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center"
                  >
                    <img
                      v-if="student.image"
                      :src="student.image"
                      :alt="`${student.first_name} ${student.last_name}`"
                      class="h-8 w-8 rounded-full object-cover"
                    />
                    <span v-else class="text-xs font-medium text-gray-600">
                      {{ student.first_name.charAt(0)
                      }}{{ student.last_name.charAt(0) }}
                    </span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">
                      {{ student.first_name }} {{ student.last_name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ student.email || '-' }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize"
              >
                {{ student.gender || '-' }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(student)"
                    :title="t('teacher.students.edit')"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button
                    @click="openDeleteModal(student)"
                    :title="t('teacher.students.delete')"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                  <button
                    @click="openAssignModal(student)"
                    :title="t('teacher.students.assign')"
                    class="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  >
                    <UserPlusIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Use BasePagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200">
        <BasePagination
          :total-count="totalCount"
          :current-page="currentPage"
          :items-per-page="filter.limit"
          :sibling-count="2"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Edit Modal -->
    <Dialog v-model:open="isEditModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('teacher.students.edit') }}</DialogTitle>
        </DialogHeader>

        <form @submit.prevent="handleUpdateStudent" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('teacher.students.firstName') }} *
              </label>
              <input
                v-model="editForm.first_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('teacher.students.lastName') }} *
              </label>
              <input
                v-model="editForm.last_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('teacher.students.username') }} *
            </label>
            <input
              v-model="editForm.username"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('teacher.students.email') }}
            </label>
            <input
              v-model="editForm.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('teacher.students.gender') }}
            </label>
            <select
              v-model="editForm.gender"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{{ t('teacher.students.gender') }}</option>
              <option value="male">{{ t('gender.male') }}</option>
              <option value="female">{{ t('gender.female') }}</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              @click="isEditModalOpen = false"
            >
              {{ t('common.cancel') }}
            </Button>
            <Button
              type="submit"
              :disabled="updateStudentMutation.isPending.value"
            >
              {{
                updateStudentMutation.isPending.value
                  ? t('common.saving')
                  : t('teacher.students.edit')
              }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-model:open="isDeleteModalOpen"
      :title="t('teacher.students.deleteConfirm')"
      :description="t('teacher.students.deleteWarning')"
      :loading="deleteStudentMutation.isPending.value"
      @confirm="handleDeleteStudent"
    />

    <!-- Assignment Modal -->
    <Dialog v-model:open="isAssignModalOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('teacher.students.assignLesson') }}</DialogTitle>
        </DialogHeader>

        <form @submit.prevent="handleCreateAssignment" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('teacher.students.student') }}
            </label>
            <input
              :value="
                selectedStudentForAssign
                  ? `${selectedStudentForAssign.first_name} ${selectedStudentForAssign.last_name}`
                  : ''
              "
              type="text"
              readonly
              class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('teacher.students.selectLesson') }} *
            </label>
            <select
              v-model.number="selectedLesson"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="null">
                {{ t('teacher.students.selectLesson') }}
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

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('teacher.students.beginTime') }} *
              </label>
              <input
                v-model="assignmentForm.begin_time"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('teacher.students.endTime') }} *
              </label>
              <input
                v-model="assignmentForm.end_time"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('teacher.students.passingScore') }} (0-100) *
            </label>
            <input
              v-model.number="assignmentForm.passing_score"
              type="number"
              min="0"
              max="100"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              @click="isAssignModalOpen = false"
            >
              {{ t('common.cancel') }}
            </Button>
            <Button
              type="submit"
              :disabled="createAssignmentMutation.isPending.value"
            >
              {{
                createAssignmentMutation.isPending.value
                  ? t('common.saving')
                  : t('teacher.students.assignLesson')
              }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
