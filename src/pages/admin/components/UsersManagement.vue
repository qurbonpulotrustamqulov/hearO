<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">User Management</h2>
      <div class="flex space-x-3">
        <Button @click="refreshUsers" :disabled="users.isLoading">
          <ArrowPathIcon class="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Search Users
          </label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, or username..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            @input="debouncedSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Status Filter
          </label>
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            @change="applyFilters"
          >
            <option value="">All Users</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
        <div class="flex items-end">
          <Button @click="applyFilters" class="w-full">
            <MagnifyingGlassIcon class="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          Users ({{ users.data.value?.count || 0 }} total)
        </h3>
      </div>

      <!-- Loading State -->
      <div v-if="users.isLoading" class="p-8 text-center">
        <ArrowPathIcon
          class="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4"
        />
        <p class="text-gray-500">Loading users...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="users.error" class="p-8 text-center">
        <ExclamationTriangleIcon class="h-8 w-8 text-red-400 mx-auto mb-4" />
        <p class="text-red-600 mb-4">Failed to load users</p>
        <Button @click="refreshUsers" variant="outline"> Try Again </Button>
      </div>

      <!-- Table -->
      <div v-else-if="users.data.value?.results" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                User
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Joined
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Last Login
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users.data.value.results" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="user.image || '/default-avatar.png'"
                    :alt="user.first_name"
                    class="h-10 w-10 rounded-full object-cover"
                  />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      @{{ user.username }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
                <div v-if="user.telegram_id" class="text-xs text-gray-500">
                  Telegram: {{ user.telegram_id }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="
                    user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                >
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span
                    v-if="user.is_superuser"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"
                  >
                    Super Admin
                  </span>
                  <span
                    v-if="user.is_staff"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    Staff
                  </span>
                  <span
                    v-if="!user.is_staff && !user.is_superuser"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
                  >
                    User
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.date_joined) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.last_login ? formatDate(user.last_login) : 'Never' }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex justify-end space-x-2">
                  <Button @click="editUser(user)" size="sm" variant="outline">
                    <PencilIcon class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="user.is_active"
                    @click="deactivateUser(user.id)"
                    size="sm"
                    variant="outline"
                    class="text-red-600 hover:text-red-700"
                  >
                    <XMarkIcon class="h-4 w-4" />
                  </Button>
                  <Button
                    v-else
                    @click="activateUser(user.id)"
                    size="sm"
                    variant="outline"
                    class="text-green-600 hover:text-green-700"
                  >
                    <CheckIcon class="h-4 w-4" />
                  </Button>
                  <Button
                    @click="deleteUser(user.id)"
                    size="sm"
                    variant="outline"
                    class="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          v-if="users.data.value && users.data.value.count > 10"
          class="px-6 py-4 border-t border-gray-200"
        >
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing {{ (currentPage - 1) * 10 + 1 }} to
              {{ Math.min(currentPage * 10, users.data.value.count) }} of
              {{ users.data.value.count }} results
            </div>
            <div class="flex space-x-2">
              <Button
                @click="changePage(currentPage - 1)"
                :disabled="!users.data.value.previous"
                size="sm"
                variant="outline"
              >
                Previous
              </Button>
              <Button
                @click="changePage(currentPage + 1)"
                :disabled="!users.data.value.next"
                size="sm"
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-8 text-center">
        <UserGroupIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">No users found</p>
      </div>
    </div>

    <!-- Edit User Modal -->
    <EditUserModal
      v-if="showEditModal"
      :user="selectedUser"
      @close="showEditModal = false"
      @updated="handleUserUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { useAdminUsers } from '../queries/useAdminUsers'
import {
  useActivateAdminUser,
  useDeactivateAdminUser,
  useDeleteAdminUser,
} from '../queries/useAdminUsers'
import EditUserModal from './EditUserModal.vue'
import type { AdminUser } from '../types'
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'

// State
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const showEditModal = ref(false)
const selectedUser = ref<AdminUser | null>(null)

// Query hooks
const users = useAdminUsers({
  page: currentPage.value,
  search: searchQuery.value,
  is_active: statusFilter.value ? statusFilter.value === 'true' : undefined,
})

const activateUserMutation = useActivateAdminUser()
const deactivateUserMutation = useDeactivateAdminUser()
const deleteUserMutation = useDeleteAdminUser()

// Methods
const refreshUsers = () => {
  users.refetch()
}

const applyFilters = () => {
  currentPage.value = 1
  users.refetch()
}

const changePage = (page: number) => {
  currentPage.value = page
  users.refetch()
}

const debouncedSearch = () => {
  // Simple debounce - in production, you might want to use a proper debounce utility
  setTimeout(() => {
    applyFilters()
  }, 300)
}

const editUser = (user: AdminUser) => {
  selectedUser.value = user
  showEditModal.value = true
}

const handleUserUpdated = () => {
  showEditModal.value = false
  selectedUser.value = null
  refreshUsers()
}

const activateUser = async (userId: number) => {
  if (confirm('Are you sure you want to activate this user?')) {
    try {
      await activateUserMutation.mutateAsync(userId)
    } catch (error) {
      console.error('Failed to activate user:', error)
    }
  }
}

const deactivateUser = async (userId: number) => {
  if (confirm('Are you sure you want to deactivate this user?')) {
    try {
      await deactivateUserMutation.mutateAsync(userId)
    } catch (error) {
      console.error('Failed to deactivate user:', error)
    }
  }
}

const deleteUser = async (userId: number) => {
  if (
    confirm(
      'Are you sure you want to delete this user? This action cannot be undone.'
    )
  ) {
    try {
      await deleteUserMutation.mutateAsync(userId)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Watch for changes in filters
onMounted(() => {
  refreshUsers()
})
</script>
