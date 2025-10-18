<template>
  <div class="bg-white rounded-xl shadow-lg p-8">
    <!-- Word Display -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <div class="bg-blue-100 p-3 rounded-full mr-4">
          <SpeakerWaveIcon class="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h3 class="text-lg font-semibold">{{ item.word }}</h3>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <span>{{ t('practice.difficulty', 'Difficulty') }}:</span>
            <div class="flex space-x-1">
              <div
                v-for="i in 5"
                :key="i"
                class="w-2 h-2 rounded-full"
                :class="i <= item.difficulty ? 'bg-blue-500' : 'bg-gray-300'"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Audio Player -->
      <Button
        v-if="item.audio"
        @click="playAudio"
        class="bg-blue-500 hover:bg-blue-600 transition-colors flex items-center"
        :disabled="isPlaying || isAudioPlaying || isLoading || isRecording"
      >
        <PlayCircleIcon v-if="!isPlaying" class="h-5 w-5 mr-2" />
        <PauseCircleIcon v-else class="h-5 w-5 mr-2" />
        {{
          isPlaying
            ? t('practice.stop', 'Stop')
            : t('practice.listen', 'Listen')
        }}
      </Button>
    </div>

    <audio
      ref="audioRef"
      :src="item.audio || undefined"
      preload="auto"
      class="hidden"
    ></audio>

    <!-- Success audio element -->
    <audio ref="successAudioRef" preload="auto" class="hidden">
      <source src="/src/assets/sounds/success.mp3" type="audio/mpeg" />
    </audio>

    <!-- Recording section -->
    <div class="mt-6 border-t pt-4">
      <div class="flex flex-col items-center">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          :class="[isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100']"
        >
          <MicrophoneIcon
            class="h-8 w-8"
            :class="isRecording ? 'text-red-600' : 'text-gray-500'"
          />
        </div>

        <Button
          @click="isRecording ? stopRecording() : startRecording()"
          :class="buttonColor"
          class="mb-4 transition-colors"
          :disabled="isPlaying || isLoading"
        >
          {{ buttonText }}
        </Button>

        <!-- Recorded audio controls -->
        <div v-if="recordedAudio" class="w-full my-4">
          <div class="flex justify-between items-center">
            <Button
              @click="playRecordedAudio"
              class="bg-gray-500 hover:bg-gray-600"
              :disabled="isPlaying || isLoading || isRecording"
            >
              <PlayCircleIcon class="h-5 w-5 mr-2" />
              {{ t('practice.playRecording', 'Play Recording') }}
            </Button>

            <div>
              <Button
                @click="resetRecording"
                class="bg-gray-200 text-gray-700 hover:bg-gray-300 mr-2"
                :disabled="
                  isPlaying || isAudioPlaying || isLoading || isRecording
                "
              >
                {{ t('practice.reset', 'Reset') }}
              </Button>
              <Button
                @click="submitRecording"
                class="bg-green-500 hover:bg-green-600"
                :disabled="
                  isSending ||
                  isPlaying ||
                  isAudioPlaying ||
                  isLoading ||
                  isRecording
                "
              >
                <span v-if="isSending">
                  <svg
                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
                {{ t('practice.submit', 'Submit') }}
              </Button>
            </div>
          </div>

          <audio
            ref="recordedAudioRef"
            :src="recordedAudio"
            class="hidden"
          ></audio>
        </div>

        <!-- Feedback message -->
        <div v-if="feedback" class="text-center w-full">
          <div
            class="inline-flex items-center px-6 py-3 rounded-lg"
            :class="[
              feedbackStatus === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200',
            ]"
          >
            <CheckIcon
              v-if="feedbackStatus === 'success'"
              class="h-6 w-6 text-green-600 mr-3"
            />
            <ExclamationTriangleIcon v-else class="h-6 w-6 text-red-600 mr-3" />
            <span
              class="font-medium"
              :class="[
                feedbackStatus === 'success'
                  ? 'text-green-800'
                  : 'text-red-800',
              ]"
            >
              {{ feedback }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Celebration Effects -->
    <div v-if="showCelebration" class="fixed inset-0 pointer-events-none z-50">
      <div
        v-for="particle in celebrationParticles"
        :key="particle.id"
        class="absolute w-3 h-3 rounded-full"
        :style="{
          left: particle.x + 'px',
          top: particle.y + 'px',
          backgroundColor: particle.color,
          transform: particle.type === 'balloon' ? 'scale(2)' : 'scale(1)',
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import type { PracticeNextItemResponse } from '../types'
import {
  PlayCircleIcon,
  PauseCircleIcon,
  SpeakerWaveIcon,
  CheckIcon,
  MicrophoneIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { useUpdatePracticeState } from '../queries'

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

const { t } = useI18n()
const props = defineProps<{
  item: PracticeNextItemResponse
}>()

const emit = defineEmits<{
  (e: 'item-completed', id: number, state: 'correct' | 'wrong'): void
}>()

const isRecording = ref(false)
const isPlaying = ref(false)
const recordedAudio = ref<string | null>(null)
const recordedBlob = ref<Blob | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const feedback = ref<string>('')
const feedbackStatus = ref<'success' | 'error' | 'none'>('none')
const isSending = ref(false)
const showCelebration = ref(false)
const isAudioPlaying = ref(false)
const isLoading = ref(false)

// Remove session state tracking since we're using single items now

const celebrationParticles = ref<
  Array<{
    id: number
    x: number
    y: number
    vx: number
    vy: number
    color: string
    type: 'firework' | 'confetti' | 'balloon'
  }>
>([])

const audioRef = ref<HTMLAudioElement | null>(null)
const recordedAudioRef = ref<HTMLAudioElement | null>(null)
const successAudioRef = ref<HTMLAudioElement | null>(null)

const updatePracticeStateMutation = useUpdatePracticeState()

// Play the lesson audio
const playAudio = () => {
  if (isPlaying.value) {
    audioRef.value?.pause()
    isPlaying.value = false
    return
  }

  if (audioRef.value) {
    audioRef.value.play()
    isPlaying.value = true

    // Reset when audio ends
    audioRef.value.onended = () => {
      isPlaying.value = false
    }

    // Handle audio errors
    audioRef.value.onerror = () => {
      isPlaying.value = false
    }
  }
}

// Start recording user's voice
const startRecording = async () => {
  try {
    isLoading.value = true
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioChunks.value = []

    // Try to use ogg format if supported by the browser
    let options = {}
    if (MediaRecorder.isTypeSupported('audio/ogg')) {
      options = { mimeType: 'audio/ogg' }
    } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      options = { mimeType: 'audio/webm;codecs=opus' }
    }

    mediaRecorder.value = new MediaRecorder(stream, options)
    isRecording.value = true
    isLoading.value = false

    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data)
    }

    mediaRecorder.value.onstop = () => {
      // Create blob of the recording for preview
      const audioBlob = new Blob(audioChunks.value, {
        type: mediaRecorder.value?.mimeType || 'audio/ogg',
      })
      recordedBlob.value = audioBlob
      recordedAudio.value = URL.createObjectURL(audioBlob)
    }

    mediaRecorder.value.start()
  } catch (error) {
    console.error('Error accessing microphone:', error)
    feedback.value = t('practice.microphoneError', 'Error accessing microphone')
    feedbackStatus.value = 'error'
    isLoading.value = false
  }
}

