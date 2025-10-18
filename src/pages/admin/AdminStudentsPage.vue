<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Students</h2>
      <div class="flex space-x-3 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Page size</label
          >
          <select
            v-model.number="limit"
            @change="refetch()"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
        <Button @click="refetch" :disabled="loading">
          <ArrowPathIcon class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button @click="openCreate" variant="outline">Add Student</Button>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          Students ({{ list.length }} total)
        </h3>
      </div>

      <div v-if="loading" class="p-8 text-center">
        <ArrowPathIcon
          class="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4"
        />
        <p class="text-gray-500">Loading students...</p>
      </div>

      <div v-else-if="error" class="p-8 text-center">
        <ExclamationTriangleIcon class="h-8 w-8 text-red-400 mx-auto mb-4" />
        <p class="text-red-600 mb-4">Failed to load students</p>
        <Button @click="refetch" variant="outline"> Try Again </Button>
      </div>

      <div v-else-if="list.length" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Student
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="s in list" :key="s.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="s.image || '/default-avatar.png'"
                    :alt="s.first_name || s.username"
                    class="h-10 w-10 rounded-full object-cover"
                  />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ s.first_name || '' }} {{ s.last_name || '' }}
                    </div>
                    <div class="text-sm text-gray-500">@{{ s.username }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ s.email || '—' }}</div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex justify-end space-x-2">
                  <Button @click="openEdit(s)" size="sm" variant="outline">
                    <PencilIcon class="h-4 w-4" />
                  </Button>
                  <Button
                    @click="askDelete(s.id)"
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
        <div class="px-6 py-4 border-t border-gray-200">
          <Pagination
            :page="page"
            :limit="limit"
            :total="total"
            @update:page="
              (p: number) => {
                page = p
              }
            "
            @update:limit="
              (l: number) => {
                limit = l
                page = 1
              }
            "
          />
        </div>
      </div>

      <div v-else class="p-8 text-center">
        <UserGroupIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">No students found</p>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="formOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
          <h2 class="text-xl font-bold mb-4">
            {{ editing ? 'Edit' : 'Create' }} Student
          </h2>
          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Username *</label
              >
              <input
                v-model="form.username"
                placeholder="Username"
                class="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Email</label
              >
              <input
                v-model="form.email"
                type="email"
                placeholder="Email"
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >First Name</label
                >
                <input
                  v-model="form.first_name"
                  placeholder="First name"
                  class="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Last Name</label
                >
                <input
                  v-model="form.last_name"
                  placeholder="Last name"
                  class="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Gender</label
              >
              <select
                v-model="form.gender"
                class="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Teacher</label
              >
              <select
                v-model.number="form.teacher_id"
                class="w-full px-3 py-2 border rounded-md"
              >
                <option :value="null">No teacher</option>
                <option v-for="t in teachers" :key="t.id" :value="t.id">
                  {{ t.username }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Password {{ editing ? '' : '*' }}</label
              >
              <input
                v-model="form.password"
                type="password"
                placeholder="Password"
                class="w-full px-3 py-2 border rounded-md"
                :required="!editing"
              />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" @click="closeForm"
                >Cancel</Button
              >
              <Button type="submit">{{ editing ? 'Update' : 'Create' }}</Button>
            </div>
          </form>
        </div>
      </div>
    </transition>
    <ConfirmModal
      :open="showDelete"
      title="Delete student"
      message="Are you sure you want to delete this student? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import Pagination from '@/components/common/Pagination.vue'
import {
  useAdminStudents,
  useCreateAdminStudent,
  useUpdateAdminStudent,
  useDeleteAdminStudent,
} from './queries/useAdminStudents'
import { useToasts } from '@/lib/toast'
import { formatApiErrors } from '@/lib/utils'
import { useAdminTeachers } from './queries/useAdminContent'
import type { AdminStudent } from './types'

const page = ref(1)
const limit = ref(10)
const params = computed(() => ({
  limit: limit.value,
  offset: (page.value - 1) * limit.value,
}))
const students = useAdminStudents(params)
const list = computed(() => students.data.value?.results || [])
const total = computed(() => students.data.value?.count || 0)
const loading = computed(() => students.isLoading.value)
const error = computed(() => !!students.error.value)
const refetch = () => students.refetch()

// Teachers for selection
const teachersQuery = useAdminTeachers()
const teachers = computed(() => teachersQuery.data?.value || [])

const formOpen = ref(false)
const editing = ref(false)
const selected = ref<AdminStudent | null>(null)
const form = ref<{
  id?: number
  username: string
  email?: string | null
  first_name?: string
  last_name?: string
  gender?: string
  password?: string
  teacher_id?: number | null
}>({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  gender: '',
  password: '',
  teacher_id: null,
})

// removed old fields config

const openCreate = () => {
  editing.value = false
  selected.value = null
  Object.assign(form.value, {
    id: undefined,
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    gender: '',
    password: '',
    teacher_id: null,
  })
  formOpen.value = true
}

const openEdit = (s: AdminStudent) => {
  editing.value = true
  selected.value = s
  Object.assign(form.value, {
    id: s.id,
    username: s.username,
    email: s.email ?? '',
    first_name: s.first_name ?? '',
    last_name: s.last_name ?? '',
    gender: s.gender ?? '',
    password: '',
    teacher_id: s.teacher_id ?? null,
  })
  formOpen.value = true
}

const closeForm = () => {
  formOpen.value = false
  selected.value = null
}

const createMutation = useCreateAdminStudent()
const updateMutation = useUpdateAdminStudent()
const deleteMutation = useDeleteAdminStudent()
const { success: toastSuccess, error: toastError } = useToasts()

const submitForm = async () => {
  try {
    if (editing.value && form.value.id) {
      const {
        id,
        username,
        email,
        first_name,
        last_name,
        gender,
        password,
        teacher_id,
      } = form.value
      await updateMutation.mutateAsync({
        id,
        data: {
          username,
          email,
          first_name,
          last_name,
          gender,
          teacher_id,
          password: password || undefined,
        },
      })
    } else {
      const {
        username,
        email,
        first_name,
        last_name,
        gender,
        password,
        teacher_id,
      } = form.value
      await createMutation.mutateAsync({
        username,
        email,
        first_name,
        last_name,
        gender,
        teacher_id,
        password: password || '',
      })
    }
    closeForm()
    refetch()
    toastSuccess(editing.value ? 'Student updated' : 'Student created')
  } catch (e: unknown) {
    console.error(e)
    const apiErrors =
      (e as { response?: { data?: { errors?: Record<string, string[]> } } })
        ?.response?.data?.errors ||
      (e as { response?: { data?: Record<string, string[]> } })?.response?.data
    toastError(formatApiErrors(apiErrors))
  }
}

const showDelete = ref(false)
const pendingDeleteId = ref<number | null>(null)

const askDelete = (id: number) => {
  pendingDeleteId.value = id
  showDelete.value = true
}

const confirmDelete = async () => {
  if (pendingDeleteId.value == null) return
  try {
    await deleteMutation.mutateAsync(pendingDeleteId.value)
    showDelete.value = false
    pendingDeleteId.value = null
    refetch()
    toastSuccess('Student deleted')
  } catch (e: unknown) {
    console.error(e)
    const apiErrors =
      (e as { response?: { data?: { errors?: Record<string, string[]> } } })
        ?.response?.data?.errors ||
      (e as { response?: { data?: Record<string, string[]> } })?.response?.data
    toastError(formatApiErrors(apiErrors))
  }
}

const cancelDelete = () => {
  showDelete.value = false
  pendingDeleteId.value = null
}
</script>
