<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Cartoons Management</h1>
        <p class="mt-1 text-sm text-gray-500">
          Manage cartoon content for the learning platform
        </p>
      </div>
      <div class="flex items-center gap-3">
        <Button @click="loadCartoons" variant="outline" :disabled="loading">
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
          Add Cartoon
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
              placeholder="Search cartoons by title..."
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
            <option value="title">Title A-Z</option>
            <option value="-title">Title Z-A</option>
            <option value="created_at">Newest First</option>
            <option value="-created_at">Oldest First</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Loading State -->
      <div v-if="loading && !cartoons.length" class="p-12 text-center">
        <div
          class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4"
        >
          <ArrowPathIcon class="h-6 w-6 text-indigo-600 animate-spin" />
        </div>
        <p class="text-gray-500">Loading cartoons...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-12 text-center">
        <div
          class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4"
        >
          <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Failed to load cartoons
        </h3>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <Button @click="loadCartoons" variant="outline">
          <ArrowPathIcon class="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!loading && !filteredCartoons.length"
        class="p-12 text-center"
      >
        <div
          class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4"
        >
          <PlayIcon class="h-6 w-6 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No cartoons found
        </h3>
        <p class="text-gray-500 mb-4">
          {{
            searchTerm
              ? 'Try adjusting your search terms'
              : 'Get started by adding your first cartoon'
          }}
        </p>
        <Button
          v-if="!searchTerm"
          @click="showCreateModal = true"
          class="bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Cartoon
        </Button>
      </div>

      <!-- Cartoons List -->
      <div v-else class="divide-y divide-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              Cartoons ({{ filteredCartoons.length }})
            </h3>
            <div class="text-sm text-gray-500">
              Showing {{ filteredCartoons.length }} of
              {{ cartoons.length }} cartoons
            </div>
          </div>
        </div>

        <div
          v-for="cartoon in filteredCartoons"
          :key="cartoon.id"
          class="px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <div
                  class="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center"
                >
                  <PlayIcon class="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ cartoon.title }}
                  </h4>
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    ID: {{ cartoon.id }}
                  </span>
                </div>
                <div
                  class="mt-1 flex items-center space-x-4 text-sm text-gray-500"
                >
                  <a
                    :href="cartoon.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-indigo-600 hover:text-indigo-900 hover:underline truncate max-w-xs"
                  >
                    {{ cartoon.link }}
                  </a>
                  <span class="flex items-center">
                    <CalendarIcon class="h-4 w-4 mr-1" />
                    {{ formatDate(cartoon.created_at) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Button
                @click="editCartoon(cartoon)"
                size="sm"
                variant="outline"
                class="text-indigo-600 hover:text-indigo-900"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                @click="deleteCartoon(cartoon)"
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

    <!-- Create Cartoon Modal -->
    <CreateCartoonModal
      v-if="showCreateModal"
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCartoonCreated"
    />

    <!-- Edit Cartoon Modal -->
    <EditCartoonModal
      v-if="showEditModal"
      :is-open="showEditModal"
      :cartoon="selectedCartoon"
      @close="showEditModal = false"
      @updated="handleCartoonUpdated"
    />

    <!-- Delete Cartoon Modal -->
    <DeleteCartoonModal
      v-if="showDeleteModal"
      :is-open="showDeleteModal"
      :cartoon="selectedCartoon"
      @close="showDeleteModal = false"
      @deleted="handleCartoonDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { useAdminCartoons } from './queries/useAdminContent'
import CreateCartoonModal from './components/CreateCartoonModal.vue'
import EditCartoonModal from './components/EditCartoonModal.vue'
import DeleteCartoonModal from './components/DeleteCartoonModal.vue'
import {
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  CalendarIcon,
} from '@heroicons/vue/24/outline'
import type { AdminCartoon } from './types'

// State
const searchTerm = ref('')
const sortBy = ref('')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedCartoon = ref<AdminCartoon | null>(null)

// Query
const cartoonsQuery = useAdminCartoons()

// Computed
const cartoons = computed(() => cartoonsQuery.data.value?.results || [])
const loading = computed(() => cartoonsQuery.isLoading.value)
const error = computed(() => cartoonsQuery.error.value?.message || '')

const filteredCartoons = computed(() => {
  let filtered = [...cartoons.value]

  // Apply search filter
  if (searchTerm.value) {
    filtered = filtered.filter((cartoon) =>
      cartoon.title.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  // Apply sorting
  if (sortBy.value) {
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'title':
          return a.title.localeCompare(b.title)
        case '-title':
          return b.title.localeCompare(a.title)
        case 'created_at':
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        case '-created_at':
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        default:
          return 0
      }
    })
  }

  return filtered
})

// Methods
const loadCartoons = () => {
  cartoonsQuery.refetch()
}

const handleSearch = () => {
  // Search is handled by computed property
}

const handleSort = () => {
  // Sorting is handled by computed property
}

const editCartoon = (cartoon: AdminCartoon) => {
  selectedCartoon.value = cartoon
  showEditModal.value = true
}

const deleteCartoon = (cartoon: AdminCartoon) => {
  selectedCartoon.value = cartoon
  showDeleteModal.value = true
}

const handleCartoonCreated = () => {
  // Query will automatically refetch due to mutation invalidation
}

const handleCartoonUpdated = () => {
  // Query will automatically refetch due to mutation invalidation
}

const handleCartoonDeleted = () => {
  // Query will automatically refetch due to mutation invalidation
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

// Load cartoons on mount
onMounted(() => {
  // Query will automatically load on mount
})
</script>
