<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  useCreateLessonItem,
  useDeleteLessonItem,
  useLessonItems,
  useUpdateLessonItem,
} from '@/pages/teacher/queries/use-lesson-items'
import type {
  LessonItemRequest,
  LessonItemRes,
  LessonItemsFilter,
  UpdateLessonItemRequest,
} from '@/pages/teacher/api/lesson-items'
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PhotoIcon,
  PlusIcon,
  SpeakerWaveIcon,
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
import BasePagination from '@/components/common/BasePagination.vue'

interface Props {
  lessonId: string
}

const props = defineProps<Props>()
const router = useRouter()
const route = useRoute()

const searchQuery = ref('')

// Create lesson item dialog state
const isCreateDialogOpen = ref(false)
const newItemWord = ref('')
const newItemAudio = ref<File | null>(null)
const newItemImage = ref<File | null>(null)
const createFormError = ref('')

// Edit lesson item dialog state
const isEditDialogOpen = ref(false)
const editItemId = ref<number | null>(null)
const editItemWord = ref('')
const editItemAudio = ref<File | null>(null)
const editItemImage = ref<File | null>(null)
const editFormError = ref('')

// Delete lesson item dialog state
const isDeleteDialogOpen = ref(false)
const deleteItemId = ref<number | null>(null)
const itemToDelete = ref<LessonItemRes | null>(null)

const lessonIdNumber = computed(() => parseInt(props.lessonId))

const filter = computed<LessonItemsFilter>(() => ({
  limit: 10,
  offset: 0,
  lesson: lessonIdNumber.value,
  ...(searchQuery.value && { search: searchQuery.value }),
}))

const { data: itemsData, isLoading, error, refetch } = useLessonItems(filter)

const { mutate: createItem, isPending: isCreating } = useCreateLessonItem()

const { mutate: updateItem, isPending: isUpdating } = useUpdateLessonItem()

const { mutate: deleteItem, isPending: isDeleting } = useDeleteLessonItem()

const items = computed(() => itemsData.value?.results || [])
const totalCount = computed(() => itemsData.value?.count || 0)

const handleSearch = () => {
  filter.value.offset = 0
  refetch()
}

const handlePageChange = (newOffset: number) => {
  filter.value.offset = newOffset
  refetch()
}

const handleCreateItem = async () => {
  if (!newItemWord.value.trim()) {
    createFormError.value = 'Word is required'
    return
  }

  createFormError.value = ''

  const data: LessonItemRequest = {
    type: 'tts',
    word: newItemWord.value.trim(),
    lesson: lessonIdNumber.value,
    audio: newItemAudio.value,
    image: newItemImage.value,
  }

  createItem(data, {
    onSuccess: () => {
      resetCreateForm()
      isCreateDialogOpen.value = false
      filter.value.offset = 0
    },
    onError: (error: unknown) => {
      createFormError.value = getErrorMessage(
        error,
        'Failed to create lesson item'
      )
    },
  })
}

const handleUpdateItem = async () => {
  if (!editItemWord.value.trim()) {
    editFormError.value = 'Word is required'
    return
  }

  if (editItemId.value === null) {
    editFormError.value = 'Invalid item ID'
    return
  }

  editFormError.value = ''

  const data: UpdateLessonItemRequest = {
    word: editItemWord.value.trim(),
    audio: editItemAudio.value,
    image: editItemImage.value,
  }

  updateItem(
    { id: editItemId.value, data },
    {
      onSuccess: () => {
        resetEditForm()
        isEditDialogOpen.value = false
        refetch()
      },
      onError: (error: unknown) => {
        editFormError.value = getErrorMessage(
          error,
          'Failed to update lesson item'
        )
      },
    }
  )
}

const handleDeleteItem = async () => {
  if (deleteItemId.value === null) return

  deleteItem(deleteItemId.value, {
    onSuccess: () => {
      resetDeleteForm()
      isDeleteDialogOpen.value = false
      refetch()
    },
    onError: (error: unknown) => {
      console.error('Failed to delete lesson item:', error)
    },
  })
}

const openEditDialog = (item: LessonItemRes) => {
  editItemId.value = item.id
  editItemWord.value = item.word
  editItemAudio.value = null
  editItemImage.value = null
  isEditDialogOpen.value = true
}

const openDeleteDialog = (item: LessonItemRes) => {
  deleteItemId.value = item.id
  itemToDelete.value = item
  isDeleteDialogOpen.value = true
}

const resetCreateForm = () => {
  newItemWord.value = ''
  newItemAudio.value = null
  newItemImage.value = null
  createFormError.value = ''
}

const resetEditForm = () => {
  editItemId.value = null
  editItemWord.value = ''
  editItemAudio.value = null
  editItemImage.value = null
  editFormError.value = ''
}

const resetDeleteForm = () => {
  deleteItemId.value = null
  itemToDelete.value = null
}

const closeCreateDialog = () => {
  isCreateDialogOpen.value = false
  resetCreateForm()
}

const closeEditDialog = () => {
  isEditDialogOpen.value = false
  resetEditForm()
}

const closeDeleteDialog = () => {
  isDeleteDialogOpen.value = false
  resetDeleteForm()
}

const onAudioFileChange = (event: Event, isEdit = false) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  if (isEdit) {
    editItemAudio.value = file
  } else {
    newItemAudio.value = file
  }
}

const onImageFileChange = (event: Event, isEdit = false) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  if (isEdit) {
    editItemImage.value = file
  } else {
    newItemImage.value = file
  }
}

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  return error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data
    ? (error.response.data as { message: string }).message
    : defaultMessage
}

