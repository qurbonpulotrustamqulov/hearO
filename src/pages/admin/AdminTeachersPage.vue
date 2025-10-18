<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Teachers</h1>
      <Button size="sm" @click="openCreate">Create</Button>
    </div>

    <div v-if="isLoading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">Failed to load teachers</div>

    <div
      v-else
      class="bg-white shadow-sm border border-gray-200 rounded-lg divide-y"
    >
      <div
        v-for="t in teachers"
        :key="t.id"
        class="p-4 flex items-center justify-between"
      >
        <div>
          <div class="font-medium text-gray-900">
            {{ t.username }} <span class="text-gray-400">#{{ t.id }}</span>
          </div>
          <div class="text-sm text-gray-500">
            <span v-if="t.first_name || t.last_name"
              >{{ t.first_name }} {{ t.last_name }}</span
            >
            <span v-if="t.email"> · {{ t.email }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="openEdit(t)">Edit</Button>
          <Button variant="destructive" size="sm" @click="confirmDelete(t)"
            >Delete</Button
          >
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <transition name="fade">
      <div
        v-if="formOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
          <h2 class="text-xl font-bold mb-4">
            {{ editing ? 'Edit' : 'Create' }} Teacher
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

    <!-- Delete Confirm -->
    <ConfirmModal
      :open="confirmOpen"
      title="Delete teacher?"
      message="This action cannot be undone."
      confirmText="Delete"
      @confirm="doDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { computed, reactive, ref } from 'vue'
import {
  useAdminTeachers,
  useCreateAdminTeacher,
  useUpdateAdminTeacher,
  useDeleteAdminTeacher,
} from './queries/useAdminContent'
import type { AdminTeacher } from './types'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { useToasts } from '@/lib/toast'
import { formatApiErrors } from '@/lib/utils'

const { data, isLoading, error } = useAdminTeachers()
const teachers = computed(() => data?.value || [])

const formOpen = ref(false)
const editing = ref(false)
const form = reactive<{
  id?: number
  username: string
  email?: string | null
  first_name?: string
  last_name?: string
  gender?: string
  password?: string
}>({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  gender: '',
  password: '',
})

const createMutation = useCreateAdminTeacher()
const updateMutation = useUpdateAdminTeacher()
const deleteMutation = useDeleteAdminTeacher()
const { success: toastSuccess, error: toastError } = useToasts()

function openCreate() {
  editing.value = false
  Object.assign(form, {
    id: undefined,
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    gender: '',
    password: '',
  })
  formOpen.value = true
}

function openEdit(t: AdminTeacher) {
  editing.value = true
  Object.assign(form, {
    id: t.id,
    username: t.username,
    email: t.email ?? '',
    first_name: t.first_name ?? '',
    last_name: t.last_name ?? '',
    gender: t.gender ?? '',
    password: '',
  })
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
}

async function submitForm() {
  try {
    if (editing.value && form.id) {
      const { id, username, email, first_name, last_name, gender, password } =
        form
      await updateMutation.mutateAsync({
        id,
        data: {
          username,
          email,
          first_name,
          last_name,
          gender,
          password: password || undefined,
        },
      })
      toastSuccess('Teacher updated')
    } else {
      const { username, email, first_name, last_name, gender, password } = form
      await createMutation.mutateAsync({
        username,
        email,
        first_name,
        last_name,
        gender,
        password: password || '',
      })
      toastSuccess('Teacher created')
    }
    formOpen.value = false
  } catch (e: unknown) {
    console.error(e)
    const apiErrors =
      (e as { response?: { data?: { errors?: Record<string, string[]> } } })
        ?.response?.data?.errors ||
      (e as { response?: { data?: Record<string, string[]> } })?.response?.data
    toastError(formatApiErrors(apiErrors))
  }
}

const confirmOpen = ref(false)
let toDeleteId: number | null = null
function confirmDelete(t: AdminTeacher) {
  toDeleteId = t.id
  confirmOpen.value = true
}
async function doDelete() {
  try {
    if (toDeleteId != null) {
      await deleteMutation.mutateAsync(toDeleteId)
      toastSuccess('Teacher deleted')
    }
  } catch (e: unknown) {
    console.error(e)
    const apiErrors =
      (e as { response?: { data?: { errors?: Record<string, string[]> } } })
        ?.response?.data?.errors ||
      (e as { response?: { data?: Record<string, string[]> } })?.response?.data
    toastError(formatApiErrors(apiErrors))
  } finally {
    confirmOpen.value = false
    toDeleteId = null
  }
}
</script>
