<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  useCreateLessonGroup,
  useDeleteLessonGroup,
  useLessonGroups,
  useUpdateLessonGroup,
} from '@/pages/teacher/queries/use-lesson-groups'
import type { LessonGroupFilter } from '@/pages/teacher/api/lesson-group'
import {
  ChevronRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
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
import type { LessonGroupRes } from '@/pages/lessons/types'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const searchQuery = ref('')
const limit = ref(20)
const offset = ref(0)

// Create lesson group dialog state
const isCreateDialogOpen = ref(false)
const newLessonGroupName = ref('')
const createFormError = ref('')

// Edit lesson group dialog state
const isEditDialogOpen = ref(false)
const editLessonGroupId = ref<number | null>(null)
const editLessonGroupName = ref('')
const editFormError = ref('')

// Delete lesson group dialog state
const isDeleteDialogOpen = ref(false)
const deleteLessonGroupId = ref<number | null>(null)
const lessonGroupToDelete = ref<LessonGroupRes | null>(null)

const filter = computed<LessonGroupFilter>(() => ({
  limit: limit.value,
  offset: offset.value,
  ...(searchQuery.value && { search: searchQuery.value }),
}))

const {
  data: lessonGroupsData,
  isLoading,
  error,
  refetch,
} = useLessonGroups(filter)

const { mutate: createLessonGroup, isPending: isCreating } =
  useCreateLessonGroup()

const { mutate: updateLessonGroup, isPending: isUpdating } =
  useUpdateLessonGroup()

const { mutate: deleteLessonGroup, isPending: isDeleting } =
  useDeleteLessonGroup()

const lessonGroups = computed(() => lessonGroupsData.value?.results || [])
const totalCount = computed(() => lessonGroupsData.value?.count || 0)

const handleSearch = () => {
  offset.value = 0
  refetch()
}

const loadMore = () => {
  offset.value += limit.value
}

const canLoadMore = computed(() => {
  return lessonGroups.value.length < totalCount.value
})

const handleRefetch = () => {
  refetch()
}

const handleCreateLessonGroup = async () => {
  if (!newLessonGroupName.value.trim()) {
    createFormError.value = t('teacher.lessonGroups.nameRequired')
    return
  }

  createFormError.value = ''

  createLessonGroup(
    { name: newLessonGroupName.value.trim() },
    {
      onSuccess: () => {
        newLessonGroupName.value = ''
        isCreateDialogOpen.value = false
        // Reset pagination to show the new group
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
            : t('teacher.lessonGroups.createSuccess')
      },
    }
  )
}

const handleUpdateLessonGroup = async () => {
  if (!editLessonGroupName.value.trim()) {
    editFormError.value = t('teacher.lessonGroups.nameRequired')
    return
  }

  if (editLessonGroupId.value === null) {
    editFormError.value = 'Invalid lesson group ID'
    return
  }

  editFormError.value = ''

  updateLessonGroup(
    {
      id: editLessonGroupId.value,
      data: { name: editLessonGroupName.value.trim() },
    },
    {
      onSuccess: () => {
        editLessonGroupId.value = null
        editLessonGroupName.value = ''
        isEditDialogOpen.value = false
        // Refetch lesson groups to get the updated data
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
            : t('teacher.lessonGroups.updateSuccess')
      },
    }
  )
}

const handleDeleteLessonGroup = async () => {
  if (deleteLessonGroupId.value === null) {
    return
  }

  deleteLessonGroup(deleteLessonGroupId.value, {
    onSuccess: () => {
      closeDeleteDialog()
      refetch()
    },
    onError: (error: unknown) => {
      console.error('Failed to delete lesson group:', error)
    },
  })
}

const openEditDialog = (group: LessonGroupRes) => {
  editLessonGroupId.value = group.id
  editLessonGroupName.value = group.name
  isEditDialogOpen.value = true
}

const openDeleteDialog = (group: LessonGroupRes) => {
  deleteLessonGroupId.value = group.id
  lessonGroupToDelete.value = group
  isDeleteDialogOpen.value = true
}

const closeCreateDialog = () => {
  isCreateDialogOpen.value = false
  newLessonGroupName.value = ''
  createFormError.value = ''
}

const closeEditDialog = () => {
  isEditDialogOpen.value = false
  editLessonGroupId.value = null
  editLessonGroupName.value = ''
  editFormError.value = ''
}

const closeDeleteDialog = () => {
  isDeleteDialogOpen.value = false
  deleteLessonGroupId.value = null
  lessonGroupToDelete.value = null
}

const navigateToLessons = (group: LessonGroupRes) => {
  router.push({
    name: 'TeacherLessons',
    params: { groupId: group.id.toString() },
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <!-- Header -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-medium text-gray-900">
              {{ t('teacher.lessonGroups.title') }}
            </h1>
          </div>

          <!-- Create Button -->
          <Dialog v-model:open="isCreateDialogOpen">
            <DialogTrigger as-child>
              <Button
                class="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-sm font-medium"
              >
                {{ t('teacher.lessonGroups.create') }}
              </Button>
            </DialogTrigger>

            <DialogContent class="sm:max-w-md">
              <DialogHeader>
                <DialogTitle class="text-lg font-medium text-gray-900">
                  {{ t('teacher.lessonGroups.createDescription') }}
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
                <form
                  @submit.prevent="handleCreateLessonGroup"
                  class="space-y-4"
                >
                  <div>
                    <label
                      for="lessonGroupName"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {{ t('teacher.lessonGroups.groupName') }}
                    </label>
                    <input
                      id="lessonGroupName"
                      v-model="newLessonGroupName"
                      type="text"
                      :placeholder="t('teacher.lessonGroups.groupName')"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                      :disabled="isCreating"
                      required
                    />
                  </div>

                  <DialogFooter class="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      @click="closeCreateDialog"
                      :disabled="isCreating"
                      class="flex-1 text-sm"
                    >
                      {{ t('common.cancel') }}
                    </Button>
                    <Button
                      type="submit"
                      :disabled="isCreating || !newLessonGroupName.trim()"
                      class="flex-1 bg-gray-900 hover:bg-gray-800 text-sm"
                    >
                      {{
                        isCreating
                          ? t('common.saving')
                          : t('teacher.lessonGroups.create')
                      }}
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
                  {{ t('teacher.lessonGroups.edit') }}
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
                <form
                  @submit.prevent="handleUpdateLessonGroup"
                  class="space-y-4"
                >
                  <div>
                    <label
                      for="editLessonGroupName"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {{ t('teacher.lessonGroups.groupName') }}
                    </label>
                    <input
                      id="editLessonGroupName"
                      v-model="editLessonGroupName"
                      type="text"
                      :placeholder="t('teacher.lessonGroups.groupName')"
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
                      {{ t('common.cancel') }}
                    </Button>
                    <Button
                      type="submit"
                      :disabled="isUpdating || !editLessonGroupName.trim()"
                      class="flex-1 bg-gray-900 hover:bg-gray-800 text-sm"
                    >
                      {{
                        isUpdating
                          ? t('common.saving')
                          : t('teacher.lessonGroups.edit')
                      }}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>

          <!-- Delete Confirmation Dialog -->
          <Dialog v-model:open="isDeleteDialogOpen">
            <DialogContent class="sm:max-w-md">
              <DialogHeader>
                <DialogTitle class="text-lg font-medium text-gray-900">
                  {{ t('teacher.lessonGroups.delete') }}
                </DialogTitle>
              </DialogHeader>

              <div class="mt-4">
                <p class="text-sm text-gray-700">
                  {{ t('teacher.lessonGroups.deleteConfirm') }}
                </p>
              </div>

              <DialogFooter class="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  @click="closeDeleteDialog"
                  :disabled="isDeleting"
                  class="flex-1 text-sm"
                >
                  {{ t('common.cancel') }}
                </Button>
                <Button
                  @click="handleDeleteLessonGroup"
                  :disabled="isDeleting"
                  class="flex-1 bg-red-600 hover:bg-red-500 text-sm"
                >
                  {{
                    isDeleting
                      ? t('common.saving')
                      : t('teacher.lessonGroups.delete')
                  }}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <!-- Search -->
        <div class="max-w-md">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('teacher.lessonGroups.search')"
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
          v-if="isLoading && lessonGroups.length === 0"
          class="flex justify-center py-16"
        >
          <div
            class="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"
          ></div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-16">
          <ExclamationTriangleIcon class="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600 mb-6">{{ t('practice.error') }}</p>
          <Button
            @click="handleRefetch"
            class="bg-gray-900 hover:bg-gray-800 text-sm px-4 py-2"
          >
            {{ t('common.tryAgain') }}
          </Button>
        </div>

        <!-- Groups Grid -->
        <div v-else-if="lessonGroups.length > 0" class="space-y-8">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="group in lessonGroups"
              :key="group.id"
              class="border border-gray-200 rounded p-4 hover:border-gray-300 transition-colors"
            >
              <!-- Group Info -->
              <div class="mb-4">
                <h3 class="font-medium text-gray-900 mb-1">{{ group.name }}</h3>
                <p class="text-xs text-gray-500">ID: {{ group.id }}</p>
              </div>

              <!-- Actions -->
              <div class="space-y-2">
                <button
                  @click="navigateToLessons(group)"
                  class="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm py-2 px-3 rounded transition-colors"
                >
                  {{ t('teacher.lessonGroups.viewLessons') }}
                  <ChevronRightIcon class="w-4 h-4" />
                </button>

                <button
                  @click="openEditDialog(group)"
                  class="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm py-2 px-3 rounded transition-colors"
                >
                  <PencilIcon class="w-4 h-4" />
                  {{ t('teacher.lessonGroups.edit') }}
                </button>

                <button
                  @click="openDeleteDialog(group)"
                  class="w-full flex items-center justify-center gap-2 border border-red-300 hover:bg-red-50 text-red-700 text-sm py-2 px-3 rounded transition-colors"
                >
                  <TrashIcon class="w-4 h-4" />
                  {{ t('teacher.lessonGroups.delete') }}
                </button>
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
              {{
                isLoading
                  ? t('common.loading')
                  : t('teacher.lessonGroups.loadMore')
              }}
            </Button>
          </div>

          <!-- Results Count -->
          <div class="text-center text-sm text-gray-500 pt-4">
            {{ lessonGroups.length }} {{ t('common.of') }} {{ totalCount }}
            {{ t('teacher.lessonGroups.list') }}
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20">
          <DocumentTextIcon class="w-12 h-12 text-gray-300 mx-auto mb-6" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{
              searchQuery
                ? t('teacher.lessonGroups.empty')
                : t('teacher.lessonGroups.empty')
            }}
          </h3>
          <p class="text-gray-600 mb-8 max-w-sm mx-auto">
            {{
              searchQuery
                ? t('teacher.lessonGroups.search')
                : t('teacher.lessonGroups.empty')
            }}
          </p>
          <Dialog v-model:open="isCreateDialogOpen" v-if="!searchQuery">
            <DialogTrigger as-child>
              <Button class="bg-gray-900 hover:bg-gray-800 text-sm px-6 py-2">
                {{ t('teacher.lessonGroups.create') }}
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