const goBack = () => {
  const groupId = route.params.groupId
  router.push({ name: 'TeacherLessons', params: { groupId } })
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
              <h1 class="text-2xl font-medium text-gray-900">Lesson Items</h1>
              <p class="text-sm text-gray-600">Lesson ID: {{ lessonId }}</p>
            </div>
          </div>

          <!-- Create Button -->
          <Dialog v-model:open="isCreateDialogOpen">
            <DialogTrigger as-child>
              <Button
                class="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 text-sm font-medium"
              >
                <PlusIcon class="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>

            <DialogContent class="sm:max-w-md">
              <DialogHeader>
                <DialogTitle class="text-lg font-medium text-gray-900">
                  Add Lesson Item
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
                <form @submit.prevent="handleCreateItem" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Word
                    </label>
                    <input
                      v-model="newItemWord"
                      type="text"
                      placeholder="Enter word"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                      :disabled="isCreating"
                      required
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Audio File
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      @change="onAudioFileChange"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                      :disabled="isCreating"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Image File
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      @change="onImageFileChange"
                      class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                      :disabled="isCreating"
                    />
                  </div>
                </form>
              </div>

              <DialogFooter class="mt-6">
                <Button
                  variant="outline"
                  @click="closeCreateDialog"
                  :disabled="isCreating"
                  class="mr-3"
                >
                  Cancel
                </Button>
                <Button
                  @click="handleCreateItem"
                  :disabled="isCreating"
                  class="bg-gray-900 hover:bg-gray-800"
                >
                  {{ isCreating ? 'Creating...' : 'Create' }}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <!-- Search -->
        <div class="flex items-center gap-4 mb-8">
          <div class="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="Search items..."
              class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
            />
          </div>
          <Button
            @click="handleSearch"
            variant="outline"
            class="px-4 py-2 text-sm"
          >
            Search
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"
        ></div>
        <p class="text-gray-600 mt-4">Loading lesson items...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="text-center py-12 bg-white rounded-lg border border-red-200"
      >
        <ExclamationTriangleIcon class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p class="text-red-800 font-medium">Failed to load lesson items</p>
        <Button @click="refetch" class="mt-4" variant="outline">
          Try Again
        </Button>
      </div>

      <!-- Items List -->
      <div v-else-if="items.length > 0" class="space-y-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 flex-1">
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  {{ item.word }}
                </h3>
                <div class="flex items-center gap-4">
                  <div
                    v-if="item.audio"
                    class="flex items-center gap-1 text-sm text-gray-600"
                  >
                    <SpeakerWaveIcon class="w-4 h-4" />
                    <span>Audio available</span>
                  </div>
                  <div
                    v-if="item.image"
                    class="flex items-center gap-1 text-sm text-gray-600"
                  >
                    <PhotoIcon class="w-4 h-4" />
                    <span>Image available</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="openEditDialog(item)"
                class="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Edit"
              >
                <PencilIcon class="w-4 h-4 text-gray-600" />
              </button>
              <button
                @click="openDeleteDialog(item)"
                class="p-2 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <TrashIcon class="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <BasePagination
          @update:offset="handlePageChange"
          :current-page="filter.offset"
          :items-per-page="filter.limit"
          :total-count="totalCount"
          @page-change="handlePageChange"
          class="mt-8"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-12 bg-white rounded-lg border border-gray-200"
      >
        <div
          class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4"
        >
          <PlusIcon class="w-6 h-6 text-gray-400" />
        </div>
        <p class="text-gray-600 font-medium mb-2">No lesson items found</p>
        <p class="text-gray-500 text-sm mb-6">
          {{
            searchQuery
              ? 'Try adjusting your search terms'
              : 'Start by adding your first lesson item'
          }}
        </p>
        <Dialog v-model:open="isCreateDialogOpen">
          <DialogTrigger as-child>
            <Button class="bg-gray-900 hover:bg-gray-800 text-white">
              <PlusIcon class="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <!-- Edit Dialog -->
      <Dialog v-model:open="isEditDialogOpen">
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle class="text-lg font-medium text-gray-900">
              Edit Lesson Item
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
            <form @submit.prevent="handleUpdateItem" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Word
                </label>
                <input
                  v-model="editItemWord"
                  type="text"
                  placeholder="Enter word"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                  :disabled="isUpdating"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Audio File (optional)
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  @change="(e) => onAudioFileChange(e, true)"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                  :disabled="isUpdating"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Image File (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  @change="(e) => onImageFileChange(e, true)"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                  :disabled="isUpdating"
                />
              </div>
            </form>
          </div>

          <DialogFooter class="mt-6">
            <Button
              variant="outline"
              @click="closeEditDialog"
              :disabled="isUpdating"
              class="mr-3"
            >
              Cancel
            </Button>
            <Button
              @click="handleUpdateItem"
              :disabled="isUpdating"
              class="bg-gray-900 hover:bg-gray-800"
            >
              {{ isUpdating ? 'Updating...' : 'Update' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Delete Dialog -->
      <Dialog v-model:open="isDeleteDialogOpen">
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle class="text-lg font-medium text-gray-900">
              Delete Lesson Item
            </DialogTitle>
          </DialogHeader>

          <div class="mt-6">
            <div class="flex items-start gap-3">
              <ExclamationTriangleIcon
                class="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0"
              />
              <div>
                <p class="text-gray-900 font-medium">
                  Are you sure you want to delete this item?
                </p>
                <p class="text-gray-600 text-sm mt-1">
                  "{{ itemToDelete?.word }}" will be permanently deleted. This
                  action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter class="mt-6">
            <Button
              variant="outline"
              @click="closeDeleteDialog"
              :disabled="isDeleting"
              class="mr-3"
            >
              Cancel
            </Button>
            <Button
              @click="handleDeleteItem"
              :disabled="isDeleting"
              class="bg-red-600 hover:bg-red-700 text-white"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