// Stop recording
const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false

    // Stop all audio tracks to release the microphone
    mediaRecorder.value.stream.getTracks().forEach((track) => track.stop())
  }
}

// Play recorded audio
const playRecordedAudio = () => {
  if (recordedAudioRef.value) {
    isAudioPlaying.value = true
    recordedAudioRef.value.play()

    recordedAudioRef.value.onended = () => {
      isAudioPlaying.value = false
    }

    recordedAudioRef.value.onerror = () => {
      isAudioPlaying.value = false
    }
  }
}

// Utility function to encode AudioBuffer to WAV Blob
function encodeWAV(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  let samples: Float32Array[] = []
  for (let i = 0; i < numChannels; i++) {
    samples.push(audioBuffer.getChannelData(i))
  }

  // Interleave channels
  let interleaved: Int16Array
  if (numChannels === 2) {
    const length = audioBuffer.length * 2
    interleaved = new Int16Array(length)
    for (let i = 0, j = 0; i < audioBuffer.length; i++, j += 2) {
      interleaved[j] = Math.max(-1, Math.min(1, samples[0][i])) * 0x7fff
      interleaved[j + 1] = Math.max(-1, Math.min(1, samples[1][i])) * 0x7fff
    }
  } else {
    interleaved = new Int16Array(audioBuffer.length)
    for (let i = 0; i < audioBuffer.length; i++) {
      interleaved[i] = Math.max(-1, Math.min(1, samples[0][i])) * 0x7fff
    }
  }

  // WAV file header
  const buffer = new ArrayBuffer(44 + interleaved.length * 2)
  const view = new DataView(buffer)

  function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + interleaved.length * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, (sampleRate * numChannels * bitDepth) / 8, true)
  view.setUint16(32, (numChannels * bitDepth) / 8, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, 'data')
  view.setUint32(40, interleaved.length * 2, true)

  // Write PCM samples
  let offset = 44
  for (let i = 0; i < interleaved.length; i++, offset += 2) {
    view.setInt16(offset, interleaved[i], true)
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

// Submit recording to server for checking
const submitRecording = async () => {
  if (!recordedBlob.value) return

  try {
    isSending.value = true
    isLoading.value = true
    feedback.value = t('practice.submitting', 'Submitting...')
    feedbackStatus.value = 'none'

    // Convert the recorded blob to WAV before sending
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    const audioContext = new AudioContextClass()
    const arrayBuffer = await recordedBlob.value.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const wavBlob = encodeWAV(audioBuffer)

    const result = await updatePracticeStateMutation.mutateAsync({
      practiceItemId: props.item.id,
      audioBlob: wavBlob,
    })

    if (result.is_correct) {
      feedback.value = `${t('practice.recognized', 'Recognized')}: "${result.user_text}" - ${t('practice.correct', 'Correct!')}`
      feedbackStatus.value = 'success'
      // Emit item-completed event with correct state
      emit('item-completed', props.item.id, 'correct')
      // Start celebration!
      createCelebration()
      startParticleAnimation()
    } else {
      feedback.value = `${t('practice.recognized', 'Recognized')}: "${result.user_text}" - ${t('practice.incorrect', 'Try again!')}`
      feedbackStatus.value = 'error'
      // Emit item-completed event with wrong state
      emit('item-completed', props.item.id, 'wrong')
    }
  } catch (error) {
    console.error('Error submitting recording:', error)
    feedback.value = t('practice.errorSubmitting', 'Error submitting recording')
    feedbackStatus.value = 'error'
  } finally {
    isSending.value = false
    isLoading.value = false
  }
}

// Reset the recording and feedback
const resetRecording = () => {
  recordedAudio.value = null
  recordedBlob.value = null
  feedback.value = ''
  feedbackStatus.value = 'none'
}

// Create celebration effects
const createCelebration = () => {
  showCelebration.value = true

  // Play success sound
  playSuccessSound()

  // Create fireworks
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight * 0.6
      createFirework(x, y)
    }, i * 200)
  }

  // Create confetti
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      createConfetti()
    }, i * 50)
  }

  // Hide celebration after 4 seconds
  setTimeout(() => {
    showCelebration.value = false
    celebrationParticles.value = []
  }, 4000)
}

