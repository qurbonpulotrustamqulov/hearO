<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'
import type { ILessonItem } from '../types'
import {
  PlayCircleIcon,
  PauseCircleIcon,
  SpeakerWaveIcon,
  CheckIcon,
  MicrophoneIcon,
} from '@heroicons/vue/24/outline'
import http from '@/service/http'

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

const { t } = useI18n()
const props = defineProps<{
  item: ILessonItem
  isLast?: boolean // Add isLast prop, optional for backward compatibility
}>()

const emit = defineEmits<{
  (e: 'item-completed', id: number, state: 'correct' | 'wrong'): void
  (e: 'item-state-changed', id: number, state: 'correct' | 'wrong' | null): void
  (e: 'next-item'): void
  (e: 'back-to-lessons'): void
  (e: 'start-from-beginning'): void
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

// Use the item's state instead of local isItemCompleted
const isItemCompleted = computed(() => props.item.state?.state === 'correct')

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
const lessonItemRef = ref<HTMLElement | null>(null)

// Play the lesson audio
const playAudio = () => {
  if (!props.item.audio) {
    console.warn('No audio available for this lesson item')
    return
  }

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

// Create celebration effects
const createCelebration = () => {
  showCelebration.value = true

  // Play success sound
  playSuccessSound()

  // Get component position for centering celebration
  const componentRect = lessonItemRef.value?.getBoundingClientRect()
  const centerX = componentRect
    ? componentRect.left + componentRect.width / 2
    : window.innerWidth / 2
  const centerY = componentRect
    ? componentRect.top + componentRect.height / 2
    : window.innerHeight / 2

  // Create fireworks around the component center
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const x = centerX + (Math.random() - 0.5) * 400 // Spread around component
      const y = centerY + (Math.random() - 0.5) * 300
      createFirework(x, y)
    }, i * 200)
  }

  // Create confetti
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      createConfetti()
    }, i * 50)
  }

  // Create balloons
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      createBalloon()
    }, i * 300)
  }
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

const createBalloon = () => {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
  ]
  const x = Math.random() * window.innerWidth
  const y = window.innerHeight + 50
  celebrationParticles.value.push({
    id: Date.now() + Math.random(),
    x: x,
    y: y,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -1.5 - Math.random(),
    color: colors[Math.floor(Math.random() * colors.length)],
    type: 'balloon',
  })
}

// Start particle animation loop
let animationId: number | null = null
const isAnimating = ref(false)

const startParticleAnimation = () => {
  // Prevent multiple animation loops
  if (isAnimating.value || animationId) {
    return
  }

  isAnimating.value = true

  const animate = () => {
    if (!showCelebration.value || celebrationParticles.value.length === 0) {
      // Stop animation when celebration ends or no particles left
      isAnimating.value = false
      animationId = null
      return
    }

    updateParticles()
    animationId = requestAnimationFrame(animate)
  }
  animate()
}

// Stop animation and cleanup
const stopParticleAnimation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  isAnimating.value = false
  celebrationParticles.value = []
}

// Update particles animation with better cleanup
const updateParticles = () => {
  for (let i = celebrationParticles.value.length - 1; i >= 0; i--) {
    const particle = celebrationParticles.value[i]

    particle.x += particle.vx
    particle.y += particle.vy

    // Add gravity to fireworks
    if (particle.type === 'firework') {
      particle.vy += 0.1
    }

    // Remove particles that are off screen
    if (
      particle.y > window.innerHeight + 100 ||
      particle.y < -100 ||
      particle.x < -100 ||
      particle.x > window.innerWidth + 100
    ) {
      celebrationParticles.value.splice(i, 1)
    }
  }

  // Stop animation if no particles left
  if (celebrationParticles.value.length === 0) {
    setTimeout(() => {
      showCelebration.value = false
      stopParticleAnimation()
    }, 2000) // Keep celebration message for 2 more seconds
  }
}

// Add refs for waveform and timer
const waveformCanvas = ref<HTMLCanvasElement | null>(null)
const recordingTimer = ref(0)
let timerInterval: number | null = null
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let dataArray: Uint8Array | null = null
let source: MediaStreamAudioSourceNode | null = null
let animationFrameId: number | null = null
let recordStartTime: number | null = null

