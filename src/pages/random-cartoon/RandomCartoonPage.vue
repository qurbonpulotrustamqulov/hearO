<template>
  <div
    class="flex flex-col items-center justify-center min-h-[60vh] p-4 sm:p-8"
  >
    <div
      class="w-full max-w-2xl min-h-[480px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col items-center transition-transform duration-300 hover:scale-[1.015] hover:shadow-3xl relative overflow-hidden"
      style="will-change: transform, box-shadow"
    >
      <h1
        class="text-3xl sm:text-4xl font-extrabold mb-6 flex items-center gap-3 text-blue-700 dark:text-yellow-200 drop-shadow-lg"
      >
        <SparklesIcon class="w-9 h-9 text-yellow-500" />
        {{ t('randomCartoon.title') }}
      </h1>
      <div class="w-full flex flex-col items-center flex-1 justify-center">
        <transition mode="out-in" name="fade">
          <div
            v-if="isLoading || isFetching"
            key="loading"
            class="flex flex-col items-center justify-center h-[315px] w-full max-w-[560px]"
          >
            <ArrowPathIcon class="animate-spin h-10 w-10 text-blue-600 mb-3" />
            <span class="text-lg text-blue-700 dark:text-yellow-200">{{
              t('randomCartoon.loading')
            }}</span>
          </div>
          <div
            v-else-if="cartoon"
            key="cartoon"
            class="flex flex-col items-center w-full"
          >
            <div class="w-full flex justify-center mb-4">
              <template v-if="getYouTubeEmbedUrl(cartoon.link)">
                <div
                  class="w-full max-w-[560px] aspect-video rounded-2xl overflow-hidden shadow-lg border-2 border-blue-200 dark:border-yellow-400 bg-black animate-fade-in"
                >
                  <iframe
                    :src="getYouTubeEmbedUrl(cartoon.link)"
                    allowfullscreen
                    class="w-full h-full"
                    frameborder="0"
                    height="315"
                    width="560"
                  ></iframe>
                </div>
              </template>
              <template v-else>
                <img
                  :alt="cartoon.title"
                  :src="cartoon.link"
                  class="w-full max-w-[560px] h-auto aspect-video object-contain rounded-2xl border-2 border-blue-200 dark:border-yellow-400 mb-2 shadow-lg bg-white animate-fade-in"
                />
              </template>
            </div>
            <div
              class="text-2xl sm:text-3xl font-bold text-center text-blue-800 dark:text-yellow-200 mb-6 drop-shadow animate-fade-in"
            >
              {{ cartoon.title }}
            </div>
          </div>
          <div
            v-else-if="isError"
            key="error"
            class="text-red-500 mb-4 text-lg h-[315px] flex items-center justify-center w-full max-w-[560px] animate-fade-in"
          >
            {{ t('randomCartoon.error') }}
          </div>
        </transition>
        <button
          :disabled="isLoading || isFetching"
          class="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-2xl shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 mt-2"
          @click="handleRefetch"
        >
          <ArrowPathIcon class="w-6 h-6" />
          {{ t('randomCartoon.newCartoon') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowPathIcon, SparklesIcon } from '@heroicons/vue/24/outline'
import { useRandomCartoon } from './queries/useRandomCartoon'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const {
  data: cartoon,
  isLoading,
  isError,
  refetch,
  isFetching,
} = useRandomCartoon()

function handleRefetch() {
  refetch()
}

function getYouTubeEmbedUrl(url: string): string | undefined {
  // Extract the video ID from a YouTube URL
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  )
  return match ? `https://www.youtube.com/embed/${match[1]}` : undefined
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
