<script setup lang="ts">
import LeftSidebar from '@/layouts/dashboard-layout/components/LeftSidebar.vue'
import Header from '@/layouts/dashboard-layout/components/TopHeader.vue'
</script>

<template>
  <div class="flex flex-row w-full h-screen">
    <!-- Fixed Sidebar -->
    <div class="fixed left-0 top-0 h-full z-50">
      <LeftSidebar />
    </div>

    <!-- Main Content Area -->
    <div class="flex flex-col flex-1 h-full bg-gray-100 dark:bg-gray-900 ml-72">
      <!-- Fixed Header -->
      <div class="fixed top-0 right-0 left-72 z-40">
        <Header class="z-50" />
      </div>

      <!-- Scrollable Content Area -->
      <div class="flex-1 p-6 overflow-y-auto mt-16">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