// Draw circular waveform
function drawWaveform() {
  if (!waveformCanvas.value) return
  const ctx = waveformCanvas.value.getContext('2d')!
  const width = waveformCanvas.value.width
  const height = waveformCanvas.value.height
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 10

  // Clear the canvas to transparent (no fill, no square)
  ctx.clearRect(0, 0, width, height)

  if (!isRecording.value) {
    // Draw a static gray ring only
    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 4
    ctx.shadowBlur = 0
    ctx.stroke()
    ctx.restore()
    return
  }

  // Animated waveform when recording
  if (!analyser || !dataArray) return
  analyser.getByteTimeDomainData(dataArray)
  // Calculate average amplitude for dynamic effects
  let sum = 0
  for (let i = 0; i < dataArray.length; i++) {
    sum += Math.abs(dataArray[i] - 128)
  }
  const avg = sum / dataArray.length
  // Gradient stroke
  const grad = ctx.createConicGradient(0, centerX, centerY)
  grad.addColorStop(0, '#a21caf') // purple
  grad.addColorStop(0.33, '#f59e42') // orange
  grad.addColorStop(0.66, '#ff6b6b') // red
  grad.addColorStop(1, '#a21caf') // purple
  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.beginPath()
  for (let i = 0; i < dataArray.length; i++) {
    const angle = (i / dataArray.length) * Math.PI * 2
    const v = dataArray[i] / 128.0
    const r = radius + (v - 1) * 40
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.strokeStyle = grad
  ctx.lineWidth = 4 + avg / 10
  ctx.shadowBlur = 0
  ctx.shadowColor = 'rgba(0,0,0,0)'
  ctx.stroke()
  ctx.restore()
}

function startWaveform(stream: MediaStream) {
  audioContext = new (window.AudioContext || window.webkitAudioContext)()
  analyser = audioContext.createAnalyser()
  analyser.fftSize = 512 // smoother, denser
  dataArray = new Uint8Array(analyser.fftSize)
  source = audioContext.createMediaStreamSource(stream)
  source.connect(analyser)
  let frame = 0
  function animate() {
    frame++
    if (frame % 4 === 0) {
      drawWaveform()
    }
    animationFrameId = requestAnimationFrame(animate)
  }
  animate()
}

function stopWaveform() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (audioContext) audioContext.close()
  audioContext = null
  analyser = null
  dataArray = null
  source = null
}

// Hold-to-record logic
const handleRecordPress = async (e: Event) => {
  e.preventDefault()
  if (isRecording.value || isLoading.value) return
  try {
    isLoading.value = true
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioChunks.value = []
    let options = {}
    if (MediaRecorder.isTypeSupported('audio/ogg')) {
      options = { mimeType: 'audio/ogg' }
    } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      options = { mimeType: 'audio/webm;codecs=opus' }
    }
    mediaRecorder.value = new MediaRecorder(stream, options)
    isRecording.value = true
    isLoading.value = false
    recordStartTime = Date.now()
    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data)
    }
    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, {
        type: mediaRecorder.value?.mimeType || 'audio/ogg',
      })
      recordedBlob.value = audioBlob
      recordedAudio.value = URL.createObjectURL(audioBlob)
      stopWaveform()
    }
    mediaRecorder.value.start()
    // Start waveform
    startWaveform(stream)
    // Start timer
    recordingTimer.value = 0
    timerInterval = window.setInterval(() => {
      recordingTimer.value++
    }, 1000)
  } catch (error) {
    feedback.value = t('lessons.microphoneError')
    feedbackStatus.value = 'error'
    console.error('Error accessing microphone:', error)
    isLoading.value = false
  }
}

const handleRecordRelease = () => {
  if (!isRecording.value || !mediaRecorder.value) return
  // Prevent accidental tap: require at least 200ms
  if (recordStartTime && Date.now() - recordStartTime < 200) {
    // Cancel recording
    isRecording.value = false
    if (mediaRecorder.value.state === 'recording') mediaRecorder.value.stop()
    if (mediaRecorder.value.stream) {
      mediaRecorder.value.stream.getTracks().forEach((track) => track.stop())
    }
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    stopWaveform()
    return
  }
  mediaRecorder.value.stop()
  isRecording.value = false // ensure this is set immediately
  if (mediaRecorder.value.stream) {
    mediaRecorder.value.stream.getTracks().forEach((track) => track.stop())
  }
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  stopWaveform()
}

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  stopParticleAnimation()
  stopWaveform()
  if (timerInterval) clearInterval(timerInterval)
})

