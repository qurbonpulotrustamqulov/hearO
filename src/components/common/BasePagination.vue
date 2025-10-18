<script setup lang="ts">
import { computed, defineEmits, toRefs } from 'vue'
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-vue-next'
import Pagination from '@/components/ui/pagination/Pagination.vue'
import PaginationContent from '@/components/ui/pagination/PaginationContent.vue'
import PaginationItem from '@/components/ui/pagination/PaginationItem.vue'
import PaginationFirst from '@/components/ui/pagination/PaginationFirst.vue'
import PaginationLast from '@/components/ui/pagination/PaginationLast.vue'
import PaginationNext from '@/components/ui/pagination/PaginationNext.vue'
import PaginationPrevious from '@/components/ui/pagination/PaginationPrevious.vue'
import PaginationEllipsis from '@/components/ui/pagination/PaginationEllipsis.vue'

/**
 * Props interface for the BasePagination component
 */
interface Props {
  /** Total number of items to paginate */
  totalCount: number
  /** Current active page (0-based) */
  currentPage: number
  /** Number of items per page */
  itemsPerPage: number
  /** Number of sibling pages to show around current page */
  siblingCount?: number
  /** Whether pagination is disabled */
  disabled?: boolean
}

/**
 * Events emitted by the BasePagination component
 */
interface Emits {
  /** Emitted when page changes (0-based) */
  (event: 'page-change', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  siblingCount: 1,
  disabled: false,
})

const emit = defineEmits<Emits>()

// Destructure props for better reactivity
const { totalCount, currentPage, itemsPerPage, siblingCount, disabled } =
  toRefs(props)

/**
 * Calculate total number of pages
 */
const totalPages = computed(() => {
  if (itemsPerPage.value <= 0) return 0
  return Math.ceil(totalCount.value / itemsPerPage.value)
})

/**
 * Check if pagination should be shown
 */
const shouldShowPagination = computed(() => {
  return totalPages.value > 1 && totalCount.value > 0
})

/**
 * Get display page number (1-based) from internal page (0-based)
 */
const displayCurrentPage = computed(() => currentPage.value + 1)

/**
 * Generate array of visible page numbers and ellipsis (for display, 1-based)
 */
function getVisiblePages(): (number | string)[] {
  const total = totalPages.value
  const current = displayCurrentPage.value // Convert to 1-based for calculations
  const delta = siblingCount.value

  if (total <= 1) return []

  const range: number[] = []
  const result: (number | string)[] = []

  // Calculate range around current page
  const startPage = Math.max(2, current - delta)
  const endPage = Math.min(total - 1, current + delta)

  // Collect pages in range
  for (let i = startPage; i <= endPage; i++) {
    range.push(i)
  }

  // Add first page
  result.push(1)

  // Add ellipsis before range if needed
  if (startPage > 2) {
    result.push('...')
  }

  // Add range (excluding first and last page)
  range.forEach((page) => {
    if (page !== 1 && page !== total) {
      result.push(page)
    }
  })

  // Add ellipsis after range if needed
  if (endPage < total - 1) {
    result.push('...')
  }

  // Add last page (if different from first)
  if (total > 1) {
    result.push(total)
  }

  // Remove duplicates while preserving order
  return result.filter((item, index, array) => {
    return array.indexOf(item) === index
  })
}

/**
 * Handle page change with validation (convert from 1-based display to 0-based internal)
 */
function handlePageChange(displayPage: number): void {
  const newPage = displayPage - 1 // Convert to 0-based

  // Validate input
  if (disabled.value) return
  if (newPage < 0 || newPage >= totalPages.value) return
  if (newPage === currentPage.value) return

  // Emit page change event (0-based)
  emit('page-change', newPage)
}

/**
 * Navigate to first page
 */
function goToFirstPage(): void {
  handlePageChange(1) // Display page 1 (internal page 0)
}

/**
 * Navigate to previous page
 */
function goToPreviousPage(): void {
  handlePageChange(displayCurrentPage.value - 1)
}

/**
 * Navigate to next page
 */
function goToNextPage(): void {
  handlePageChange(displayCurrentPage.value + 1)
}

/**
 * Navigate to last page
 */
function goToLastPage(): void {
  handlePageChange(totalPages.value) // Display page = totalPages (internal page = totalPages - 1)
}
</script>

<template>
  <Pagination
    v-if="shouldShowPagination"
    :items-per-page="itemsPerPage"
    :class="{ 'opacity-50 pointer-events-none': disabled }"
  >
    <PaginationContent>
      <!-- First Page Button -->
      <PaginationFirst
        v-if="displayCurrentPage > 1"
        :disabled="disabled"
        @click="goToFirstPage"
      >
        <ChevronsLeft class="w-4 h-4" />
      </PaginationFirst>

      <!-- Previous Page Button -->
      <PaginationPrevious
        v-if="displayCurrentPage > 1"
        :disabled="disabled"
        @click="goToPreviousPage"
      >
        <ChevronLeft class="w-4 h-4" />
      </PaginationPrevious>

      <!-- Page Numbers and Ellipsis -->
      <template
        v-for="(item, index) in getVisiblePages()"
        :key="`page-${index}-${item}`"
      >
        <PaginationEllipsis v-if="item === '...'" />
        <PaginationItem
          v-else
          :value="item as number"
          :is-active="displayCurrentPage === item"
          :disabled="disabled"
          @click="handlePageChange(item as number)"
        >
          {{ item }}
        </PaginationItem>
      </template>

      <!-- Next Page Button -->
      <PaginationNext
        v-if="displayCurrentPage < totalPages"
        :disabled="disabled"
        @click="goToNextPage"
      >
        <ChevronRight class="w-4 h-4" />
      </PaginationNext>

      <!-- Last Page Button -->
      <PaginationLast
        v-if="displayCurrentPage < totalPages"
        :disabled="disabled"
        @click="goToLastPage"
      >
        <ChevronsRight class="w-4 h-4" />
      </PaginationLast>
    </PaginationContent>
  </Pagination>
</template>
