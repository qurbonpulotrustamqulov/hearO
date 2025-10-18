<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useCreateLesson,
  useDeleteLesson,
  useLessons,
  useUpdateLesson,
} from '@/pages/teacher/queries/use-lessons'
import { useCreateAssignment } from '@/pages/teacher/queries/use-assignments'
import { useStudents } from '@/pages/teacher/queries/use-students'
import type {
  CreateLessonRequest,
  LessonsFilter,
  UpdateLessonRequest,
} from '@/pages/teacher/api/lessons'
import type { AssignmentReq } from '@/pages/teacher/api/assignments'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
} from '@heroicons/vue/24/outline'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ILesson } from '@/pages/lessons/types'
import { toast } from 'vue-sonner'

interface Props {
  groupId: string
}

const props = defineProps<Props>()
const router = useRouter()

const searchQuery = ref('')
const limit = ref(20)
const offset = ref(0)

// Create lesson dialog state
const isCreateDialogOpen = ref(false)
const newLessonTitle = ref('')
const newLessonType = ref<'simple' | 'tutorial'>('simple')
const createFormError = ref('')

// Edit lesson dialog state
const isEditDialogOpen = ref(false)
const editLessonId = ref<number | null>(null)
const editLessonTitle = ref('')
const editFormError = ref('')

// Delete lesson dialog state
const isDeleteDialogOpen = ref(false)
const deleteLessonId = ref<number | null>(null)
const lessonToDelete = ref<ILesson | null>(null)

// Assignment dialog state
const isAssignDialogOpen = ref(false)
const selectedLessonForAssign = ref<ILesson | null>(null)
const assignmentForm = ref<AssignmentReq>({
  student: 0,
  lesson: 0,
  begin_time: '',
  end_time: '',
  passing_score: 70,
})

const groupIdNumber = computed(() => parseInt(props.groupId))

const filter = computed<LessonsFilter>(() => ({
  limit: limit.value,
  offset: offset.value,
  group: groupIdNumber.value,
  ...(searchQuery.value && { search: searchQuery.value }),
}))

const { data: lessonsData, isLoading, error, refetch } = useLessons(filter)

const { mutate: createLesson, isPending: isCreating } = useCreateLesson()

const { mutate: updateLesson, isPending: isUpdating } = useUpdateLesson()

const { mutate: deleteLesson, isPending: isDeleting } = useDeleteLesson()

const { mutate: createAssignment, isPending: isAssigning } =
  useCreateAssignment()

// Fetch students for assignment
const { data: studentsData } = useStudents({ limit: 100, offset: 0 })
const students = computed(() => studentsData.value?.results || [])

const lessons = computed(() => lessonsData.value?.results || [])
const totalCount = computed(() => lessonsData.value?.count || 0)

const handleSearch = () => {
  offset.value = 0
  refetch()
}

const loadMore = () => {
  offset.value += limit.value
}

const canLoadMore = computed(() => {
  return lessons.value.length < totalCount.value
})

const handleRefetch = () => {
  refetch()
}

const handleCreateLesson = async () => {
  if (!newLessonTitle.value.trim()) {
    createFormError.value = 'Lesson title is required'
    return
  }

  createFormError.value = ''

  const data: CreateLessonRequest = {
    title: newLessonTitle.value.trim(),
    group: groupIdNumber.value,
    lesson_type: newLessonType.value,
  }

  createLesson(data, {
    onSuccess: () => {
      newLessonTitle.value = ''
      newLessonType.value = 'simple'
      isCreateDialogOpen.value = false
      offset.value = 0
    },
    onError: (error: unknown) => {
      createFormError.value =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? (error.response.data as { message: string }).message
          : 'Failed to create lesson'
    },
  })
}

