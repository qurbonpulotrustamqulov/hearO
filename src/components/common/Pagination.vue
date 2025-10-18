<template>
  <div class="flex items-center justify-between py-3" v-if="total > 0">
    <div class="text-sm text-gray-600">
      Showing {{ start + 1 }}–{{ end }} of {{ total }}
    </div>
    <div class="flex items-center gap-2">
      <button
        class="px-3 py-1 border rounded disabled:opacity-50"
        :disabled="page === 1"
        @click="$emit('update:page', page - 1)"
      >
        Previous
      </button>
      <select
        class="px-3 py-1 border rounded"
        :value="limit"
        @change="
          $emit(
            'update:limit',
            Number(($event.target as HTMLSelectElement).value)
          )
        "
      >
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
      <button
        class="px-3 py-1 border rounded disabled:opacity-50"
        :disabled="page >= totalPages"
        @click="$emit('update:page', page + 1)"
      >
        Next
      </button>
    </div>
  </div>
  <div v-else class="py-3"></div>
  <div v-if="showNumbers" class="flex flex-wrap items-center gap-1">
    <button
      v-for="p in pages"
      :key="p"
      class="px-2 py-1 border rounded text-sm"
      :class="p === page ? 'bg-gray-100' : ''"
      @click="$emit('update:page', p)"
    >
      {{ p }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'PaginationComponent',
})

const props = defineProps<{
  page: number
  limit: number
  total: number
  showNumbers?: boolean
}>()

defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:limit', value: number): void
}>()

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.limit))
)
const start = computed(() => (props.page - 1) * props.limit)
const end = computed(() => Math.min(props.total, props.page * props.limit))
const pages = computed(() =>
  Array.from({ length: totalPages.value }, (_, i) => i + 1)
)
</script>