// Submit recording to server for checking
const submitRecording = async () => {
  if (!recordedBlob.value) return

  try {
    isSending.value = true
    isLoading.value = true
    feedback.value = t('lessons.sending')
    feedbackStatus.value = 'none'

    // Convert the recorded blob to WAV before sending
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    const audioContext = new AudioContextClass()
    const arrayBuffer = await recordedBlob.value.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const wavBlob = encodeWAV(audioBuffer)

    // Create a form data object to send the WAV audio
    const formData = new FormData()
    formData.append('user_audio', wavBlob, 'recording.wav')
    formData.append('lesson_item', props.item.id.toString())

    // Call the API endpoint to check the recording
    const response = await http.post('/check/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Handle the response with the new format
    if (response.data.user_text && response.data.is_correct !== undefined) {
      const recognizedText = response.data.user_text
      const isCorrect = response.data.is_correct

      if (isCorrect) {
        feedback.value = `${t('lessons.recognized')}: "${recognizedText}" - ${t('lessons.correct')}`
        feedbackStatus.value = 'success'
        // Emit item-completed event with correct state
        emit('item-completed', props.item.id, 'correct')
        // Start celebration!
        createCelebration()
        startParticleAnimation()
      } else {
        feedback.value = `${t('lessons.recognized')}: "${recognizedText}" - ${t('lessons.incorrect')}`
        feedbackStatus.value = 'error'
        // Emit item-completed event with wrong state
        emit('item-completed', props.item.id, 'wrong')
      }
    } else {
      // Fallback for old response format
      if (response.data.success) {
        feedback.value = response.data.message || t('lessons.goodJob')
        feedbackStatus.value = 'success'
        // Emit item-completed event with correct state
        emit('item-completed', props.item.id, 'correct')
        createCelebration()
        startParticleAnimation()
      } else {
        feedback.value = response.data.message || t('lessons.tryAgain')
        feedbackStatus.value = 'error'
        // Emit item-completed event with wrong state
        emit('item-completed', props.item.id, 'wrong')
      }
    }
  } catch (error) {
    console.error('Error submitting recording:', error)
    feedback.value = t('lessons.errorSubmitting')
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

// Retry the current item (reset its state)
const retryItem = () => {
  feedback.value = ''
  feedbackStatus.value = 'none'
  showCelebration.value = false
  stopParticleAnimation()
  resetRecording()
  // Reset the item state for retry
  emit('item-state-changed', props.item.id, null)
}

// Handle retry button click
const handleRetry = () => {
  stopParticleAnimation()
  retryItem()
}

// Handle next button click
const handleNext = () => {
  if (props.isLast) {
    showCelebration.value = true
    // Optionally, you can trigger a special celebration or callback here
  } else {
    showCelebration.value = false
    stopParticleAnimation()
    emit('next-item')
  }
}

const handleBackToLessons = () => {
  showCelebration.value = false
  stopParticleAnimation()
  emit('back-to-lessons')
}

const handleStartFromBeginning = () => {
  showCelebration.value = false
  stopParticleAnimation()
  emit('start-from-beginning')
}

// Reset feedback and audio state when item changes
watch(
  () => props.item.id,
  () => {
    feedback.value = ''
    feedbackStatus.value = 'none'
    recordedAudio.value = null
    recordedBlob.value = null
  }
)
</script>

<template>
  <div
    class="lesson-item bg-white rounded-xl shadow-md overflow-hidden p-6 mb-4 relative"
    :class="{ 'border-2 border-green-500': isItemCompleted }"
    ref="lessonItemRef"
  >
    <!-- Celebration overlay using Teleport to render outside component -->
    <Teleport to="body">
      <div
        v-if="showCelebration"
        class="fixed inset-0 z-50 pointer-events-none"
        style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh"
      >
        <!-- Fireworks -->
        <div
          v-for="particle in celebrationParticles.filter(
            (p) => p.type === 'firework'
          )"
          :key="particle.id"
          class="absolute w-2 h-2 rounded-full celebration-firework"
          :style="{
            left: particle.x + 'px',
            top: particle.y + 'px',
            backgroundColor: particle.color,
            boxShadow: `0 0 20px ${particle.color}, 0 0 40px ${particle.color}`,
            transform: 'translate(-50%, -50%)',
          }"
        ></div>

        <!-- Confetti -->
        <div
          v-for="particle in celebrationParticles.filter(
            (p) => p.type === 'confetti'
          )"
          :key="particle.id"
          class="absolute w-3 h-3 celebration-confetti"
          :style="{
            left: particle.x + 'px',
            top: particle.y + 'px',
            backgroundColor: particle.color,
            transform: 'translate(-50%, -50%) rotate(45deg)',
          }"
        ></div>

        <!-- Balloons -->
        <div
          v-for="particle in celebrationParticles.filter(
            (p) => p.type === 'balloon'
          )"
          :key="particle.id"
          class="absolute w-8 h-10 rounded-full celebration-balloon"
          :style="{
            left: particle.x + 'px',
            top: particle.y + 'px',
            backgroundColor: particle.color,
            transform: 'translate(-50%, -50%)',
          }"
        >
          <div
            class="absolute bottom-0 left-1/2 w-0.5 h-4 bg-gray-400 transform -translate-x-1/2"
          ></div>
        </div>

        <!-- Celebration message -->
        <div
          class="fixed text-center pointer-events-auto z-60"
          :style="{
            left:
              (lessonItemRef?.getBoundingClientRect()?.left || 0) +
              (lessonItemRef?.getBoundingClientRect()?.width || 0) / 2 +
              'px',
            top:
              (lessonItemRef?.getBoundingClientRect()?.top || 0) +
              (lessonItemRef?.getBoundingClientRect()?.height || 0) / 2 +
              'px',
            transform: 'translate(-50%, -50%)',
          }"
        >
          <div
            class="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl animate-bounce celebration-rainbow"
          >
            <div class="text-6xl mb-4 celebration-sparkle">🎉</div>
            <h2 class="text-3xl font-bold text-green-600 mb-2">
              {{
                props.isLast
                  ? t('lessons.lessonComplete', 'Lesson Completed!')
                  : 'Excellent!'
              }}
            </h2>
            <p class="text-xl text-gray-700 mb-4">
              {{
                props.isLast
                  ? t(
                      'lessons.greatJob',
                      "Great job! You've completed this lesson."
                    )
                  : 'You did it! 🌟'
              }}
            </p>
            <div
              v-if="props.isLast"
              class="flex flex-col sm:flex-row justify-center gap-4 mb-2"
            >
              <Button
                @click="handleBackToLessons"
                class="bg-gray-500 hover:bg-gray-600 min-w-[180px]"
              >
                {{ t('lessons.backToLessons', 'Back to Lessons') }}
              </Button>
              <Button
                @click="handleStartFromBeginning"
                class="bg-blue-500 hover:bg-blue-600 min-w-[180px]"
              >
                {{ t('lessons.startFromBeginning', 'Start from Beginning') }}
              </Button>
            </div>
            <div
              v-else
              class="flex flex-col sm:flex-row justify-center gap-4 mb-2"
            >
              <Button
                @click="handleRetry"
                class="bg-gray-500 hover:bg-gray-600 text-white min-w-[120px]"
              >
                {{ t('lessons.retry', 'Retry') }}
              </Button>
              <Button
                @click="handleNext"
                class="bg-green-500 hover:bg-green-600 text-white min-w-[120px]"
              >
                {{ t('lessons.next', 'Next') }}
              </Button>
            </div>
            <div class="text-4xl mt-4 flex justify-center gap-2">
              <span
                class="inline-block animate-bounce"
                style="animation-delay: 0s"
                >🎊</span
              >
              <span
                class="inline-block animate-bounce"
                style="animation-delay: 0.2s"
                >🎈</span
              >
              <span
                class="inline-block animate-bounce"
                style="animation-delay: 0.4s"
                >⭐</span
              >
              <span
                class="inline-block animate-bounce"
                style="animation-delay: 0.6s"
                >🎊</span
              >
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Success indicator for completed items -->
    <div v-if="isItemCompleted" class="flex items-center justify-between mb-3">
      <div
        class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center"
      >
        <CheckIcon class="h-4 w-4 mr-1" />
        {{ t('lessons.stepCompleted') }}
      </div>
    </div>

    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <div class="bg-blue-100 p-3 rounded-full mr-4">
          <SpeakerWaveIcon class="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h3 class="text-lg font-semibold">{{ item.word }}</h3>
          <p class="text-sm text-gray-500">
            {{ t('lessons.listenAndRepeat') }}
          </p>
        </div>
      </div>

      <Button
        v-if="item.audio"
        @click="playAudio"
        class="bg-blue-500 hover:bg-blue-600 transition-colors flex items-center"
        :disabled="isPlaying || isAudioPlaying || isLoading || isRecording"
      >
        <PlayCircleIcon v-if="!isPlaying" class="h-5 w-5 mr-2" />
        <PauseCircleIcon v-else class="h-5 w-5 mr-2" />
        {{ isPlaying ? t('lessons.stop') : t('lessons.listen') }}
      </Button>
    </div>

    <!-- Image section - display if item has an image -->
    <div v-if="item.image" class="mb-6 flex justify-center">
      <div class="max-w-sm w-full">
        <img
          :src="item.image"
          :alt="item.word"
          class="w-full h-auto rounded-lg shadow-md object-cover max-h-64 max-w-64"
          loading="lazy"
        />
      </div>
    </div>

    <!-- Audio element for lesson audio -->
    <audio
      v-if="item.audio"
      ref="audioRef"
      :src="item.audio"
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
          class="relative flex items-center justify-center mb-4 p-4"
          style="width: 120px; height: 120px"
        >
          <canvas
            v-if="isRecording"
            ref="waveformCanvas"
            width="120"
            height="120"
            class="absolute top-0 left-0"
            style="z-index: 1; pointer-events: none"
          ></canvas>
          <button
            class="w-24 h-24 rounded-full flex items-center justify-center bg-white shadow-lg focus:outline-none transition-all duration-200"
            :class="[isRecording && 'animate-pulse']"
            @mousedown="handleRecordPress"
            @touchstart="handleRecordPress"
            @mouseup="handleRecordRelease"
            @mouseleave="handleRecordRelease"
            @touchend="handleRecordRelease"
            :disabled="isLoading || isPlaying"
            aria-label="Hold to record"
            style="z-index: 2; position: relative"
          >
            <MicrophoneIcon
              :class="isRecording ? 'text-blue-500' : 'text-gray-400'"
              class="h-12 w-12 transition-colors duration-200"
            />
          </button>
          <span
            v-if="isRecording"
            class="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white/80 px-2 py-1 rounded shadow"
            style="z-index: 3"
            >{{ recordingTimer }}s</span
          >
        </div>

        <!-- Recorded audio controls -->
        <div v-if="recordedAudio" class="w-full my-4">
          <div class="flex justify-between items-center">
            <Button
              @click="playRecordedAudio"
              class="bg-gray-500 hover:bg-gray-600"
              :disabled="isPlaying || isLoading || isRecording"
            >
              <PlayCircleIcon class="h-5 w-5 mr-2" />
              {{ t('lessons.playRecording') }}
            </Button>

            <div>
              <Button
                @click="resetRecording"
                class="bg-gray-200 text-gray-700 hover:bg-gray-300 mr-2"
                :disabled="
                  isPlaying || isAudioPlaying || isLoading || isRecording
                "
              >
                {{ t('lessons.reset') }}
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
                {{ t('lessons.submit') }}
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
        <div
          v-if="feedback"
          class="w-full p-3 rounded-lg mt-2 text-center"
          :class="{
            'bg-green-100 text-green-700': feedbackStatus === 'success',
            'bg-red-100 text-red-700': feedbackStatus === 'error',
            'bg-blue-100 text-blue-700': feedbackStatus === 'none',
          }"
        >
          {{ feedback }}
        </div>

        <!-- Success Celebration Card as Dialog -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.lesson-item {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.lesson-item:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Celebration animations */
@keyframes sparkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  25% {
    opacity: 0.8;
    transform: scale(1.2) rotate(90deg);
  }
  50% {
    opacity: 1;
    transform: scale(0.8) rotate(180deg);
  }
  75% {
    opacity: 0.9;
    transform: scale(1.1) rotate(270deg);
  }
}

@keyframes rainbow {
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(5deg);
  }
  50% {
    transform: translateY(-20px) rotate(0deg);
  }
  75% {
    transform: translateY(-10px) rotate(-5deg);
  }
}

@keyframes explode {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.5) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(2) rotate(360deg);
    opacity: 0;
  }
}

/* Apply animations to celebration elements */
.celebration-firework {
  animation: explode 2s ease-out forwards;
}

.celebration-confetti {
  animation: float 3s ease-in-out infinite;
}

.celebration-balloon {
  animation: float 4s ease-in-out infinite;
}

.celebration-sparkle {
  animation: sparkle 1.5s ease-in-out infinite;
}

.celebration-rainbow {
  animation: rainbow 2s linear infinite;
}
</style>