const handleUpdateLesson = async () => {
  if (!editLessonTitle.value.trim()) {
    editFormError.value = 'Lesson name is required'
    return
  }

  if (editLessonId.value === null) {
    editFormError.value = 'Invalid lesson ID'
    return
  }

  editFormError.value = ''

  const data: UpdateLessonRequest = {
    name: editLessonTitle.value.trim(),
  }

  updateLesson(
    { id: editLessonId.value, data },
    {
      onSuccess: () => {
        editLessonId.value = null
        editLessonTitle.value = ''
        isEditDialogOpen.value = false
        refetch()
      },
      onError: (error: unknown) => {
        editFormError.value =
          error &&
          typeof error === 'object' &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object' &&
          'data' in error.response &&
          error.response.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data
            ? (error.response.data as { message: string }).message
            : 'Failed to update lesson'
      },
    }
  )
}

const handleDeleteLesson = async () => {
  if (deleteLessonId.value === null) return

  deleteLesson(deleteLessonId.value, {
    onSuccess: () => {
      deleteLessonId.value = null
      lessonToDelete.value = null
      isDeleteDialogOpen.value = false
      refetch()
    },
    onError: (error: unknown) => {
      console.error('Failed to delete lesson:', error)
    },
  })
}

const handleCreateAssignment = async () => {
  if (!assignmentForm.value.student) {
    toast.error('Please select a student')
    return
  }

  if (!assignmentForm.value.begin_time || !assignmentForm.value.end_time) {
    toast.error('Please select begin and end time')
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

  createAssignment(assignmentForm.value, {
    onSuccess: () => {
      toast.success('Assignment created successfully')
      closeAssignDialog()
    },
    onError: (error: unknown) => {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
          ? (error.response.data as { message: string }).message
          : 'Failed to create assignment'
      toast.error(errorMessage)
    },
  })
}

const openEditDialog = (lesson: ILesson) => {
  editLessonId.value = lesson.id
  editLessonTitle.value = lesson.title
  isEditDialogOpen.value = true
}

const openDeleteDialog = (lesson: ILesson) => {
  deleteLessonId.value = lesson.id
  lessonToDelete.value = lesson
  isDeleteDialogOpen.value = true
}

const openAssignDialog = (lesson: ILesson) => {
  selectedLessonForAssign.value = lesson
  assignmentForm.value = {
    student: 0,
    lesson: lesson.id,
    begin_time: '',
    end_time: '',
    passing_score: 70,
  }
  isAssignDialogOpen.value = true
}

const closeCreateDialog = () => {
  isCreateDialogOpen.value = false
  newLessonTitle.value = ''
  newLessonType.value = 'simple'
  createFormError.value = ''
}

const closeEditDialog = () => {
  isEditDialogOpen.value = false
  editLessonId.value = null
  editLessonTitle.value = ''
  editFormError.value = ''
}

const closeDeleteDialog = () => {
  isDeleteDialogOpen.value = false
  deleteLessonId.value = null
  lessonToDelete.value = null
}

const closeAssignDialog = () => {
  isAssignDialogOpen.value = false
  selectedLessonForAssign.value = null
  assignmentForm.value = {
    student: 0,
    lesson: 0,
    begin_time: '',
    end_time: '',
    passing_score: 70,
  }
}

const goBack = () => {
  router.push({ name: 'TeacherLessonGroups' })
}

const openLessonItems = (lesson: ILesson) => {
  router.push({
    name: 'TeacherLessonItems',
    params: {
      groupId: props.groupId,
      lessonId: lesson.id.toString(),
    },
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <!-- Header -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <button
              @click="goBack"
              class="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <ArrowLeftIcon class="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 class="text-2xl font-medium text-gray-900">Lessons</h1>
              <p class="text-sm text-gray-600">Group ID: {{ groupId }}</p>
            </div>
          </div>

          <!-- Create Button -->
          <Dialog v-model:open="isCreateDialogOpen">
            <DialogTrigger as-child>
              <Button
                class="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-sm font-medium"
              >
                Create Lesson
              </Button>
            </DialogTrigger>

            <DialogContent class="sm:max-w-md">
              <DialogHeader>
                <DialogTitle class="text-lg font-medium text-gray-900">
                  Create Lesson
                </DialogTitle>
              </DialogHeader>

              <div class="mt-6">
                <!-- Error Message -->
                <div
                  v-if="createFormError"
                  class="mb-4 p-3 bg-red-50 text-red-800 text-sm rounded border border-red-100"
                >
                  {{ createFormError }}
                </div>

                <!-- Form -->
                <form @submit.prevent="handleCreateLesson" class="space-y-4">
                  <div>
                    <label
                      for="lessonTitle"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Title
                    </label>
                    <input
                      id="lessonTitle"
                      v-model="newLessonTitle"
                      type="text"
                      placeholder="Enter lesson title"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                      :disabled="isCreating"
                      required
                    />
                  </div>

                  <div>
                    <label
                      for="lessonType"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Type
                    </label>
                    <select
                      id="lessonType"
                      v-model="newLessonType"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                      :disabled="isCreating"
                    >
                      <option value="simple">Simple</option>
                      <option value="tutorial">Tutorial</option>
                    </select>
                  </div>

                  <DialogFooter class="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      @click="closeCreateDialog"
                      :disabled="isCreating"
                      class="flex-1 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      :disabled="isCreating || !newLessonTitle.trim()"
                      class="flex-1 bg-gray-900 hover:bg-gray-800 text-sm"
                    >
                      {{ isCreating ? 'Creating...' : 'Create' }}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>

          <!-- Edit Dialog -->
          <Dialog v-model:open="isEditDialogOpen">
            <DialogContent class="sm:max-w-md">
              <DialogHeader>
                <DialogTitle class="text-lg font-medium text-gray-900">
                  Edit Lesson
                </DialogTitle>
              </DialogHeader>

              <div class="mt-6">
                <!-- Error Message -->
                <div
                  v-if="editFormError"
                  class="mb-4 p-3 bg-red-50 text-red-800 text-sm rounded border border-red-100"
                >
                  {{ editFormError }}
                </div>

                <!-- Form -->
                <form @submit.prevent="handleUpdateLesson" class="space-y-4">
                  <div>
                    <label
                      for="editLessonName"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Name
                    </label>
                    <input
                      id="editLessonName"
                      v-model="editLessonTitle"
                      type="text"
                      placeholder="Enter lesson name"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                      :disabled="isUpdating"
                      required
                    />
                  </div>

                  <DialogFooter class="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      @click="closeEditDialog"
                      :disabled="isUpdating"
                      class="flex-1 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      :disabled="isUpdating || !editLessonTitle.trim()"
                      class="flex-1 bg-gray-900 hover:bg-gray-800 text-sm"
                    >
                      {{ isUpdating ? 'Updating...' : 'Update' }}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>

          <!-- Delete Dialog -->
          <Dialog v-model:open="isDeleteDialogOpen">
            <DialogContent class="sm:max-w-md">
              <DialogHeader>
                <DialogTitle class="text-lg font-medium text-gray-900">
                  Delete Lesson
                </DialogTitle>
              </DialogHeader>

              <div class="mt-6">
                <p class="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete "<strong>{{
                    lessonToDelete?.title
                  }}</strong
                  >"? This action cannot be undone.
                </p>

                <DialogFooter class="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    @click="closeDeleteDialog"
                    :disabled="isDeleting"
                    class="flex-1 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    @click="handleDeleteLesson"
                    :disabled="isDeleting"
                    class="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                  >
                    {{ isDeleting ? 'Deleting...' : 'Delete' }}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <!-- Assign Dialog -->
          <Dialog v-model:open="isAssignDialogOpen">
            <DialogContent class="sm:max-w-md">
              <DialogHeader>
                <DialogTitle class="text-lg font-medium text-gray-900">
                  Assign Lesson
                </DialogTitle>
              </DialogHeader>

              <div class="mt-6">
                <!-- Form -->
                <form
                  @submit.prevent="handleCreateAssignment"
                  class="space-y-4"
                >
                  <div>
                    <label
                      for="studentSelect"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Student
                    </label>
                    <select
                      id="studentSelect"
                      v-model.number="assignmentForm.student"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                      :disabled="isAssigning"
                      required
                    >
                      <option :value="0" disabled>Select a student</option>
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
                    <label
                      for="beginTime"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Begin Time
                    </label>
                    <input
                      id="beginTime"
                      v-model="assignmentForm.begin_time"
                      type="datetime-local"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                      :disabled="isAssigning"
                      required
                    />
                  </div>

                  <div>
                    <label
                      for="endTime"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      End Time
                    </label>
                    <input
                      id="endTime"
                      v-model="assignmentForm.end_time"
                      type="datetime-local"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                      :disabled="isAssigning"
                      required
                    />
                  </div>

                  <div>
                    <label
                      for="passingScore"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Passing Score
                    </label>
                    <input
                      id="passingScore"
                      v-model.number="assignmentForm.passing_score"
                      type="number"
                      min="0"
                      max="100"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                      :disabled="isAssigning"
                      required
                    />
                  </div>

                  <DialogFooter class="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      @click="closeAssignDialog"
                      :disabled="isAssigning"
                      class="flex-1 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      :disabled="isAssigning || !assignmentForm.student"
                      class="flex-1 bg-gray-900 hover:bg-gray-800 text-sm"
                    >
                      {{ isAssigning ? 'Assigning...' : 'Assign' }}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <!-- Search -->
        <div class="max-w-md">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search lessons..."
              class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
              @keyup.enter="handleSearch"
            />
            <button
              @click="handleSearch"
              class="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded"
            >
              <MagnifyingGlassIcon class="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div>
        <!-- Loading -->
        <div
          v-if="isLoading && lessons.length === 0"
          class="flex justify-center py-16"
        >
          <div
            class="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"
          ></div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-16">
          <ExclamationTriangleIcon class="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600 mb-6">Failed to load lessons</p>
          <Button
            @click="handleRefetch"
            class="bg-gray-900 hover:bg-gray-800 text-sm px-4 py-2"
          >
            Try Again
          </Button>
        </div>

        <!-- Lessons Grid -->
        <div v-else-if="lessons.length > 0" class="space-y-8">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="lesson in lessons"
              :key="lesson.id"
              class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
              @click="openLessonItems(lesson)"
            >
              <div class="p-6">
                <div class="mb-4">
                  <h3
                    class="font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors"
                  >
                    {{ lesson.title }}
                  </h3>
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-500">ID: {{ lesson.id }}</p>
                    <span
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      Lesson
                    </span>
                  </div>
                </div>

                <div
                  class="flex items-center justify-between pt-4 border-t border-gray-100"
                >
                  <span class="text-sm text-gray-600">Click to view items</span>
                  <div class="flex gap-1">
                    <button
                      @click.stop="openEditDialog(lesson)"
                      class="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Edit lesson"
                    >
                      <PencilIcon class="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      @click.stop="openDeleteDialog(lesson)"
                      class="p-2 hover:bg-red-50 rounded transition-colors"
                      title="Delete lesson"
                    >
                      <TrashIcon class="w-4 h-4 text-red-600" />
                    </button>
                    <button
                      @click.stop="openAssignDialog(lesson)"
                      class="p-2 hover:bg-blue-50 rounded transition-colors"
                      title="Assign lesson"
                    >
                      <UserPlusIcon class="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="canLoadMore" class="text-center pt-8">
            <Button
              @click="loadMore"
              :disabled="isLoading"
              variant="outline"
              class="text-sm px-6 py-2"
            >
              {{ isLoading ? 'Loading...' : 'Load More' }}
            </Button>
          </div>

          <!-- Results Count -->
          <div class="text-center text-sm text-gray-500 pt-4">
            {{ lessons.length }} of {{ totalCount }} lessons
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20">
          <DocumentTextIcon class="w-12 h-12 text-gray-300 mx-auto mb-6" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ searchQuery ? 'No lessons found' : 'No lessons yet' }}
          </h3>
          <p class="text-gray-600 mb-8 max-w-sm mx-auto">
            {{
              searchQuery
                ? 'Try a different search term.'
                : 'Create your first lesson to get started.'
            }}
          </p>
          <Dialog v-model:open="isCreateDialogOpen" v-if="!searchQuery">
            <DialogTrigger as-child>
              <Button class="bg-gray-900 hover:bg-gray-800 text-sm px-6 py-2">
                Create Lesson
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