// Play success sound
const playSuccessSound = () => {
  try {
    if (successAudioRef.value) {
      successAudioRef.value.volume = 0.6
      successAudioRef.value.play().catch(() => {
        playGeneratedSuccessSound()
      })
    } else {
      playGeneratedSuccessSound()
    }
  } catch (error) {
    console.log('Audio playback failed:', error)
    playGeneratedSuccessSound()
  }
}

// Generate success sound using Web Audio API
const playGeneratedSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    )

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.log('Generated sound failed:', error)
  }
}

const createFirework = (x: number, y: number) => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
  ]
  const color = colors[Math.floor(Math.random() * colors.length)]

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    const velocity = 3 + Math.random() * 2
    celebrationParticles.value.push({
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      color: color,
      type: 'firework',
    })
  }
}

const createConfetti = () => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
  ]
  const x = Math.random() * window.innerWidth
  const y = -20
  celebrationParticles.value.push({
    id: Date.now() + Math.random(),
    x: x,
    y: y,
    vx: (Math.random() - 0.5) * 2,
    vy: 2 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    type: 'confetti',
  })
}

const updateParticles = () => {
  celebrationParticles.value.forEach((particle) => {
    particle.x += particle.vx
    particle.y += particle.vy

    // Add gravity to fireworks
    if (particle.type === 'firework') {
      particle.vy += 0.1
    }

    // Remove particles that are off screen
    if (particle.y > window.innerHeight + 100 || particle.y < -100) {
      const index = celebrationParticles.value.findIndex(
        (p) => p.id === particle.id
      )
      if (index > -1) {
        celebrationParticles.value.splice(index, 1)
      }
    }
  })
}

// Start particle animation loop
let animationId: number
const startParticleAnimation = () => {
  const animate = () => {
    updateParticles()
    animationId = requestAnimationFrame(animate)
  }
  animate()
}

// Stop animation when component unmounts
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

const buttonColor = computed(() => {
  if (feedbackStatus.value === 'success') return 'bg-green-500'
  if (feedbackStatus.value === 'error') return 'bg-red-500'
  if (isRecording.value) return 'bg-red-600'
  return 'bg-blue-500'
})

const buttonText = computed(() => {
  if (isRecording.value) return t('practice.stopRecording', 'Stop Recording')
  return t('practice.startRecording', 'Start Recording')
})
</script>
